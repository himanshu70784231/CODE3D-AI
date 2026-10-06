import React, { useState } from 'react';
import { Settings, Cpu, CheckCircle2, ShieldCheck, Sun, Moon, Palette, Gauge } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
  const { theme, setTheme, isBright } = useTheme();

  const [speed, setSpeed] = useState(() => {
    try {
      const saved = localStorage.getItem('code3d_default_speed');
      return saved ? Number(saved) : 1;
    } catch (e) {
      return 1;
    }
  });

  const [reducedMotion, setReducedMotion] = useState(() => {
    try {
      return localStorage.getItem('code3d_reduced_motion') === 'true';
    } catch (e) {
      return false;
    }
  });

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    try {
      localStorage.setItem('code3d_default_speed', String(newSpeed));
    } catch (e) {}
  };

  const handleReducedMotionToggle = () => {
    setReducedMotion((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('code3d_reduced_motion', String(next));
      } catch (e) {}
      return next;
    });
  };

  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-10 select-none transition-colors duration-200 ${
      isBright ? 'bg-[#f7f6f3] text-stone-900' : 'bg-[#0e1013] text-stone-100'
    }`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium mb-2 border bg-amber-500/10 border-amber-500/30 text-amber-500">
            <Settings size={13} />
            <span>Platform Configuration &amp; Preferences</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            System Settings &amp; Appearance
          </h1>
          <p className={`text-xs mt-1 leading-relaxed ${isBright ? 'text-stone-600' : 'text-stone-400'}`}>
            Configure color themes, execution playback speeds, accessibility settings, and 3D WebGL runtime diagnostics.
          </p>
        </div>

        {/* Theme Customizer */}
        <div className={`border rounded-xl p-6 space-y-4 transition-colors ${
          isBright ? 'bg-white border-[#e2dfd8] shadow-xs' : 'bg-[#13161b] border-[#252932]'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Palette size={16} className="text-amber-500" />
              <span>Appearance &amp; Display Theme</span>
            </h2>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              isBright ? 'bg-amber-100/80 border-amber-300 text-amber-900' : 'bg-[#181c23] border-[#252932] text-amber-400'
            }`}>
              Active: {isBright ? 'Alabaster Light' : 'Charcoal Dark'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dark Mode */}
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                !isBright
                  ? 'bg-[#181c23] border-amber-500/80 ring-1 ring-amber-500/40 shadow-sm'
                  : 'bg-stone-50 border-stone-200 hover:border-stone-300 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-[#0e1013] border border-[#252932] flex items-center justify-center text-amber-400 shrink-0">
                <Moon size={18} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-100">Charcoal Dark Mode</span>
                  {!isBright && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Neutral graphite &amp; charcoal surfaces (`#0e1013`), warm amber execution pointers, code3dDark Monaco editor.
                </p>
              </div>
            </button>

            {/* Light Mode */}
            <button
              onClick={() => setTheme('bright')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                isBright
                  ? 'bg-amber-50/40 border-amber-500/60 ring-1 ring-amber-500/30 shadow-xs'
                  : 'bg-[#0e1013] border-[#252932] hover:border-stone-700 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-amber-100/60 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                <Sun size={18} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${isBright ? 'text-stone-900' : 'text-stone-200'}`}>
                    Alabaster Light Mode
                  </span>
                  {isBright && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200/60 text-amber-900 border border-amber-400 font-mono">
                      Current
                    </span>
                  )}
                </div>
                <p className={`text-[11px] leading-snug ${isBright ? 'text-stone-600' : 'text-stone-400'}`}>
                  Warm stone &amp; sand canvas (`#f7f6f3`), high-contrast typography, soft architectural lighting, code3dLight Monaco editor.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Animation Speed & Motion Accessibility */}
        <div className={`border rounded-xl p-6 space-y-4 transition-colors ${
          isBright ? 'bg-white border-[#e2dfd8] shadow-xs' : 'bg-[#13161b] border-[#252932]'
        }`}>
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Gauge size={16} className="text-amber-500" />
            <span>3D Playback &amp; Motion Preferences</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Default Playback Speed */}
            <div className={`p-4 rounded-xl border space-y-2 ${
              isBright ? 'bg-stone-50/50 border-[#e2dfd8]' : 'bg-[#0e1013] border-[#252932]'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isBright ? 'text-stone-800' : 'text-stone-200'}`}>
                  Default Playback Speed
                </span>
                <span className="text-[10px] font-mono text-amber-500 font-bold">{speed}x</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Default step pacing when launching new algorithm traces.
              </p>
              <div className="flex items-center gap-1.5 pt-1">
                {[0.25, 0.5, 1, 2, 4].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`flex-1 py-1 rounded text-xs font-mono font-bold border transition cursor-pointer ${
                      speed === s
                        ? 'bg-amber-500 text-stone-950 border-amber-400'
                        : isBright
                          ? 'bg-white border-[#e2dfd8] text-stone-700 hover:bg-stone-100'
                          : 'bg-[#181c23] border-[#252932] text-stone-300 hover:bg-[#222731]'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Reduced Motion Toggle */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 ${
              isBright ? 'bg-stone-50/50 border-[#e2dfd8]' : 'bg-[#0e1013] border-[#252932]'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isBright ? 'text-stone-800' : 'text-stone-200'}`}>
                    Reduced Motion
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    reducedMotion
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-stone-800 text-stone-400 border-stone-700'
                  }`}>
                    {reducedMotion ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Replaces continuous 3D camera sweeps with smooth direct frame transitions.
                </p>
              </div>

              <button
                onClick={handleReducedMotionToggle}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  reducedMotion
                    ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                    : isBright
                      ? 'bg-white hover:bg-stone-100 border-[#e2dfd8] text-stone-700'
                      : 'bg-[#181c23] hover:bg-[#222731] border-[#252932] text-stone-300'
                }`}
              >
                {reducedMotion ? 'Disable Reduced Motion' : 'Enable Reduced Motion'}
              </button>
            </div>
          </div>
        </div>

        {/* Runtime Stack Info */}
        <div className={`border rounded-xl p-6 space-y-4 transition-colors ${
          isBright ? 'bg-white border-[#e2dfd8] shadow-xs' : 'bg-[#13161b] border-[#252932]'
        }`}>
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Cpu size={16} className="text-amber-500" />
            <span>Active Software Runtimes</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className={`border rounded-xl p-3.5 space-y-1 ${
              isBright ? 'bg-stone-50/50 border-[#e2dfd8]' : 'bg-[#0e1013] border-[#252932]'
            }`}>
              <div className={`uppercase text-[10px] ${isBright ? 'text-stone-500' : 'text-stone-400'}`}>5-Language Polyglot Engine</div>
              <div className="font-bold">Java, C++, Python, JS &amp; C</div>
              <div className="text-emerald-500 text-[11px] flex items-center gap-1 mt-1">
                <CheckCircle2 size={12} /> Normalized Trace Pipeline
              </div>
            </div>

            <div className={`border rounded-xl p-3.5 space-y-1 ${
              isBright ? 'bg-stone-50/50 border-[#e2dfd8]' : 'bg-[#0e1013] border-[#252932]'
            }`}>
              <div className={`uppercase text-[10px] ${isBright ? 'text-stone-500' : 'text-stone-400'}`}>Full-Stack Backend Server</div>
              <div className="font-bold">Node.js / Express + PostgreSQL (Neon) / Prisma</div>
              <div className="text-emerald-500 text-[11px] flex items-center gap-1 mt-1">
                <CheckCircle2 size={12} /> Port 5000 (Cookie Sessions + Sandbox)
              </div>
            </div>

            <div className={`border rounded-xl p-3.5 space-y-1 ${
              isBright ? 'bg-stone-50/50 border-[#e2dfd8]' : 'bg-[#0e1013] border-[#252932]'
            }`}>
              <div className={`uppercase text-[10px] ${isBright ? 'text-stone-500' : 'text-stone-400'}`}>Frontend Bundler</div>
              <div className="font-bold">Vite 5.4 + React 18</div>
              <div className="text-emerald-500 text-[11px] flex items-center gap-1 mt-1">
                <CheckCircle2 size={12} /> Port 5173 (HMR Active)
              </div>
            </div>

            <div className={`border rounded-xl p-3.5 space-y-1 ${
              isBright ? 'bg-stone-50/50 border-[#e2dfd8]' : 'bg-[#0e1013] border-[#252932]'
            }`}>
              <div className={`uppercase text-[10px] ${isBright ? 'text-stone-500' : 'text-stone-400'}`}>3D Graphics Pipeline</div>
              <div className="font-bold">Three.js + React Three Fiber 8</div>
              <div className="text-amber-500 text-[11px] flex items-center gap-1 mt-1">
                <CheckCircle2 size={12} /> WebGL 2.0 Hardware Accelerated
              </div>
            </div>
          </div>
        </div>

        {/* Security & Sandboxing Info */}
        <div className={`border rounded-xl p-6 space-y-3 transition-colors ${
          isBright ? 'bg-white border-[#e2dfd8] shadow-xs' : 'bg-[#13161b] border-[#252932]'
        }`}>
          <h2 className="text-sm font-bold flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>Code Execution Sandbox &amp; Security Protocol</span>
          </h2>
          <p className={`text-xs leading-relaxed font-sans ${isBright ? 'text-stone-600' : 'text-stone-300'}`}>
            User-submitted code is first verified through JavaParser and syntactic AST validation.
            The backend rejects filesystem operations, reflection, network requests, and dangerous system calls,
            executing only controlled AST program models within an isolated simulation sandbox.
          </p>
        </div>

        {/* Exhibition Info */}
        <div className={`border rounded-xl p-6 flex items-center justify-between transition-colors ${
          isBright
            ? 'bg-amber-50/50 border-amber-200 text-stone-900'
            : 'bg-amber-500/10 border-amber-500/30 text-stone-100'
        }`}>
          <div className="space-y-1">
            <h3 className="text-sm font-bold">
              Code3D AI Release Build
            </h3>
            <p className={`text-xs font-sans ${isBright ? 'text-stone-600' : 'text-stone-400'}`}>
              Engineered for interactive educational programming, synchronized Monaco-Three.js execution, and Big-O algorithm mastery.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-500 text-stone-950 px-3 py-1.5 rounded-lg shrink-0">
            v1.0 Ready
          </span>
        </div>
      </div>
    </div>
  );
}
