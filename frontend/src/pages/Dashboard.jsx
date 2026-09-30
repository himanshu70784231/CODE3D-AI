import React, { useState, useEffect } from 'react';
import {
  Play,
  Layers,
  Code2,
  Sparkles,
  ArrowRight,
  Box,
  Cpu,
  History,
  BookOpen,
  Terminal,
  Zap,
  CheckCircle2,
  Clock,
  Database,
  ExternalLink,
  Plus,
  FolderOpen,
  FileCode,
  Search,
  MessageSquare,
  Send,
  HelpCircle,
} from 'lucide-react';
import { SAMPLE_PROGRAMS } from '../utils/sampleCodes.js';
import { ALGORITHM_CATALOG } from '../algorithms/index.js';
import { getExecutionHistory } from '../services/apiService.js';
import { getDashboardStats } from '../services/dashboard.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

/**
 * CODE3D-AI — Redesigned Dashboard Page (Phase 7)
 * 
 * Implements:
 * - Welcome Hero: "Build. Visualize. Understand."
 * - Quick Actions: + New Visualization, Import Project, Open Workspace
 * - Recent Projects with status, language, last modified, and 3D quick open
 * - AI Section: "Ask Code3D AI" with quick prompts:
 *   "Explain this function", "Visualize this algorithm", "Find dependencies", "Show execution flow"
 * - Meaningful empty states with CTAs
 * - Quick Start Templates
 */
