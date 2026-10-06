import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  ArrowRight,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  BookOpen,
  RotateCcw,
  CheckCircle2,
  Terminal,
  Clock,
  ChevronRight,
  Boxes,
  Zap,
  Flame,
  Search,
  Trophy,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ALGORITHM_CATALOG } from '../algorithms/index.js';
import { getExecutionHistory } from '../services/apiService.js';
import { getDashboardStats } from '../services/dashboard.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

// Interactive mini-simulator steps for hero demonstration
const DEMO_TRACE = [
  { line: 1, event: 'INITIALIZE', expr: 'int[] arr = { 28, 14, 35, 12, 42 };', desc: 'Allocated 5 contiguous memory slots on heap', active: 0, comp: null, values: [28, 14, 35, 12, 42] },
  { line: 2, event: 'COMPARE', expr: 'arr[0] > arr[1]  // 28 > 14', desc: 'Evaluating loop comparison: 28 is greater than 14', active: 0, comp: [0, 1], values: [28, 14, 35, 12, 42] },
  { line: 3, event: 'SWAP', expr: 'swap(arr[0], arr[1])', desc: 'Memory cells 0 and 1 exchange positions physically', active: 1, comp: [0, 1], values: [14, 28, 35, 12, 42] },
  { line: 4, event: 'POINTER', expr: 'i++  // Advance pointer to index 1', desc: 'Loop counter incremented. Active window shifts right.', active: 1, comp: [1, 2], values: [14, 28, 35, 12, 42] },
  { line: 5, event: 'COMPARE', expr: 'arr[1] > arr[2]  // 28 > 35 (FALSE)', desc: 'Condition evaluated to FALSE. Skipping swap mutation.', active: 2, comp: [1, 2], values: [14, 28, 35, 12, 42] },
];

