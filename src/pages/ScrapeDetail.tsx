import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Sparkles, Link as LinkIcon, Hash, Trash2, RefreshCw } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import { supabase } from '../lib/supabase';
import { Modal } from '../components/ui/Modal';

interface Scrape {
  id: string;
  url: string;
  page_title: string;
  meta_description: string | null;
  favicon_url: string | null;
  created_at: string;
  notes: string | null;
  tags: string[];
  project: {
    id: string;
    name: string;
  };
}

interface Heading {
  id: string;
  level: number;
  text: string;
  order_index: number;
}

interface LinkItem {
  id: string;
  url: string;
  anchor_text: string;
  is_external: boolean;
  order_index: number;
}

interface AIInsight {
  id: string;
  summary_short: string;
  summary_long: string | null;
  tags: string[];
  key_points: any;
}

export function ScrapeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [scrape, setScrape] = useState<Scrape | null>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [regeneratingAi, setRegeneratingAi] = useState(false);

  useEffect(() => {
    loadScrapeData();
  }, [id]);

  const loadScrapeData = async () => {
    if (!id) return;

    try {
      const [scrapeResult, headingsResult, linksResult, aiResult] = await Promise.all([
        supabase
          .from('scrapes')
          .select('*, project:projects(id, name)')
          .eq('id', id)
          .single(),
        supabase
          .from('headings')
          .select('*')
          .eq('scrape_id', id)
          .order('order_index'),
        supabase
          .from('links')
          .select('*')
          .eq('scrape_id', id)
          .order('order_index'),
        supabase
          .from('ai_insights')
          .select('*')
          .eq('scrape_id', id)
          .maybeSingle(),
      ]);

      if (scrapeResult.error) throw scrapeResult.error;
      if (headingsResult.error) throw headingsResult.error;
      if (linksResult.error) throw linksResult.error;
      if (aiResult.error && aiResult.error.code !== 'PGRST116') throw aiResult.error;

      setScrape(scrapeResult.data as any);
      setHeadings(headingsResult.data);
      setLinks(linksResult.data);
      setAiInsights(aiResult.data);
    } catch (error: any) {
      showToast('error', error.message || 'Failed to load scrape');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateAi = async () => {
    if (!scrape) return;

    setRegeneratingAi(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ai-insights`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scrapeId: id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate AI insights');
      }

      showToast('success', 'AI insights regenerated!');
      loadScrapeData();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to regenerate AI insights');
    } finally {
      setRegeneratingAi(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const { error } = await supabase.from('scrapes').delete().eq('id', id);

      if (error) throw error;

      showToast('success', 'Scrape deleted successfully');
      navigate(`/projects/${scrape?.project.id}`);
    } catch (error: any) {
      showToast('error', error.message || 'Failed to delete scrape');
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getHeadingStyle = (level: number) => {
    const styles = {
      1: 'text-2xl font-bold text-gray-900',
      2: 'text-xl font-semibold text-gray-900 ml-4',
      3: 'text-lg font-medium text-gray-800 ml-8',
      4: 'text-base font-medium text-gray-700 ml-12',
      5: 'text-sm font-medium text-gray-700 ml-16',
      6: 'text-sm font-normal text-gray-600 ml-20',
    };
    return styles[level as keyof typeof styles] || styles[6];
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  if (!scrape) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900">Scrape not found</h2>
          <Link to="/scrapes">
            <Button className="mt-4">Back to Scrapes</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <Link
            to={`/projects/${scrape.project.id}`}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {scrape.project.name}
          </Link>

          <div className="flex items-start gap-4">
            {scrape.favicon_url && (
              <img src={scrape.favicon_url} alt="" className="w-8 h-8 rounded" />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{scrape.page_title}</h1>
              <a
                href={scrape.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 mt-2"
              >
                {scrape.url}
                <ExternalLink className="w-4 h-4" />
              </a>
              {scrape.meta_description && (
                <p className="text-gray-600 mt-3">{scrape.meta_description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">Scraped on {formatDate(scrape.created_at)}</p>
            </div>

            <Button variant="ghost" size="sm" onClick={() => setShowDeleteModal(true)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {aiInsights && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerateAi}
                loading={regeneratingAi}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Summary</h3>
                <p className="text-gray-900">{aiInsights.summary_short}</p>
                {aiInsights.summary_long && (
                  <p className="text-gray-700 mt-2">{aiInsights.summary_long}</p>
                )}
              </div>

              {aiInsights.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {aiInsights.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(aiInsights.key_points) && aiInsights.key_points.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Key Takeaways</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {aiInsights.key_points.map((point: string, idx: number) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {headings.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Headings</h2>
                  <span className="text-sm text-gray-500">({headings.length})</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {headings.map(heading => (
                  <div key={heading.id} className={getHeadingStyle(heading.level)}>
                    {heading.text}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {links.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Links</h2>
                  <span className="text-sm text-gray-500">({links.length})</span>
                </div>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                <div className="space-y-2">
                  {links.map(link => (
                    <div key={link.id} className="border-b border-gray-100 pb-2 last:border-0">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                      >
                        {link.anchor_text || link.url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <p className="text-xs text-gray-500 truncate mt-1">{link.url}</p>
                      {link.is_external && (
                        <span className="text-xs text-gray-400">External</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {headings.length === 0 && links.length === 0 && (
          <Card>
            <CardContent className="text-center py-16">
              <p className="text-gray-600">No content extracted from this page</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Scrape">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this scrape? This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting} className="flex-1">
              Delete Scrape
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