export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const { isBright } = useTheme();
  const [aiQuery, setAiQuery] = useState('');
  const [historyStats, setHistoryStats] = useState({
    totalExecutionsCount: 0,
    successfulCount: 0,
    recentExecutions: [],
  });

  useEffect(() => {
    getDashboardStats()
      .then((res) => {
        if (res?.success && res.stats) {
          const recent = (res.stats.recentExecutions || []).map((e) => ({
            id: e.id,
            programTitle: e.title || 'Simulation',
            language: e.language || 'java',
            totalSteps: e.stepCount || 10,
            status: e.status || 'COMPLETED',
            executedAt: new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
          setHistoryStats({
            totalExecutionsCount: res.stats.totalExecutions || 0,
            successfulCount: res.stats.totalExecutions || 0,
            recentExecutions: recent.slice(0, 5),
          });
        } else {
          fallbackHistory();
        }
      })
      .catch(() => fallbackHistory());

    function fallbackHistory() {
      getExecutionHistory()
        .then((data) => {
          if (data) {
            const successful = (data.recentExecutions || []).filter((e) => e.status === 'COMPLETED').length;
            setHistoryStats({
              totalExecutionsCount: data.totalExecutionsCount || (data.recentExecutions || []).length,
              successfulCount: successful,
              recentExecutions: (data.recentExecutions || []).slice(0, 5),
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  const quickStartTemplates = [
    {
      title: 'Array Traversal & Iteration',
      category: 'Arrays',
      lang: 'Java',
      complexity: 'O(n)',
      desc: 'Step through an array with index pointers, loop conditions, and atomic memory updates.',
      progId: 'array-loop',
    },
    {
      title: 'Binary Search (Two Pointers)',
      category: 'Searching',
      lang: 'Java',
      complexity: 'O(log n)',
      desc: 'Halve the search space iteratively with left, right, and mid pointer visualization.',
      progId: 'binary-search',
    },
    {
      title: 'Bubble Sort (Swapping in 3D)',
      category: 'Sorting',
      lang: 'Java',
      complexity: 'O(n²)',
      desc: 'Observe adjacent comparisons and 3D slot swaps until the array is fully sorted.',
      progId: 'bubble-sort',
    },
    {
      title: 'Two Sum Problem',
      category: 'Hash Map',
      lang: 'Java',
      complexity: 'O(n)',
      desc: 'Find two indices that sum to target using a lookup table in 3D space.',
      progId: 'two-sum',
    },
  ];

  // Curated Recent Projects demonstration for first-time or returning users
  const fallbackProjects = [
    {
      id: 'proj-1',
      name: 'Two Pointer Search & Partition',
      language: 'Java',
      lastModified: '10 mins ago',
      status: '3D Verified',
      category: 'Algorithms',
    },
    {
      id: 'proj-2',
      name: 'Dynamic Array Heap Visualizer',
      language: 'JavaScript',
      lastModified: '2 hours ago',
      status: 'AST Compiled',
      category: 'Data Structures',
    },
    {
      id: 'proj-3',
      name: 'Recursion Call-Stack Tree Explorer',
      language: 'Python',
      lastModified: 'Yesterday',
      status: 'Ready',
      category: 'Trees',
    },
  ];

  const handleAskAi = (promptText) => {
    const q = promptText || aiQuery;
    if (!q) return;
    onNavigate('ai');
  };

  return (
    <div className={`flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 font-sans select-none transition-colors duration-200 ${
      isBright ? 'bg-slate-100 text-slate-900' : 'bg-[#070b14] text-slate-100'
    }`}>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* ========================================================
            1. HERO WELCOME SECTION: "Build. Visualize. Understand."
            ======================================================== */}
        <div className={`rounded-2xl p-6 sm:p-8 border shadow-xl relative overflow-hidden transition-all ${
          isBright
            ? 'bg-white border-slate-200 shadow-slate-200'
            : 'bg-[#0d1726]/90 border-slate-800 shadow-cyan-950/20'
        }`}>
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-wide">
                  SPATIAL WORKSPACE
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Welcome, {user?.fullName || user?.username || 'Developer'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-sky-300 bg-clip-text text-transparent">
                Build. Visualize. Understand.
              </h1>

              <p className={`text-xs sm:text-sm leading-relaxed ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                Step inside code execution memory. Real AST interpretation, synchronized variable inspection,
                and interactive 3D WebGL spatial data structures.
              </p>
            </div>

            {/* Quick Actions (Phase 7 Requirement) */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => onNavigate('visualizer')}
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold flex items-center gap-2 transition shadow-md shadow-cyan-500/20 cursor-pointer active:scale-[0.98]"
              >
                <Plus size={15} className="stroke-[3]" />
                <span>New Visualization</span>
              </button>

              <button
                onClick={() => onNavigate('visualizer')}
                className={`h-10 px-4 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                  isBright
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                    : 'bg-[#101c2d] hover:bg-[#142338] border-slate-700 text-slate-200'
                }`}
              >
                <FolderOpen size={14} className="text-cyan-400" />
                <span>Import Project</span>
              </button>

              <button
                onClick={() => onNavigate('visualizer')}
                className={`h-10 px-4 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                  isBright
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                    : 'bg-[#101c2d] hover:bg-[#142338] border-slate-700 text-slate-200'
                }`}
              >
                <Box size={14} className="text-amber-400" />
                <span>Open Workspace</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. ASK CODE3D AI SECTION (Phase 7 Requirement)
            ======================================================== */}
        <div className={`rounded-xl p-5 border shadow-md relative overflow-hidden transition-all ${
          isBright
            ? 'bg-white border-slate-200'
            : 'bg-[#0d1726]/80 border-slate-800/80'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Ask Code3D AI</h2>
              <p className="text-[11px] text-slate-400">Intelligent code explanation and spatial algorithm synthesis</p>
            </div>
          </div>

          {/* Quick Prompts Row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {[
              'Explain this function',
              'Visualize this algorithm',
              'Find dependencies',
              'Show execution flow',
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleAskAi(prompt)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                  isBright
                    ? 'bg-slate-50 hover:bg-cyan-50 border-slate-300 hover:border-cyan-400 text-slate-700'
                    : 'bg-[#070b14] hover:bg-[#101c2d] border-slate-700/80 hover:border-cyan-500/60 text-slate-300 hover:text-cyan-300'
                }`}
              >
                <Sparkles size={11} className="text-cyan-400" />
                <span>"{prompt}"</span>
              </button>
            ))}
          </div>

          {/* Inline Ask Input Bar */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
              placeholder="Ask Code3D AI anything about algorithms, memory frames, or complexity..."
              className={`w-full pl-3.5 pr-20 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                isBright
                  ? 'bg-slate-50 border-slate-300 text-slate-900'
                  : 'bg-[#070b14] border-slate-700/80 text-white placeholder-slate-500'
              }`}
            />
            <button
              onClick={() => handleAskAi()}
              className="absolute right-1.5 top-1.5 h-7 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <span>Ask</span>
              <Send size={11} />
            </button>
          </div>
        </div>

        {/* ========================================================
            3. RECENT PROJECTS SECTION (Phase 7 Requirement)
            ======================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <FolderOpen size={14} className="text-cyan-400" />
              <span>Recent Projects & Workspaces</span>
            </div>
            <button
              onClick={() => onNavigate('saved')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all saved</span>
              <ArrowRight size={11} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {fallbackProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onNavigate('visualizer')}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all cursor-pointer group shadow-sm ${
                  isBright
                    ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-cyan-500'
                    : 'bg-[#0d1726] hover:bg-[#101c2d] border-slate-800 hover:border-cyan-500/60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {proj.language}
                    </span>
                    <span className="text-slate-400">{proj.lastModified}</span>
                  </div>

                  <h3 className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                    {proj.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                    <CheckCircle2 size={11} />
                    <span>{proj.status}</span>
                  </div>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[10px] font-mono">{proj.category}</span>
                  <span className="text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Open in 3D</span>
                    <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================
            4. QUICK START TEMPLATES GRID
            ======================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Zap size={14} className="text-cyan-400" />
              <span>Quick Start SDE Templates</span>
            </div>
            <button
              onClick={() => onNavigate('algorithms')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all algorithms</span>
              <ArrowRight size={11} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickStartTemplates.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('visualizer')}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer group shadow-sm ${
                  isBright
                    ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-cyan-500'
                    : 'bg-[#0d1726] hover:bg-[#101c2d] border-slate-800 hover:border-cyan-500/60'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{item.category}</span>
                    <span className="text-cyan-400">{item.complexity}</span>
                  </div>
                  <h3 className="font-semibold text-xs text-white group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono">{item.lang}</span>
                  <span className="text-cyan-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>Open</span>
                    <ArrowRight size={10} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================
            5. TWO-COLUMN: RECENT SESSIONS & RUNTIME DIAGNOSTICS
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Execution History Table */}
          <div className={`lg:col-span-2 rounded-xl border overflow-hidden flex flex-col ${
            isBright ? 'bg-white border-slate-200' : 'bg-[#0d1726] border-slate-800'
          }`}>
            <div className={`h-10 px-4 border-b flex items-center justify-between text-xs font-semibold ${
              isBright ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#101c2d] border-slate-800 text-white'
            }`}>
              <div className="flex items-center gap-2">
                <History size={13} className="text-cyan-400" />
                <span>Recent Execution Sessions</span>
              </div>
              <button
                onClick={() => onNavigate('history')}
                className="text-[11px] text-cyan-400 hover:underline font-normal cursor-pointer"
              >
                View all ({historyStats.totalExecutionsCount})
              </button>
            </div>

            <div className="p-0 overflow-x-auto flex-1">
              {historyStats.recentExecutions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-mono italic">
                  No recorded simulations yet. Execute code in Studio to log sessions.
                </div>
              ) : (
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className={`border-b text-[10px] uppercase tracking-wider ${
                      isBright ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#070b14]/50 border-slate-800 text-slate-400'
                    }`}>
                      <th className="py-2.5 px-3.5 font-semibold">Program</th>
                      <th className="py-2.5 px-3.5 font-semibold">Lang</th>
                      <th className="py-2.5 px-3.5 font-semibold">Steps</th>
                      <th className="py-2.5 px-3.5 font-semibold">Status</th>
                      <th className="py-2.5 px-3.5 font-semibold text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isBright ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
                    {historyStats.recentExecutions.map((row, idx) => (
                      <tr
                        key={idx}
                        onClick={() => onNavigate('visualizer')}
                        className={`transition-colors cursor-pointer ${
                          isBright ? 'hover:bg-slate-50 text-slate-800' : 'hover:bg-[#101c2d] text-slate-200'
                        }`}
                      >
                        <td className="py-2.5 px-3.5 font-medium truncate max-w-[200px]">
                          {row.programTitle}
                        </td>
                        <td className="py-2.5 px-3.5 text-cyan-400 uppercase text-[10px]">
                          {row.language}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-400">{row.totalSteps}</td>
                        <td className="py-2.5 px-3.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {row.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-400 text-right text-[11px]">
                          {row.executedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Runtime Diagnostics */}
          <div className={`rounded-xl border overflow-hidden flex flex-col ${
            isBright ? 'bg-white border-slate-200' : 'bg-[#0d1726] border-slate-800'
          }`}>
            <div className={`h-10 px-4 border-b flex items-center justify-between text-xs font-semibold ${
              isBright ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#101c2d] border-slate-800 text-white'
            }`}>
              <div className="flex items-center gap-2">
                <Cpu size={13} className="text-cyan-400" />
                <span>Runtime Diagnostics</span>
              </div>
            </div>

            <div className="p-4 space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <span className="text-slate-400">AST Interpreter:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Active
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <span className="text-slate-400">3D GPU Engine:</span>
                <span className="text-cyan-400 font-semibold">WebGL 2.0</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <span className="text-slate-400">Curated SDE Sheet:</span>
                <span className="text-amber-400 font-semibold">182 Problems</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <span className="text-slate-400">Database Engine:</span>
                <span className="text-purple-400 font-semibold">PostgreSQL</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('dsa')}
                  className="w-full py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Layers size={13} />
                  <span>Browse DSA Hub</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
