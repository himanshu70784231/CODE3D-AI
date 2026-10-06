import React, { useState } from 'react';
import {
  Play,
  Pause,
  Sparkles,
  Layers,
  Save,
  Share2,
  Settings,
  Box,
  Check,
  Code2,
  ChevronDown,
  BookOpen,
  Lightbulb,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';

/**
 * CODE3D-AI - Professional IDE Top Toolbar
 * Clean technical neutral foundation with prominent Amber execution triggers.
 */
export function TopNav({
  projectName = 'Array Traversal & Iteration',
  language = 'java',
  onChangeLanguage = null,
  onRun = null,
  isRunning = false,
  isPlaying = false,
  onExplainAi = null,
  onVisualize = null,
  onSave = null,
  isSaving = false,
  saveSuccess = false,
  onShare = null,
  onOpenSettings = null,
  onOpenCodeDoctor = null,
  onOpenStriverSheet = null,
}) {
  const navigate = useNavigate();
  const { isBright, currentAccent } = useTheme();
  const [copiedLink, setCopiedLink] = useState(false);

  const accentHex = isBright ? currentAccent.bright : currentAccent.dark;

  const handleShareClick = () => {
    if (onShare) {
      onShare();
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <header className={`h-11 border-b px-3 flex items-center justify-between text-xs select-none shrink-0 z-30 transition-colors duration-150 ${
      isBright
        ? 'bg-white border-[#e2ded5] text-stone-900 shadow-2xs'
        : 'bg-[#121419] border-[#242831] text-stone-100'
    }`}>
      {/* Left: Brand + Project Name */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shrink-0"
          title="Return to Dashboard"
        >
          <div className="w-5.5 h-5.5 rounded-md bg-amber-500 flex items-center justify-center text-stone-950 font-bold shadow-2xs">
            <Box size={13} className="text-stone-950 stroke-[2.5]" />
          </div>
          <span className={`font-bold text-xs tracking-wide hidden sm:inline ${
            isBright ? 'text-stone-900' : 'text-stone-100'
          }`}>
            CODE<span className="text-amber-500">3D</span>
          </span>
        </button>

        <span className={isBright ? 'text-stone-300 hidden sm:inline' : 'text-stone-700 hidden sm:inline'}>/</span>

        {/* Project Title with Indicator */}
        <div className="flex items-center gap-2 min-w-0">
          <span className={`font-medium hidden md:inline shrink-0 ${
            isBright ? 'text-stone-500' : 'text-stone-400'
          }`}>
            Program:
          </span>
          <span className={`font-semibold text-xs truncate max-w-[130px] sm:max-w-[200px] md:max-w-[260px] ${
            isBright ? 'text-stone-900' : 'text-stone-100'
          }`}>
            {projectName}
          </span>
        </div>

        {/* Language Selector */}
        {onChangeLanguage && (
          <select
            value={language}
            onChange={(e) => onChangeLanguage(e.target.value)}
            className={`h-6.5 border rounded-md px-2 text-[11px] font-mono focus:outline-none focus:border-amber-500 cursor-pointer transition-colors ${
              isBright
                ? 'bg-stone-50 border-stone-300 text-stone-800'
                : 'bg-[#181c22] border-stone-700 text-stone-200'
            }`}
            title="Programming Language"
            aria-label="Select Programming Language"
          >
            <option value="java">Java 21</option>
            <option value="python">Python 3</option>
            <option value="javascript">JavaScript</option>
            <option value="c">C17</option>
            <option value="cpp">C++20</option>
          </select>
        )}
      </div>

      {/* Center / Action Buttons: Run, Explain, Visualize */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Primary Run Action — Warm Amber Flame (Core Interaction) */}
        <button
          id="ide-top-run-btn"
          onClick={onRun}
          disabled={isRunning}
          style={{
            backgroundColor: isPlaying ? undefined : accentHex,
          }}
          className={`h-7 px-3.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 text-stone-950 ${
            isPlaying
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'hover:brightness-105'
          } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Run Code (Ctrl + Enter)"
        >
          {isPlaying ? (
            <>
              <Pause size={12} className="fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play size={12} className="fill-current" />
              <span>Run Execution</span>
            </>
          )}
        </button>

        {/* Explain with AI */}
        {onExplainAi && (
          <button
            onClick={onExplainAi}
            className={`h-7 px-2.5 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isBright
                ? 'bg-stone-100 hover:bg-stone-200/80 border-stone-300 text-stone-800'
                : 'bg-[#181c22] hover:bg-stone-800 border-stone-700 text-stone-200'
            }`}
            title="Explain current execution step with AI"
          >
            <Sparkles size={12} className="text-amber-500" />
            <span className="hidden sm:inline">Explain AI</span>
          </button>
        )}

        {/* Visualize 3D Action */}
        {onVisualize && (
          <button
            onClick={onVisualize}
            className={`h-7 px-2.5 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isBright
                ? 'bg-stone-100 hover:bg-stone-200/80 border-stone-300 text-stone-800'
                : 'bg-[#181c22] hover:bg-stone-800 border-stone-700 text-stone-200'
            }`}
            title="Focus 3D Viewport"
          >
            <Layers size={12} className={isBright ? 'text-stone-700' : 'text-stone-300'} />
            <span className="hidden sm:inline">3D Viewport</span>
          </button>
        )}

        {/* Striver Sheet Quick Launch */}
        {onOpenStriverSheet && (
          <button
            onClick={onOpenStriverSheet}
            className={`h-7 px-2.5 rounded-md border text-xs font-medium hidden lg:flex items-center gap-1.5 transition-colors cursor-pointer ${
              isBright
                ? 'bg-stone-100 hover:bg-stone-200/80 border-stone-300 text-stone-800'
                : 'bg-[#181c22] hover:bg-stone-800 border-stone-700 text-stone-200'
            }`}
            title="Striver SDE Sheet"
          >
            <BookOpen size={12} className="text-amber-500" />
            <span>SDE Sheet</span>
          </button>
        )}

        {/* Personal Problem Solver */}
        {onOpenCodeDoctor && (
          <button
            onClick={onOpenCodeDoctor}
            className={`h-7 px-2.5 rounded-md border text-xs font-medium hidden xl:flex items-center gap-1.5 transition-colors cursor-pointer ${
              isBright
                ? 'bg-stone-100 hover:bg-stone-200/80 border-stone-300 text-stone-800'
                : 'bg-[#181c22] hover:bg-stone-800 border-stone-700 text-stone-200'
            }`}
            title="Personal Problem Solver"
          >
            <Lightbulb size={12} className="text-amber-500" />
            <span>Problem Solver</span>
          </button>
        )}
      </div>

      {/* Right: Save, Share, Settings */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Save Button */}
        {onSave && (
          <button
            onClick={onSave}
            disabled={isSaving}
            className={`h-7 px-2.5 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              saveSuccess
                ? isBright
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-emerald-950/60 border-emerald-500 text-emerald-400'
                : isBright
                  ? 'bg-white hover:bg-stone-100 border-stone-300 text-stone-800'
                  : 'bg-[#181c22] hover:bg-stone-800 border-stone-700 text-stone-200'
            }`}
            title="Save code to project collection"
          >
            {saveSuccess ? <Check size={12} /> : <Save size={12} className={isBright ? 'text-stone-500' : 'text-stone-400'} />}
            <span className="hidden md:inline">
              {saveSuccess ? 'Saved' : isSaving ? 'Saving...' : 'Save'}
            </span>
          </button>
        )}

        {/* Share Button */}
        <button
          onClick={handleShareClick}
          className={`h-7 px-2.5 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            copiedLink
              ? isBright
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-emerald-950/60 border-emerald-500 text-emerald-400'
              : isBright
                ? 'bg-white hover:bg-stone-100 border-stone-300 text-stone-800'
                : 'bg-[#181c22] hover:bg-stone-800 border-stone-700 text-stone-200'
          }`}
          title="Copy project share URL"
        >
          {copiedLink ? <Check size={12} /> : <Share2 size={12} className={isBright ? 'text-stone-500' : 'text-stone-400'} />}
          <span className="hidden md:inline">{copiedLink ? 'Copied' : 'Share'}</span>
        </button>

        {/* Settings Button */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
              isBright
                ? 'bg-white hover:bg-stone-100 border-stone-300 text-stone-700'
                : 'bg-[#181c22] hover:bg-stone-800 border-stone-700 text-stone-300'
            }`}
            title="Open Visualizer Settings"
          >
            <Settings size={13} />
          </button>
        )}
      </div>
    </header>
  );
}

export default TopNav;
