import React, { useState } from 'react';
import {
  initialProfile
} from './data/initialData';
import MetricCard from './components/MetricCard';
import ProjectLogCard from './components/ProjectLogCard';
import DeploymentTroubleshooter from './components/DeploymentTroubleshooter';
import AddLogModal from './components/AddLogModal';
import {
  Flame,
  FolderGit2,
  Cpu,
  CheckCircle,
  Terminal,
  Plus,
  Search,
  Layers,
  ExternalLink,
  Activity,
  Calendar,
  GitPullRequest,
  Settings
} from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState(initialProfile);
  const [projects, setProjects] = useState(initialProfile.dated_events_projects_plans);
  const [selectedProjectId, setSelectedProjectId] = useState('project-qs-ai');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Selected active project
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Handle incident resolved state
  const handleResolveIssue = (projectId) => {
    setProjects(prevProjects => 
      prevProjects.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            latest_activity: {
              ...project.latest_activity,
              status: 'resolved'
            }
          };
        }
        return project;
      })
    );
  };

  // Create new manual log
  const handleAddProjectLog = (newProject) => {
    setProjects(prev => [newProject, ...prev]);
    setSelectedProjectId(newProject.id);
  };

  // Filters & Search trigger
  const filteredProjects = projects.filter(proj => {
    const matchesSearch = proj.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          proj.repository.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || proj.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-gray-50 flex flex-col">
      
      {/* Dev Header Navbar */}
      <header className="border-b border-gray-900 bg-gray-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 rounded-lg">
              <Flame className="w-6 h-6 text-indigo-500 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                QuickStart<span className="text-indigo-500">.Ai</span> 
                <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-950/80 border border-indigo-900/40 text-indigo-400 rounded">V10 Live Dashboard</span>
              </span>
              <p className="text-[10px] font-mono text-gray-400">Deployment Automation & Active Log Ledger</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs font-mono text-gray-400 bg-gray-900/80 border border-gray-800 px-3 py-1.5 rounded-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Telemetry Active</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Profile Card & Info banner */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-900/90 to-indigo-950/20 border border-gray-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5 z-10">
            <img 
              src={profile.avatar_url}
              alt={profile.displayName}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/50 bg-gray-800"
            />
            <div className="text-center md:text-left space-y-2">
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">{profile.displayName}</h1>
                <p className="text-xs font-mono text-indigo-400 hover:underline cursor-pointer flex items-center justify-center md:justify-start gap-1 mt-0.5">
                  @{profile.username} <ExternalLink className="w-3 h-3" />
                </p>
              </div>
              <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
                {profile.bio}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col justify-end gap-2.5 z-10 w-full md:w-auto shrink-0">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full md:w-auto px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition duration-150 shadow-lg shadow-indigo-950/50 border border-indigo-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>Record Manual Incident</span>
            </button>
            <a 
              href="https://github.com/micheledallida-web/V10"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto px-4 py-2.5 bg-gray-950 border border-gray-850 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg text-xs font-mono flex items-center justify-center space-x-2 transition duration-150"
            >
              <span>v10-repository-metrics</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Core Profile telemetry metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Active Telemetry Codebase"
            value={projects.length}
            subtext="Configured Repositories"
            icon={FolderGit2}
            colorClass="from-indigo-600 to-blue-600"
          />
          <MetricCard 
            title="Total Logged Events"
            value={profile.stats.total_commits}
            subtext="Recorded System Updates"
            icon={Activity}
            colorClass="from-purple-600 to-indigo-600"
          />
          <MetricCard 
            title="Vercel Deployment Health"
            value={profile.stats.uptime_rate}
            subtext="Operational status standard"
            icon={CheckCircle}
            colorClass="from-emerald-600 to-teal-600"
          />
          <MetricCard 
            title="Diagnostic Solutions"
            value={projects.filter(p => p.latest_activity?.status === 'resolved').length}
            subtext="Vercel Incidents Mitigated"
            icon={Terminal}
            colorClass="from-amber-600 to-red-600"
          />
        </div>

        {/* Workspace Hub Grid layout: Left is project select feed, right is detailed Troubleshooter simulator */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* LEFT: Project feed with filter option (5 cols) */}
          <div className="xl:col-span-5 space-y-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" /> Codebase Ledger & Plans
                  </h2>
                  <p className="text-xs text-gray-400">Select a repository workspace to run isolated diagnostics</p>
                </div>
                <span className="text-xs font-mono bg-gray-900 border border-gray-800 text-gray-400 px-2 py-1 rounded">
                  {filteredProjects.length} visible
                </span>
              </div>
              
              {/* Search & Filter Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    type="text"
                    placeholder="Search projects, repositories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition font-mono"
                  />
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 text-gray-500" />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-300 font-mono focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="active_development">Active Dev</option>
                  <option value="shipped">Shipped</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>

            {/* Active List rendering project cards */}
            <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
              {filteredProjects.length === 0 ? (
                <div className="p-8 text-center bg-gray-900/20 border border-gray-800 border-dashed rounded-xl">
                  <p className="text-xs text-gray-500 font-mono">No active plans or project registries matching requirements found.</p>
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <ProjectLogCard 
                    key={project.id}
                    project={project}
                    onSelect={(p) => setSelectedProjectId(p.id)}
                    isActive={project.id === selectedProjectId}
                  />
                ))
              )}
            </div>
          </div>

          {/* RIGHT: Vercel Interactive Deployment Diagnostic Hub (7 cols) */}
          <div className="xl:col-span-7 space-y-6">
            
            {/* Current Context block */}
            <div className="bg-gray-900 border border-gray-850 rounded-xl p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">INSPECTING PIPELINE</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white mt-1">{activeProject?.project_name}</h2>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">Repo: {activeProject?.repository} on branch '{activeProject?.branch}'</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-mono">Active Status:</span>
                  <span className="px-2.5 py-1 bg-gray-950 text-white rounded border border-gray-850 font-mono text-xs">
                    {activeProject?.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Highlight target troubleshooting context details from Prompt Data */}
              {activeProject?.latest_activity && (
                <div className="space-y-3">
                  <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-red-400 text-xs font-semibold font-mono mb-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                      <span>DETECTED ISSUE - {activeProject.latest_activity.type.toUpperCase()}</span>
                    </div>
                    <p className="text-xs text-gray-300 font-mono leading-relaxed bg-gray-950/60 p-3 rounded border border-gray-900">
                      "{activeProject.latest_activity.issue}"
                    </p>
                  </div>

                  <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold font-mono mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                      <span>INTELLIGENT MITIGATION PROTOCOL</span>
                    </div>
                    <p className="text-xs text-gray-300 font-mono leading-relaxed bg-gray-950/60 p-3 rounded border border-gray-900">
                      "{activeProject.latest_activity.resolution_provided}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive troubleshooter widget */}
            <DeploymentTroubleshooter 
              activeProject={activeProject}
              onResolveIssue={handleResolveIssue}
            />

          </div>
        </div>

        {/* Plan Ledger Calendar of Events details section */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 font-mono flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-indigo-400" /> Active Ledger Event Timestamps
          </h3>
          <div className="space-y-4">
            {projects.map((proj, idx) => (
              <div key={proj.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-950 rounded-lg border border-gray-850 hover:border-gray-800 transition">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-mono text-gray-500 pt-0.5">0{idx + 1}.</span>
                  <div>
                    <span className="text-sm font-bold text-white">{proj.project_name}</span>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">Action: {proj.latest_activity?.type}</p>
                    <div className="text-[11px] text-gray-500 font-mono mt-1 flex flex-wrap gap-x-4">
                      <span>Branch: <strong className="text-gray-300">{proj.branch}</strong></span>
                      <span>ID: <strong className="text-gray-300">{proj.id}</strong></span>
                      <span>Resolution Status: 
                        <strong className={proj.latest_activity?.status === 'resolved' ? 'text-emerald-400 ml-1' : 'text-amber-400 ml-1'}>
                          {proj.latest_activity?.status || 'unresolved'}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 md:mt-0 text-right shrink-0">
                  <span className="inline-block px-3 py-1 bg-gray-900 text-gray-400 font-mono text-xs rounded border border-gray-800">
                    {proj.latest_activity?.timestamp ? new Date(proj.latest_activity.timestamp).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Dev Footer details */}
      <footer className="border-t border-gray-900 bg-gray-950 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 font-mono gap-4">
          <div>
            <span>© 2026 micheledallida-web. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
              Framework Override Version: v10.4.1
            </span>
            <span>Vercel Integration Agent v2.3</span>
          </div>
        </div>
      </footer>

      {/* Modal trigger creation log entry */}
      <AddLogModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddProjectLog}
      />
    </div>
  );
}