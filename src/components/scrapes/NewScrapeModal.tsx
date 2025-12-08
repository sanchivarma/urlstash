import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useToast } from '../ui/Toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Plus } from 'lucide-react';

interface NewScrapeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Project {
  id: string;
  name: string;
}

export function NewScrapeModal({ isOpen, onClose, onSuccess }: NewScrapeModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    projectId: '',
    newProjectName: '',
    useAi: true,
  });

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .select('id, name')
      .order('name');

    if (error) {
      showToast('error', 'Failed to load projects');
      return;
    }

    setProjects(data || []);
  };

  const normalizeUrl = (url: string) => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return '';

    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return `https://${trimmedUrl}`;
    }
    return trimmedUrl;
  };

  const validateUrl = (url: string) => {
    try {
      new URL(normalizeUrl(url));
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedUrl = normalizeUrl(formData.url);

    if (!validateUrl(formData.url)) {
      showToast('error', 'Please enter a valid URL (e.g., example.com or https://example.com)');
      return;
    }

    let projectId = formData.projectId;

    if (showNewProject) {
      if (!formData.newProjectName.trim()) {
        showToast('error', 'Please enter a project name');
        return;
      }

      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: formData.newProjectName,
          user_id: user!.id,
        })
        .select('id')
        .single();

      if (projectError) {
        showToast('error', 'Failed to create project');
        return;
      }

      projectId = newProject.id;
    }

    if (!projectId) {
      showToast('error', 'Please select a project');
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-url`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: normalizedUrl,
          projectId,
          useAi: formData.useAi,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to scrape URL');
      }

      const result = await response.json();
      showToast('success', 'Page scraped successfully!');
      onSuccess();
      resetForm();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to scrape URL');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      url: '',
      projectId: '',
      newProjectName: '',
      useAi: true,
    });
    setShowNewProject(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Scrape" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Website URL"
          type="url"
          required
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="example.com or https://example.com"
          helperText="Enter the website URL (https:// will be added automatically if not specified)"
        />

        {!showNewProject ? (
          <div>
            <Select
              label="Project"
              required
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            >
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </Select>
            <button
              type="button"
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              onClick={() => setShowNewProject(true)}
            >
              <Plus className="w-4 h-4" />
              Create new project
            </button>
          </div>
        ) : (
          <div>
            <Input
              label="New Project Name"
              required
              value={formData.newProjectName}
              onChange={(e) => setFormData({ ...formData, newProjectName: e.target.value })}
              placeholder="My Project"
            />
            <button
              type="button"
              className="mt-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              onClick={() => setShowNewProject(false)}
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="useAi"
            checked={formData.useAi}
            onChange={(e) => setFormData({ ...formData, useAi: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="useAi" className="text-sm text-slate-700 dark:text-slate-300">
            Use AI to summarize and analyze this page
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            Scrape Website
          </Button>
        </div>
      </form>
    </Modal>
  );
}
