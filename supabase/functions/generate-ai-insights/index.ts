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
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { scrapeId } = await req.json();

    if (!scrapeId) {
      throw new Error('Missing required field: scrapeId');
    }

    const { data: scrape, error: scrapeError } = await supabase
      .from('scrapes')
      .select('*, headings(*), links(*)')
      .eq('id', scrapeId)
      .eq('user_id', user.id)
      .single();

    if (scrapeError || !scrape) {
      throw new Error('Scrape not found or access denied');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    const contentForAi = `Title: ${scrape.page_title}\n\nMeta Description: ${scrape.meta_description || 'N/A'}\n\nHeadings:\n${scrape.headings.slice(0, 20).map((h: any) => `${'#'.repeat(h.level)} ${h.text}`).join('\n')}\n\nTop Links:\n${scrape.links.slice(0, 10).map((l: any) => l.anchor_text).join('\n')}`;

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

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const openaiData = await openaiResponse.json();
    const aiContent = JSON.parse(openaiData.choices[0].message.content);

    const { data: existingInsight } = await supabase
      .from('ai_insights')
      .select('id')
      .eq('scrape_id', scrapeId)
      .maybeSingle();

    let result;
    if (existingInsight) {
      const { data, error } = await supabase
        .from('ai_insights')
        .update({
          summary_short: aiContent.summary_short || 'No summary available',
          summary_long: aiContent.summary_long || null,
          tags: aiContent.tags || [],
          key_points: aiContent.key_points || [],
        })
        .eq('id', existingInsight.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('ai_insights')
        .insert({
          scrape_id: scrapeId,
          summary_short: aiContent.summary_short || 'No summary available',
          summary_long: aiContent.summary_long || null,
          tags: aiContent.tags || [],
          key_points: aiContent.key_points || [],
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return new Response(
      JSON.stringify({ success: true, insights: result }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
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