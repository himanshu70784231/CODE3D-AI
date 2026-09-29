import React, { useState } from 'react';
import { FileCode, Play, RotateCcw, Check, Sparkles, Maximize2, Minimize2, ChevronDown, ChevronRight, Settings2, AlignLeft } from 'lucide-react';
import CodeEditor from './CodeEditor.jsx';

/**
 * CODE3D-AI - EditorPanel Component
 * Wraps Monaco Editor in a professional IDE editor tab with file metadata,
 * unsaved state dot, format action, language indicator, and collapse/fullscreen controls.
 */
export function EditorPanel({
  code,
  onChangeCode,
  language = 'java',
  onChangeLanguage,
  currentLineNumber,
  syntaxErrorLine,
  isPlaying,
  onRun,
  onReset,
  isExecuting,
  isCodeDirty,
  breakpoints,
  onToggleBreakpoint,
  onSelectLine,
  isCollapsed = false,
  onToggleCollapse = null,
  isFullscreen = false,
  onToggleFullscreen = null,
  onOpenCustomCode,
  onOpenCodeDoctor,
  onOpenPersonalProblem,
  onOpenStriverSheet,
}) {
  const fileNames = {
    java: 'Main.java',
    python: 'main.py',
    javascript: 'main.js',
    c: 'main.c',
    cpp: 'main.cpp',
  };

  const currentFileName = fileNames[language] || 'Main.java';

  return (
    <div
      className={`flex flex-col h-full bg-[#101c2d] border border-[#26364a] rounded-md overflow-hidden transition-colors ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : ''
      }`}
    >
      {/* Editor Tab Bar & Toolbar */}
      <div className="h-9 bg-[#0d1726] border-b border-[#26364a] px-2 flex items-center justify-between text-xs select-none shrink-0">
        {/* Active File Tab */}
        <div className="flex items-center gap-1">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded hover:bg-[#1e2f47] text-[#94a3b8] hover:text-[#f8fafc] transition-colors cursor-pointer mr-0.5"
              title={isCollapsed ? 'Expand Editor' : 'Collapse Editor'}
            >
              {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
            </button>
          )}

          <div className="flex items-center gap-2 px-2.5 py-1 bg-[#101c2d] border-t-2 border-t-[#3b82f6] border-x border-x-[#26364a] rounded-t text-xs font-medium text-[#f8fafc]">
            <FileCode size={13} className="text-[#38bdf8]" />
            <span>{currentFileName}</span>

            {/* Unsaved State Dot Indicator */}
            {isCodeDirty && (
              <span
                className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse"
                title="Unsaved changes (modified)"
              />
            )}
          </div>
        </div>

        {/* Editor Controls & Indicators */}
        <div className="flex items-center gap-1.5">
          {/* Language Indicator Badge */}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#142338] text-[#38bdf8] border border-[#26364a]">
            {language.toUpperCase()}
          </span>

          {/* Quick Run in Editor Toolbar */}
          <button
            onClick={onRun}
            className="h-6 px-2 rounded bg-[#3b82f6] hover:bg-[#2563eb] text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            title="Execute Code (Ctrl + Enter)"
          >
            <Play size={10} className="fill-current" />
            <span className="hidden sm:inline">Run</span>
          </button>

          {/* Reset Code Button */}
          <button
            onClick={onReset}
            className="p-1 rounded hover:bg-[#1e2f47] text-[#94a3b8] hover:text-[#f8fafc] transition-colors cursor-pointer"
            title="Reset code to original template"
          >
            <RotateCcw size={12} />
          </button>

          {/* Fullscreen Toggle */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-1 rounded hover:bg-[#1e2f47] text-[#94a3b8] hover:text-[#f8fafc] transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Editor'}
            >
              {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </button>
          )}
        </div>
      </div>

      {/* Editor Content Area */}
      {!isCollapsed && (
        <div className="flex-1 overflow-hidden relative">
          <CodeEditor
            code={code}
            onChangeCode={onChangeCode}
            language={language}
            onChangeLanguage={onChangeLanguage}
            currentLineNumber={currentLineNumber}
            syntaxErrorLine={syntaxErrorLine}
            isPlaying={isPlaying}
            onPlay={onRun}
            onRunCode={onRun}
            onResetCode={onReset}
            isExecuting={isExecuting}
            isCodeDirty={isCodeDirty}
            breakpoints={breakpoints}
            onToggleBreakpoint={onToggleBreakpoint}
            onSelectLine={onSelectLine}
            onOpenCustomCode={onOpenCustomCode}
            onOpenCodeDoctor={onOpenCodeDoctor}
            onOpenPersonalProblem={onOpenPersonalProblem}
            onOpenStriverSheet={onOpenStriverSheet}
          />
        </div>
      )}
    </div>
  );
}

export default EditorPanel;
