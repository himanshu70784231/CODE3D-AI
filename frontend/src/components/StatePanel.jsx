import React, { useState } from 'react';
import {
  Cpu,
  Variable,
  Layers,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  CornerDownRight,
  GitBranch,
  ChevronDown,
  ChevronRight,
  Award,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { safeString, safeDisplay, formatOperation, safeIncludes, safeArray } from '../utils/safeRender';

function inferType(val) {
  if (val === null) return 'null';
  if (val === undefined) return 'void';
  if (typeof val === 'boolean') return 'boolean';
  if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'double';
  if (typeof val === 'string') return 'String';
  if (Array.isArray(val)) {
    if (val.length === 0) return 'int[]';
    return `${inferType(val[0])}[]`;
  }
  if (typeof val === 'object') {
    if (val.__type) return val.__type;
    return 'Object';
  }
  return typeof val;
}

function formatValue(val) {
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'string') return `"${val}"`;
  if (Array.isArray(val)) return `[${val.join(', ')}]`;
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

export default function StatePanel({
  currentStep,
  totalSteps,
  correctOutput = null,
  isAtEnd = false,
  complexity = null,
  algorithmName = 'Algorithm',
  onSelectVariable = null,
}) {
  const { isBright } = useTheme();
  const [expandedArrays, setExpandedArrays] = useState({});

  if (!currentStep) {
    return (
      <div className={`flex flex-col items-center justify-center h-full p-6 text-center select-none ${
        isBright ? 'text-stone-500 bg-white' : 'text-stone-400 bg-[#121419]'
      }`}>
        <Cpu size={24} className="opacity-40 mb-2" />
        <span className="text-xs font-mono">Run execution to observe runtime state</span>
      </div>
    );
  }

  const {
    stepNumber,
    lineNumber,
    variables = {},
    changedVariable,
    previousValue,
    currentValue,
    condition,
    explanation,
    aiHint,
    eventType = 'STEP',
    metadata = {},
    dataStructure = currentStep.dataStructureState || {},
    callStack = [],
  } = currentStep;

  const rawOperation = metadata?.operation || eventType || 'STEP';
  const operation = formatOperation(rawOperation);

  const getOperationBadge = (op) => {
    switch (op) {
      case 'COMPARE':
        return isBright
          ? 'bg-amber-100 text-amber-900 border-amber-300'
          : 'bg-amber-950/60 text-amber-300 border-amber-600/40';
      case 'SWAP':
      case 'PARTITION_SWAP':
        return isBright
          ? 'bg-orange-100 text-orange-900 border-orange-300'
          : 'bg-orange-950/60 text-orange-300 border-orange-600/40';
      case 'FOUND':
      case 'MATCH':
      case 'COMPLETE':
      case 'SORTED':
        return isBright
          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
          : 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40';
      case 'NOT_FOUND':
        return isBright
          ? 'bg-rose-100 text-rose-900 border-rose-300'
          : 'bg-rose-950/60 text-rose-300 border-rose-600/40';
      default:
        return isBright
          ? 'bg-stone-100 text-stone-800 border-stone-300'
          : 'bg-stone-800 text-stone-200 border-stone-700';
    }
  };

  const varEntries = Object.entries(variables || {});

  return (
    <div className={`flex flex-col h-full overflow-y-auto select-none transition-colors duration-150 ${
      isBright
        ? 'bg-white text-stone-900'
        : 'bg-[#121419] text-stone-100'
    }`}>
      {/* 1. Header Bar: Clean & Architectural (Not a card) */}
      <div className={`h-9.5 px-3.5 flex items-center justify-between border-b shrink-0 sticky top-0 z-10 transition-colors ${
        isBright ? 'bg-[#f7f6f3] border-[#e2ded5]' : 'bg-[#16191f] border-[#242831]'
      }`}>
        <div className="flex items-center gap-2">
          <Cpu size={13} className="text-amber-500" />
          <span className="text-[11px] font-bold tracking-wider uppercase font-mono">
            Execution State
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className={`px-2 py-0.5 rounded font-bold border ${
            isBright ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-amber-950/50 border-amber-700/50 text-amber-400'
          }`}>
            Step {stepNumber} / {totalSteps}
          </span>
        </div>
      </div>

      <div className="flex-1 divide-y divide-inherit">
        {/* 2. Execution Event & Line */}
        <div className="p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500">
              Active Event
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${getOperationBadge(operation)}`}>
                {operation}
              </span>
              {lineNumber && (
                <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] border ${
                  isBright ? 'bg-stone-100 text-stone-700 border-stone-300' : 'bg-stone-800 text-stone-300 border-stone-700'
                }`}>
                  Line {lineNumber}
                </span>
              )}
            </div>
          </div>

          {/* Explanation Text (Educational Clarity) */}
          {explanation && (
            <p className={`text-xs leading-relaxed font-sans ${isBright ? 'text-stone-700' : 'text-stone-300'}`}>
              {explanation}
            </p>
          )}

          {/* AI Hint / Complexity Footprint */}
          {aiHint && (
            <div className={`flex items-start gap-1.5 text-[11px] pt-1 ${
              isBright ? 'text-amber-800' : 'text-amber-300/90'
            }`}>
              <Sparkles size={12} className="shrink-0 mt-0.5 text-amber-500" />
              <span>{aiHint}</span>
            </div>
          )}
        </div>

        {/* 3. Variables Table (Clean, aligned tabular layout — NO box overload) */}
        <div className="p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
              <Variable size={11} className="text-amber-500" />
              Variables &amp; Scope
            </span>
            <span className={`text-[10px] font-mono ${isBright ? 'text-stone-500' : 'text-stone-500'}`}>
              scope: {currentStep?.scope || 'main'}
            </span>
          </div>

          {varEntries.length === 0 ? (
            <div className="py-2 text-stone-500 text-xs italic font-mono">
              No local variables initialized in current frame.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className={`border-b text-[10px] uppercase tracking-wider ${
                    isBright ? 'text-stone-500 border-stone-200' : 'text-stone-500 border-stone-800'
                  }`}>
                    <th className="py-1 px-1 font-semibold">Identifier</th>
                    <th className="py-1 px-1 font-semibold">Type</th>
                    <th className="py-1 px-1 font-semibold text-right">Value</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isBright ? 'divide-stone-100' : 'divide-stone-800/40'}`}>
                  {varEntries.map(([name, val]) => {
                    const isChanged = changedVariable === name;
                    const typeStr = inferType(val);
                    const valStr = formatValue(val);

                    return (
                      <tr
                        key={name}
                        onClick={() => onSelectVariable && onSelectVariable(name, val)}
                        className={`transition-colors cursor-pointer ${
                          isChanged
                            ? isBright
                              ? 'bg-amber-100/60 text-amber-950 font-bold'
                              : 'bg-amber-500/15 text-amber-200 font-bold'
                            : isBright
                              ? 'hover:bg-stone-50 text-stone-800'
                              : 'hover:bg-stone-800/40 text-stone-200'
                        }`}
                        title="Click to highlight variable in 3D scene"
                      >
                        <td className="py-1.5 px-1 font-bold whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className={isChanged ? 'text-amber-500' : isBright ? 'text-stone-900' : 'text-stone-100'}>
                              {name}
                            </span>
                            {isChanged && (
                              <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-400 font-normal">
                                mutated
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-1.5 px-1 opacity-70 whitespace-nowrap text-[11px]">
                          {typeStr}
                        </td>
                        <td className="py-1.5 px-1 text-right font-bold whitespace-nowrap">
                          <span className={isChanged ? 'text-amber-400' : ''}>
                            {valStr}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 4. Condition Evaluation (Inline evaluation — Clean flow) */}
        {condition && (
          <div className="p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <GitBranch size={11} className="text-amber-500" />
                Condition Branch
              </span>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                condition.result
                  ? isBright
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50'
                  : isBright
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : 'bg-rose-950/60 text-rose-300 border-rose-700/50'
              }`}>
                {condition.result ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                {condition.result ? 'TRUE' : 'FALSE'}
              </span>
            </div>

            <div className={`p-2 rounded-md font-mono text-xs border ${
              isBright ? 'bg-[#f7f6f3] border-[#e2ded5]' : 'bg-[#16191f] border-[#242831]'
            }`}>
              <div className="flex items-center justify-between">
                <span className="opacity-75">Expr:</span>
                <span className="font-bold">{safeString(condition.expression)}</span>
              </div>
              {condition.evaluation && (
                <div className="flex items-center justify-between mt-1 text-[11px] opacity-80">
                  <span>Eval:</span>
                  <span className="text-amber-500 font-semibold">{safeString(condition.evaluation)}</span>
                </div>
              )}
              {condition.branch && (
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-inherit text-[10px] opacity-70">
                  <span>Branch:</span>
                  <span>{safeString(condition.branch)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. Call Stack */}
        <div className="p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
              <Layers size={11} className="text-amber-500" />
              Call Stack
            </span>
            <span className={`text-[10px] font-mono ${isBright ? 'text-stone-500' : 'text-stone-500'}`}>
              depth: {callStack.length || 1}
            </span>
          </div>

          <div className="space-y-1 font-mono text-xs">
            {callStack && callStack.length > 0 ? (
              callStack.map((frame, idx) => {
                const isTop = idx === callStack.length - 1;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-1.5 rounded border ${
                      isTop
                        ? isBright
                          ? 'bg-amber-50/70 border-amber-300 text-stone-900 font-bold'
                          : 'bg-amber-950/30 border-amber-600/40 text-amber-300 font-bold'
                        : isBright
                          ? 'bg-white border-stone-200 text-stone-600'
                          : 'bg-[#16191f] border-stone-800 text-stone-400'
                    }`}
                  >
                    <span>{typeof frame === 'string' ? frame : safeString(frame?.name, 'frame()')}</span>
                    <span className="text-[10px] opacity-75">{isTop ? `line ${lineNumber}` : ''}</span>
                  </div>
                );
              })
            ) : (
              <div className={`flex items-center justify-between p-1.5 rounded border ${
                isBright ? 'bg-stone-50 border-stone-200 text-stone-800' : 'bg-[#16191f] border-stone-800 text-stone-300'
              }`}>
                <span>{currentStep?.scope ? `${currentStep.scope}()` : 'main()'}</span>
                <span className="text-[10px] opacity-75">line {lineNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* 6. Verified Correct Output (Celebratory finish at completion) */}
        {correctOutput && (
          <div className="p-3.5">
            <div className={`p-2.5 rounded-md border font-mono text-xs ${
              isAtEnd
                ? isBright
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300'
                : isBright
                  ? 'bg-stone-50 border-stone-200 text-stone-800'
                  : 'bg-[#16191f] border-stone-800 text-stone-300'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                  <Award size={11} className={isAtEnd ? 'text-emerald-500' : 'text-stone-400'} />
                  {isAtEnd ? 'Verified Execution Output' : 'Output Stream'}
                </span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  isAtEnd ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stone-800 text-stone-400'
                }`}>
                  {isAtEnd ? 'CORRECT' : 'RUNNING'}
                </span>
              </div>
              <div className="font-bold break-all mt-1">
                {safeDisplay(correctOutput)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
