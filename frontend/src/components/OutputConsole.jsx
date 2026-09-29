import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Copy, Check, Trash2, ArrowDown, AlertTriangle, AlertCircle, CheckCircle, Maximize2, Minimize2 } from 'lucide-react';

/**
 * CODE3D-AI - OutputConsole Component
 * Features Console, Output, and Errors tabs with Monospace typography,
 * level badges (INFO, SUCCESS, WARNING, ERROR), Auto-scroll, Clear, and Copy.
 */
export function OutputConsole({
  output = [],
  correctOutput = null,
  isAtEnd = false,
  error = null,
  onClearOutput = null,
  isFullscreen = false,
  onToggleFullscreen = null,
}) {
  const [activeTab, setActiveTab] = useState('console'); // 'console' | 'output' | 'errors'
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
      textToCopy = correctOutput || activeOutput[activeOutput.length - 1] || 'No output recorded';
    } else if (activeTab === 'errors') {
      textToCopy = error || 'No errors reported';
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
      className={`flex flex-col h-full bg-[#08111f] border-t border-[#26364a] font-mono text-xs select-none transition-colors ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#08111f]' : ''
      }`}
    >
      {/* Console Header with Tabs and Actions */}
      <div className="h-8 bg-[#0d1726] border-b border-[#26364a] px-3 flex items-center justify-between text-xs shrink-0 select-none">
        {/* Tabs: Console | Output | Errors */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('console')}
            className={`h-6 px-2.5 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'console'
                ? 'bg-[#142338] text-[#38bdf8] border border-[#26364a]'
                : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#101c2d]'
            }`}
          >
            <Terminal size={12} />
            <span>Console</span>
            <span className="text-[10px] text-[#64748b]">({activeOutput.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('output')}
            className={`h-6 px-2.5 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'output'
                ? 'bg-[#142338] text-[#22c55e] border border-[#26364a]'
                : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#101c2d]'
            }`}
          >
            <CheckCircle size={12} />
            <span>Output</span>
            {isAtEnd && <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />}
          </button>

          <button
            onClick={() => setActiveTab('errors')}
            className={`h-6 px-2.5 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'errors'
                ? 'bg-[#142338] text-[#ef4444] border border-[#26364a]'
                : error
                ? 'text-[#ef4444] hover:bg-[#101c2d]'
                : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#101c2d]'
            }`}
          >
            <AlertCircle size={12} />
            <span>Errors</span>
            {error && (
              <span className="text-[9px] px-1 rounded bg-[#ef4444]/20 text-[#ef4444] font-bold">
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
                ? 'bg-[#142338] border-[#3b82f6]/40 text-[#38bdf8]'
                : 'bg-[#101c2d] border-[#26364a] text-[#64748b]'
            }`}
            title="Toggle Auto-scroll"
          >
            <ArrowDown size={10} className={autoScroll ? 'text-[#38bdf8]' : ''} />
            <span className="hidden sm:inline">Auto-scroll</span>
          </button>

          {/* Clear */}
          <button
            onClick={handleClear}
            className="p-1 rounded hover:bg-[#1e2f47] text-[#94a3b8] hover:text-[#ef4444] transition-colors cursor-pointer"
            title="Clear Console"
          >
            <Trash2 size={12} />
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-[#1e2f47] text-[#94a3b8] hover:text-[#f8fafc] transition-colors cursor-pointer flex items-center gap-1"
            title="Copy Output"
          >
            {copied ? <Check size={12} className="text-[#22c55e]" /> : <Copy size={12} />}
          </button>

          {/* Expand / Fullscreen */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-1 rounded hover:bg-[#1e2f47] text-[#94a3b8] hover:text-[#f8fafc] transition-colors cursor-pointer"
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
        className="flex-1 p-2.5 overflow-y-auto space-y-1 font-mono text-[11px] select-text bg-[#08111f]"
      >
        {activeTab === 'console' && (
          <>
            <div className="text-[#64748b] select-none text-[10px] pb-1">
              $ code3d --trace-vm --sync-spatial-memory
            </div>

            {activeOutput.length === 0 ? (
              <div className="text-[#64748b] italic py-1">
                Process waiting for execution. Click 'Run' or press Ctrl+Enter to start.
              </div>
            ) : (
              activeOutput.map((line, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[#f8fafc] leading-relaxed">
                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-[#142338] text-[#38bdf8] select-none shrink-0 border border-[#26364a]">
                    INFO
                  </span>
                  <span className="break-all">{line}</span>
                </div>
              ))
            )}

            {isAtEnd && (
              <div className="flex items-center gap-2 text-[#22c55e] pt-1">
                <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-emerald-950/60 text-[#22c55e] border border-emerald-500/40 select-none">
                  SUCCESS
                </span>
                <span>Program execution completed successfully. Exit code: 0</span>
              </div>
            )}
          </>
        )}

        {activeTab === 'output' && (
          <div className="space-y-2">
            <div className="text-[#94a3b8] text-[10px] uppercase font-bold tracking-wider">
              Verified Output Result
            </div>

            {correctOutput ? (
              <div className="p-2.5 rounded bg-[#101c2d] border border-[#22c55e]/40 text-[#22c55e] font-bold text-xs break-all">
                {correctOutput}
              </div>
            ) : activeOutput.length > 0 ? (
              <div className="p-2.5 rounded bg-[#101c2d] border border-[#26364a] text-[#f8fafc] break-all">
                {activeOutput[activeOutput.length - 1]}
              </div>
            ) : (
              <div className="text-[#64748b] italic">
                No output produced yet. Run the code to view return results.
              </div>
            )}
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="space-y-2">
            {error ? (
              <div className="p-2.5 rounded bg-rose-950/40 border border-[#ef4444]/50 text-[#fca5a5] space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#ef4444]">
                  <AlertTriangle size={13} />
                  <span>Execution Diagnostic:</span>
                </div>
                <div className="text-xs break-all">{error}</div>
              </div>
            ) : (
              <div className="text-[#22c55e] flex items-center gap-1.5 py-1">
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
