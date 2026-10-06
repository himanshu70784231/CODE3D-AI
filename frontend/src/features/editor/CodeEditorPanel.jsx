import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  FileCode,
  Sparkles,
  AlignLeft,
  Map,
  WrapText,
  Type,
  Trash2,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button, IconButton, Badge } from '../../components/common';

const LANGUAGE_CONFIG = {
  java: { monacoLang: 'java', fileName: 'Main.java', label: 'Java 21' },
  python: { monacoLang: 'python', fileName: 'main.py', label: 'Python 3' },
  cpp: { monacoLang: 'cpp', fileName: 'main.cpp', label: 'C++ 20' },
  c: { monacoLang: 'c', fileName: 'main.c', label: 'C99' },
  javascript: { monacoLang: 'javascript', fileName: 'main.js', label: 'JavaScript' },
};

export default function CodeEditorPanel({
  code,
  onChangeCode,
  currentLineNumber,
  language = 'java',
  isCodeDirty = false,
  isExecuting = false,
  executionError = null,
  onRunCode,
  onResetCode,
  onClearCode,
  customInput = '',
  onChangeCustomInput,
  breakpoints = new Set(),
  onToggleBreakpoint,
}) {
  const { isBright } = useTheme();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  const [fontSize, setFontSize] = useState(13);
  const [showMinimap, setShowMinimap] = useState(false);
  const [wordWrap, setWordWrap] = useState('on');
  const [showInputSection, setShowInputSection] = useState(false);

  const langConfig = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG.java;

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Dark Theme - obsidian & warm amber keywords
    monaco.editor.defineTheme('code3dDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'f59e0b', fontStyle: 'bold' },
        { token: 'string', foreground: '10b981' },
        { token: 'number', foreground: 'fbbf24' },
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'type', foreground: '38bdf8' },
        { token: 'identifier', foreground: 'f3f4f6' },
        { token: 'delimiter', foreground: '9ca3af' },
      ],
      colors: {
        'editor.background': '#13161b',
        'editor.foreground': '#f3f4f6',
        'editor.lineHighlightBackground': '#181c24',
        'editorLineNumber.foreground': '#4b5563',
        'editorLineNumber.activeForeground': '#f59e0b',
        'editorCursor.foreground': '#f59e0b',
        'editor.selectionBackground': '#2d3748',
        'editorGutter.background': '#13161b',
      },
    });

    // Light Theme - warm alabaster & deep amber keywords
    monaco.editor.defineTheme('code3dLight', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'b45309', fontStyle: 'bold' },
        { token: 'string', foreground: '047857' },
        { token: 'number', foreground: 'd97706' },
        { token: 'comment', foreground: '9ca3af', fontStyle: 'italic' },
        { token: 'type', foreground: '0284c7' },
        { token: 'identifier', foreground: '1c1917' },
        { token: 'delimiter', foreground: '78716c' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#1c1917',
        'editor.lineHighlightBackground': '#fef3c733',
        'editorLineNumber.foreground': '#a8a29e',
        'editorLineNumber.activeForeground': '#b45309',
        'editorCursor.foreground': '#b45309',
        'editor.selectionBackground': '#fed7aa',
        'editorGutter.background': '#ffffff',
      },
    });

    monaco.editor.setTheme(isBright ? 'code3dLight' : 'code3dDark');

    // Ctrl+Enter / Cmd+Enter Shortcut
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRunCode && !isExecuting) {
        onRunCode();
      }
    });

    // Gutter Click for Breakpoints
    editor.onMouseDown((e) => {
      if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
        const line = e.target.position?.lineNumber;
        if (line && onToggleBreakpoint) {
          onToggleBreakpoint(line);
        }
      }
    });
  };

  // Sync theme
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(isBright ? 'code3dLight' : 'code3dDark');
    }
  }, [isBright]);

  // Sync active execution line decoration & scroll
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    const newDecorations = [];

    if (currentLineNumber && currentLineNumber > 0) {
      newDecorations.push({
        range: new monaco.Range(currentLineNumber, 1, currentLineNumber, 1),
        options: {
          isWholeLine: true,
          className: 'code3d-active-line-highlight',
          glyphMarginClassName: 'code3d-active-line-glyph',
          overviewRuler: {
            color: '#f59e0b',
            position: monaco.editor.OverviewRulerLane.Full,
          },
        },
      });

      // Smooth scroll if line is out of viewport
      editor.revealLineInCenterIfOutsideViewport(currentLineNumber, monaco.editor.ScrollType.Smooth);
    }

    // Breakpoint decorations
    breakpoints.forEach((bLine) => {
      newDecorations.push({
        range: new monaco.Range(bLine, 1, bLine, 1),
        options: {
          isWholeLine: false,
          glyphMarginClassName: 'code3d-breakpoint-glyph',
        },
      });
    });

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  }, [currentLineNumber, breakpoints]);

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden relative w-full">
      {/* Editor Sub-Header Toolbar */}
      <div
        className={`h-9 px-3 border-b flex items-center justify-between shrink-0 select-none ${
          isBright ? 'bg-stone-50 border-stone-200' : 'bg-[#151921] border-stone-850'
        }`}
      >
        <div className="flex items-center gap-2">
          <FileCode size={13} className="text-amber-500" />
          <span className="text-xs font-mono font-semibold">{langConfig.fileName}</span>
          <span className="text-[10px] text-stone-500 font-mono hidden sm:inline">
            ({langConfig.label})
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Format Code */}
          <IconButton
            icon={AlignLeft}
            size="xs"
            onClick={handleFormatCode}
            title="Format Code (Alt+Shift+F)"
          />

          {/* Toggle Word Wrap */}
          <IconButton
            icon={WrapText}
            size="xs"
            active={wordWrap === 'on'}
            onClick={() => setWordWrap((prev) => (prev === 'on' ? 'off' : 'on'))}
            title="Toggle Word Wrap"
          />

          {/* Toggle Minimap */}
          <IconButton
            icon={Map}
            size="xs"
            active={showMinimap}
            onClick={() => setShowMinimap((prev) => !prev)}
            title="Toggle Minimap"
          />

          {/* Font Size decrease / increase */}
          <button
            type="button"
            onClick={() => setFontSize((s) => Math.max(11, s - 1))}
            className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono hover:bg-stone-800 text-stone-400 hover:text-stone-200 cursor-pointer"
            title="Decrease Font Size"
          >
            A-
          </button>
          <button
            type="button"
            onClick={() => setFontSize((s) => Math.min(20, s + 1))}
            className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono hover:bg-stone-800 text-stone-400 hover:text-stone-200 cursor-pointer"
            title="Increase Font Size"
          >
            A+
          </button>

          {/* Clear Code */}
          {onClearCode && (
            <IconButton
              icon={Trash2}
              size="xs"
              onClick={onClearCode}
              title="Clear Editor"
            />
          )}

          {/* Custom Input Toggle */}
          <button
            type="button"
            onClick={() => setShowInputSection((prev) => !prev)}
            className={`h-5 px-1.5 rounded text-[10px] font-mono font-medium flex items-center gap-1 transition cursor-pointer ${
              showInputSection
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
            title="Custom Input / Test Cases"
          >
            <span>Input</span>
            {showInputSection ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>
        </div>
      </div>

      {/* Stale Code / Unsaved Alert Bar */}
      {isCodeDirty && (
        <div
          className={`px-3 py-1.5 text-[11px] border-b flex items-center justify-between shrink-0 select-none ${
            isBright
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            <AlertTriangle size={12} className="text-amber-500 shrink-0" />
            <span className="truncate">Code edited. Visualizer represents last executed code.</span>
          </div>
          <button
            type="button"
            onClick={onRunCode}
            disabled={isExecuting}
            className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-[10px] shrink-0 ml-2 cursor-pointer"
          >
            Re-run (Ctrl+Enter)
          </button>
        </div>
      )}

      {/* Optional Custom Input Box */}
      {showInputSection && (
        <div
          className={`p-2.5 border-b shrink-0 ${
            isBright ? 'bg-stone-50 border-stone-200' : 'bg-stone-900/60 border-stone-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-mono uppercase font-semibold text-stone-400">
              Custom Program Input (stdin)
            </label>
            <span className="text-[10px] text-stone-500">e.g. 5, 10, 15</span>
          </div>
          <input
            type="text"
            value={customInput}
            onChange={(e) => onChangeCustomInput && onChangeCustomInput(e.target.value)}
            placeholder="Input numbers or arguments..."
            className={`w-full px-2.5 py-1 text-xs font-mono rounded border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
              isBright
                ? 'bg-white border-stone-300 text-stone-900'
                : 'bg-[#0e1013] border-stone-750 text-stone-100 placeholder-stone-600'
            }`}
          />
        </div>
      )}

      {/* Monaco Editor Canvas */}
      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          language={langConfig.monacoLang}
          value={code}
          onChange={(val) => onChangeCode(val || '')}
          onMount={handleEditorDidMount}
          theme={isBright ? 'code3dLight' : 'code3dDark'}
          options={{
            fontSize,
            fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
            fontLigatures: true,
            lineNumbers: 'on',
            minimap: { enabled: showMinimap },
            wordWrap,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            glyphMargin: true,
            renderWhitespace: 'none',
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>
    </div>
  );
}
