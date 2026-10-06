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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ALGORITHM_CATALOG } from '../algorithms/index.js';
import { SAMPLE_PROGRAMS } from '../utils/sampleCodes.js';
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
    navigate('/visualizer');
  };

  const categories = ['All', 'Arrays', 'Sorting', 'Trees', 'Graphs', 'Searching', 'Stack & Queue'];

  const filteredAlgorithms = ALGORITHM_CATALOG.filter((algo) => {
    const matchesCat = activeCategory === 'All' || algo.category === activeCategory;
    const matchesSearch = !searchQuery.trim() ||
      algo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      algo.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className={`flex-1 overflow-y-auto selection:bg-amber-500 selection:text-stone-950 transition-colors duration-150 ${
      isBright ? 'bg-[#f7f6f3] text-stone-900' : 'bg-[#0e1013] text-stone-100'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">

        {/* ========================================================
            1. HERO: SEE YOUR CODE EXECUTE (Strong, Editorial, Confident)
            ======================================================== */}
        <section className="space-y-6 pt-2">
          {/* Technical Pill Indicator */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider border ${
              isBright
                ? 'bg-stone-200/70 text-stone-800 border-stone-300'
                : 'bg-stone-800 text-stone-300 border-stone-700'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Spatial Code Engine 2.0
            </span>
            <span className={`text-xs font-mono hidden sm:inline ${isBright ? 'text-stone-500' : 'text-stone-500'}`}>
              AST Interpreter • 3D WebGL • Synchronized Execution
            </span>
          </div>

          {/* Main Statement */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-display leading-[1.08]">
              SEE YOUR CODE <span className="text-amber-500">EXECUTE.</span>
            </h1>
            <p className={`text-base sm:text-lg max-w-2xl leading-relaxed ${
              isBright ? 'text-stone-600' : 'text-stone-300'
            }`}>
              Watch memory mutate, pointers shift, conditions evaluate, and algorithms physically unfold.
              Code3D AI maps every statement directly to spatial 3D execution.
            </p>
          </div>

          {/* Core Call to Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleStartVisualizing}
              style={{
                backgroundColor: isBright ? currentAccent.bright : currentAccent.dark,
                boxShadow: `0 4px 14px ${currentAccent.glow}`,
              }}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-stone-950 font-bold text-sm transition-all active:scale-97 cursor-pointer shadow-md"
            >
              <Play size={16} className="fill-current" />
              <span>Start Visualizing</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('algorithm-catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-2 h-11 px-5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                isBright
                  ? 'bg-white hover:bg-stone-100 border-stone-300 text-stone-800'
                  : 'bg-[#14171c] hover:bg-stone-800 border-stone-700 text-stone-200'
              }`}
            >
              <span>Explore Algorithms</span>
            </button>

            <button
              onClick={() => navigate('/dsa')}
              className={`inline-flex items-center gap-2 h-11 px-4 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                isBright
                  ? 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                  : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
              }`}
            >
              <BookOpen size={15} />
              <span>SDE Sheet (182 Problems)</span>
            </button>
          </div>
        </section>

        {/* ========================================================
            2. THE CORE RELATIONSHIP: CODE -> EXECUTION -> UNDERSTANDING
            ======================================================== */}
        <section className={`p-6 rounded-2xl border transition-colors template-card ${
          isBright ? 'bg-white border-[#e2ded5] shadow-xs' : 'bg-[#13161b] border-[#242831]'
        }`}>
          <div className="text-[11px] font-mono uppercase tracking-widest font-bold text-amber-500 mb-3">
            Core Mental Model
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-2 items-center text-center font-mono">
            <div className={`p-3 rounded-lg border ${
              isBright ? 'bg-stone-50 border-stone-200' : 'bg-[#181c22] border-stone-700'
            }`}>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-500">1. Code</div>
              <div className="text-[11px] mt-1 opacity-70">Source Input (Java/Py/C)</div>
            </div>

            <div className="hidden sm:flex justify-center text-stone-500 font-bold">→</div>

            <div className={`p-3 rounded-lg border ${
              isBright ? 'bg-stone-50 border-stone-200' : 'bg-[#181c22] border-stone-700'
            }`}>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-500">2. Execution</div>
              <div className="text-[11px] mt-1 opacity-70">AST Steps &amp; Mutations</div>
            </div>

            <div className="hidden sm:flex justify-center text-stone-500 font-bold">→</div>

            <div className={`p-3 rounded-lg border ${
              isBright ? 'bg-stone-50 border-stone-200' : 'bg-[#181c22] border-stone-700'
            }`}>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-500">3. Visualization</div>
              <div className="text-[11px] mt-1 opacity-70">Physical 3D Geometry</div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. INTERACTIVE HERO PREVIEW (Immediate Visual Proof)
            ======================================================== */}
        <section className={`rounded-2xl border overflow-hidden transition-colors template-card ${
          isBright ? 'bg-white border-[#e2ded5] shadow-xs' : 'bg-[#13161b] border-[#242831]'
        }`}>
          {/* Header of preview */}
          <div className={`px-4 py-2.5 border-b flex items-center justify-between text-xs font-mono ${
            isBright ? 'bg-stone-50 border-stone-200 text-stone-700' : 'bg-[#16191f] border-stone-800 text-stone-300'
          }`}>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: isBright ? currentAccent.bright : currentAccent.dark }}
              />
              <span className="font-bold">Live Execution Preview: Bubble Sort Iteration</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-stone-500 text-[11px]">
                Step {demoStep + 1} of {DEMO_TRACE.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-inherit">
            {/* Left: Code Snippet with Active Line Highlight */}
            <div className="p-4 sm:p-6 font-mono text-xs space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                Source Code (Java)
              </div>
              <div className="space-y-1 font-mono text-[12px] leading-relaxed">
                <div className={`px-2 py-1 rounded transition-colors ${currentDemo.line === 1 ? 'bg-amber-500/20 text-amber-400 font-bold border-l-2 border-amber-500' : 'opacity-70'}`}>
                  1&nbsp; int[] arr = &#123; 28, 14, 35, 12, 42 &#125;;
                </div>
                <div className={`px-2 py-1 rounded transition-colors ${currentDemo.line === 2 ? 'bg-amber-500/20 text-amber-400 font-bold border-l-2 border-amber-500' : 'opacity-70'}`}>
                  2&nbsp; if (arr[i] &gt; arr[i + 1]) &#123;
                </div>
                <div className={`px-2 py-1 rounded transition-colors ${currentDemo.line === 3 ? 'bg-amber-500/20 text-amber-400 font-bold border-l-2 border-amber-500' : 'opacity-70'}`}>
                  3&nbsp; &nbsp;&nbsp;swap(arr, i, i + 1);
                </div>
                <div className={`px-2 py-1 rounded transition-colors ${currentDemo.line === 4 ? 'bg-amber-500/20 text-amber-400 font-bold border-l-2 border-amber-500' : 'opacity-70'}`}>
                  4&nbsp; &#125;
                </div>
                <div className={`px-2 py-1 rounded transition-colors ${currentDemo.line === 5 ? 'bg-amber-500/20 text-amber-400 font-bold border-l-2 border-amber-500' : 'opacity-70'}`}>
                  5&nbsp; i++;
                </div>
              </div>

              {/* Event Explanation */}
              <div className={`p-3 rounded-md border text-xs font-sans mt-4 ${
                isBright ? 'bg-stone-50 border-stone-200 text-stone-800' : 'bg-[#181c22] border-stone-700 text-stone-200'
              }`}>
                <div className="text-[10px] font-mono font-bold uppercase text-amber-500 mb-1">
                  Event: {currentDemo.event}
                </div>
                <div>{currentDemo.desc}</div>
              </div>
            </div>

            {/* Right: Live Array State Representation */}
            <div className="p-4 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500">
                Spatial Memory Representation
              </div>

              {/* Memory slots */}
              <div className="flex items-end justify-center gap-2 sm:gap-3 py-6">
                {currentDemo.values.map((val, idx) => {
                  const isCompared = currentDemo.comp && currentDemo.comp.includes(idx);
                  const isActive = currentDemo.active === idx;
                  const heightPx = Math.max(40, val * 2.2);

                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5">
                      <span className={`text-[10px] font-mono font-bold ${
                        isCompared ? 'text-amber-500' : isBright ? 'text-stone-600' : 'text-stone-400'
                      }`}>
                        [{idx}]
                      </span>
                      <div
                        style={{ height: `${heightPx}px` }}
                        className={`w-10 sm:w-12 rounded-md flex items-center justify-center font-mono font-bold text-sm border transition-all duration-300 ${
                          isCompared
                            ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm scale-105'
                            : isActive
                              ? 'bg-stone-800 text-amber-400 border-amber-500/50'
                              : isBright
                                ? 'bg-stone-100 text-stone-800 border-stone-300'
                                : 'bg-[#181c22] text-stone-300 border-stone-700'
                        }`}
                      >
                        {val}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Scrubber Playback Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-inherit text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsDemoPlaying(!isDemoPlaying)}
                    className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {isDemoPlaying ? <Pause size={12} className="fill-current" /> : <Play size={12} className="fill-current" />}
                    <span>{isDemoPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                  <button
                    onClick={() => setDemoStep((prev) => (prev + 1) % DEMO_TRACE.length)}
                    className={`px-3 py-1 rounded border font-medium cursor-pointer ${
                      isBright ? 'border-stone-300 hover:bg-stone-100 text-stone-800' : 'border-stone-700 hover:bg-stone-800 text-stone-200'
                    }`}
                  >
                    Step Next →
                  </button>
                </div>

                <button
                  onClick={handleStartVisualizing}
                  className="font-semibold text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Full 3D Studio</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. ALGORITHM EXPLORATION (Editorial List Rows — NOT Cards)
            ======================================================== */}
        <section id="algorithm-catalog-section" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest font-bold text-amber-500 mb-1">
                Curriculum
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Explore Algorithms in 3D
              </h2>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search algorithms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full h-9 pl-9 pr-3 rounded-md text-xs font-mono border focus:outline-none focus:border-amber-500 transition-colors ${
                  isBright ? 'bg-white border-stone-300 text-stone-900' : 'bg-[#14171c] border-stone-700 text-stone-100'
                }`}
              />
            </div>
          </div>

          {/* Clean Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : isBright
                      ? 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
                      : 'bg-[#14171c] border border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Clean Algorithmic Rows (Anti-Box Design) */}
          <div className={`rounded-2xl border overflow-hidden divide-y divide-inherit template-card ${
            isBright ? 'bg-white border-[#e2ded5] shadow-xs' : 'bg-[#13161b] border-[#242831]'
          }`}>
            {filteredAlgorithms.slice(0, 10).map((algo) => (
              <div
                key={algo.id}
                onClick={() => handleLaunchAlgorithm(algo)}
                className={`px-4 py-3 flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                  isBright ? 'hover:bg-stone-50' : 'hover:bg-[#181c22]'
                }`}
              >
                <div className="min-w-0 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs font-mono ${
                    isBright ? 'bg-stone-100 text-stone-800' : 'bg-stone-800 text-stone-200'
                  }`}>
                    {algo.category[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                      <span>{algo.name}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                        algo.difficulty === 'Easy'
                          ? 'text-emerald-500 border-emerald-500/30'
                          : algo.difficulty === 'Medium'
                            ? 'text-amber-500 border-amber-500/30'
                            : 'text-rose-500 border-rose-500/30'
                      }`}>
                        {algo.difficulty}
                      </span>
                    </div>
                    <p className={`text-[11px] truncate max-w-sm sm:max-w-md mt-0.5 ${
                      isBright ? 'text-stone-500' : 'text-stone-400'
                    }`}>
                      {algo.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] text-stone-500">TIME</span>
                    <span className="font-bold">{algo.timeComplexity}</span>
                  </div>
                  <div className="hidden lg:flex flex-col items-end">
                    <span className="text-[10px] text-stone-500">SPACE</span>
                    <span className="font-bold">{algo.spaceComplexity}</span>
                  </div>
                  <div className="flex items-center text-amber-500 font-semibold gap-1 hover:underline">
                    <span className="hidden sm:inline">Launch 3D</span>
                    <ChevronRight size={15} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            5. RECENT ACTIVITY (Clean Activity Table — NOT 10 Cards)
            ======================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest font-bold text-amber-500 mb-1">
                Ledger
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                Recent Executions
              </h2>
            </div>
            <button
              onClick={() => navigate('/history')}
              className="text-xs font-mono font-semibold text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full History</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className={`rounded-xl border overflow-hidden ${
            isBright ? 'bg-white border-[#e2ded5]' : 'bg-[#13161b] border-[#242831]'
          }`}>
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className={`border-b text-[10px] uppercase tracking-wider text-stone-500 ${
                  isBright ? 'bg-stone-50 border-stone-200' : 'bg-[#16191f] border-stone-800'
                }`}>
                  <th className="py-2.5 px-4 font-semibold">Program</th>
                  <th className="py-2.5 px-3 font-semibold">Runtime</th>
                  <th className="py-2.5 px-3 font-semibold">Trace Steps</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit">
                {historyStats.recentExecutions.length > 0 ? (
                  historyStats.recentExecutions.map((rec) => (
                    <tr
                      key={rec.id}
                      className={`transition-colors ${isBright ? 'hover:bg-stone-50' : 'hover:bg-[#181c22]'}`}
                    >
                      <td className="py-3 px-4 font-semibold">
                        <div className="flex items-center gap-2">
                          <Code2 size={13} className="text-amber-500 shrink-0" />
                          <span className="truncate max-w-[200px]">{rec.programTitle}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 uppercase text-stone-400">
                        {rec.language || 'Java'}
                      </td>
                      <td className="py-3 px-3">
                        {rec.totalSteps} steps
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-emerald-500 font-bold text-[11px]">
                          <CheckCircle2 size={11} />
                          <span>{rec.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={handleStartVisualizing}
                          className="font-bold text-amber-500 hover:underline cursor-pointer"
                        >
                          Replay in 3D →
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  [
                    { title: 'Bubble Sort (3D Cell Swaps)', lang: 'Java', steps: 14, status: 'VERIFIED' },
                    { title: 'Binary Search Tree Balancing', lang: 'Python', steps: 22, status: 'VERIFIED' },
                    { title: 'Kadane Max Subarray Wavefront', lang: 'C++', steps: 18, status: 'VERIFIED' },
                  ].map((row, i) => (
                    <tr
                      key={i}
                      className={`transition-colors ${isBright ? 'hover:bg-stone-50' : 'hover:bg-[#181c22]'}`}
                    >
                      <td className="py-3 px-4 font-semibold">
                        <div className="flex items-center gap-2">
                          <Code2 size={13} className="text-amber-500 shrink-0" />
                          <span>{row.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 uppercase text-stone-400">{row.lang}</td>
                      <td className="py-3 px-3">{row.steps} steps</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-emerald-500 font-bold text-[11px]">
                          <CheckCircle2 size={11} />
                          <span>{row.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={handleStartVisualizing}
                          className="font-bold text-amber-500 hover:underline cursor-pointer"
                        >
                          Launch in 3D →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
