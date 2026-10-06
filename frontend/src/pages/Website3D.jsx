import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Play,
  Layers,
  Box,
  Cpu,
  Terminal,
  Zap,
  BookOpen,
  Trophy,
  Bot,
  Compass,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Code2,
  Clock,
  ShieldCheck,
  Flame,
  Award,
  Palette,
  Layout,
  Sliders,
  Check,
} from 'lucide-react';
import { useTheme, ACCENT_PALETTES, TEMPLATE_STYLES } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Hero3DCanvas from '../components/Hero3DCanvas';
import Interactive3DPlayground from '../components/Interactive3DPlayground';
import TemplateCustomizerModal from '../components/TemplateCustomizerModal';

const DATA_STRUCTURE_CARDS = [
  {
    title: '1D Arrays & Vectors',
    category: 'Linear Structures',
    badge: 'Dual Pointers',
    desc: 'Physical 3D cylindrical memory blocks with rotating pointer rings tracking loop variables i, j, and mid in real time.',
    icon: '🧊',
  },
  {
    title: 'Binary Trees & BST',
    category: 'Hierarchical Lattices',
    badge: 'Recursive Branches',
    desc: 'Volumetric 3D node lattices with dynamic recursive branch physics, depth levels, and tree balancing visualizations.',
    icon: '🌳',
  },
  {
    title: '2D Matrices & Grids',
    category: 'Spatial Grids',
    badge: 'Row-Major Memory',
    desc: 'Multi-tiered 3D cell planes simulating row-major memory stride, island counting, and flood fill wavefronts.',
    icon: '▦',
  },
  {
    title: 'Call Stack & Recursion',
    category: 'Memory Execution',
    badge: 'LIFO Activation',
    desc: 'Vertical 3D memory chamber stacking stack frames sequentially, showing local scope variables and return unwindings.',
    icon: '📚',
  },
  {
    title: 'Graph Networks & BFS/DFS',
    category: 'Topological Systems',
    badge: '3D Wavefronts',
    desc: 'Orbital 3D force-directed nodes connected with glowing bezier edges, shortest-path illumination, and cycle rings.',
    icon: '🕸️',
  },
  {
    title: 'Heaps & Priority Queues',
    category: 'Balanced Heaps',
    badge: 'Heapify Engine',
    desc: 'Complete 3D binary tree spheres mapped with physical heap array indices, tracking sift-up and sift-down mutations.',
    icon: '🔺',
  },
];

const CURRICULUM_HIGHLIGHTS = [
  {
    id: 'striver-kadane',
    title: "Kadane's Algorithm (Max Subarray)",
    category: 'Arrays',
    difficulty: 'Medium',
    time: 'O(n)',
    space: 'O(1)',
  },
  {
    id: 'striver-2sum',
    title: 'Two Sum (Two Pointers & Hash)',
    category: 'Arrays',
    difficulty: 'Easy',
    time: 'O(n)',
    space: 'O(1)',
  },
  {
    id: 'striver-dutch-flag',
    title: 'Sort Colors (Dutch National Flag)',
    category: 'Arrays',
    difficulty: 'Medium',
    time: 'O(n)',
    space: 'O(1)',
  },
  {
    id: 'striver-invert-tree',
    title: 'Invert Binary Tree in 3D',
    category: 'Trees',
    difficulty: 'Easy',
    time: 'O(n)',
    space: 'O(h)',
  },
  {
    id: 'striver-lca-tree',
    title: 'Lowest Common Ancestor (LCA)',
    category: 'Trees',
    difficulty: 'Medium',
    time: 'O(n)',
    space: 'O(h)',
  },
  {
    id: 'striver-cycle-detect',
    title: 'Detect Cycle in Linked List (Tortoise & Hare)',
    category: 'Linked Lists',
    difficulty: 'Medium',
    time: 'O(n)',
    space: 'O(1)',
  },
];

