import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  GitBranch,
  History,
  Code2,
  Settings,
  Database,
  CheckCircle2,
  XCircle,
  Play,
  RefreshCw,
  User,
  Terminal,
  Cpu,
  Plus,
  ExternalLink,
  FileCode,
  CloudLightning,
  Check
} from 'lucide-react';

// Initial profile structure containing the exact active target state
const INITIAL_PROFILE = {
  user_info: {
    name: "Michele Dallida",
    handle: "@micheledallida-web",
    role: "Senior Cloud Systems Engineer & Fullstack Developer",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256",
    bio: "Specializing in strict framework builds, serverless deployments, and predictive self-healing CI/CD runtimes."
  },
  dated_events_projects_plans: [
    {
      project_name: "QuickStart.Ai",
      repository: "micheledallida-web/V10",
      branch: "main",
      status: "active_development",
      latest_activity: {
        timestamp: "2026-07-19T04:33:22Z",
        type: "vercel_deployment_troubleshooting",
        issue: "Vercel production build failure for strict Next.js application due to a missing framework version detection error.",
        resolution_provided: "Verifying package.json root directory tracking and dependency configuration without making structural assumptions."
      }
    },
    {
      project_name: "DevOps Shield (Archived)",
      repository: "micheledallida-web/devops-shield-v2",
      branch: "production",
      status: "completed",
      latest_activity: {
        timestamp: "2026-05-11T14:20:00Z",
        type: "security_hardening",
        issue: "Cross-origin isolation policies causing WebAssembly modules memory access faults.",
        resolution_provided: "Configured strict COOP and COEP HTTP headers on Cloudflare edge handlers."
      }
    },
    {
      project_name: "Serverless Edge Proxy",
      repository: "micheledallida-web/edge-routing",
      branch: "v2-canary",
      status: "active_development",
      latest_activity: {
        timestamp: "2026-07-12T09:15:33Z",
        type: "cold_start_mitigation",
        issue: "V8 Engine memory initialization delay on secondary region proxies exceeding 400ms target.",
        resolution_provided: "Implemented active request routing warmup scripts & minimized module load footprints."
      }
    }
  ],
  deployment_environments: {
    "QuickStart.Ai": {
      provider: "Vercel",
      status: "error",
      lastBuildStatus: "failed",
      region: "iad1 (Washington, D.C.)",
      runtime: "Next.js (Strict Mode)",
      frameworkVersion: "14.2.4-strict-patch"
    },
    "DevOps Shield (Archived)": {
      provider: "Cloudflare Pages",
      status: "active",
      lastBuildStatus: "passed",
      region: "Global Edge Grid",
      runtime: "React (Static Gateway)",
      frameworkVersion: "18.3.1"
    },
    "Serverless Edge Proxy": {
      provider: "AWS CloudFront Functions",
      status: "active",
      lastBuildStatus: "passed",
      region: "us-east-1",
      runtime: "NodeJS CloudRuntime",
      frameworkVersion: "v20.x"
    }
  }
};

