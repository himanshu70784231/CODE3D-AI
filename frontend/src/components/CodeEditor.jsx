import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, FileCode, CheckCircle2, Code2, Sparkles, Trophy, BookOpen, Lightbulb, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const LANGUAGE_CONFIG = {
  java: {
    monacoLang: 'java',
    fileName: 'Main.java',
    badge: 'Java 21',
    icon: '☕'
  },
  python: {
    monacoLang: 'python',
    fileName: 'main.py',
    badge: 'Python 3.12',
    icon: '🐍'
  },
  c: {
    monacoLang: 'c',
    fileName: 'main.c',
    badge: 'C17 Standard',
    icon: '🇨'
  },
  cpp: {
    monacoLang: 'cpp',
    fileName: 'main.cpp',
    badge: 'C++20 STL',
    icon: '⚡'
  },
  javascript: {
    monacoLang: 'javascript',
    fileName: 'main.js',
    badge: 'Node.js / ES2024',
    icon: '🟨'
  }
};

export default function CodeEditor({
  code,
  onChangeCode,
  currentLineNumber,
  language = 'java',
  onChangeLanguage,
  onOpenCustomCode,
  onOpenCodeDoctor,
  onOpenPersonalProblem,
  onOpenLeetCode,
  onOpenStriverSheet,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onReset,
  isAtStart,
  isAtEnd,
  isCodeDirty = false,
  onRunCode,
  onResetCode,
  isExecuting = false,
  syntaxErrorLine = null,
  breakpoints = new Set(),
  onToggleBreakpoint,
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);
  const { isBright } = useTheme();

  const currentLangConfig = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG.java;

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Dark Theme definition - Deep obsidian palette harmonized with 3D canvas
    monaco.editor.defineTheme('code3dDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '00f2fe', fontStyle: 'bold' },
        { token: 'type', foreground: '38bdf8' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'fbbf24' },
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
      ],
      colors: {
        'editor.background': '#070b14',
        'editor.lineHighlightBackground': '#1e293b44',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#00f2fe',
      },
    });

    // Bright Theme definition
    monaco.editor.defineTheme('code3dLight', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '0284c7', fontStyle: 'bold' },
        { token: 'type', foreground: '0369a1' },
        { token: 'string', foreground: '059669' },
        { token: 'number', foreground: 'd97706' },
        { token: 'comment', foreground: '94a3b8', fontStyle: 'italic' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.lineHighlightBackground': '#f1f5f9',
        'editorLineNumber.foreground': '#94a3b8',
        'editorLineNumber.activeForeground': '#0284c7',
      },
    });

    monaco.editor.setTheme(isBright ? 'code3dLight' : 'code3dDark');

    // Register Ctrl+Enter / Cmd+Enter shortcut
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRunCode) {
        onRunCode();
      } else if (onPlay) {
        onPlay();
      }
    });

    // F5: Play / Resume execution
    editor.addCommand(monaco.KeyCode.F5, () => {
      if (isPlaying) {
        if (onPause) onPause();
      } else {
        if (onPlay) onPlay();
        else if (onRunCode) onRunCode();
      }
    });

    // F10: Step forward
    editor.addCommand(monaco.KeyCode.F10, () => {
      if (onNext) onNext();
    });

    // Shift + F10: Step backward
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.F10, () => {
      if (onPrev) onPrev();
    });

    // Escape: Stop / Reset execution
    editor.addCommand(monaco.KeyCode.Escape, () => {
      if (onReset) onReset();
    });

    // Glyph margin click listener to toggle breakpoints
    editor.onMouseDown((e) => {
      if (
        e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN ||
        e.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS
      ) {
        const line = e.target.position?.lineNumber;
        if (line && onToggleBreakpoint) {
          onToggleBreakpoint(line);
        }
      }
    });
  };

  // Switch editor theme whenever bright mode changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(isBright ? 'code3dLight' : 'code3dDark');
    }
  }, [isBright]);

  // Update line highlighting & breakpoints whenever currentLineNumber, syntaxErrorLine, or breakpoints change
  useEffect(() => {
    if (!editorRef.current) return;
    const editor = editorRef.current;

    const newDecorations = [];

    // 1. Breakpoints in glyph margin
    if (breakpoints && breakpoints.size > 0) {
      breakpoints.forEach((line) => {
        newDecorations.push({
          range: {
            startLineNumber: line,
            startColumn: 1,
            endLineNumber: line,
            endColumn: 1,
          },
          options: {
            isWholeLine: false,
            glyphMarginClassName: line === currentLineNumber ? 'breakpoint-active-glyph' : 'breakpoint-glyph',
            glyphMarginHoverMessage: { value: `Breakpoint on line ${line}` },
          },
        });
      });
    }

    // 2. Syntax Error or Active Line
    if (syntaxErrorLine) {
      newDecorations.push({
        range: {
          startLineNumber: syntaxErrorLine,
          startColumn: 1,
          endLineNumber: syntaxErrorLine,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: 'syntax-error-line-bg',
          glyphMarginClassName: 'syntax-error-glyph',
        },
      });
      editor.revealLineInCenterIfOutsideViewport(syntaxErrorLine);
    } else if (currentLineNumber) {
      newDecorations.push({
        range: {
          startLineNumber: currentLineNumber,
          startColumn: 1,
          endLineNumber: currentLineNumber,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: 'active-execution-line-bg',
          glyphMarginClassName: 'active-execution-line-glyph',
        },
      });
      editor.revealLineInCenterIfOutsideViewport(currentLineNumber);
    }

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  }, [currentLineNumber, syntaxErrorLine, breakpoints]);

  return (
    <div className={`flex flex-col h-full border-r select-none transition-colors duration-200 ${
      isBright ? 'bg-white border-slate-200' : 'bg-[#0b0f19] border-slate-800/80'
    }`}>
      {/* Editor Header Bar with Language Switcher */}
      <div className={`h-10 border-b px-2.5 flex items-center justify-between gap-1.5 transition-colors overflow-hidden min-w-0 ${
        isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800/70'
      }`}>
        <div className="flex items-center gap-1.5 min-w-0 shrink">
          <FileCode size={14} className={`shrink-0 ${isBright ? 'text-cyan-600' : 'text-cyan-400'}`} />
          <span className={`text-xs font-mono font-medium truncate max-w-[90px] sm:max-w-none ${isBright ? 'text-slate-800' : 'text-slate-200'}`}>
            {currentLangConfig.fileName}
          </span>

          {isCodeDirty && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span className="hidden md:inline">Modified</span>
            </span>
          )}
          
          {/* Language Selector Dropdown */}
          <select
            value={language}
            onChange={(e) => onChangeLanguage && onChangeLanguage(e.target.value)}
            className={`border rounded px-1.5 py-0.5 text-[11px] font-mono focus:outline-none focus:border-cyan-500 cursor-pointer shrink-0 ${
              isBright
                ? 'bg-white border-slate-300 text-slate-800'
                : 'bg-slate-950 border-slate-700 text-cyan-300'
            }`}
          >
            <option value="java">☕ Java</option>
            <option value="javascript">🟨 JS</option>
            <option value="python">🐍 Py</option>
            <option value="c">🇨 C</option>
            <option value="cpp">⚡ C++</option>
          </select>

          <span className={`hidden xl:inline-block text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
            isBright ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
          }`}>
            {currentLangConfig.badge}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Striver SDE Sheet Button */}
          {(onOpenStriverSheet || onOpenLeetCode) && (
            <button
              onClick={onOpenStriverSheet || onOpenLeetCode}
              className={`h-7 flex items-center gap-1 text-xs px-2 rounded-md border transition font-semibold shadow-xs cursor-pointer shrink-0 ${
                isBright
                  ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                  : 'bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 text-amber-300 border-amber-500/40'
              }`}
              title="Open Striver SDE Sheet (182 Core Problems) in 3D"
            >
              <BookOpen size={12} className="text-amber-400 shrink-0" />
              <span className="hidden xl:inline">Striver 📜</span>
            </button>
          )}



          {/* Direct "Input Any Code" Button */}
          {onOpenCustomCode && (
            <button
              onClick={onOpenCustomCode}
              className={`h-7 flex items-center gap-1 text-xs px-2 rounded-md border transition font-semibold shadow-xs cursor-pointer shrink-0 ${
                isBright
                  ? 'bg-cyan-100 text-cyan-800 border-cyan-300 hover:bg-cyan-200'
                  : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30 shadow-cyan-950'
              }`}
              title="Input Any Code in JS, C, C++, Python, or Java to visualize in 3D"
            >
              <Code2 size={12} className={`shrink-0 ${isBright ? 'text-cyan-700' : 'text-cyan-400'}`} />
              <span className="hidden xl:inline">Input ⚡</span>
            </button>
          )}

          {currentLineNumber && (
            <div className={`h-7 flex items-center gap-1 text-xs font-mono px-1.5 rounded-md border shrink-0 ${
              isBright
                ? 'text-cyan-700 bg-cyan-50 border-cyan-300'
                : 'text-cyan-400 bg-cyan-950/60 border-cyan-800/50'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-ping shrink-0 ${isBright ? 'bg-cyan-600' : 'bg-cyan-400'}`}></span>
              <span className="whitespace-nowrap">L{currentLineNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Monaco Code Editor */}
      <div className="flex-1 w-full overflow-hidden">
        <Editor
          height="100%"
          language={currentLangConfig.monacoLang}
          theme={isBright ? 'code3dLight' : 'code3dDark'}
          value={code}
          onChange={(val) => onChangeCode && onChangeCode(val)}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13.5,
            fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
            fontLigatures: true,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            renderLineHighlight: 'all',
            glyphMargin: true,
            folding: true,
          }}
        />
      </div>

      {/* Editor Controls Bar */}
      <div className={`border-t p-2 flex items-center justify-between gap-1.5 transition-colors overflow-hidden min-w-0 ${
        isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800/80'
      }`}>
        <div className="flex items-center gap-1 min-w-0 shrink">
          {/* Play / Pause / Run */}
          {isPlaying ? (
            <button
              onClick={onPause}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded border text-xs font-medium transition cursor-pointer shrink-0 ${
                isBright
                  ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              }`}
              title="Pause Simulation"
            >
              <Pause size={13} className="fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (isExecuting) return;
                if (onRunCode) onRunCode();
                else if (onPlay) onPlay();
              }}
              disabled={isExecuting}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold transition shadow-sm cursor-pointer shrink-0 ${
                isExecuting
                  ? 'opacity-70 cursor-not-allowed bg-cyan-700 text-cyan-200'
                  : isCodeDirty
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/40 animate-pulse'
                    : isBright
                      ? 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-cyan-600/20'
                      : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-cyan-500/20'
              }`}
              title={isExecuting ? "Executing code..." : "Run / Play Simulation (Ctrl+Enter)"}
            >
              {isExecuting ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span className="hidden sm:inline">Compiling...</span>
                  <span className="sm:hidden">Run</span>
                </>
              ) : (
                <>
                  <Play size={13} className="fill-current" />
                  <span>{isCodeDirty ? 'Run ⚡' : isAtEnd ? 'Replay' : isAtStart ? 'Run' : 'Resume'}</span>
                </>
              )}
            </button>
          )}

          {/* Reset Simulation Step */}
          <button
            onClick={onReset}
            className={`p-1.5 rounded transition cursor-pointer shrink-0 ${
              isBright
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
            title="Reset Simulation to Step 1"
          >
            <RotateCcw size={14} />
          </button>

          {/* Reset Code to Template */}
          {onResetCode && (
            <button
              onClick={onResetCode}
              className={`px-1.5 py-1 rounded transition cursor-pointer text-xs flex items-center gap-1 border shrink-0 ${
                isBright
                  ? 'border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'border-slate-700/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
              }`}
              title="Reset Editor to Default Algorithm Code"
            >
              <RotateCcw size={11} className="opacity-70 shrink-0" />
              <span className="hidden sm:inline text-[11px] font-mono whitespace-nowrap">Reset Code</span>
            </button>
          )}
        </div>

        {/* Step-by-Step Step Back / Next */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onPrev}
            disabled={isAtStart}
            className={`flex items-center gap-0.5 px-2 py-1.5 rounded text-xs font-medium transition border shrink-0 ${
              isAtStart
                ? 'opacity-40 cursor-not-allowed border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                : isBright
                  ? 'border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer'
                  : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer'
            }`}
            title="Previous Execution Step"
          >
            <SkipBack size={12} />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <button
            onClick={onNext}
            disabled={isAtEnd}
            className={`flex items-center gap-0.5 px-2 py-1.5 rounded text-xs font-medium transition border shrink-0 ${
              isAtEnd
                ? 'opacity-40 cursor-not-allowed border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                : isBright
                  ? 'border-cyan-400 bg-cyan-50 text-cyan-800 hover:bg-cyan-100 cursor-pointer'
                  : 'border-cyan-600/60 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 cursor-pointer'
            }`}
            title="Next Execution Step"
          >
            <span className="hidden sm:inline">Next</span>
            <SkipForward size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

