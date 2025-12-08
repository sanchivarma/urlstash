import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderOpen, FileText, TrendingUp } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { NewScrapeModal } from '../components/scrapes/NewScrapeModal';

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  scrape_count?: number;
}

interface Scrape {
  id: string;
  url: string;
  page_title: string;
  created_at: string;
  project: {
    name: string;
  };
}

export function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentScrapes, setRecentScrapes] = useState<Scrape[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewScrapeModal, setShowNewScrapeModal] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalScrapes: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const [projectsResult, scrapesResult] = await Promise.all([
        supabase
          .from('projects')
          .select('*, scrapes(count)')
          .order('updated_at', { ascending: false })
          .limit(4),
        supabase
          .from('scrapes')
          .select('id, url, page_title, created_at, project:projects(name)')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      if (projectsResult.error) throw projectsResult.error;
      if (scrapesResult.error) throw scrapesResult.error;

      const projectsWithCount = projectsResult.data.map(p => ({
        ...p,
        scrape_count: Array.isArray(p.scrapes) ? p.scrapes.length : 0,
      }));

      setProjects(projectsWithCount);
      setRecentScrapes(scrapesResult.data as any);

      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      const { count: scrapeCount } = await supabase
        .from('scrapes')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalProjects: projectCount || 0,
        totalScrapes: scrapeCount || 0,
      });
    } catch (error: any) {
      showToast('error', error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening.</p>
          </div>
          <Button onClick={() => setShowNewScrapeModal(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Scrape
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Scrapes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalScrapes}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recentScrapes.filter(s => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(s.created_at) > weekAgo;
                  }).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
              <Link to="/projects">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
            {projects.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No projects yet</p>
                  <Link to="/projects">
                    <Button size="sm">Create your first project</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {projects.map(project => (
                  <Link key={project.id} to={`/projects/${project.id}`}>
                    <Card hover>
                      <CardContent>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
                            {project.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>{project.scrape_count || 0} scrapes</span>
                              <span>{formatDate(project.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Scrapes</h2>
              <Link to="/scrapes">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
            {recentScrapes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No scrapes yet</p>
                  <Button size="sm" onClick={() => setShowNewScrapeModal(true)}>
                    Create your first scrape
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentScrapes.map(scrape => (
                  <Link key={scrape.id} to={`/scrapes/${scrape.id}`}>
                    <Card hover>
                      <CardContent>
                        <h3 className="font-medium text-gray-900 truncate">{scrape.page_title}</h3>
                        <p className="text-sm text-gray-600 truncate mt-1">{scrape.url}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{scrape.project?.name}</span>
                          <span>{formatDate(scrape.created_at)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <NewScrapeModal
        isOpen={showNewScrapeModal}
        onClose={() => setShowNewScrapeModal(false)}
        onSuccess={() => {
          setShowNewScrapeModal(false);
          loadDashboardData();
        }}
      />
    </AppLayout>
  );
}
