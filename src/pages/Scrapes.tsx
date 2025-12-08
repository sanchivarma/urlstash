import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Search, Filter } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useToast } from '../components/ui/Toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { NewScrapeModal } from '../components/scrapes/NewScrapeModal';

interface Scrape {
  id: string;
  url: string;
  page_title: string;
  meta_description: string | null;
  created_at: string;
  tags: string[];
  project: {
    id: string;
    name: string;
  };
}

interface Project {
  id: string;
  name: string;
}

export function Scrapes() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [scrapes, setScrapes] = useState<Scrape[]>([]);
  const [filteredScrapes, setFilteredScrapes] = useState<Scrape[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [showNewScrapeModal, setShowNewScrapeModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    let filtered = scrapes;

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.page_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedProject) {
      filtered = filtered.filter(s => s.project.id === selectedProject);
    }

    setFilteredScrapes(filtered);
  }, [searchQuery, selectedProject, scrapes]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [scrapesResult, projectsResult] = await Promise.all([
        supabase
          .from('scrapes')
          .select('id, url, page_title, meta_description, created_at, tags, project:projects(id, name)')
          .order('created_at', { ascending: false }),
        supabase.from('projects').select('id, name').order('name'),
      ]);

      if (scrapesResult.error) throw scrapesResult.error;
      if (projectsResult.error) throw projectsResult.error;

      setScrapes(scrapesResult.data as any);
      setProjects(projectsResult.data);
    } catch (error: any) {
      showToast('error', error.message || 'Failed to load scrapes');
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Scrapes</h1>
            <p className="text-gray-600 mt-1">Browse and search all your scraped content</p>
          </div>
          <Button onClick={() => setShowNewScrapeModal(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Scrape
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by title, URL, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </Select>
        </div>

        {filteredScrapes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || selectedProject ? 'No scrapes found' : 'No scrapes yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedProject
                  ? 'Try adjusting your filters'
                  : 'Create your first scrape to get started'}
              </p>
              {!searchQuery && !selectedProject && (
                <Button onClick={() => setShowNewScrapeModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Scrape
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredScrapes.map(scrape => (
              <Link key={scrape.id} to={`/scrapes/${scrape.id}`}>
                <Card hover>
                  <CardContent>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {scrape.project.name}
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(scrape.created_at)}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 truncate">{scrape.page_title}</h3>
                        <p className="text-sm text-gray-600 truncate mt-1">{scrape.url}</p>
                        {scrape.meta_description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{scrape.meta_description}</p>
                        )}
                        {scrape.tags.length > 0 && (
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {scrape.tags.slice(0, 4).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {scrape.tags.length > 4 && (
                              <span className="text-xs text-gray-500">+{scrape.tags.length - 4} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <NewScrapeModal
        isOpen={showNewScrapeModal}
        onClose={() => setShowNewScrapeModal(false)}
        onSuccess={() => {
          setShowNewScrapeModal(false);
          loadData();
        }}
      />
    </AppLayout>
  );
}
