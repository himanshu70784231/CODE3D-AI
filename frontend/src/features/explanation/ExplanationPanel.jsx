import React, { useState } from 'react';
import {
  Info,
  GitBranch,
  Layers,
  Sparkles,
  Clock,
  HardDrive,
  ChevronDown,
  ChevronUp,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { PanelHeader, Badge } from '../../components/common';

/**
 * ExplanationPanel Component
 * 
 * Compliant with Section 12 & 13 specification:
 * - Current Step, Line Number, Operation Badge
 * - Progressive disclosure of pedagogical explanation
 * - Variables table with mutation highlight and bidirectional click-to-highlight
 * - Condition evaluation branch
 * - Call Stack frames
 * - Complexity summary
 */
export default function ExplanationPanel({
  currentStep = null,
  currentStepIndex = 0,
  totalSteps = 1,
  timeComplexity = 'O(n)',
  spaceComplexity = 'O(1)',
  onSelectVariable = null,
  selectedVariable = null,
}) {
  const { isBright } = useTheme();
  const [showAiHint, setShowAiHint] = useState(true);
  const [showCallStack, setShowCallStack] = useState(false);

  const stepNumber = currentStep?.stepNumber || currentStep?.step || currentStepIndex + 1;
  const lineNumber = currentStep?.lineNumber || currentStep?.line || 1;
  const operation = currentStep?.operation || currentStep?.eventType || 'EXECUTE';
  const explanation = currentStep?.explanation || `Executing statement at source line ${lineNumber}.`;
  const aiHint = currentStep?.aiHint || '';
  const variables = currentStep?.variables || {};
  const changedVar = currentStep?.changedVariable || null;
  const condition = currentStep?.condition || null;
  const callStack = currentStep?.callStack || [];

  return (
    <div className="h-full flex flex-col overflow-hidden relative select-none">
      <PanelHeader
        icon={Info}
        title="State & Dry Run"
        subtitle={`Step ${stepNumber} of ${totalSteps}`}
        badge={
          <Badge variant="amber" size="xs" mono>
            Line {lineNumber}
          </Badge>
        }
      />

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 space-y-3.5 text-xs">
        {/* Active Step & Operation Card */}
        <div
          className={`p-3 rounded-xl border transition-all ${
            isBright
              ? 'bg-white border-stone-200 shadow-2xs'
              : 'bg-[#151921] border-stone-800 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
              Current Operation
            </span>
            <Badge variant="amber" size="xs" mono dot>
              {operation}
            </Badge>
          </div>

          <p className="text-xs font-medium leading-relaxed mb-2 text-stone-200">
            {explanation}
          </p>

          {/* AI Pedagogical Insight (Collapsible) */}
          {aiHint && (
            <div
              className={`mt-2 p-2 rounded-lg border text-[11px] ${
                isBright
                  ? 'bg-amber-50/80 border-amber-200/80 text-amber-900'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
              }`}
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowAiHint((prev) => !prev)}
              >
                <div className="flex items-center gap-1.5 font-semibold text-[10px] uppercase font-mono tracking-wider">
                  <Sparkles size={11} className="text-amber-500" />
                  <span>Pedagogical Hint</span>
                </div>
                {showAiHint ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </div>
              {showAiHint && (
                <p className="mt-1 text-[11px] leading-relaxed opacity-90">
                  {aiHint}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Condition Check Card (if active on step) */}
        {condition && (
          <div
            className={`p-3 rounded-xl border ${
              condition.result
                ? isBright
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : isBright
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider opacity-75">
                Condition Evaluation
              </span>
              <Badge variant={condition.result ? 'emerald' : 'rose'} size="xs" mono>
                {condition.result ? 'TRUE (BRANCH TAKEN)' : 'FALSE (BRANCH SKIPPED)'}
              </Badge>
            </div>

            <div className="space-y-1 font-mono text-[11px]">
              <div>
                <span className="opacity-60">Expression: </span>
                <span className="font-semibold">{condition.expression}</span>
              </div>
              {condition.evaluation && (
                <div>
                  <span className="opacity-60">Substituted: </span>
                  <span>{condition.evaluation}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scope Variables Table */}
        <div
          className={`rounded-xl border overflow-hidden ${
            isBright ? 'bg-white border-stone-200' : 'bg-[#151921] border-stone-800'
          }`}
        >
          <div
            className={`px-3 py-2 border-b flex items-center justify-between select-none ${
              isBright ? 'bg-stone-50 border-stone-200' : 'bg-stone-900/60 border-stone-800'
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold text-xs">
              <Activity size={12} className="text-amber-500" />
              <span>Variables in Scope</span>
            </div>
            <span className="text-[10px] font-mono text-stone-500">
              {Object.keys(variables).length} active
            </span>
          </div>

          {Object.keys(variables).length === 0 ? (
            <div className="p-4 text-center text-stone-500 text-xs italic">
              No variables declared in current frame yet.
            </div>
          ) : (
            <div className="divide-y divide-stone-800/60">
              {Object.entries(variables).map(([name, val]) => {
                const isChanged = changedVar === name;
                const isSelected = selectedVariable === name;
                const displayVal = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val);

                return (
                  <div
                    key={name}
                    onClick={() => onSelectVariable && onSelectVariable(name)}
                    className={`px-3 py-2 flex items-center justify-between text-xs transition cursor-pointer ${
                      isSelected
                        ? isBright
                          ? 'bg-amber-100/70'
                          : 'bg-amber-500/15'
                        : isChanged
                          ? isBright
                            ? 'bg-amber-50/50'
                            : 'bg-amber-500/5'
                          : isBright
                            ? 'hover:bg-stone-50'
                            : 'hover:bg-stone-850/50'
                    }`}
                    title="Click to highlight in 3D scene"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-500">{name}</span>
                      {isChanged && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-semibold animate-pulse">
                          +changed
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-medium truncate max-w-[140px] text-stone-300">
                      {displayVal}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Call Stack Section (collapsible) */}
        {callStack.length > 0 && (
          <div
            className={`rounded-xl border overflow-hidden ${
              isBright ? 'bg-white border-stone-200' : 'bg-[#151921] border-stone-800'
            }`}
          >
            <div
              className={`px-3 py-2 border-b flex items-center justify-between cursor-pointer select-none ${
                isBright ? 'bg-stone-50 border-stone-200' : 'bg-stone-900/60 border-stone-800'
              }`}
              onClick={() => setShowCallStack((prev) => !prev)}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs">
                <Layers size={12} className="text-amber-500" />
                <span>Call Stack Frames</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-stone-500">
                  Depth {callStack.length}
                </span>
                {showCallStack ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </div>
            </div>

            {showCallStack && (
              <div className="p-2 space-y-1">
                {callStack.map((frame, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 rounded bg-stone-900/80 font-mono text-[11px] flex items-center justify-between text-stone-300"
                  >
                    <span className="font-semibold text-amber-400">
                      {frame.functionName || 'anonymous'}()
                    </span>
                    <span className="text-[10px] text-stone-500">
                      line {frame.lineNumber}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Complexity Card */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-around select-none ${
            isBright ? 'bg-stone-50 border-stone-200' : 'bg-[#151921] border-stone-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-amber-500" />
            <div>
              <div className="text-[10px] font-mono uppercase text-stone-500">Time</div>
              <div className="text-xs font-mono font-bold text-stone-200">{timeComplexity}</div>
            </div>
          </div>

          <div className={`w-px h-7 ${isBright ? 'bg-stone-300' : 'bg-stone-800'}`} />

          <div className="flex items-center gap-2">
            <HardDrive size={14} className="text-amber-500" />
            <div>
              <div className="text-[10px] font-mono uppercase text-stone-500">Space</div>
              <div className="text-xs font-mono font-bold text-stone-200">{spaceComplexity}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
