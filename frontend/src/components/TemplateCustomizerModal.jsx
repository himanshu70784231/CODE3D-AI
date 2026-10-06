import React from 'react';
import {
  X,
  Palette,
  Layout,
  Sun,
  Moon,
  Check,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useTheme, ACCENT_PALETTES, TEMPLATE_STYLES } from '../context/ThemeContext';

export default function TemplateCustomizerModal({ isOpen, onClose }) {
  const {
    theme,
    toggleTheme,
    isBright,
    accentColor,
    setAccentColor,
    currentAccent,
    templateStyle,
    setTemplateStyle,
    currentTemplate,
  } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in select-none">
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 scale-100 ${
          isBright
            ? 'bg-white border-slate-200 shadow-slate-300/60 text-slate-900'
            : 'bg-[#090f1d] border-slate-800 shadow-black/80 text-white'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-5 border-b flex items-center justify-between ${
            isBright ? 'bg-slate-50 border-slate-200' : 'bg-[#0d162a] border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-950 font-bold shadow-md"
              style={{ backgroundColor: isBright ? currentAccent.bright : currentAccent.dark }}
            >
              <Palette size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold font-display tracking-tight">
                Software Style &amp; Template Studio
              </h2>
              <p className="text-[11px] opacity-70">
                Customize layout architecture, accent colors, and illumination modes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-500/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* SECTION 1: TEMPLATE ARCHITECTURE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                1. Select Template Architecture
              </span>
              <span className="text-[11px] font-mono font-bold text-accent">
                {currentTemplate.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(TEMPLATE_STYLES).map((tmpl) => {
                const isSelected = templateStyle === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => setTemplateStyle(tmpl.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? isBright
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                          : 'bg-slate-800/90 border-emerald-400 ring-2 ring-emerald-400/30 shadow-lg'
                        : isBright
                          ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">{tmpl.icon}</span>
                        {isSelected && (
                          <span
                            className="w-4 h-4 rounded-full flex items-center justify-center text-slate-950 text-[10px] font-bold"
                            style={{
                              backgroundColor: isBright ? currentAccent.bright : currentAccent.dark,
                            }}
                          >
                            <Check size={10} />
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold font-display">{tmpl.name}</h4>
                      <p className="text-[10px] opacity-75 mt-1 leading-snug">
                        {tmpl.description}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-500/20">
                      <span className="text-[9px] font-mono uppercase font-bold opacity-60">
                        {tmpl.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: HYPER-VIVID COLOR PALETTES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                2. Live Accent Color Palette
              </span>
              <span
                className="text-[11px] font-mono font-bold"
                style={{ color: isBright ? currentAccent.bright : currentAccent.dark }}
              >
                {currentAccent.name}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {Object.values(ACCENT_PALETTES).map((pal) => {
                const isSelected = accentColor === pal.id;
                const activeHex = isBright ? pal.bright : pal.dark;
                return (
                  <button
                    key={pal.id}
                    onClick={() => setAccentColor(pal.id)}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition cursor-pointer relative ${
                      isSelected
                        ? 'border-2 shadow-md scale-105 font-bold'
                        : 'border-slate-500/20 hover:scale-102 opacity-75 hover:opacity-100'
                    }`}
                    style={{
                      borderColor: isSelected ? activeHex : undefined,
                      backgroundColor: isSelected
                        ? isBright ? `${pal.bright}15` : `${pal.dark}20`
                        : undefined,
                    }}
                  >
                    <span
                      className="w-7 h-7 rounded-full shadow-inner flex items-center justify-center text-slate-950"
                      style={{ backgroundColor: activeHex }}
                    >
                      {isSelected && <Check size={13} strokeWidth={3} className="text-white" />}
                    </span>
                    <span className="text-[11px] font-mono tracking-tight font-semibold">
                      {pal.name.split(' ')[1] || pal.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: ILLUMINATION MODE */}
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              3. Illumination Environment
            </span>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  if (theme !== 'dark') toggleTheme();
                }}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-cyan-400 ring-2 ring-cyan-400/20 shadow-md text-white'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center text-cyan-400">
                  <Moon size={16} />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold">Cosmic Dark</h4>
                  <p className="text-[10px] opacity-70">Deep obsidian with neon glow</p>
                </div>
              </button>

              <button
                onClick={() => {
                  if (theme !== 'bright') toggleTheme();
                }}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition cursor-pointer ${
                  theme === 'bright'
                    ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-md text-slate-900'
                    : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <Sun size={16} />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold">Ceramic Bright</h4>
                  <p className="text-[10px] opacity-70">Ultra-clean daylit studio</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between ${
            isBright ? 'bg-slate-50 border-slate-200' : 'bg-[#0d162a] border-slate-800'
          }`}
        >
          <span className="text-[11px] font-mono opacity-70">
            Active: {currentTemplate.name} • {currentAccent.name}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition cursor-pointer"
            style={{
              backgroundColor: isBright ? currentAccent.bright : currentAccent.dark,
            }}
          >
            Apply &amp; Experience
          </button>
        </div>
      </div>
    </div>
  );
}
