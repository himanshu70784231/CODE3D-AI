import React from 'react';
import { Variable, CheckCircle2, XCircle, Sparkles, Layers, Cpu, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function StatePanel({ currentStep, totalSteps, correctOutput = null, isAtEnd = false }) {
  const { isBright } = useTheme();

  if (!currentStep) return null;

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
  } = currentStep;

  return (
    <div className={`flex flex-col h-full border-l overflow-y-auto transition-colors duration-200 ${
      isBright
        ? 'bg-white text-slate-800 border-slate-200'
        : 'bg-[#0b101d] text-slate-200 border-slate-800/80'
    }`}>
      {/* State Panel Header */}
      <div className={`h-10 border-b px-3.5 flex items-center justify-between sticky top-0 z-10 transition-colors ${
        isBright
          ? 'bg-slate-50/95 border-slate-200 text-slate-800'
          : 'bg-slate-900/90 border-slate-800/80 text-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <Cpu size={14} className={isBright ? 'text-cyan-600' : 'text-cyan-400'} />
          <span className={`text-xs font-semibold uppercase tracking-wider ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
            Program State
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-mono ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
            Step <strong className={`font-bold ${isBright ? 'text-cyan-700' : 'text-cyan-400'}`}>{stepNumber}</strong> of {totalSteps}
          </span>
        </div>
      </div>

      <div className="p-3.5 space-y-3.5 flex-1 text-xs">
        {/* Step & Line Metric Cards */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`border rounded-lg p-2.5 transition-colors ${
            isBright
              ? 'bg-slate-50/90 border-slate-200'
              : 'bg-slate-900/70 border-slate-800'
          }`}>
            <span className={`text-[10px] uppercase font-medium ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
              Current Line
            </span>
            <div className={`text-base font-mono font-bold mt-0.5 flex items-center gap-1.5 ${
              isBright ? 'text-cyan-700' : 'text-cyan-400'
            }`}>
              <span>Line {lineNumber}</span>
            </div>
          </div>

          <div className={`border rounded-lg p-2.5 transition-colors ${
            isBright
              ? 'bg-slate-50/90 border-slate-200'
              : 'bg-slate-900/70 border-slate-800'
          }`}>
            <span className={`text-[10px] uppercase font-medium ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
              Event Type
            </span>
            <div className={`text-[11px] font-mono font-semibold mt-1 truncate ${
              isBright ? 'text-slate-800' : 'text-slate-300'
            }`}>
              {currentStep.eventType || 'EXECUTION'}
            </div>
          </div>
        </div>

        {/* Verified Correct Output Card */}
        {correctOutput && (
          <div className={`border rounded-lg p-3 transition-colors ${
            isAtEnd
              ? isBright
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-sm'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-emerald-950/40'
              : isBright
                ? 'bg-cyan-50/90 border-cyan-200 text-cyan-950'
                : 'bg-slate-900/60 border-slate-800/80'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isAtEnd ? 'text-emerald-500' : 'text-cyan-400'}`}>
                {isAtEnd ? '🏆 Verified Correct Output' : '⚡ Output Result'}
              </span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                isAtEnd ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
              }`}>
                {isAtEnd ? '100% CORRECT' : 'EVALUATING'}
              </span>
            </div>
            <div className="font-mono text-xs font-bold break-all">
              {correctOutput}
            </div>
          </div>
        )}

        {/* Variables Section */}
        <div className={`border rounded-lg p-3 transition-colors ${
          isBright
            ? 'bg-slate-50/80 border-slate-200'
            : 'bg-slate-900/60 border-slate-800/80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Variable size={13} className={isBright ? 'text-cyan-600' : 'text-cyan-400'} />
              <span className={`font-semibold text-xs ${isBright ? 'text-slate-800' : 'text-slate-300'}`}>
                Variable Memory
              </span>
            </div>
            <span className={`text-[10px] font-mono ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
              Scope: active
            </span>
          </div>

          <div className="space-y-1.5 font-mono">
            {Object.keys(variables).length === 0 ? (
              <p className={`italic text-[11px] ${isBright ? 'text-slate-400' : 'text-slate-500'}`}>
                No local variables in scope.
              </p>
            ) : (
              Object.entries(variables).map(([name, val]) => {
                const isRecentlyChanged = changedVariable === name;
                const varTypes = currentStep?.dataStructureState?.variableTypes || {};
                
                // Infer type
                let inferredType = varTypes[name];
                if (!inferredType) {
                  if (Array.isArray(val) || (typeof val === 'string' && val.startsWith('[') && val.endsWith(']'))) {
                    inferredType = 'int[]';
                  } else if (typeof val === 'number') {
                    inferredType = Number.isInteger(val) ? 'int' : 'double';
                  } else if (typeof val === 'boolean') {
                    inferredType = 'boolean';
                  } else {
                    inferredType = 'var';
                  }
                }

                // Check if this variable is an array to show element breakdown
                let arrayElements = null;
                if (Array.isArray(val)) {
                  arrayElements = val;
                } else if (typeof val === 'string' && val.startsWith('[') && val.endsWith(']')) {
                  try {
                    const parsed = JSON.parse(val);
                    if (Array.isArray(parsed)) arrayElements = parsed;
                  } catch (e) {
                    const items = val.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
                    if (items.length > 0) arrayElements = items;
                  }
                }

                const activeIdx = currentStep?.dataStructureState?.activeIndex;

                return (
                  <div key={name} className="flex flex-col gap-1">
                    <div
                      className={`flex items-center justify-between p-2 rounded transition-all border ${
                        isRecentlyChanged
                          ? isBright
                            ? 'bg-cyan-50/90 border-cyan-400 text-cyan-950 font-semibold'
                            : 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                          : isBright
                          ? 'bg-white border-slate-200 text-slate-700 shadow-2xs'
                          : 'bg-slate-950/50 border-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                          isBright ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {inferredType}
                        </span>
                        <span className={isBright ? 'text-slate-700 font-medium' : 'text-slate-300 font-medium'}>
                          {name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isRecentlyChanged && previousValue !== null && (
                          <div className={`flex items-center gap-1 text-[10px] line-through ${
                            isBright ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            <span>{String(previousValue)}</span>
                            <ArrowRight size={10} className="text-slate-400 no-underline" />
                          </div>
                        )}
                        <span className={`font-bold ${
                          isRecentlyChanged
                            ? isBright ? 'text-cyan-700' : 'text-cyan-300'
                            : isBright ? 'text-slate-900' : 'text-slate-100'
                        }`}>
                          {String(val)}
                        </span>
                        {isRecentlyChanged && (
                          <span className={`text-[9px] px-1 py-0.2 rounded font-sans uppercase font-bold ${
                            isBright
                              ? 'bg-cyan-100 text-cyan-800'
                              : 'bg-cyan-900/80 text-cyan-300'
                          }`}>
                            Updated
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Array Index Breakdown for Arrays */}
                    {arrayElements && arrayElements.length > 0 && arrayElements.length <= 16 && (
                      <div className={`ml-3 pl-2 border-l py-1 flex flex-wrap gap-1 ${
                        isBright ? 'border-slate-300' : 'border-slate-800'
                      }`}>
                        {arrayElements.map((el, idx) => {
                          const isActiveSlot = (activeIdx === idx);
                          return (
                            <div
                              key={idx}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono border transition ${
                                isActiveSlot
                                  ? isBright
                                    ? 'bg-cyan-200 border-cyan-400 text-cyan-950 font-bold ring-1 ring-cyan-400'
                                    : 'bg-cyan-500/30 border-cyan-400 text-cyan-200 font-bold ring-1 ring-cyan-400'
                                  : isBright
                                  ? 'bg-slate-100 border-slate-200 text-slate-600'
                                  : 'bg-slate-900 border-slate-800 text-slate-400'
                              }`}
                              title={`${name}[${idx}] = ${el}${isActiveSlot ? ' (Active)' : ''}`}
                            >
                              <span className="opacity-60">{name}[{idx}]:</span> {String(el)}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Condition Evaluation Card */}
        {condition ? (
          <div className={`border rounded-lg p-3 transition-colors ${
            isBright
              ? 'bg-slate-50/80 border-slate-200'
              : 'bg-slate-900/60 border-slate-800/80'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-semibold text-xs ${isBright ? 'text-slate-800' : 'text-slate-300'}`}>
                Condition Evaluation
              </span>
              {condition.result ? (
                <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  isBright
                    ? 'text-emerald-800 bg-emerald-100 border-emerald-300'
                    : 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50'
                }`}>
                  <CheckCircle2 size={11} /> TRUE
                </span>
              ) : (
                <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  isBright
                    ? 'text-rose-800 bg-rose-100 border-rose-300'
                    : 'text-rose-400 bg-rose-950/60 border-rose-800/50'
                }`}>
                  <XCircle size={11} /> FALSE
                </span>
              )}
            </div>

            <div className={`space-y-1 rounded p-2 font-mono text-[11px] border ${
              isBright
                ? 'bg-white border-slate-200 text-slate-800'
                : 'bg-slate-950/70 border-slate-800 text-slate-300'
            }`}>
              <div className={isBright ? 'text-slate-600' : 'text-slate-400'}>
                Expression: <span className={`font-medium ${isBright ? 'text-slate-900' : 'text-slate-200'}`}>{condition.expression}</span>
              </div>
              <div className={isBright ? 'text-slate-600' : 'text-slate-400'}>
                Evaluation: <span className={`font-semibold ${isBright ? 'text-cyan-700' : 'text-cyan-300'}`}>{condition.evaluation}</span>
              </div>
              <div className={`text-[10px] mt-1 pt-1 border-t ${
                isBright ? 'border-slate-100 text-slate-500' : 'border-slate-800/60 text-slate-500'
              }`}>
                Branch: <span className={isBright ? 'text-slate-800 font-semibold' : 'text-slate-300'}>{condition.branch}</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Call Stack */}
        <div className={`border rounded-lg p-3 transition-colors ${
          isBright
            ? 'bg-slate-50/80 border-slate-200'
            : 'bg-slate-900/60 border-slate-800/80'
        }`}>
          <div className="flex items-center gap-1.5 mb-2">
            <Layers size={13} className={isBright ? 'text-cyan-600' : 'text-cyan-400'} />
            <span className={`font-semibold text-xs ${isBright ? 'text-slate-800' : 'text-slate-300'}`}>
              Call Stack
            </span>
          </div>
          <div className={`border rounded p-2 font-mono text-[11px] flex items-center justify-between ${
            isBright
              ? 'bg-white border-slate-200 text-slate-700'
              : 'bg-slate-950/50 border-slate-800 text-slate-300'
          }`}>
            <span className={isBright ? 'text-cyan-700 font-semibold' : 'text-cyan-400'}>
              Main.execute()
            </span>
            <span className={`text-[10px] ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>
              line {lineNumber}
            </span>
          </div>
        </div>

        {/* AI Pedagogical Explanation */}
        <div className={`border rounded-lg p-3 transition-colors ${
          isBright
            ? 'bg-gradient-to-br from-cyan-50 via-sky-50 to-indigo-50 border-cyan-200 shadow-2xs'
            : 'bg-gradient-to-br from-cyan-950/30 to-slate-900/60 border-cyan-800/30'
        }`}>
          <div className={`flex items-center gap-1.5 mb-1.5 font-semibold text-xs ${
            isBright ? 'text-cyan-800' : 'text-cyan-400'
          }`}>
            <Sparkles size={13} />
            <span>Execution Insight</span>
          </div>
          <p className={`text-[11.5px] leading-relaxed font-sans ${
            isBright ? 'text-slate-700' : 'text-slate-300'
          }`}>
            {explanation}
          </p>

          {aiHint && (
            <div className={`mt-2 pt-2 border-t text-[11px] flex items-start gap-1.5 ${
              isBright
                ? 'border-cyan-200 text-slate-600'
                : 'border-cyan-900/30 text-slate-400'
            }`}>
              <span className={`font-bold ${isBright ? 'text-cyan-700' : 'text-cyan-400'}`}>Hint:</span>
              <span>{aiHint}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
