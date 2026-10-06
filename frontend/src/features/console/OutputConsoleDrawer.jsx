import React from 'react';
import { Terminal, Trash2, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { IconButton, Badge } from '../../components/common';

/**
 * OutputConsoleDrawer Component
 * 
 * Collapsible bottom terminal output drawer
 */
export default function OutputConsoleDrawer({
  output = [],
  executionError = null,
  isExecuting = false,
  onClear,
  onClose,
}) {
  const { isBright } = useTheme();

  return (
    <div className="h-full flex flex-col overflow-hidden w-full select-none">
      {/* Console Header Bar */}
      <div
        className={`h-8 px-3 border-b flex items-center justify-between shrink-0 ${
          isBright ? 'bg-stone-100 border-stone-200' : 'bg-[#151921] border-stone-850'
        }`}
      >
        <div className="flex items-center gap-2">
          <Terminal size={13} className="text-amber-500" />
          <span className="text-xs font-mono font-semibold">Console Output (stdout)</span>
          {output.length > 0 && (
            <span className="text-[10px] font-mono text-stone-500">
              ({output.length} {output.length === 1 ? 'line' : 'lines'})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {output.length > 0 && (
            <IconButton
              icon={Trash2}
              size="xs"
              onClick={onClear}
              title="Clear Console Output"
            />
          )}
          {onClose && (
            <IconButton
              icon={X}
              size="xs"
              onClick={onClose}
              title="Hide Console Drawer"
            />
          )}
        </div>
      </div>

      {/* Terminal Stream Body */}
      <div
        className={`flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1 select-text ${
          isBright ? 'bg-stone-50 text-stone-900' : 'bg-[#0e1013] text-stone-200'
        }`}
      >
        {isExecuting && (
          <div className="flex items-center gap-2 text-amber-500 animate-pulse text-[11px]">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Executing program instructions...</span>
          </div>
        )}

        {executionError && (
          <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle size={13} className="shrink-0" />
            <span>{executionError}</span>
          </div>
        )}

        {output.length === 0 && !isExecuting && !executionError && (
          <div className="text-stone-500 italic text-[11px] py-2">
            No standard output generated yet. Run code to stream stdout.
          </div>
        )}

        {output.map((line, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="text-stone-600 select-none text-[10px] w-5 text-right shrink-0">
              {idx + 1}
            </span>
            <span className="text-stone-300 break-all">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
