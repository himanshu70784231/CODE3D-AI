import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Copy, Check, Trash2, ArrowDown, AlertTriangle, AlertCircle, CheckCircle, Maximize2, Minimize2 } from 'lucide-react';
import { safeString, safeDisplay, safeErrorMessage } from '../utils/safeRender';
import { useTheme } from '../context/ThemeContext';

export function OutputConsole({
  output = [],
  correctOutput = null,
  isAtEnd = false,
  error = null,
  onClearOutput = null,
  isFullscreen = false,
  onToggleFullscreen = null,
}) {
  const { isBright } = useTheme();
  const [activeTab, setActiveTab] = useState('console');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [clearedLength, setClearedLength] = useState(0);
  const scrollContainerRef = useRef(null);

  const activeOutput = Array.isArray(output) ? output.slice(clearedLength) : [];

  useEffect(() => {
    if (autoScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [activeOutput, autoScroll, correctOutput, error]);

  const handleCopy = () => {
    let textToCopy = '';
    if (activeTab === 'console') {
      textToCopy = activeOutput.join('\n');
    } else if (activeTab === 'output') {
      textToCopy = safeString(correctOutput) || safeString(activeOutput[activeOutput.length - 1]) || 'No output recorded';
    } else if (activeTab === 'errors') {
      textToCopy = safeErrorMessage(error, 'No errors reported');
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setClearedLength(output.length);
    if (onClearOutput) {
      onClearOutput();
    }
  };

  return (
    <div
      className={`flex flex-col h-full border-t font-mono text-xs select-none transition-colors duration-200 ${
        isBright
          ? 'bg-[#fcfbf9] border-[#e2dfd8] text-stone-800'
          : 'bg-[#0e1013] border-[#252932] text-stone-100'
      } ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      {/* Console Header with Tabs and Actions */}
      <div className={`h-8 border-b px-3 flex items-center justify-between text-xs shrink-0 select-none transition-colors ${
        isBright ? 'bg-[#f7f6f3] border-[#e2dfd8]' : 'bg-[#181c23] border-[#252932]'
      }`}>
        {/* Tabs: Console | Output | Errors */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('console')}
            className={`h-6 px-2.5 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'console'
                ? isBright
                  ? 'bg-white text-stone-900 border border-stone-300 shadow-2xs font-bold'
                  : 'bg-[#13161b] text-amber-400 border border-[#252932]'
                : isBright
                  ? 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
            }`}
          >
            <Terminal size={12} className={activeTab === 'console' ? 'text-amber-500' : 'text-stone-400'} />
            <span>Console</span>
            <span className="text-[10px] text-stone-500">
              ({activeOutput.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('output')}
            className={`h-6 px-2.5 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'output'
                ? isBright
                  ? 'bg-white text-emerald-800 border border-stone-300 shadow-2xs font-bold'
                  : 'bg-[#13161b] text-emerald-400 border border-[#252932]'
                : isBright
                  ? 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
            }`}
          >
            <CheckCircle size={12} className={isBright ? 'text-emerald-600' : 'text-emerald-400'} />
            <span>Output</span>
            {isAtEnd && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </button>

          <button
            onClick={() => setActiveTab('errors')}
            className={`h-6 px-2.5 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'errors'
                ? isBright
                  ? 'bg-white text-rose-800 border border-stone-300 shadow-2xs font-bold'
                  : 'bg-[#13161b] text-rose-400 border border-[#252932]'
                : error
                  ? 'text-rose-500 hover:bg-rose-50'
                  : isBright
                    ? 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
            }`}
          >
            <AlertCircle size={12} className={error ? 'text-rose-500' : isBright ? 'text-stone-400' : 'text-stone-500'} />
            <span>Errors</span>
            {error && (
              <span className={`text-[9px] px-1 rounded font-bold ${
                isBright ? 'bg-rose-100 text-rose-700' : 'bg-[#ef4444]/20 text-[#ef4444]'
              }`}>
                1
              </span>
            )}
          </button>
        </div>

        {/* Toolbar Actions */}
        <div className="flex items-center gap-1.5">
          {/* Auto-scroll */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 border transition-colors cursor-pointer ${
              autoScroll
                ? isBright
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-amber-950/40 border-amber-600/40 text-amber-300'
                : isBright
                  ? 'bg-white border-stone-300 text-stone-500'
                  : 'bg-[#181c22] border-stone-700 text-stone-500'
            }`}
            title="Toggle Auto-scroll"
          >
            <ArrowDown size={10} className={autoScroll ? 'text-amber-500' : ''} />
            <span className="hidden sm:inline">Auto-scroll</span>
          </button>

          {/* Clear */}
          <button
            onClick={handleClear}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isBright ? 'text-stone-500 hover:text-rose-600 hover:bg-stone-200' : 'text-stone-400 hover:text-rose-400 hover:bg-[#181c23]'
            }`}
            title="Clear Console"
          >
            <Trash2 size={12} />
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className={`p-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
              isBright ? 'text-stone-500 hover:text-stone-900 hover:bg-stone-200' : 'text-stone-400 hover:text-stone-100 hover:bg-[#181c23]'
            }`}
            title="Copy Output"
          >
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          </button>

          {/* Expand / Fullscreen */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className={`p-1 rounded transition-colors cursor-pointer ${
                isBright ? 'text-stone-500 hover:text-stone-900 hover:bg-stone-200' : 'text-stone-400 hover:text-stone-100 hover:bg-[#181c23]'
              }`}
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand Console'}
            >
              {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </button>
          )}
        </div>
      </div>

      {/* Tab Contents */}
      <div
        ref={scrollContainerRef}
        className={`flex-1 p-2.5 overflow-y-auto space-y-1 font-mono text-[11px] select-text transition-colors ${
          isBright ? 'bg-white' : 'bg-[#0e1013]'
        }`}
      >
        {activeTab === 'console' && (
          <>
            <div className={`select-none text-[10px] pb-1 ${isBright ? 'text-stone-500 font-semibold' : 'text-stone-500'}`}>
              $ code3d --trace-vm --sync-spatial-memory
            </div>

            {activeOutput.length === 0 ? (
              <div className="italic py-1 text-stone-500">
                Process waiting for execution. Click 'Run' or press Ctrl+Enter to start.
              </div>
            ) : (
              activeOutput.map((line, idx) => (
                <div key={idx} className={`flex items-start gap-2 leading-relaxed ${
                  isBright ? 'text-stone-800' : 'text-stone-100'
                }`}>
                  <span className={`px-1 py-0.2 rounded text-[9px] font-bold select-none shrink-0 border ${
                    isBright
                      ? 'bg-amber-100/70 border-amber-300 text-amber-900'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    INFO
                  </span>
                  <span className="break-all">{safeString(line)}</span>
                </div>
              ))
            )}

            {isAtEnd && (
              <div className="flex items-center gap-2 text-emerald-500 font-semibold pt-1">
                <span className={`px-1 py-0.2 rounded text-[9px] font-bold select-none border ${
                  isBright
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                }`}>
                  SUCCESS
                </span>
                <span>Program execution completed successfully. Exit code: 0</span>
              </div>
            )}
          </>
        )}

        {activeTab === 'output' && (
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
              Verified Output Result
            </div>

            {correctOutput ? (
              <div className={`p-2.5 rounded border font-bold text-xs break-all ${
                isBright
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-[#13161b] border-emerald-500/40 text-emerald-400'
              }`}>
                {safeDisplay(correctOutput)}
              </div>
            ) : activeOutput.length > 0 ? (
              <div className={`p-2.5 rounded border break-all ${
                isBright
                  ? 'bg-stone-50 border-[#e2dfd8] text-stone-800'
                  : 'bg-[#13161b] border-[#252932] text-stone-100'
              }`}>
                {safeString(activeOutput[activeOutput.length - 1])}
              </div>
            ) : (
              <div className="italic text-stone-500">
                No output produced yet. Run the code to view return results.
              </div>
            )}
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="space-y-2">
            {error ? (
              <div className={`p-2.5 rounded border space-y-1 ${
                isBright
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-rose-950/40 border-[#ef4444]/50 text-rose-300'
              }`}>
                <div className="flex items-center gap-2 font-bold text-rose-500">
                  <AlertTriangle size={13} />
                  <span>Execution Diagnostic:</span>
                </div>
                <div className="text-xs break-all">{safeErrorMessage(error)}</div>
              </div>
            ) : (
              <div className="text-emerald-500 flex items-center gap-1.5 py-1 font-semibold">
                <CheckCircle size={13} />
                <span>Zero syntax or runtime diagnostics reported. Clean build.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OutputConsole;
