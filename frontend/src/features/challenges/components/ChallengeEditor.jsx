/**
 * CODE3D-AI: Challenge Monaco Editor Component
 * Lightweight, robust Monaco Editor wrapper for challenge inspection and code repair.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import {
  FileCode,
  RotateCcw,
  AlignLeft,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Lock,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const LANGUAGE_MAP = {
  javascript: { monaco: 'javascript', label: 'JavaScript' },
  python: { monaco: 'python', label: 'Python 3' },
  java: { monaco: 'java', label: 'Java 21' },
  cpp: { monaco: 'cpp', label: 'C++ 20' },
  c: { monaco: 'c', label: 'C Standard' },
};

export default function ChallengeEditor({
  code = '',
  onChangeCode = null,
  language = 'javascript',
  readOnly = false,
  highlightLine = null,
  errorLine = null,
  onReset = null,
  height = '360px',
  title = 'Source Code',
}) {
  const { isBright } = useTheme();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const langInfo = LANGUAGE_MAP[language] || LANGUAGE_MAP.javascript;

  const handleBeforeMount = useCallback((monaco) => {
    if (!monaco || !monaco.editor) return;

    // Define custom dark theme
    monaco.editor.defineTheme('c3dChallengeDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'f59e0b', fontStyle: 'bold' },
        { token: 'type', foreground: '38bdf8' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'fb923c' },
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'delimiter', foreground: '94a3b8' },
      ],
      colors: {
        'editor.background': '#0f131a',
        'editor.lineHighlightBackground': '#181e29',
        'editorGutter.background': '#0b0e14',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#f59e0b',
        'editorCursor.foreground': '#f59e0b',
      },
    });

    // Define custom light theme
    monaco.editor.defineTheme('c3dChallengeLight', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'd97706', fontStyle: 'bold' },
        { token: 'type', foreground: '0284c7' },
        { token: 'string', foreground: '059669' },
        { token: 'number', foreground: 'ea580c' },
        { token: 'comment', foreground: '94a3b8', fontStyle: 'italic' },
      ],
      colors: {
        'editor.background': '#f8fafc',
        'editor.lineHighlightBackground': '#f1f5f9',
        'editorGutter.background': '#f1f5f9',
        'editorLineNumber.foreground': '#94a3b8',
        'editorLineNumber.activeForeground': '#d97706',
        'editorCursor.foreground': '#d97706',
      },
    });
  }, []);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  // Line highlighting effect
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const newDecorations = [];

    if (errorLine && errorLine > 0) {
      newDecorations.push({
        range: new monacoRef.current.Range(errorLine, 1, errorLine, 1),
        options: {
          isWholeLine: true,
          className: 'bg-red-500/20 border-l-2 border-red-500',
          glyphMarginClassName: 'text-red-500 font-bold',
        },
      });
    } else if (highlightLine && highlightLine > 0) {
      newDecorations.push({
        range: new monacoRef.current.Range(highlightLine, 1, highlightLine, 1),
        options: {
          isWholeLine: true,
          className: 'bg-amber-500/20 border-l-2 border-amber-500',
        },
      });
    }

    decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, newDecorations);
  }, [highlightLine, errorLine]);

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  return (
    <div
      className={`c3d-challenge-editor-wrap flex flex-col rounded-xl border transition-all duration-200 overflow-hidden ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'relative'
      } ${
        isBright
          ? 'bg-white border-slate-200 shadow-xs'
          : 'bg-[#0f131a] border-slate-800 shadow-md shadow-black/30'
      }`}
    >
      {/* Editor Header Bar */}
      <div
        className={`h-10 px-3 flex items-center justify-between border-b select-none text-xs ${
          isBright ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0b0e14] border-slate-800 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-2">
          <FileCode size={14} className="text-amber-500" />
          <span className="font-semibold">{title}</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
              isBright
                ? 'bg-slate-200/60 border-slate-300 text-slate-700'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            {langInfo.label}
          </span>
          {readOnly && (
            <span className="flex items-center gap-1 text-[10px] text-amber-500/90 font-mono font-semibold">
              <Lock size={10} /> Read Only
            </span>
          )}
        </div>

        {/* Toolbar Actions */}
        <div className="flex items-center gap-1">
          {!readOnly && onReset && (
            <button
              onClick={onReset}
              className={`p-1.5 rounded transition hover:bg-slate-500/20 text-slate-400 hover:text-amber-400`}
              title="Reset code to original starter"
            >
              <RotateCcw size={13} />
            </button>
          )}

          {!readOnly && (
            <button
              onClick={handleFormatCode}
              className={`p-1.5 rounded transition hover:bg-slate-500/20 text-slate-400 hover:text-amber-400`}
              title="Format source code"
            >
              <AlignLeft size={13} />
            </button>
          )}

          <button
            onClick={handleCopyCode}
            className={`p-1.5 rounded transition hover:bg-slate-500/20 text-slate-400 hover:text-amber-400`}
            title="Copy code to clipboard"
          >
            {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-1.5 rounded transition hover:bg-slate-500/20 text-slate-400 hover:text-amber-400`}
            title={isFullscreen ? 'Exit full screen' : 'Full screen editor'}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Editor Surface */}
      <div style={{ height: isFullscreen ? 'calc(100vh - 8rem)' : height }} className="w-full relative">
        <Editor
          height="100%"
          language={langInfo.monaco}
          value={code}
          onChange={readOnly ? undefined : (val) => onChangeCode && onChangeCode(val || '')}
          theme={isBright ? 'c3dChallengeLight' : 'c3dChallengeDark'}
          beforeMount={handleBeforeMount}
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            fontSize: 13,
            lineHeight: 20,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            automaticLayout: true,
            padding: { top: 8, bottom: 8 },
            renderLineHighlight: 'all',
          }}
        />
      </div>
    </div>
  );
}
