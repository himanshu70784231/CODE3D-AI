import React from 'react';
import { GitBranch, CheckCircle2, XCircle } from 'lucide-react';

/**
 * CODE3D-AI - ConditionPanel Component
 * Displays compact Condition, Result, and Branch state.
 */
export function ConditionPanel({
  condition = null,
  currentLine = null,
  currentOperation = null,
}) {
  if (!condition && !currentOperation) {
    return (
      <div className="p-3 bg-[#101c2d] border border-[#26364a] rounded text-xs text-[#64748b] font-mono italic">
        No active condition evaluated in this step.
      </div>
    );
  }

  const resultBool = condition?.result ?? null;

  return (
    <div className="bg-[#101c2d] border border-[#26364a] rounded-md p-3 text-xs font-mono space-y-2 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#26364a] pb-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-[#f8fafc]">
          <GitBranch size={13} className="text-[#3b82f6]" />
          <span>Condition Evaluation</span>
        </div>

        {resultBool !== null && (
          <span
            className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
              resultBool
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                : 'bg-rose-950/60 border-rose-500/50 text-rose-400'
            }`}
          >
            {resultBool ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
            {resultBool ? 'TRUE' : 'FALSE'}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-[11px]">
        {currentLine && (
          <div className="text-[#94a3b8]">
            Line: <span className="text-[#f8fafc] font-semibold">{currentLine}</span>
          </div>
        )}

        {currentOperation && (
          <div className="text-[#94a3b8]">
            Operation: <span className="text-[#38bdf8] font-medium">{currentOperation}</span>
          </div>
        )}

        {condition && (
          <>
            <div className="text-[#94a3b8]">
              Expression:{' '}
              <span className="text-[#f8fafc] font-semibold bg-[#0d1726] px-1.5 py-0.5 rounded border border-[#26364a]">
                {condition.expression}
              </span>
            </div>

            {condition.evaluation && (
              <div className="text-[#94a3b8]">
                Evaluation:{' '}
                <span className="text-[#2dd4bf] font-medium">
                  {condition.evaluation}
                </span>
              </div>
            )}

            {condition.branch && (
              <div className="text-[#94a3b8]">
                Branch:{' '}
                <span className="text-[#c084fc] font-medium">
                  {condition.branch}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ConditionPanel;
