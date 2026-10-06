import React from 'react';
import { Cpu, Variable, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { safeString, safeDisplay, formatOperation, safeIncludes, safeArray } from '../utils/safeRender';

export default function StepInspector({ currentStep, totalSteps }) {
  const { isBright } = useTheme();

  if (!currentStep) return null;

  const {
    stepNumber,
    lineNumber,
    eventType = 'STEP',
    variables = {},
    condition = null,
    metadata = {},
    dataStructure = currentStep.dataStructureState || {},
    output = [],
  } = currentStep;

  const rawOperation = metadata?.operation || eventType || 'STEP';
  const operation = formatOperation(rawOperation);
  const comparedIndices = safeArray(metadata?.comparedIndices || dataStructure?.comparedIndices);
  const swappedIndices = safeArray(metadata?.swappedIndices || dataStructure?.swappedIndices);
  const activeIndex = metadata?.activeIndex ?? dataStructure?.activeIndex ?? null;
  const values = Array.isArray(dataStructure?.values) ? dataStructure.values : [];

  const getOperationBadgeColor = (op) => {
    switch (op) {
      case 'COMPARE':
        return isBright ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-950/60 text-amber-300 border-amber-600/40';
      case 'SWAP':
      case 'PARTITION_SWAP':
        return isBright ? 'bg-orange-100 text-orange-900 border-orange-300' : 'bg-orange-950/60 text-orange-300 border-orange-600/40';
      case 'COMPLETE':
      case 'SORTED':
      case 'FOUND':
        return isBright ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40';
      case 'NOT_FOUND':
        return isBright ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-rose-950/60 text-rose-300 border-rose-600/40';
      default:
        return isBright ? 'bg-stone-100 text-stone-800 border-stone-300' : 'bg-stone-800 text-stone-200 border-stone-700';
    }
  };

  return (
    <div className="space-y-3 select-none text-xs">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-inherit">
        <div className="flex items-center gap-2">
          <Cpu size={13} className="text-amber-500" />
          <span className="font-bold text-xs uppercase tracking-wider font-mono">Step Inspector</span>
        </div>
        <span className={`px-2 py-0.5 rounded font-mono font-bold border text-[10px] ${
          isBright ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-amber-950/50 border-amber-700/50 text-amber-400'
        }`}>
          Step {stepNumber} / {totalSteps}
        </span>
      </div>

      {/* Operation & Line Number row */}
      <div className="flex items-center justify-between py-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-stone-500 text-[11px]">Operation:</span>
          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] border ${getOperationBadgeColor(operation)}`}>
            {operation}
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="text-stone-500 text-[11px]">Source:</span>
          <span className={`font-bold text-xs ${isBright ? 'text-stone-900' : 'text-stone-100'}`}>
            {lineNumber ? `Line ${lineNumber}` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Comparison Detail if Active */}
      {condition && (
        <div className={`p-2.5 rounded-md border font-mono text-[11px] ${
          isBright ? 'bg-amber-50/70 border-amber-200 text-stone-900' : 'bg-amber-950/20 border-amber-600/30 text-amber-200'
        }`}>
          <div className="text-[10px] font-sans font-semibold uppercase text-amber-600 dark:text-amber-400 mb-1">
            Comparison Evaluation
          </div>
          <div className="flex items-center justify-between">
            <span>{safeString(condition.expression)}</span>
            <span className="font-bold text-amber-500">{safeString(condition.evaluation)}</span>
          </div>
          <div className="text-[10px] mt-1 pt-1 border-t border-amber-300/30 flex items-center justify-between">
            <span className="opacity-75">Result:</span>
            <span className={`font-bold ${condition.result ? 'text-emerald-500' : 'text-rose-500'}`}>
              {condition.result ? 'TRUE' : 'FALSE'} ({condition.branch || ''})
            </span>
          </div>
        </div>
      )}

      {/* Variables in Scope */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[10px] text-stone-500 uppercase font-sans font-semibold flex items-center gap-1">
          <Variable size={11} className="text-amber-500" /> Variables in Scope
        </div>
        <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
          {Object.entries(variables)
            .filter(([k]) => k !== 'arr' && k !== 'stack' && k !== 'queue')
            .map(([k, v]) => (
              <span
                key={k}
                className={`px-2 py-0.5 rounded border ${
                  isBright ? 'bg-stone-100 border-stone-200 text-stone-800' : 'bg-[#181c22] border-stone-700 text-stone-200'
                }`}
              >
                <span className="text-amber-500 font-semibold">{k}</span> = {safeDisplay(v)}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}
