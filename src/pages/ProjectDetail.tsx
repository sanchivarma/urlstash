import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, FileText, Trash2, Edit2, Search } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Textarea } from '../components/ui/Textarea';
import { useToast } from '../components/ui/Toast';
import { supabase } from '../lib/supabase';
import { NewScrapeModal } from '../components/scrapes/NewScrapeModal';

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface Scrape {
  id: string;
  url: string;
  page_title: string;
  meta_description: string | null;
  created_at: string;
  tags: string[];
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [scrapes, setScrapes] = useState<Scrape[]>([]);
  const [filteredScrapes, setFilteredScrapes] = useState<Scrape[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewScrapeModal, setShowNewScrapeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editData, setEditData] = useState({ name: '', description: '' });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProjectData();
  }, [id]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredScrapes(
        scrapes.filter(s =>
          s.page_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      );
    } else {
      setFilteredScrapes(scrapes);
    }
  }, [searchQuery, scrapes]);

  const loadProjectData = async () => {
    if (!id) return;

    try {
      const [projectResult, scrapesResult] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id).single(),
        supabase
          .from('scrapes')
          .select('id, url, page_title, meta_description, created_at, tags')
          .eq('project_id', id)
          .order('created_at', { ascending: false }),
      ]);

      if (projectResult.error) throw projectResult.error;
      if (scrapesResult.error) throw scrapesResult.error;

      setProject(projectResult.data);
      setScrapes(scrapesResult.data);
      setEditData({
        name: projectResult.data.name,
        description: projectResult.data.description || '',
      });
    } catch (error: any) {
      showToast('error', error.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: editData.name,
          description: editData.description || null,
        })
        .eq('id', id);

      if (error) throw error;

      showToast('success', 'Project updated successfully!');
      setShowEditModal(false);
      loadProjectData();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to update project');
    }
  };

  const handleDeleteProject = async () => {
    setDeleting(true);

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);

      if (error) throw error;

      showToast('success', 'Project deleted successfully');
      navigate('/projects');
    } catch (error: any) {
      showToast('error', error.message || 'Failed to delete project');
      setDeleting(false);
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

  if (!project) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
          <Link to="/projects">
            <Button className="mt-4">Back to Projects</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <Link to="/projects" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              {project.description && (
                <p className="text-gray-600 mt-2">{project.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Created {formatDate(project.created_at)} • {scrapes.length} scrapes
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowEditModal(true)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteModal(true)}>
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button onClick={() => setShowNewScrapeModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Scrape
              </Button>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search scrapes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredScrapes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No scrapes found' : 'No scrapes in this project'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Create your first scrape to get started'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowNewScrapeModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Scrape
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
                        <h3 className="font-semibold text-gray-900 truncate">{scrape.page_title}</h3>
                        <p className="text-sm text-gray-600 truncate mt-1">{scrape.url}</p>
                        {scrape.meta_description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{scrape.meta_description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {scrape.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {scrape.tags.length > 3 && (
                            <span className="text-xs text-gray-500">+{scrape.tags.length - 3} more</span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 flex-shrink-0">{formatDate(scrape.created_at)}</span>
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
          loadProjectData();
        }}
      />

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Project">
        <form onSubmit={handleUpdateProject} className="space-y-4">
          <Input
            label="Project Name"
            required
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
          />
          <Textarea
            label="Description"
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            rows={3}
          />
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">Update</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Project">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{project.name}</strong>? This will also delete all {scrapes.length} scrapes in this project. This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowDeleteModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteProject} loading={deleting} className="flex-1">
              Delete Project
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