export default function App() {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('user_profile_state');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [selectedProject, setSelectedProject] = useState(profile.dated_events_projects_plans[0].project_name);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jsonText, setJsonText] = useState(JSON.stringify(profile, null, 2));
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildLogs, setBuildLogs] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  
  // Form states for adding new activity log
  const [newProjectName, setNewProjectName] = useState('QuickStart.Ai');
  const [newActivityType, setNewActivityType] = useState('vercel_deployment_troubleshooting');
  const [newIssue, setNewIssue] = useState('');
  const [newResolution, setNewResolution] = useState('');

  useEffect(() => {
    localStorage.setItem('user_profile_state', JSON.stringify(profile));
    setJsonText(JSON.stringify(profile, null, 2));
  }, [profile]);

  const handleJsonChange = (e) => {
    setJsonText(e.target.value);
  };

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.dated_events_projects_plans && Array.isArray(parsed.dated_events_projects_plans)) {
        setProfile(parsed);
        triggerNotification("Profile state loaded & synced successfully!");
      } else {
        alert("Invalid Profile schema: 'dated_events_projects_plans' must be an array.");
      }
    } catch (err) {
      alert("JSON syntax error: " + err.message);
    }
  };

  const triggerNotification = (msg) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3500);
  };

  const triggerBuildSimulation = (projName) => {
    const proj = profile.dated_events_projects_plans.find(p => p.project_name === projName);
    if (!proj) return;

    setIsBuilding(true);
    setActiveTab('terminal');
    setBuildLogs([
      `[1/4] 🚀 Initializing Vercel environment build for repository ${proj.repository}...`,
      `[2/4] 🧬 Tracking root directory dependency tree in branch [${proj.branch}]...`,
    ]);

    setTimeout(() => {
      setBuildLogs(prev => [...prev, 
        `[3/4] ⚠️ WARN: Strict validation flag is enabled.`, 
        `[3/4] ❌ ERR: ${proj.latest_activity.issue}`,
        `[3/4] 🔍 Root Cause: Next.js strict build error due to missing framework version signature mismatch. Parsing config...`,
      ]);
    }, 1200);

    setTimeout(() => {
      setBuildLogs(prev => [...prev, 
        `[4/4] 🛠️ Applying resolution hook: "${proj.latest_activity.resolution_provided}"`, 
        `[4/4] ✨ Recalibrating root package.json dependency tracking files.`, 
        `[4/4] ✅ Framework successfully compiled into static modules.`,
        `🎉 Vercel deployment production build SUCCESSFUL for ${proj.project_name}!`
      ]);
      
      // Dynamically update status of environment to active
      setProfile(prev => {
        const updatedEnvs = { ...prev.deployment_environments };
        if (updatedEnvs[projName]) {
          updatedEnvs[projName].status = "active";
          updatedEnvs[projName].lastBuildStatus = "passed";
        }
        return { ...prev, deployment_environments: updatedEnvs };
      });

      setIsBuilding(false);
      triggerNotification(`${projName} deployed to Production Vercel state!`);
    }, 3200);
  };

  const handleAddNewActivity = (e) => {
    e.preventDefault();
    if (!newIssue || !newResolution) {
      alert("Please specify the Issue and Resolution for this deployment log");
      return;
    }

    setProfile(prev => {
      const updatedPlans = prev.dated_events_projects_plans.map(p => {
        if (p.project_name === newProjectName) {
          return {
            ...p,
            latest_activity: {
              timestamp: new Date().toISOString(),
              type: newActivityType,
              issue: newIssue,
              resolution_provided: newResolution
            }
          };
        }
        return p;
      });

      // Also dynamically set environment back to 'error' status to allow testing of resolutions!
      const updatedEnvs = { ...prev.deployment_environments };
      if (updatedEnvs[newProjectName]) {
        updatedEnvs[newProjectName].status = "error";
        updatedEnvs[newProjectName].lastBuildStatus = "failed";
      }

      return {
        ...prev,
        dated_events_projects_plans: updatedPlans,
        deployment_environments: updatedEnvs
      };
    });

    setNewIssue('');
    setNewResolution('');
    triggerNotification(`Updated event log for ${newProjectName}. Try executing a build mock!`);
  };

  const resetToDefault = () => {
    setProfile(INITIAL_PROFILE);
    triggerNotification("Profile reset to original telemetry payload!");
  };

  const selectedProjData = profile.dated_events_projects_plans.find(p => p.project_name === selectedProject) 
    || profile.dated_events_projects_plans[0];

  const currentEnv = profile.deployment_environments[selectedProjData.project_name];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* TOP DEVSYNC HEADER BAR */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <CloudLightning className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  DevOps Control Tower
                </h1>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded">
                  V10.7-LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Strict Vercel Environment Deployment & Event Resolution Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetToDefault}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 text-slate-400 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="h-3 w-3" />
              Reset State
            </button>

            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs text-emerald-400 font-mono bg-emerald-950/50 border border-emerald-900/50 px-2 py-1 rounded">
              Sync Engine Connected
            </span>
          </div>
        </div>
      </header>

      {/* NOTIFICATION TOAST */}
      {showNotification && (
        <div className="fixed bottom-5 right-5 z-50 bg-indigo-950 border border-indigo-500 text-indigo-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <p className="text-sm font-medium">{notificationMsg}</p>
        </div>
      )}

      {/* HERO DEV IDENTITY SECTION */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-900 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={profile.user_info.avatar_url}
              alt={profile.user_info.name}
              className="h-16 w-16 rounded-full border-2 border-indigo-500/50 object-cover shadow-indigo-900/30 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{profile.user_info.name}</h2>
                <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">{profile.user_info.handle}</span>
              </div>
              <p className="text-sm text-indigo-400 font-medium">{profile.user_info.role}</p>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">{profile.user_info.bio}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
            <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl">
              <p className="text-[10px] text-slate-400 font-mono uppercase">Monitored Repos</p>
              <p className="text-2xl font-extrabold text-white font-mono mt-0.5">
                {profile.dated_events_projects_plans.length}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl">
              <p className="text-[10px] text-slate-400 font-mono uppercase">Active Statuses</p>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">
                {profile.dated_events_projects_plans.filter(p => p.status === 'active_development').length}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl col-span-2 sm:col-span-1">
              <p className="text-[10px] text-slate-400 font-mono uppercase">Failed Builds</p>
              <p className="text-2xl font-extrabold text-rose-500 font-mono mt-0.5">
                {Object.values(profile.deployment_environments).filter(e => e.status === 'error').length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER LAYOUT */}
      <main className="max-w-7xl mx-auto p-4 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 w-full">
        
        {/* LEFT COLUMN: CONTROL TABS & INTERACTIVE FORMS */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* INTERACTIVE COMPONENT: PROJECT SELECTOR */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-400" />
              Active Target Repositories
            </h3>
            <div className="space-y-2.5">
              {profile.dated_events_projects_plans.map((proj) => {
                const isSelected = selectedProject === proj.project_name;
                const env = profile.deployment_environments[proj.project_name];
                return (
                  <button
                    key={proj.project_name}
                    onClick={() => setSelectedProject(proj.project_name)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex flex-col gap-1.5 ${
                      isSelected 
                        ? 'bg-slate-800/70 border-cyan-500 shadow-md shadow-cyan-950/20' 
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/30 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-sm text-white">{proj.project_name}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        env?.status === 'active' 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' 
                          : 'bg-rose-950 text-rose-400 border border-rose-800/50'
                      }`}>
                        {env?.status === 'active' ? 'Active' : 'Unresolved Build'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <GitBranch className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{proj.repository}</span>
                      <span className="text-slate-600">|</span>
                      <span>{proj.branch}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SIDE PANEL: APPEND NEW TROUBLESHOOTING LOG */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4 text-indigo-400" />
              Override/Inject Activity Log
            </h3>
            <form onSubmit={handleAddNewActivity} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase">Target Project</label>
                <select
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {profile.dated_events_projects_plans.map(p => (
                    <option key={p.project_name} value={p.project_name}>{p.project_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase">Activity Type Tag</label>
                <input
                  type="text"
                  value={newActivityType}
                  onChange={(e) => setNewActivityType(e.target.value)}
                  placeholder="e.g. vercel_deployment_troubleshooting"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase">Observed Production Issue</label>
                <textarea
                  rows={2}
                  value={newIssue}
                  onChange={(e) => setNewIssue(e.target.value)}
                  placeholder="Vercel production build failure for strict Next.js application due to a missing framework version detection error."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 custom-scrollbar"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase">Resolution Action</label>
                <textarea
                  rows={2}
                  value={newResolution}
                  onChange={(e) => setNewResolution(e.target.value)}
                  placeholder="Verifying package.json root directory tracking and dependency configuration..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 custom-scrollbar"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-medium rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-950/50"
              >
                <Database className="h-3.5 w-3.5" />
                Apply Telemetry Update
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: DETAIL WORKSPACE & CODE SYNC */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* VIEW TAB SELECTOR */}
          <div className="flex border-b border-slate-800 gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'dashboard' 
                  ? 'border-indigo-500 text-white bg-slate-900/30' 
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard Monitor
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'terminal' 
                  ? 'border-indigo-500 text-white bg-slate-900/30' 
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              Vercel Shell Logs
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'json' 
                  ? 'border-indigo-500 text-white bg-slate-900/30' 
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              Synchronize Profile JSON
            </button>
          </div>

          {/* TAB 1: INTERACTIVE MONITOR & COMPILATION PREVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* DETAILED PROJECT DIAGNOSTIC WORKSPACE */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                      <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">Target Workspace</span>
                    </div>
                    <h2 className="text-2xl font-black text-white mt-1">{selectedProjData.project_name}</h2>
                  </div>
                  
                  <button
                    onClick={() => triggerBuildSimulation(selectedProjData.project_name)}
                    disabled={isBuilding}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-md ${
                      isBuilding 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                    }`}
                  >
                    <Play className={`h-3.5 w-3.5 ${isBuilding ? 'animate-spin' : ''}`} />
                    {isBuilding ? 'Running Verifications...' : 'Execute Vercel Production Build'}
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  
                  {/* CLOUD ENVIRONMENT SPECS */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Host Provider</span>
                      <span className="text-sm font-semibold text-white mt-1 block">{currentEnv?.provider || "Vercel Cloud"}</span>
                    </div>
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Runtime Target</span>
                      <span className="text-sm font-semibold text-white mt-1 block font-mono text-indigo-400">{currentEnv?.runtime || "NodeJS Strict Mode"}</span>
                    </div>
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Version Detection Engine</span>
                      <span className="text-sm font-semibold text-white mt-1 block font-mono text-cyan-400">{currentEnv?.frameworkVersion || "Detected Dynamic"}</span>
                    </div>
                  </div>

                  {/* TELEMETRY ERROR REPORTING BLOCK */}
                  <div className={`p-5 rounded-2xl border transition-all ${ 
                    currentEnv?.status === 'active'
                      ? 'bg-emerald-950/10 border-emerald-900/50 text-emerald-100'
                      : 'bg-rose-950/10 border-rose-900/50 text-rose-100'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${ 
                        currentEnv?.status === 'active' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                      }`}>
                        {currentEnv?.status === 'active' ? <Check className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider block text-slate-400">
                          Telemetry Diagnosis Code (2026-07-19)
                        </span>
                        <h4 className="font-bold text-sm text-white">
                          {currentEnv?.status === 'active' ? 'Resolution successfully verified and locked.' : selectedProjData.latest_activity.type}
                        </h4>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-850 font-mono">
                          <span className="text-rose-400 font-semibold">[Reported Issue]:</span> {selectedProjData.latest_activity.issue}
                        </p>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-850 font-mono">
                          <span className="text-emerald-400 font-semibold">[System Patch applied]:</span> {selectedProjData.latest_activity.resolution_provided}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* HISTORICAL TIMELINE METRIC */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <History className="h-3.5 w-3.5 text-indigo-400" />
                      Repository Event History Timeline
                    </h3>
                    <div className="relative border-l-2 border-slate-800 ml-3.5 pl-6 space-y-6">
                      {profile.dated_events_projects_plans.map((evt, idx) => (
                        <div key={idx} className="relative">
                          {/* Dot indicator */}
                          <span className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full bg-slate-950 border-2 border-indigo-500 ring-4 ring-slate-950 flex items-center justify-center" />
                          
                          <div className="bg-slate-950/50 hover:bg-slate-950 border border-slate-850 hover:border-slate-800 transition-all p-4 rounded-xl">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <span className="font-bold text-sm text-indigo-300">{evt.project_name}</span>
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                                {new Date(evt.latest_activity.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 font-mono">Type: {evt.latest_activity.type}</p>
                            <div className="mt-2.5 pt-2 border-t border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-slate-500 font-semibold">Issue Description:</span>
                                <p className="text-slate-300 mt-0.5">{evt.latest_activity.issue}</p>
                              </div>
                              <div>
                                <span className="text-slate-500 font-semibold">Resolution:</span>
                                <p className="text-slate-300 mt-0.5">{evt.latest_activity.resolution_provided}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SIMULATED SHELL LOGS */}
          {activeTab === 'terminal' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[520px] shadow-xl">
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 block" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 ml-2">bash - vercel --prod --debug</span>
                </div>
                <button 
                  onClick={() => setBuildLogs([])} 
                  className="text-[10px] font-mono text-slate-400 hover:text-white bg-slate-900 px-2 py-1 border border-slate-800 rounded"
                >
                  Clear Terminal Logs
                </button>
              </div>

              <div className="bg-slate-950 p-4 font-mono text-xs text-slate-300 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
                {buildLogs.length === 0 ? (
                  <div className="text-slate-500 h-full flex flex-col items-center justify-center gap-3">
                    <Terminal className="h-10 w-10 text-slate-700 animate-pulse" />
                    <p className="text-center">
                      No build executing currently. <br />
                      <button 
                        onClick={() => triggerBuildSimulation(selectedProject)} 
                        className="mt-2 text-indigo-400 hover:underline font-semibold text-xs"
                      >
                        Click here to trigger build simulation
                      </button>
                    </p>
                  </div>
                ) : (
                  buildLogs.map((log, idx) => {
                    let textClass = "text-slate-300";
                    if (log.includes("❌ ERR")) textClass = "text-rose-400 font-bold";
                    if (log.includes("⚠️ WARN")) textClass = "text-amber-400";
                    if (log.includes("✅") || log.includes("SUCCESSFUL")) textClass = "text-emerald-400 font-bold";
                    if (log.includes("🚀") || log.includes("🧬")) textClass = "text-indigo-300";

                    return (
                      <div key={idx} className={`p-1.5 rounded bg-slate-900/30 font-mono leading-relaxed ${textClass}`}>
                        <span className="text-slate-600 mr-2">$</span>
                        {log}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="bg-slate-950 px-4 py-2 text-[10px] font-mono text-slate-500 border-t border-slate-900 flex justify-between">
                <span>Status: {isBuilding ? "BUILDING IN CLOUD TARGET" : "STANDBY"}</span>
                <span>Vercel Deploy CLI v34.2.1</span>
              </div>
            </div>
          )}

          {/* TAB 3: SYNCHRONIZE PROFILE JSON */}
          {activeTab === 'json' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 shadow-xl">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Synchronized Live State Profile Editor</h3>
                <p className="text-xs text-slate-400 mt-1">
                  This payload matches the exact target parameters for the user_profile dated plans database. You can copy/paste external updates directly into the workspace below.
                </p>
              </div>

              <div className="relative flex-1">
                <textarea
                  value={jsonText}
                  onChange={handleJsonChange}
                  className="w-full h-96 bg-slate-950 text-cyan-400 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 custom-scrollbar leading-relaxed"
                  spellCheck="false"
                />
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <span className="bg-indigo-950 text-indigo-400 text-[10px] px-2 py-1 rounded font-mono border border-indigo-800">
                    Valid JSON Schema
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setJsonText(JSON.stringify(profile, null, 2))}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-800 bg-slate-950 text-slate-400 hover:text-white transition-all"
                >
                  Revert to Current State
                </button>
                <button
                  onClick={handleApplyJson}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-950/50"
                >
                  Apply Live JSON State
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* FOOTER METRICS */}
      <footer className="bg-slate-950 border-t border-slate-900 mt-auto py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-slate-700" />
            <span>Active Target: <strong>user_profile</strong> (micheledallida-web)</span>
          </div>
          <p className="font-mono text-[10px]">
            Last Checked Telemetry: 2026-07-19T04:33:22Z
          </p>
        </div>
      </footer>

    </div>
  );
}