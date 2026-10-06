import React from 'react';
import { GitBranch, CheckCircle2, XCircle } from 'lucide-react';
import { safeString } from '../utils/safeRender';
import { useTheme } from '../context/ThemeContext';

/**
 * CODE3D-AI - ConditionPanel Component
 * Displays compact Condition, Result, and Branch state.
 * Full Dark and Bright mode execution.
 */
export function ConditionPanel({
  condition = null,
  currentLine = null,
  currentOperation = null,
}) {
  const { isBright } = useTheme();

  if (!condition && !currentOperation) {
    return (
      <div className={`p-3 border rounded-md text-xs font-mono italic transition-colors ${
        isBright ? 'bg-stone-50 border-stone-200 text-stone-400' : 'bg-[#16191f] border-[#242831] text-stone-500'
      }`}>
        No active condition evaluated in this step.
      </div>
    );
  }

  const resultBool = condition?.result ?? null;

  return (
    <div className={`border rounded-md p-3 text-xs font-mono space-y-2 select-none transition-colors duration-150 ${
      isBright ? 'bg-white border-stone-200 text-stone-800' : 'bg-[#16191f] border-[#242831] text-stone-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-inherit pb-1.5">
        <div className="flex items-center gap-1.5 font-bold">
          <GitBranch size={13} className="text-amber-500" />
          <span>Condition Evaluation</span>
        </div>

        {resultBool !== null && (
          <span
            className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
              resultBool
                ? isBright
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                : isBright
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
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
          <div className="text-stone-400">
            Line: <span className={`font-semibold ${isBright ? 'text-stone-900' : 'text-stone-100'}`}>{currentLine}</span>
          </div>
        )}

        {currentOperation && (
          <div className="text-stone-400">
            Operation: <span className="font-medium text-amber-500">{safeString(currentOperation)}</span>
          </div>
        )}

        {condition && (
          <>
            <div className="text-stone-400">
              Expression:{' '}
              <span className={`font-semibold px-1.5 py-0.5 rounded border ${
                isBright ? 'bg-stone-100 border-stone-300 text-stone-900' : 'bg-[#101216] border-stone-700 text-stone-100'
              }`}>
                {safeString(condition.expression)}
              </span>
            </div>

            {condition.evaluation && (
              <div className="text-stone-400">
                Evaluation:{' '}
                <span className="font-medium text-amber-500">
                  {safeString(condition.evaluation)}
                </span>
              </div>
            )}

            {condition.branch && (
              <div className="text-stone-400">
                Branch:{' '}
                <span className="font-medium text-stone-300">
                  {safeString(condition.branch)}
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
