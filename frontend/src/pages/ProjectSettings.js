import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { TrendingUp, ArrowLeft, Copy, Code, CheckCircle } from 'lucide-react';
import { Trash } from 'lucide-react';

export default function ProjectSettings({ user, onLogout }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/projects/${projectId}`);
      setProject(response.data);
    } catch (error) {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const trackingScript = project ? `<!-- SignalVista Analytics -->
<script>
  (function() {
    window.SignalVista = {
      projectId: '${project.id}',
      trackingCode: '${project.tracking_code}',
      apiUrl: '${process.env.REACT_APP_BACKEND_URL}/api'
    };
    
    // Generate session ID
    let sessionId = sessionStorage.getItem('df_session');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('df_session', sessionId);
    }
    
    // Track function
    window.SignalVista.track = function(eventType, eventData) {
      fetch(window.SignalVista.apiUrl + '/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: window.SignalVista.projectId,
          tracking_code: window.SignalVista.trackingCode,
          session_id: sessionId,
          event_type: eventType,
          page_url: window.location.href,
          page_title: document.title,
          referrer: document.referrer,
          user_agent: navigator.userAgent,
          consent_given: true,
          ...eventData
        })
      });
    };
    
    // Auto-track pageview
    window.SignalVista.track('pageview');
  })();
</script>` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackingScript);
    setCopied(true);
    toast.success('Tracking code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const openDeleteModal = () => {
    setDeleteConfirmText('');
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmText('');
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    if (deleteConfirmText !== project.name) {
      toast.error('Project name does not match. Type the exact project name to confirm.');
      return;
    }
    try {
      setDeleting(true);
      // Call delete endpoint - adjust path if your API uses /api prefix
      await axios.delete(`/projects/${project.id}`);
      toast.success('Project deleted successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to delete project');
    } finally {
      setDeleting(false);
      closeDeleteModal();
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              data-testid="back-to-dashboard-button"
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-slate-900">SignalVista</span>
            </div>
          </div>
          <div className="text-slate-700 font-medium">Settings: {project?.name}</div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Project Settings</h1>
        <p className="text-lg text-slate-600 mb-8">Configure tracking and privacy settings</p>

        {/* Project Info */}
        <Card className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="project-info-card">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Project Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Project Name</label>
              <div className="mt-1 text-sm text-slate-700 font-mono bg-slate-100 px-3 py-2 rounded">{project?.name}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Domain</label>
              <div className="mt-1 text-sm text-slate-700 font-mono bg-slate-100 px-3 py-2 rounded">{project?.domain}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Project ID</label>
              <div className="mt-1 text-sm text-slate-700 font-mono bg-slate-100 px-3 py-2 rounded">
                {project?.id}
              </div>
            </div>
          </div>
        </Card>

        {/* Delete Project */}
        <Card className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="delete-project-card">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Danger Zone</h2>
              <p className="text-sm text-slate-600">Permanently delete this project and all associated data. This action cannot be undone.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={openDeleteModal}
                data-testid="open-delete-modal-button"
              >
                <Trash className="w-4 h-4 mr-2" /> Delete Project
              </Button>
            </div>
          </div>
        </Card>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6">
              <h3 className="text-xl font-bold mb-2">Confirm Project Deletion</h3>
              <p className="text-sm text-slate-600 mb-4">To permanently delete the project, type the project name below exactly: <span className="font-medium">{project?.name}</span></p>

              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full border border-slate-200 rounded px-3 py-2 mb-4"
                placeholder="Type project name to confirm"
                data-testid="delete-confirm-input"
              />

              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={closeDeleteModal} className="text-slate-600">Cancel</Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDeleteProject}
                  disabled={deleteConfirmText !== project?.name || deleting}
                  data-testid="confirm-delete-button"
                >
                  {deleting ? 'Deleting...' : 'Delete Project'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tracking Code */}
        <Card className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="tracking-code-card">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Tracking Code</h2>
              <p className="text-slate-600">Add this code to your website's &lt;head&gt; section</p>
            </div>
            <Button
              data-testid="copy-tracking-code-button"
              onClick={copyToClipboard}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {copied ? (
                <><CheckCircle className="w-4 h-4 mr-2" />Copied!</>
              ) : (
                <><Copy className="w-4 h-4 mr-2" />Copy Code</>
              )}
            </Button>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 overflow-x-auto">
            <pre className="text-sm text-green-400 font-mono">{trackingScript}</pre>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="bg-white rounded-2xl shadow-lg p-8" data-testid="privacy-settings-card">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Privacy Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-200">
              <div>
                <div className="font-semibold text-slate-900">IP Anonymization</div>
                <div className="text-sm text-slate-600">Hash IP addresses for user privacy</div>
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Enabled
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-200">
              <div>
                <div className="font-semibold text-slate-900">Consent Management</div>
                <div className="text-sm text-slate-600">Require user consent before tracking</div>
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Enabled
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-semibold text-slate-900">Respect Do Not Track</div>
                <div className="text-sm text-slate-600">Honor browser DNT settings</div>
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Enabled
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
