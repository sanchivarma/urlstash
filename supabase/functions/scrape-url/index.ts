import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authentication required. Please log in again.');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Your session has expired. Please log in again.');
    }

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      throw new Error('Invalid request. Please try again.');
    }

    const { url, projectId, useAi } = requestBody;

    if (!url || !projectId) {
      throw new Error('Please provide both a website URL and select a project.');
    }

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      throw new Error('Scraping service is not configured. Please contact support.');
    }

    console.log('Scraping URL:', url);

    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'html'],
      }),
    });

    if (!firecrawlResponse.ok) {
      const errorText = await firecrawlResponse.text();
      console.error('Firecrawl error:', errorText);
      throw new Error('Something went wrong. Please check if the website link is valid or try again in some time.');
    }

    const firecrawlData = await firecrawlResponse.json();
    console.log('Firecrawl response received');
    
    const content = firecrawlData.data;

    const pageTitle = content.metadata?.title || 'Untitled';
    const metaDescription = content.metadata?.description || null;
    const faviconUrl = content.metadata?.favicon || null;

    const headings: Array<{ level: number; text: string; order_index: number }> = [];
    const links: Array<{ url: string; anchor_text: string; is_external: boolean; order_index: number }> = [];

    if (content.markdown) {
      const lines = content.markdown.split('\n');
      let headingIndex = 0;
      let linkIndex = 0;

      for (const line of lines) {
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
          headings.push({
            level: headingMatch[1].length,
            text: headingMatch[2].trim(),
            order_index: headingIndex++,
          });
        }

        const linkMatches = line.matchAll(/\[([^\]]+)\]\(([^\)]+)\)/g);
        for (const match of linkMatches) {
          const linkUrl = match[2];
          const anchorText = match[1];
          const isExternal = linkUrl.startsWith('http');

          links.push({
            url: linkUrl,
            anchor_text: anchorText,
            is_external: isExternal,
            order_index: linkIndex++,
          });
        }
      }
    }

    console.log(`Extracted ${headings.length} headings and ${links.length} links`);

    const { data: scrape, error: scrapeError } = await supabase
      .from('scrapes')
      .insert({
        project_id: projectId,
        user_id: user.id,
        url,
        page_title: pageTitle,
        meta_description: metaDescription,
        favicon_url: faviconUrl,
        raw_content: content,
        tags: [],
      })
      .select()
      .single();

    if (scrapeError) {
      console.error('Database error:', scrapeError);
      throw new Error('Unable to save the scraped data. Please try again.');
    }

    if (headings.length > 0) {
      const headingsToInsert = headings.map(h => ({
        ...h,
        scrape_id: scrape.id,
      }));
      const { error: headingsError } = await supabase.from('headings').insert(headingsToInsert);
      if (headingsError) {
        console.error('Headings insert error:', headingsError);
      }
    }

    if (links.length > 0) {
      const linksToInsert = links.slice(0, 100).map(l => ({
        ...l,
        scrape_id: scrape.id,
      }));
      const { error: linksError } = await supabase.from('links').insert(linksToInsert);
      if (linksError) {
        console.error('Links insert error:', linksError);
      }
    }

    if (useAi) {
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (openaiApiKey) {
        try {
          const contentForAi = `Title: ${pageTitle}\n\nMeta Description: ${metaDescription || 'N/A'}\n\nHeadings:\n${headings.slice(0, 20).map(h => `${'#'.repeat(h.level)} ${h.text}`).join('\n')}\n\nTop Links:\n${links.slice(0, 10).map(l => l.anchor_text).join('\n')}`;

          const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: 'You are an expert content analyzer. Analyze the provided web page content and generate a concise summary, relevant tags, and key takeaways. Respond in JSON format with: summary_short (1-2 sentences), summary_long (2-4 sentences), tags (array of 3-7 keywords), key_points (array of 3-5 bullet points).'
                },
                {
                  role: 'user',
                  content: contentForAi
                }
              ],
              response_format: { type: 'json_object' },
              temperature: 0.7,
            }),
          });

          if (openaiResponse.ok) {
            const openaiData = await openaiResponse.json();
            const aiContent = JSON.parse(openaiData.choices[0].message.content);

            await supabase.from('ai_insights').insert({
              scrape_id: scrape.id,
              summary_short: aiContent.summary_short || 'No summary available',
              summary_long: aiContent.summary_long || null,
              tags: aiContent.tags || [],
              key_points: aiContent.key_points || [],
            });
            console.log('AI insights generated');
          } else {
            console.error('OpenAI error:', await openaiResponse.text());
          }
        } catch (aiError) {
          console.error('AI generation error:', aiError);
        }
      } else {
        console.log('OpenAI API key not configured, skipping AI insights');
      }
    }

    return new Response(
      JSON.stringify({ success: true, scrape }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});