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

/**
 * CODE3D-AI - Professional IDE Top Toolbar
 * 
 * Central command bar with Project name, Language selector, primary Run action,
 * Explain with AI, 3D Visualize, Save, Share, and Settings.
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
  const [copiedLink, setCopiedLink] = useState(false);

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
    <header className="h-11 bg-[#0d1726] border-b border-[#26364a] px-3 flex items-center justify-between text-xs text-[#f8fafc] select-none shrink-0 z-30">
      {/* Left: Brand + Project Name */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shrink-0"
          title="Return to Dashboard"
        >
          <div className="w-7 h-7 rounded bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center shadow-xs">
            <Box size={16} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-wide hidden sm:inline text-[#f8fafc]">
            CODE<span className="text-[#3b82f6]">3D</span>-AI
          </span>
        </button>

        <span className="text-[#26364a] hidden sm:inline">|</span>

        {/* Project Title with Indicator */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[#94a3b8] font-medium hidden md:inline shrink-0">
            Project:
          </span>
          <span className="font-semibold text-xs text-[#f8fafc] truncate max-w-[140px] sm:max-w-[220px] md:max-w-[280px]">
            {projectName}
          </span>
        </div>

        {/* Language Selector */}
        {onChangeLanguage && (
          <select
            value={language}
            onChange={(e) => onChangeLanguage(e.target.value)}
            className="h-7 bg-[#101c2d] border border-[#26364a] rounded px-2 text-[11px] font-mono text-[#38bdf8] focus:outline-none focus:border-[#3b82f6] cursor-pointer"
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
        {/* Primary Run Action */}
        <button
          id="ide-top-run-btn"
          onClick={onRun}
          disabled={isRunning}
          className={`h-7 px-3.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
            isPlaying
              ? 'bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-bold'
              : 'bg-[#3b82f6] hover:bg-[#2563eb] text-white shadow-blue-500/20 active:scale-[0.98]'
          } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Run Code (Ctrl + Enter)"
        >
          {isPlaying ? (
            <>
              <Pause size={13} className="fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play size={13} className="fill-current" />
              <span>Run</span>
            </>
          )}
        </button>

        {/* Explain with AI */}
        {onExplainAi && (
          <button
            onClick={onExplainAi}
            className="h-7 px-2.5 rounded bg-[#101c2d] hover:bg-[#1e2f47] border border-[#8b5cf6]/40 text-[#c084fc] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Explain current execution step with AI"
          >
            <Sparkles size={13} className="text-[#a855f7]" />
            <span className="hidden sm:inline">Explain with AI</span>
          </button>
        )}

        {/* Visualize 3D Action */}
        {onVisualize && (
          <button
            onClick={onVisualize}
            className="h-7 px-2.5 rounded bg-[#101c2d] hover:bg-[#1e2f47] border border-[#14b8a6]/40 text-[#2dd4bf] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Focus 3D Viewport"
          >
            <Layers size={13} className="text-[#14b8a6]" />
            <span className="hidden sm:inline">Visualize</span>
          </button>
        )}

        {/* Striver Sheet Quick Launch */}
        {onOpenStriverSheet && (
          <button
            onClick={onOpenStriverSheet}
            className="h-7 px-2.5 rounded bg-[#101c2d] hover:bg-[#1e2f47] border border-[#26364a] text-[#f59e0b] text-xs font-medium hidden lg:flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Striver SDE Sheet"
          >
            <BookOpen size={13} className="text-[#f59e0b]" />
            <span>Striver Sheet</span>
          </button>
        )}

        {/* Personal Problem Solver */}
        {onOpenCodeDoctor && (
          <button
            onClick={onOpenCodeDoctor}
            className="h-7 px-2.5 rounded bg-[#101c2d] hover:bg-[#1e2f47] border border-[#26364a] text-[#fbbf24] text-xs font-medium hidden xl:flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Personal Problem Solver"
          >
            <Lightbulb size={13} className="text-[#fbbf24]" />
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
            className={`h-7 px-2.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              saveSuccess
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400'
                : 'bg-[#101c2d] hover:bg-[#1e2f47] border-[#26364a] text-[#f8fafc]'
            }`}
            title="Save code to project collection"
          >
            {saveSuccess ? <Check size={13} /> : <Save size={13} className="text-[#94a3b8]" />}
            <span className="hidden md:inline">
              {saveSuccess ? 'Saved' : isSaving ? 'Saving...' : 'Save'}
            </span>
          </button>
        )}

        {/* Share Button */}
        <button
          onClick={handleShareClick}
          className="h-7 px-2 sm:px-2.5 rounded bg-[#101c2d] hover:bg-[#1e2f47] border border-[#26364a] text-[#94a3b8] hover:text-[#f8fafc] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Share workspace link"
        >
          {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
          <span className="hidden md:inline">{copiedLink ? 'Copied' : 'Share'}</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings || (() => navigate('/settings'))}
          className="h-7 w-7 rounded bg-[#101c2d] hover:bg-[#1e2f47] border border-[#26364a] text-[#94a3b8] hover:text-[#f8fafc] flex items-center justify-center transition-colors cursor-pointer"
          title="Workspace Settings"
          aria-label="Workspace Settings"
        >
          <Settings size={13} />
        </button>
      </div>
    </header>
  );
}

export default TopNav;