export default function Website3D({ onLaunchConcept }) {
  const {
    isBright,
    accentColor,
    setAccentColor,
    currentAccent,
    templateStyle,
    setTemplateStyle,
    currentTemplate,
    toggleTheme,
    theme,
  } = useTheme();

  const { loginAsGuest, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeHex = isBright ? currentAccent.bright : currentAccent.dark;

  const handleLaunchStudio = (concept) => {
    if (!isAuthenticated) {
      loginAsGuest('3D Explorer');
    }
    if (onLaunchConcept && concept) {
      onLaunchConcept(concept);
    } else {
      navigate('/visualizer');
    }
  };

  const scrollToPlayground = () => {
    const el = document.getElementById('interactive-playground');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`flex-1 overflow-y-auto overflow-x-hidden transition-colors duration-300 select-none ${
        isBright ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#040711] text-slate-100'
      }`}
    >
      {/* Background Cybernetic Dot Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.14] overflow-hidden z-0">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${activeHex} 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Floating Style & Palette Control Bar (Top Center Island) */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 pt-4 sm:pt-6">
        <div
          className={`dynamic-island px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-lg`}
        >
          {/* Left: Template Switcher Tabs */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono uppercase font-bold opacity-60 hidden sm:inline mr-1">
              Template:
            </span>
            {Object.values(TEMPLATE_STYLES).map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplateStyle(t.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  templateStyle === t.id
                    ? 'font-bold text-white shadow-sm'
                    : isBright
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                style={{
                  backgroundColor: templateStyle === t.id ? activeHex : undefined,
                }}
              >
                <span>{t.icon}</span>
                <span>{t.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Right: Hyper-Vivid Accent Color Swatches */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase font-bold opacity-60 hidden md:inline">
              Palette:
            </span>
            <div className="flex items-center gap-1.5">
              {Object.values(ACCENT_PALETTES).map((pal) => {
                const isSelected = accentColor === pal.id;
                const palHex = isBright ? pal.bright : pal.dark;
                return (
                  <button
                    key={pal.id}
                    onClick={() => setAccentColor(pal.id)}
                    title={pal.name}
                    className={`w-6 h-6 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                      isSelected ? 'scale-115 ring-2 ring-offset-2 ring-offset-slate-900' : 'hover:scale-105 opacity-80'
                    }`}
                    style={{
                      backgroundColor: palHex,
                      ringColor: palHex,
                    }}
                  >
                    {isSelected && <Check size={11} strokeWidth={3} className="text-white" />}
                  </button>
                );
              })}
            </div>

            <span className="text-slate-500 opacity-40 mx-1">|</span>

            {/* Customize Drawer Trigger */}
            <button
              onClick={() => setIsModalOpen(true)}
              className={`h-7 px-2.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                isBright
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              <Palette size={12} />
              <span className="hidden sm:inline">Customize</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-16 md:space-y-24">
        {/* ========================================================
            HERO BENTO DECK: NEW 2026 ASYMMETRIC BENTO GRID
            ======================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Major Bento Tile: Interactive 3D Quantum Core & Vision (8 Cols) */}
          <div className="lg:col-span-8 bento-card p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
            {/* Ambient Background Glow matching accent color */}
            <div
              className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-[120px] pointer-events-none opacity-40 transition-colors duration-500"
              style={{ backgroundColor: activeHex }}
            />

            <div className="relative z-10 space-y-5">
              {/* Top Row: Technical Tag */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-xs font-bold border border-amber-500/40 bg-amber-500/10 text-amber-500">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>3D SPATIAL CODE ENGINE</span>
                </div>

                <span className="text-[11px] font-mono px-3 py-1 rounded-full border border-stone-500/20 opacity-80 backdrop-blur-md">
                  Active Palette: {currentAccent.name}
                </span>
              </div>

              {/* Headline */}
              <h1
                className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight font-display leading-[1.08] ${
                  isBright ? 'text-stone-950' : 'text-white'
                }`}
              >
                SEE YOUR CODE <span className="text-amber-500">EXECUTE.</span>
              </h1>

              {/* Subtitle */}
              <p
                className={`text-sm sm:text-base leading-relaxed max-w-xl font-sans ${
                  isBright ? 'text-stone-600' : 'text-stone-300'
                }`}
              >
                Watch arrays mutate, binary trees branch, recursion call-stacks elevate, and memory pointers traverse in hardware-accelerated 60 FPS spatial WebGL.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => handleLaunchStudio()}
                  className="h-12 px-7 rounded-xl text-sm font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 flex items-center gap-2.5 shadow-md transition-all duration-150 hover:-translate-y-0.5 cursor-pointer"
                >
                  <Play size={16} className="fill-current" />
                  <span>Start Visualizing</span>
                  <ArrowRight size={17} />
                </button>

                <button
                  onClick={scrollToPlayground}
                  className={`h-12 px-6 rounded-xl text-sm font-semibold border flex items-center gap-2 transition hover:-translate-y-0.5 cursor-pointer ${
                    isBright
                      ? 'bg-white hover:bg-stone-100 border-stone-300 text-stone-800 shadow-sm'
                      : 'bg-[#181c22] hover:bg-stone-800 border-stone-700 text-stone-200'
                  }`}
                >
                  <Code2 size={15} className="text-amber-500" />
                  <span>Test-Drive Playground</span>
                </button>

                <button
                  onClick={() => navigate('/dsa')}
                  className={`h-12 px-5 rounded-xl text-xs font-mono font-bold border flex items-center gap-2 transition cursor-pointer ${
                    isBright
                      ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-700/60 text-amber-300'
                  }`}
                >
                  <Trophy size={15} />
                  <span>182 SDE Sheet</span>
                </button>
              </div>
            </div>

            {/* Bottom Micro-Metrics inside Hero Bento */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-6 mt-6 border-t border-slate-500/15">
              {[
                { label: 'SDE Questions', val: '182', icon: '🎯' },
                { label: 'Client AST', val: '100%', icon: '⚡' },
                { label: 'WebGL Frame', val: '60 FPS', icon: '🧊' },
                { label: 'Dry-Run Delay', val: '0ms', icon: '⏱️' },
              ].map((s, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-[10px] font-mono opacity-60 flex items-center gap-1">
                    <span>{s.icon}</span>
                    <span>{s.label}</span>
                  </span>
                  <span className="text-base font-black font-mono mt-0.5" style={{ color: activeHex }}>
                    {s.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Minor Bento Tile: Interactive Rotating 3D WebGL Canvas (4 Cols) */}
          <div className="lg:col-span-4 bento-card p-4 flex flex-col justify-between min-h-[360px] relative overflow-hidden group">
            {/* 3D Canvas */}
            <div className="flex-1 w-full h-full relative rounded-2xl overflow-hidden min-h-[280px]">
              <Hero3DCanvas />
            </div>

            {/* Canvas Telemetry Overlay */}
            <div className="pt-3 border-t border-slate-500/15 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeHex }} />
                <span className="font-mono text-[11px] font-semibold">Quantum Core Active</span>
              </div>
              <span className="text-[10px] font-mono opacity-60">Drag to Orbit</span>
            </div>
          </div>
        </section>

        {/* ========================================================
            INTERACTIVE 3D PLAYGROUND SECTION (Live Demo on Website)
            ======================================================== */}
        <section id="interactive-playground" className="space-y-5 pt-2 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div
                className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest mb-1.5"
                style={{ color: activeHex }}
              >
                <Sparkles size={14} />
                <span>Real-Time WebGL Execution</span>
              </div>
              <h2
                className={`text-2xl sm:text-3xl font-extrabold font-display tracking-tight ${
                  isBright ? 'text-slate-900' : 'text-white'
                }`}
              >
                Interactive 3D Algorithm Deck
              </h2>
              <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                Test Bubble Sort, Binary Search, and Two Pointers in real time. Inspect 3D column heights, pointer halos, and memory mutations with instant step-through.
              </p>
            </div>

            <button
              onClick={() => handleLaunchStudio()}
              className="h-10 px-5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md transition cursor-pointer self-start sm:self-auto"
              style={{
                backgroundColor: activeHex,
                boxShadow: `0 4px 16px ${currentAccent.glow}`,
              }}
            >
              <span>Launch Studio IDE</span>
              <ExternalLink size={13} />
            </button>
          </div>

          {/* Interactive Playground Component */}
          <Interactive3DPlayground onLaunchStudio={handleLaunchStudio} />
        </section>

        {/* ========================================================
            3D DATA STRUCTURE GALLERY: Volumetric Memory Models
            ======================================================== */}
        <section className="space-y-8 pt-4">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span
              className="text-xs font-mono font-bold uppercase tracking-widest"
              style={{ color: activeHex }}
            >
              Spatial Architecture Catalog
            </span>
            <h2
              className={`text-3xl sm:text-4xl font-extrabold font-display tracking-tight ${
                isBright ? 'text-slate-900' : 'text-white'
              }`}
            >
              Every Data Structure. Physically Modeled in 3D.
            </h2>
            <p className={`text-xs sm:text-sm ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
              From linear array buffers to complex topological graph wavefronts, CODE3D-AI transforms abstract references into tactile spatial geometries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DATA_STRUCTURE_CARDS.map((card, idx) => (
              <div
                key={idx}
                className="bento-card p-6 flex flex-col justify-between cursor-pointer group"
                onClick={() => handleLaunchStudio()}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2.5 rounded-xl bg-slate-500/10 border border-slate-500/20 group-hover:scale-110 transition-transform">
                      {card.icon}
                    </span>
                    <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-slate-500/20">
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono uppercase opacity-60 font-semibold tracking-wider">
                      {card.category}
                    </span>
                    <h3
                      className={`text-lg font-bold font-display mt-0.5 group-hover:text-accent transition-colors ${
                        isBright ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {card.title}
                    </h3>
                  </div>

                  <p className={`text-xs leading-relaxed ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                    {card.desc}
                  </p>
                </div>

                <div
                  className="pt-5 mt-4 border-t border-slate-500/15 flex items-center justify-between text-xs font-semibold group-hover:translate-x-1 transition-transform"
                  style={{ color: activeHex }}
                >
                  <span>Explore 3D Model</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            STRIVER SDE 182-QUESTION CURRICULUM PREVIEW
            ======================================================== */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-500 uppercase tracking-widest mb-1.5">
                <Trophy size={14} />
                <span>Interview Mastery</span>
              </div>
              <h2
                className={`text-2xl sm:text-3xl font-extrabold font-display tracking-tight ${
                  isBright ? 'text-slate-900' : 'text-white'
                }`}
              >
                Striver SDE Sheet in 3D
              </h2>
              <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                Master all 182 high-yield interview questions with pre-configured 3D execution traces, time complexity proofs, and edge-case visualizers.
              </p>
            </div>

            <button
              onClick={() => navigate('/dsa')}
              className="h-10 px-5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-md shadow-amber-500/20 transition cursor-pointer self-start sm:self-auto"
            >
              <span>View All 182 Problems</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Curriculum Problem Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CURRICULUM_HIGHLIGHTS.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleLaunchStudio()}
                className="bento-card p-5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-500/15">
                    <span className="text-[10px] font-mono uppercase font-semibold opacity-60">
                      {item.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                        item.difficulty === 'Easy'
                          ? isBright
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                          : isBright
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-amber-950/60 text-amber-400 border-amber-800'
                      }`}
                    >
                      {item.difficulty}
                    </span>
                  </div>

                  <h4
                    className={`text-sm font-bold font-display mt-2.5 ${
                      isBright ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {item.title}
                  </h4>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-500/15 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-mono text-[11px] opacity-60">
                    <span>⏱️ {item.time}</span>
                    <span>💾 {item.space}</span>
                  </div>

                  <span className="text-xs font-semibold flex items-center gap-1" style={{ color: activeHex }}>
                    <span>3D Trace</span>
                    <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            "TRADITIONAL DEBUGGER VS CODE3D-AI" COMPARISON
            ======================================================== */}
        <section className="bento-card p-8 sm:p-12 relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
            <span
              className="text-xs font-mono font-bold uppercase tracking-widest"
              style={{ color: activeHex }}
            >
              The Spatial Difference
            </span>
            <h2
              className={`text-2xl sm:text-3xl font-extrabold font-display ${
                isBright ? 'text-slate-900' : 'text-white'
              }`}
            >
              Why 3D Changes How You Learn DSA
            </h2>
            <p className={`text-xs sm:text-sm ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
              Move from guessing pointer mutations to seeing physical memory in 360-degree coordinates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Traditional 2D Debugger */}
            <div
              className={`p-6 rounded-2xl border ${
                isBright ? 'bg-white/80 border-slate-300' : 'bg-slate-950/60 border-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-2 text-rose-500 mb-3">
                <span className="text-lg">❌</span>
                <h3 className="text-sm font-bold font-mono uppercase tracking-wide">
                  Traditional Flat Debuggers
                </h3>
              </div>
              <ul className="space-y-3 text-xs">
                {[
                  'Dry, unformatted terminal text scrolling past screen boundaries.',
                  'Mental exhaustion from manually tracking nested loop indices (i, j, k).',
                  'Zero spatial understanding of tree depth, AVL rotations, or graph cycles.',
                  'Static line breakpoints with cumbersome back-and-forth stepping.',
                ].map((txt, i) => (
                  <li key={i} className={`flex items-start gap-2 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                    <span className="text-rose-500">•</span>
                    <span>{txt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: CODE3D-AI Spatial Studio */}
            <div
              className="p-6 rounded-2xl border"
              style={{
                backgroundColor: isBright ? `${currentAccent.bright}10` : `${currentAccent.dark}15`,
                borderColor: activeHex,
              }}
            >
              <div className="flex items-center gap-2 mb-3" style={{ color: activeHex }}>
                <span className="text-lg">✅</span>
                <h3 className="text-sm font-bold font-mono uppercase tracking-wide">
                  CODE3D-AI Spatial Studio
                </h3>
              </div>
              <ul className="space-y-3 text-xs">
                {[
                  'Physical 3D cylinders, spheres, and glowing pointer rings moving in real-time.',
                  'Instant visual feedback on swaps, partitioning, and heap balancing.',
                  'Time-travel scrubber bar allows rewinding back to any past step in milliseconds.',
                  'Interactive camera orbit lets you view trees and matrices from any angle.',
                ].map((txt, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-2 ${isBright ? 'text-slate-800' : 'text-slate-200'}`}
                  >
                    <span style={{ color: activeHex }}>✓</span>
                    <span className="font-medium">{txt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ========================================================
            FINAL CALL-TO-ACTION (CTA) BANNER
            ======================================================== */}
        <section
          className="bento-card p-8 sm:p-14 relative overflow-hidden text-center space-y-6 shadow-2xl"
          style={{
            background: isBright
              ? `linear-gradient(135deg, ${currentAccent.bright}, #0284c7, #6366f1)`
              : `linear-gradient(135deg, #09152b, #040916, #0e1e3c)`,
            borderColor: activeHex,
          }}
        >
          {/* Subtle Ambient Radial Highlight */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ backgroundColor: activeHex }}
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-3 text-white">
            <span className="text-xs font-mono font-bold uppercase tracking-widest opacity-80">
              Instant 3D Access
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight">
              Ready to See Your Code in Three Dimensions?
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              Launch the 3D Studio right now. Enter your own custom code, solve Striver SDE problems, or consult the AI Code Doctor with zero latency.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => handleLaunchStudio()}
              className="h-12 px-8 rounded-xl text-sm font-bold bg-white text-slate-950 hover:bg-slate-100 shadow-xl transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
            >
              <span>Launch 3D Studio</span>
              <ArrowRight size={17} />
            </button>

            <button
              onClick={() => navigate('/ai')}
              className="h-12 px-6 rounded-xl text-sm font-semibold border border-white/30 hover:bg-white/10 text-white transition cursor-pointer flex items-center gap-2"
            >
              <Bot size={16} />
              <span>Ask AI Code Doctor</span>
            </button>
          </div>
        </section>

        {/* ========================================================
            POLISHED FOOTER
            ======================================================== */}
        <footer
          className={`pt-10 pb-8 border-t flex flex-col md:flex-row items-center justify-between gap-6 text-xs ${
            isBright ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-950 font-bold text-[10px]"
              style={{ backgroundColor: activeHex }}
            >
              3D
            </div>
            <span className="font-display font-bold text-sm tracking-wider text-slate-900 dark:text-white">
              CODE<span style={{ color: activeHex }}>3D</span>-AI
            </span>
            <span className="text-slate-400">|</span>
            <span>Spatial WebGL Code Intelligence</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span className="hover:text-accent cursor-pointer" onClick={() => navigate('/visualizer')}>
              3D Studio
            </span>
            <span className="hover:text-accent cursor-pointer" onClick={() => navigate('/dsa')}>
              182 Striver Sheet
            </span>
            <span className="hover:text-accent cursor-pointer" onClick={() => navigate('/ai')}>
              AI Tutor
            </span>
            <span className="hover:text-accent cursor-pointer" onClick={() => navigate('/quiz')}>
              Quiz Arena
            </span>
          </div>

          <div className="text-[11px] font-mono">
            Powered by Three.js &amp; AST Engine • 60 FPS
          </div>
        </footer>
      </div>

      {/* Floating Style Studio Modal */}
      <TemplateCustomizerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
