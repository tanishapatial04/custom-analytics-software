import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { TrendingUp, Plus, Eye, MessageSquare, LogOut, Settings, BarChart3, Users, Activity } from 'lucide-react';
import NLQInterface from '../components/NLQInterface';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showNLQ, setShowNLQ] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newProject, setNewProject] = useState({ name: '', domain: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/projects');
      setProjects(response.data);
      if (response.data.length > 0 && !selectedProject) {
        setSelectedProject(response.data[0]);
      }
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/projects', newProject);
      toast.success('Project created successfully!');
      setProjects([...projects, response.data]);
      setSelectedProject(response.data);
      setShowCreateProject(false);
      setNewProject({ name: '', domain: '' });
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-[#1C4B42] animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-[#1C4B42]" />
              <span className="text-2xl font-bold text-slate-900">SignalVista</span>
            </div>
            
            {/* Project Selector */}
            {projects.length > 0 && (
              <select
                data-testid="project-selector"
                value={selectedProject?.id || ''}
                onChange={(e) => {
                  const project = projects.find(p => p.id === e.target.value);
                  setSelectedProject(project);
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Button
              data-testid="create-project-button"
              onClick={() => setShowCreateProject(true)}
              variant="outline"
              className="border-[#b4e717] text-[#1C4B42] hover:bg-[#f8fbe8]"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-lg">
              <div className="w-8 h-8 bg-[#b4e717] rounded-full flex items-center justify-center text-[#1C4B42] font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-slate-700 font-medium">{user?.name}</span>
            </div>
            <Button
              data-testid="logout-button"
              onClick={onLogout}
              variant="ghost"
              className="text-slate-600 hover:text-slate-900"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-6 py-8">
        {projects.length === 0 ? (
          // Empty State
          <div className="max-w-2xl mx-auto text-center py-20" data-testid="empty-state">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-[#1C4B42]" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Create your first project</h2>
            <p className="text-lg text-slate-600 mb-8">
              Start tracking analytics by creating a project for your website
            </p>
            <Button
              data-testid="create-first-project-button"
              onClick={() => setShowCreateProject(true)}
              className="bg-[#b4e717] text-[#1C4B42] px-8 py-6 text-lg rounded-full hover:bg-[#b4e718] hover:text-[#1C4B42]"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Project
            </Button>
          </div>
        ) : (
          <div>
            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <Button
                data-testid="view-analytics-button"
                onClick={() => setShowNLQ(false)}
                className={`flex-1 py-6 rounded-xl font-semibold transition-all ${
                  !showNLQ 
                    ? 'bg-[#b4e717] text-[#1C4B42] shadow-lg' 
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Analytics Dashboard
              </Button>
              <Button
                data-testid="ask-nlq-button"
                onClick={() => setShowNLQ(true)}
                className={`flex-1 py-6 rounded-xl font-semibold transition-all ${
                  showNLQ 
                    ? 'bg-[#b4e717] text-[#1C4B42] shadow-lg' 
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Ask Natural Language
              </Button>
              <Button
                data-testid="project-settings-button"
                onClick={() => navigate(`/projects/${selectedProject.id}/settings`)}
                variant="outline"
                className="px-6 py-6 rounded-xl border-slate-300 hover:bg-slate-50"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>

            {/* Content Area */}
            {showNLQ ? (
              <NLQInterface projectId={selectedProject.id} />
            ) : (
              <AnalyticsDashboard projectId={selectedProject.id} />
            )}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <Card className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8" data-testid="create-project-modal">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <Label htmlFor="project-name" className="text-slate-700">Project Name</Label>
                <Input
                  id="project-name"
                  data-testid="input-project-name"
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                  placeholder="My Awesome Website"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="project-domain" className="text-slate-700">Domain</Label>
                <Input
                  id="project-domain"
                  data-testid="input-project-domain"
                  type="text"
                  value={newProject.domain}
                  onChange={(e) => setNewProject({ ...newProject, domain: e.target.value })}
                  required
                  placeholder="example.com"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  data-testid="cancel-create-project-button"
                  type="button"
                  onClick={() => setShowCreateProject(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  data-testid="confirm-create-project-button"
                  type="submit"
                  className="flex-1 bg-[#b4e717] text-[#1C4B42] hover:bg-[#b4e718] hover:text-[#1C4B42]"
                >
                  Create Project
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
