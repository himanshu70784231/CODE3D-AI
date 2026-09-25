import React from 'react';
import {
  Play,
  Layers,
  Code2,
  Sparkles,
  HelpCircle,
  Activity,
  ArrowRight,
  Box,
  CheckCircle,
  Cpu,
  BarChart3,
  TrendingUp,
  History,
  BookOpen,
  Scale,
  Terminal,
  Zap,
  Shield,
  Eye,
  GitBranch,
  Binary,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { SAMPLE_PROGRAMS } from '../utils/sampleCodes';

export default function Dashboard({ onNavigate }) {
  const { isBright } = useTheme();

  const workflowSteps = [
    {
      num: '01',
      title: 'Write or Paste Code',
      desc: 'Enter Java, Python, C, C++, or JavaScript in a full Monaco code editor with live syntax diagnostics.',
      icon: Code2,
      color: 'from-cyan-500 to-blue-500'
    },
    {
      num: '02',
      title: 'Step Through Execution',
      desc: 'Control time with Play, Pause, Step Forward (F10), Step Back, and Glyph Margin Breakpoints.',
      icon: Play,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      num: '03',
      title: 'Inspect Variables & Memory',
      desc: 'Watch values update in real-time with atomic diff highlighting, array slot indexing, and branch evaluations.',
      icon: Cpu,
      color: 'from-purple-500 to-pink-500'
    },
    {
      num: '04',
      title: 'Master 3D Data Structures',
      desc: 'Gain spatial intuition as arrays, trees, graphs, heaps, and matrices animate in 3D WebGL space.',
      icon: Box,
      color: 'from-emerald-500 to-teal-500'
    }
  ];

  const featureCards = [
    {
      title: 'Real AST Execution Engine',
      desc: 'Powered by JavaParser in the Spring Boot backend and client AST interpreter. No fake hardcoded traces.',
      icon: Terminal,
      badge: 'AST Sandboxed',
    },
    {
      title: 'Interactive 3D Visualizers',
      desc: '12 dedicated 3D visualizers including Arrays, Linked Lists, Trees, Graphs, Heaps, and Dynamic Programming.',
      icon: Box,
      badge: '12 Structures',
    },
    {
      title: 'Monaco Debugger & Breakpoints',
      desc: 'Click the glyph margin to toggle red breakpoints. Execution halts automatically on breakpoint lines.',
      icon: Shield,
      badge: 'F5 / F10 Debugger',
    },
    {
      title: "Striver's SDE Sheet (182 Problems)",
      desc: 'Full 182-problem curriculum across Days 1–27 with problem statements, optimal code, and 3D traces.',
      icon: BookOpen,
      badge: '182 Curated',
    },
    {
      title: 'Algorithm Compare Mode',
      desc: 'Benchmark two algorithms side-by-side (e.g. Linear vs Binary Search, Bubble vs Quick Sort) with operation counts.',
      icon: Scale,
      badge: 'Dual Benchmark',
    },
    {
      title: 'Multi-Language Support',
      desc: 'Simulate and visualize code written in Java 21, Python 3, C17, C++20, and Node.js JavaScript.',
      icon: GitBranch,
      badge: '5 Languages',
    },
  ];

  const modules = [
    {
      title: 'Launch 3D Studio',
      desc: 'Step inside execution memory. Inspect arrays, variables, and loops in interactive 3D space.',
      icon: Play,
      action: () => onNavigate('visualizer'),
      primary: true,
      badge: 'Live Studio',
    },
    {
      title: "Striver's SDE Sheet 📜",
      desc: 'Master the top 182 SDE interview problems across Days 1–27 with interactive 3D WebGL trace.',
      icon: BookOpen,
      action: () => onNavigate('striver'),
      primary: true,
      badge: '182 Problems (Days 1–27)',
    },
    {
      title: 'Learn DSA Catalog',
      desc: 'Master Linked Lists, Stacks, Queues, Binary Trees, and sorting algorithms in 3D.',
      icon: Layers,
      action: () => onNavigate('dsa'),
      badge: `${SAMPLE_PROGRAMS.length} Concepts`,
    },
    {
      title: 'Quiz Arena',
      desc: 'Challenge algorithmic intuition by predicting variables and branch evaluations.',
      icon: HelpCircle,
      action: () => onNavigate('quiz'),
      badge: 'Challenge',
    },
    {
      title: 'Execution History',
      desc: 'View recorded simulation traces, database audit logs, and past quiz attempts.',
      icon: History,
      action: () => onNavigate('history'),
      badge: 'Database',
    },
    {
      title: 'Settings & Cloud DB',
      desc: 'Configure backend connections (Aiven, Render, Railway) and personalize simulation speeds.',
      icon: Cpu,
      action: () => onNavigate('settings'),
      badge: 'Configuration',
    },
  ];

  const techStack = [
    { name: 'Java 21 LTS', role: 'Language Platform', color: 'text-amber-400' },
    { name: 'Spring Boot 3', role: 'REST Backend API', color: 'text-emerald-400' },
    { name: 'JavaParser', role: 'AST Compilation Engine', color: 'text-blue-400' },
    { name: 'React 18 + Vite', role: 'High-Speed Frontend', color: 'text-cyan-400' },
    { name: 'Three.js / R3F', role: '3D WebGL Rendering', color: 'text-purple-400' },
    { name: 'Monaco Editor', role: 'VS Code Editor Engine', color: 'text-sky-400' },
    { name: 'Tailwind CSS', role: 'Obsidian UI Styling', color: 'text-teal-400' },
    { name: 'Aiven / H2', role: 'Cloud SQL Database', color: 'text-rose-400' },
  ];

  return (
    <div className={`flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 select-none transition-colors duration-200 ${
      isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto space-y-12 pb-12">
        {/* Hero Section */}
        <div className={`relative rounded-3xl p-8 sm:p-12 md:p-16 overflow-hidden shadow-2xl border transition-colors ${
          isBright
            ? 'bg-gradient-to-b from-white via-cyan-50/30 to-slate-100 border-slate-200 text-slate-900 shadow-slate-200'
            : 'bg-gradient-to-b from-slate-900/90 via-slate-950 to-[#070b14] border-cyan-500/30 shadow-2xl shadow-cyan-950/40 text-white'
        }`}>
          {/* Vibrant background glow effects */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-6">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold border ${
              isBright
                ? 'bg-cyan-50 border-cyan-300 text-cyan-800'
                : 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-950'
            }`}>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>NEXT-GENERATION 3D CODE VISUALIZER &amp; DEBUGGER</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-sans leading-none">
                SEE YOUR CODE <br />
                <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">
                  COME ALIVE
                </span>
              </h1>

              <p className={`text-xl sm:text-2xl font-light italic ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
                "Don't just read the code. Step inside its memory space."
              </p>
            </div>

            <p className={`text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl ${
              isBright ? 'text-slate-600' : 'text-slate-300'
            }`}>
              Execute Java, Python, C, C++, and JavaScript programs with real AST interpretation.
              Watch variables update, loop branches evaluate, arrays swap, and call stacks push in an interactive
              3D WebGL environment with atomic time-travel debugging.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('visualizer')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-7 py-3.5 rounded-xl text-sm flex items-center gap-3 transition shadow-lg shadow-cyan-500/30 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play size={18} className="fill-current" />
                <span>Launch 3D Studio</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => onNavigate('striver')}
                className={`border font-bold px-6 py-3.5 rounded-xl text-sm flex items-center gap-2.5 transition cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  isBright
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 shadow-sm'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-amber-950/20'
                }`}
              >
                <BookOpen size={17} className="text-amber-400" />
                <span>Striver SDE Sheet (182)</span>
              </button>

              <button
                onClick={() => onNavigate('dsa')}
                className={`border font-semibold px-5 py-3.5 rounded-xl text-sm flex items-center gap-2 transition cursor-pointer ${
                  isBright
                    ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-sm'
                    : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <Layers size={17} className={isBright ? 'text-cyan-600' : 'text-cyan-400'} />
                <span>DSA Catalog</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Data Structure Visualizers', value: '12 Active', icon: Box, sub: 'Arrays, Trees, Graphs, DP' },
            { label: 'Striver SDE Sheet', value: '182 Problems', icon: BookOpen, sub: 'Days 1 to 27 complete' },
            { label: 'Execution Engine', value: '100% Real AST', icon: Terminal, sub: 'JavaParser + Sandboxing' },
            { label: 'Supported Languages', value: '5 Languages', icon: GitBranch, sub: 'Java, Python, C, C++, JS' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className={`border rounded-2xl p-5 transition ${
                  isBright
                    ? 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-cyan-500/30 shadow-lg'
                }`}
              >
                <div className={`flex items-center justify-between mb-2 ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span className="text-xs font-semibold uppercase tracking-wider">{stat.label}</span>
                  <Icon size={18} className={isBright ? 'text-cyan-600' : 'text-cyan-400'} />
                </div>
                <div className={`text-2xl sm:text-3xl font-bold font-mono ${isBright ? 'text-slate-900' : 'text-white'}`}>
                  {stat.value}
                </div>
                <div className={`text-xs font-mono mt-1 ${isBright ? 'text-cyan-700' : 'text-cyan-400'}`}>
                  {stat.sub}
                </div>
              </div>
            );
          })}
        </div>

        {/* How It Works - 4-Step Interactive Workflow */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Interactive Workflow
            </span>
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${isBright ? 'text-slate-900' : 'text-white'}`}>
              How CODE3D-AI Works
            </h2>
            <p className={`text-sm ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
              From source code to full 3D spatial execution in milliseconds
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
                    isBright
                      ? 'bg-white border-slate-200 shadow-sm hover:border-cyan-400 hover:shadow-md'
                      : 'bg-slate-900/50 border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        STEP {step.num}
                      </span>
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${step.color} flex items-center justify-center text-slate-950 font-bold shadow-sm`}>
                        <Icon size={16} />
                      </div>
                    </div>
                    <h3 className={`font-bold text-base ${isBright ? 'text-slate-900' : 'text-white'}`}>
                      {step.title}
                    </h3>
                    <p className={`text-xs leading-relaxed ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-extrabold ${isBright ? 'text-slate-900' : 'text-white'}`}>
                Platform Architecture Features
              </h2>
              <p className={`text-xs mt-1 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                Designed for engineering students, SDE aspirants, and educators
              </p>
            </div>
            <button
              onClick={() => onNavigate('visualizer')}
              className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Explore Visualizer</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featureCards.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl border transition-all ${
                    isBright
                      ? 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className={`font-bold text-sm mb-1.5 ${isBright ? 'text-slate-900' : 'text-white'}`}>
                    {feat.title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modules Quick Launch */}
        <div className="space-y-4">
          <h2 className={`text-xl font-bold ${isBright ? 'text-slate-900' : 'text-white'}`}>
            Explore Studio Modules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={idx}
                  onClick={m.action}
                  className={`p-5 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer group ${
                    m.primary
                      ? isBright
                        ? 'bg-gradient-to-b from-cyan-50 to-white border-cyan-300 shadow-md hover:shadow-lg'
                        : 'bg-gradient-to-b from-cyan-950/40 to-slate-900/80 border-cyan-500/40 shadow-lg shadow-cyan-950/40 hover:border-cyan-400'
                      : isBright
                      ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
                      : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        m.primary
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                          : isBright
                          ? 'bg-slate-100 text-cyan-700 border border-slate-200'
                          : 'bg-slate-800 text-cyan-400'
                      }`}>
                        <Icon size={18} />
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        isBright
                          ? 'bg-slate-100 border-slate-200 text-slate-700'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400'
                      }`}>
                        {m.badge}
                      </span>
                    </div>
                    <h3 className={`font-bold text-sm transition-colors ${
                      isBright ? 'text-slate-900 group-hover:text-cyan-700' : 'text-white group-hover:text-cyan-300'
                    }`}>
                      {m.title}
                    </h3>
                    <p className={`text-xs mt-1.5 leading-relaxed ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                      {m.desc}
                    </p>
                  </div>
                  <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-semibold group-hover:translate-x-0.5 transition-transform ${
                    isBright ? 'border-slate-100 text-cyan-700' : 'border-slate-800/60 text-cyan-400'
                  }`}>
                    <span>Launch Module</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technology Stack Grid */}
        <div className={`p-6 sm:p-8 rounded-3xl border transition-colors ${
          isBright ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className={`text-lg font-bold ${isBright ? 'text-slate-900' : 'text-white'}`}>
                Production Technology Stack
              </h3>
              <p className={`text-xs mt-0.5 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                Modern architecture engineered for sub-millisecond execution analysis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-emerald-400">All Systems Operational</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {techStack.map((tech, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border font-mono text-xs ${
                  isBright ? 'bg-white border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className={`font-bold ${tech.color}`}>{tech.name}</div>
                <div className={`text-[11px] mt-0.5 ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
                  {tech.role}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
          isBright ? 'border-slate-200 text-slate-500' : 'border-slate-800/80 text-slate-400'
        }`}>
          <div className="flex items-center gap-2">
            <span className="font-bold text-cyan-400">CODE3D AI</span>
            <span>• Interactive 3D Educational Code Visualization Engine</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('visualizer')} className="hover:text-cyan-400 transition">Visualizer</button>
            <button onClick={() => onNavigate('striver')} className="hover:text-cyan-400 transition">Striver SDE</button>
            <button onClick={() => onNavigate('dsa')} className="hover:text-cyan-400 transition">DSA Hub</button>
            <button onClick={() => onNavigate('quiz')} className="hover:text-cyan-400 transition">Quiz</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
