import React from 'react';
import { FileCode, Play, RotateCcw, Check, Sparkles, Maximize2, Minimize2, ChevronDown, ChevronRight } from 'lucide-react';
import CodeEditor from './CodeEditor.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

/**
 * CODE3D-AI - EditorPanel Component
 * Clean integrated editor workspace with file metadata and execution status.
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
  const { isBright } = useTheme();

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
      className={`flex flex-col h-full border-r overflow-hidden transition-colors duration-150 ${
        isBright
          ? 'bg-white border-[#e2ded5]'
          : 'bg-[#13161b] border-[#242831]'
      } ${isFullscreen ? 'fixed inset-0 z-50 border-none' : ''}`}
    >
      {/* Editor Tab Bar & Toolbar */}
      <div className={`h-8.5 border-b px-2 flex items-center justify-between text-xs select-none shrink-0 transition-colors ${
        isBright ? 'bg-[#f7f6f3] border-[#e2ded5]' : 'bg-[#16191f] border-[#242831]'
      }`}>
        {/* Active File Tab */}
        <div className="flex items-center gap-1">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`p-1 rounded transition-colors cursor-pointer mr-0.5 ${
                isBright
                  ? 'hover:bg-stone-200 text-stone-500 hover:text-stone-900'
                  : 'hover:bg-stone-800 text-stone-400 hover:text-stone-100'
              }`}
              title={isCollapsed ? 'Expand Editor' : 'Collapse Editor'}
            >
              {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
            </button>
          )}

          <div className={`flex items-center gap-1.5 px-2.5 py-1 border-b-2 text-xs font-semibold ${
            isBright
              ? 'border-b-amber-600 text-stone-900 font-bold'
              : 'border-b-amber-500 text-stone-100 font-bold'
          }`}>
            <FileCode size={13} className="text-amber-500" />
            <span>{currentFileName}</span>

            {/* Unsaved State Dot Indicator */}
            {isCodeDirty && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"
                title="Unsaved changes (modified)"
              />
            )}
          </div>
        </div>

        {/* Editor Controls & Indicators */}
        <div className="flex items-center gap-1.5">
          {/* Language Indicator Badge */}
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
            isBright
              ? 'bg-stone-100 text-stone-700 border-stone-300'
              : 'bg-[#181c22] text-stone-300 border-stone-700'
          }`}>
            {language.toUpperCase()}
          </span>

          {/* Fullscreen Toggle */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className={`p-1 rounded cursor-pointer ${
                isBright ? 'hover:bg-stone-200 text-stone-500' : 'hover:bg-stone-800 text-stone-400'
              }`}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Editor'}
            >
              {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </button>
          )}
        </div>
      </div>

      {/* Embedded Monaco Editor */}
      <div className="flex-1 w-full overflow-hidden">
        <CodeEditor
          code={code}
          onChangeCode={onChangeCode}
          currentLineNumber={currentLineNumber}
          language={language}
          onChangeLanguage={onChangeLanguage}
          isPlaying={isPlaying}
          onRunCode={onRun}
          onResetCode={onReset}
          isExecuting={isExecuting}
          isCodeDirty={isCodeDirty}
          syntaxErrorLine={syntaxErrorLine}
          breakpoints={breakpoints}
          onToggleBreakpoint={onToggleBreakpoint}
          onSelectLine={onSelectLine}
          onOpenCustomCode={onOpenCustomCode}
          onOpenCodeDoctor={onOpenCodeDoctor}
          onOpenPersonalProblem={onOpenPersonalProblem}
          onOpenStriverSheet={onOpenStriverSheet}
        />
      </div>
    </div>
  );
}

export default EditorPanel;