export default function Dashboard({ onNavigate, onLaunchConcept }) {
  const { user } = useAuth();
  const { isBright, currentAccent } = useTheme();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [demoStep, setDemoStep] = useState(0);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [historyStats, setHistoryStats] = useState({
    totalExecutionsCount: 8,
    successfulCount: 8,
    recentExecutions: [],
  });

  const currentDemo = DEMO_TRACE[demoStep];

  // Auto-play demo ticker
  useEffect(() => {
    let timer;
    if (isDemoPlaying) {
      timer = setInterval(() => {
        setDemoStep((prev) => (prev + 1) % DEMO_TRACE.length);
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [isDemoPlaying]);

  useEffect(() => {
    getDashboardStats()
      .then((res) => {
        if (res?.success && res.stats) {
          const recent = (res.stats.recentExecutions || []).map((e) => ({
            id: e.id,
            programTitle: e.title || 'Simulation',
            language: e.language || 'java',
            totalSteps: e.stepCount || 12,
            status: e.status || 'COMPLETED',
            executedAt: new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
          setHistoryStats({
            totalExecutionsCount: res.stats.totalExecutions || 8,
            successfulCount: res.stats.totalExecutions || 8,
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
          if (data && data.recentExecutions) {
            setHistoryStats({
              totalExecutionsCount: data.totalExecutionsCount || data.recentExecutions.length,
              successfulCount: data.recentExecutions.filter((e) => e.status === 'COMPLETED').length,
              recentExecutions: data.recentExecutions.slice(0, 5),
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleLaunchAlgorithm = (algo) => {
    if (onLaunchConcept) {
      onLaunchConcept(algo);
    } else {
      navigate('/visualizer', { state: { concept: algo } });
    }
  };

  const handleStartVisualizing = () => {
    navigate('/editor');
  };

  const categories = ['All', 'Arrays', 'Sorting', 'Trees', 'Graphs', 'Searching', 'Stack & Queue'];

  const filteredAlgorithms = ALGORITHM_CATALOG.filter((algo) => {
    const matchesCat = activeCategory === 'All' || algo.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      algo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      algo.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const userDisplayName = (
    user?.fullName ||
    user?.name ||
    user?.username ||
    'Developer'
  ).split(' ')[0];

  const workspaceCards = [
    {
      icon: Code2,
      title: 'Code Editor',
      description: 'Write, execute and visualize your algorithms with step-by-step 3D execution.',
      action: 'Open Editor',
      path: '/editor',
      accent: 'orange',
    },
    {
      icon: BookOpen,
      title: 'DSA Hub',
      description: 'Explore data structures, algorithms, patterns and problems in one place.',
      action: 'Explore DSA',
      path: '/dsa',
      accent: 'cyan',
    },
    {
      icon: Sparkles,
      title: 'AI Tutor',
      description: 'Get intelligent explanations, debugging help, AST analysis and guidance.',
      action: 'Ask AI',
      path: '/ai',
      accent: 'violet',
    },
    {
      icon: Trophy,
      title: 'Quiz Arena',
      description: 'Challenge yourself with topic-based DSA quizzes and track your progress.',
      action: 'Take Quiz',
      path: '/quiz',
      accent: 'emerald',
    },
  ];

  return (
    <div
      className={`min-h-full flex-1 overflow-y-auto selection:bg-orange-500 selection:text-white transition-colors duration-200 ${
        isBright ? 'bg-[#f7f9fc] text-slate-900' : 'bg-[#070b14] text-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 space-y-8 md:space-y-12">
        {/* ========================================================
            1. HERO WORKSPACE WELCOME (Matching code-3d-ai.vercel.app/#/app)
            ======================================================== */}
        <section
          className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 md:p-10 shadow-sm transition-all duration-200 ${
            isBright ? 'bg-white border-slate-200' : 'bg-[#0b111d] border-slate-800'
          }`}
        >
          {/* Ambient Lighting Orbs */}
          <div
            className={`absolute -top-32 -right-32 h-72 w-72 rounded-full blur-3xl pointer-events-none ${
              isBright ? 'bg-orange-200/40' : 'bg-orange-500/10'
            }`}
          />
          <div
            className={`absolute -bottom-40 left-1/3 h-80 w-80 rounded-full blur-3xl pointer-events-none ${
              isBright ? 'bg-violet-200/30' : 'bg-violet-500/10'
            }`}
          />

          <div className="relative">
            {/* System Status Chips */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-wide ${
                  isBright
                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Terminal size={13} className="text-orange-500" />
                CODE3D AI WORKSPACE
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                  isBright
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                SYSTEM READY
              </span>
              <span
                className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                  isBright
                    ? 'bg-orange-50 text-orange-700 border border-orange-200/60'
                    : 'bg-orange-950/40 text-orange-400 border border-orange-800/40'
                }`}
              >
                <Zap size={11} className="text-orange-500" />
                AST ENGINE 2.0
              </span>
            </div>

            {/* Greeting with Gradient Text */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Welcome,{' '}
              <span className="bg-gradient-to-r from-orange-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
                {userDisplayName}
              </span>
              <span className="ml-2 inline-block animate-bounce">👋</span>
            </h1>

            <p
              className={`mt-4 max-w-2xl text-sm md:text-base leading-7 ${
                isBright ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Your coding workspace is ready. Build, visualize and understand algorithms with the power of
              AI and interactive 3D execution.
            </p>

            {/* Action Buttons */}
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/editor')}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 active:scale-95 px-5 py-3 text-sm font-bold text-white transition-all shadow-lg shadow-orange-500/25 cursor-pointer"
              >
                <Play size={16} fill="white" />
                <span>Start Coding</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => navigate('/dsa')}
                className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition-all hover:-translate-y-0.5 cursor-pointer ${
                  isBright
                    ? 'bg-white border-slate-300 hover:bg-slate-50 text-slate-800'
                    : 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <BookOpen size={16} className="text-cyan-500" />
                <span>Explore DSA</span>
              </button>

              <button
                onClick={() => navigate('/ai')}
                className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition-all hover:-translate-y-0.5 cursor-pointer ${
                  isBright
                    ? 'bg-violet-50/80 border-violet-200 text-violet-700 hover:bg-violet-100'
                    : 'bg-violet-950/30 border-violet-800/60 text-violet-300 hover:bg-violet-900/40'
                }`}
              >
                <Sparkles size={16} className="text-violet-400" />
                <span>AI Tutor</span>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================
            2. 4 QUICK STAT BADGES
            ======================================================== */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Code2, label: 'Code Workspace', value: '3D WebGL', accent: 'orange' },
            { icon: Sparkles, label: 'AI Powered', value: 'AST ON', accent: 'violet' },
            { icon: BookOpen, label: 'DSA Curriculum', value: '180+ Patterns', accent: 'cyan' },
            { icon: Zap, label: 'Execution', value: 'Live 60 FPS', accent: 'emerald' },
          ].map(({ icon: Icon, label, value, accent }) => (
            <div
              key={label}
              className={`rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 ${
                isBright ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0b111d] border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    accent === 'orange'
                      ? 'bg-orange-500/10 text-orange-500'
                      : accent === 'violet'
                      ? 'bg-violet-500/10 text-violet-500'
                      : accent === 'cyan'
                      ? 'bg-cyan-500/10 text-cyan-500'
                      : 'bg-emerald-500/10 text-emerald-500'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span className="text-xs font-mono font-bold tracking-wider">{value}</span>
              </div>
              <p className={`mt-3 text-xs font-medium ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
                {label}
              </p>
            </div>
          ))}
        </section>

        {/* ========================================================
            3. "YOUR WORKSPACE" CORE 4 CARDS (Exact Layout & Visuals)
            ======================================================== */}
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Your Workspace</h2>
              <p className={`mt-1 text-sm ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
                Everything you need to learn, practice and improve.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {workspaceCards.map(({ icon: Icon, title, description, action, path, accent }) => (
              <button
                key={title}
                onClick={() => navigate(path)}
                className={`group text-left rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 cursor-pointer ${
                  isBright
                    ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xl'
                    : 'bg-[#0b111d] border-slate-800 hover:border-slate-700 hover:bg-[#0d1421]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
                      accent === 'orange'
                        ? 'bg-orange-500/10 text-orange-500'
                        : accent === 'cyan'
                        ? 'bg-cyan-500/10 text-cyan-500'
                        : accent === 'violet'
                        ? 'bg-violet-500/10 text-violet-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}
                  >
                    <Icon size={24} />
                  </div>
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                      isBright
                        ? 'bg-slate-100 group-hover:bg-slate-200'
                        : 'bg-slate-900 group-hover:bg-slate-800'
                    }`}
                  >
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5 text-slate-400 group-hover:text-slate-200"
                    />
                  </div>
                </div>

                <h3 className="mt-6 text-lg font-bold tracking-tight">{title}</h3>
                <p
                  className={`mt-2 text-sm leading-6 ${
                    isBright ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {description}
                </p>

                <div
                  className={`mt-5 text-xs font-bold flex items-center gap-1 ${
                    accent === 'orange'
                      ? 'text-orange-500'
                      : accent === 'cyan'
                      ? 'text-cyan-500'
                      : accent === 'violet'
                      ? 'text-violet-500'
                      : 'text-emerald-500'
                  }`}
                >
                  <span>{action}</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ========================================================
            4. AI TUTOR ASSISTANCE BANNER
            ======================================================== */}
        <section
          className={`relative overflow-hidden rounded-2xl border p-6 md:p-7 transition-all ${
            isBright
              ? 'bg-gradient-to-r from-violet-50 via-white to-cyan-50 border-slate-200 shadow-xs'
              : 'bg-gradient-to-r from-violet-950/20 via-[#0b111d] to-cyan-950/20 border-slate-800'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  isBright ? 'bg-violet-100 text-violet-600' : 'bg-violet-950/50 text-violet-400'
                }`}
              >
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base">Need help with your code?</h3>
                <p className={`mt-1 text-sm ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                  Ask Code3D AI to explain, debug or improve your solution with instant multi-language AST diagnostics.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/ai')}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold transition hover:-translate-y-0.5 shrink-0 cursor-pointer ${
                isBright
                  ? 'bg-white border-slate-300 hover:bg-slate-50 text-slate-800'
                  : 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
              }`}
            >
              <span>Open AI Tutor</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </section>

        {/* ========================================================
            5. INTERACTIVE LIVE 3D EXECUTION SIMULATOR PREVIEW
            ======================================================== */}
        <section
          className={`rounded-2xl border overflow-hidden transition-colors ${
            isBright ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0b111d] border-slate-800'
          }`}
        >
          {/* Header of preview */}
          <div
            className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3 ${
              isBright ? 'bg-slate-50 border-slate-200' : 'bg-[#0e131d] border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-500">
                Live Memory Trace Simulator
              </span>
              <span className={`text-[11px] font-mono hidden sm:inline ${isBright ? 'text-slate-400' : 'text-slate-500'}`}>
                • Bubble Sort (arr: [28, 14, 35, 12, 42])
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDemoPlaying(!isDemoPlaying)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition cursor-pointer ${
                  isDemoPlaying
                    ? 'bg-orange-500 text-white border-orange-600'
                    : isBright
                    ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                {isDemoPlaying ? <Pause size={12} /> : <Play size={12} className="fill-current" />}
                <span>{isDemoPlaying ? 'PAUSE' : 'AUTO-STEP'}</span>
              </button>

              <button
                onClick={() => setDemoStep(0)}
                className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                  isBright
                    ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title="Reset simulation to step 1"
              >
                <RotateCcw size={13} />
              </button>

              <button
                onClick={handleStartVisualizing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-xs font-mono font-bold transition cursor-pointer"
              >
                <span>3D STUDIO</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          {/* Interactive memory preview content */}
          <div className="p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">EVENT:</span>
                <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-500 border border-orange-500/20 font-bold">
                  {currentDemo.event}
                </span>
                <span className={`hidden sm:inline ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                  {currentDemo.desc}
                </span>
              </div>
              <div className="text-slate-500 text-[11px]">
                Step {demoStep + 1} of {DEMO_TRACE.length}
              </div>
            </div>

            {/* Visual Heap / Memory Cells Simulation */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>HEAP ARRAY MEMORY CELLS (PHYSICAL LAYOUT)</span>
                <span>INDICES [0..4]</span>
              </div>

              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {currentDemo.values.map((val, idx) => {
                  const isPointerActive = currentDemo.active === idx;
                  const isCompared = currentDemo.comp && currentDemo.comp.includes(idx);

                  return (
                    <div
                      key={idx}
                      className={`relative flex flex-col items-center justify-center h-20 sm:h-24 rounded-xl border font-mono transition-all duration-300 ${
                        isPointerActive
                          ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/15 scale-102'
                          : isCompared
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : isBright
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-[#0f1420] border-slate-800'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-500 mb-1">
                        [{idx}]
                      </span>
                      <span className="text-lg sm:text-2xl font-black">{val}</span>

                      {isPointerActive && (
                        <div className="absolute -bottom-2.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-500 text-white shadow-xs">
                          POINTER
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stepper buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/40">
              <div className="font-mono text-xs text-orange-500 truncate max-w-xs sm:max-w-md">
                <code>{currentDemo.expr}</code>
              </div>

              <div className="flex items-center gap-1">
                {DEMO_TRACE.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setDemoStep(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      demoStep === i
                        ? 'bg-orange-500 scale-125'
                        : isBright
                        ? 'bg-slate-300 hover:bg-slate-400'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                    title={`Jump to step ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            6. ALGORITHM QUICK LAUNCH CATALOG
            ======================================================== */}
        <section id="algorithm-catalog-section" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest font-bold text-orange-500 mb-1">
                Spatial Catalog
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Launch 3D Visualizer
              </h2>
              <p className={`text-xs sm:text-sm mt-1 ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
                1-click simulation for canonical data structures and algorithms.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search algorithms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border font-mono transition-colors outline-hidden ${
                  isBright
                    ? 'bg-white border-slate-300 focus:border-orange-500 text-slate-900'
                    : 'bg-[#0b111d] border-slate-800 focus:border-orange-500 text-slate-100'
                }`}
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-orange-500 text-white font-bold shadow-xs'
                    : isBright
                    ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    : 'bg-[#0b111d] text-slate-400 border border-slate-800 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAlgorithms.slice(0, 9).map((algo) => (
              <div
                key={algo.id}
                onClick={() => handleLaunchAlgorithm(algo)}
                className={`group p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between ${
                  isBright
                    ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg'
                    : 'bg-[#0b111d] border-slate-800 hover:border-slate-700 hover:bg-[#0d1421]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-500/10 text-orange-500 border border-orange-500/20">
                      {algo.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        algo.difficulty === 'Easy'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : algo.difficulty === 'Medium'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {algo.difficulty}
                    </span>
                  </div>

                  <h3 className="mt-3 font-bold text-base group-hover:text-orange-500 transition-colors">
                    {algo.name}
                  </h3>

                  <p
                    className={`mt-1.5 text-xs line-clamp-2 leading-relaxed ${
                      isBright ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    {algo.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/40 flex items-center justify-between text-xs font-mono">
                  <span className="text-[11px] text-slate-500">
                    O({algo.timeComplexity || 'n'})
                  </span>
                  <div className="flex items-center gap-1 font-bold text-orange-500 group-hover:translate-x-0.5 transition-transform">
                    <span>Launch 3D</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            7. RECENT EXECUTIONS ACTIVITY LEDGER
            ======================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest font-bold text-orange-500 mb-1">
                Execution History
              </div>
              <h2 className="text-xl font-bold tracking-tight">Recent Simulations</h2>
            </div>
            <button
              onClick={() => navigate('/history')}
              className="text-xs font-mono font-semibold text-orange-500 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full History</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div
            className={`rounded-2xl border overflow-hidden ${
              isBright ? 'bg-white border-slate-200' : 'bg-[#0b111d] border-slate-800'
            }`}
          >
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr
                  className={`border-b text-[10px] uppercase tracking-wider text-slate-500 ${
                    isBright ? 'bg-slate-50 border-slate-200' : 'bg-[#0e131d] border-slate-800'
                  }`}
                >
                  <th className="py-3 px-4 font-semibold">Program</th>
                  <th className="py-3 px-3 font-semibold">Language</th>
                  <th className="py-3 px-3 font-semibold">Steps</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {(historyStats.recentExecutions.length > 0
                  ? historyStats.recentExecutions
                  : [
                      { title: 'Bubble Sort (3D Cell Swaps)', lang: 'Java', steps: 14, status: 'VERIFIED' },
                      { title: 'Binary Search Tree Balancing', lang: 'Python', steps: 22, status: 'VERIFIED' },
                      { title: 'Kadane Max Subarray Wavefront', lang: 'C++', steps: 18, status: 'VERIFIED' },
                    ]
                ).map((row, i) => (
                  <tr
                    key={i}
                    className={`transition-colors ${
                      isBright ? 'hover:bg-slate-50' : 'hover:bg-[#111726]'
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold">
                      <div className="flex items-center gap-2">
                        <Code2 size={13} className="text-orange-500 shrink-0" />
                        <span className="truncate max-w-[200px]">{row.programTitle || row.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 uppercase text-slate-400">{row.language || row.lang}</td>
                    <td className="py-3 px-3">{row.totalSteps || row.steps} steps</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-emerald-500 font-bold text-[11px]">
                        <CheckCircle2 size={11} />
                        <span>{row.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={handleStartVisualizing}
                        className="font-bold text-orange-500 hover:underline cursor-pointer"
                      >
                        Launch in 3D →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <div
          className={`pt-6 pb-6 text-center text-xs font-mono ${
            isBright ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          CODE3D AI · Learn. Code. Visualize.
        </div>
      </div>
    </div>
  );
}
