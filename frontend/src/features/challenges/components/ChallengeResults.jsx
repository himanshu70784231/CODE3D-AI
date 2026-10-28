/**
 * CODE3D-AI: Challenge Results Component
 * Comprehensive visual feedback for Predict and Repair challenges.
 */

import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Box,
  Sparkles,
  Info,
  Clock,
  Terminal,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export default function ChallengeResults({
  mode = 'predict', // 'predict' | 'repair'
  isSuccess = false,
  message = '',
  validationResult = null,
  testCaseResults = [],
  syntaxError = null,
  explanation = '',
  aiExplanation = null,
  onRetry = null,
  onNext = null,
  onVisualize3D = null,
  earnedXp = 0,
}) {
  const { isBright } = useTheme();

  return (
    <div className="w-full flex flex-col gap-4 c3d-animate-fade-in select-none">
      {/* Primary Result Banner */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
          isSuccess
            ? isBright
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950 shadow-xs'
              : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-100 shadow-md shadow-emerald-950/20'
            : isBright
            ? 'bg-rose-50 border-rose-200 text-rose-950 shadow-xs'
            : 'bg-rose-950/30 border-rose-800/60 text-rose-100 shadow-md shadow-rose-950/20'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isSuccess ? 'bg-emerald-500 text-white shadow-sm' : 'bg-rose-500 text-white shadow-sm'
            }`}
          >
            {isSuccess ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">
                {isSuccess
                  ? mode === 'predict'
                    ? 'Prediction Confirmed!'
                    : 'Code Successfully Repaired!'
                  : mode === 'predict'
                  ? 'Prediction Mismatch'
                  : 'Tests Failing'}
              </h3>
              {isSuccess && earnedXp > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles size={11} /> +{earnedXp} XP
                </span>
              )}
            </div>
            <p className="text-xs opacity-90 mt-0.5 font-medium">{message}</p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {onVisualize3D && (
            <button
              onClick={onVisualize3D}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                isBright
                  ? 'bg-cyan-50 text-cyan-800 border-cyan-300 hover:bg-cyan-100'
                  : 'bg-cyan-950/40 text-cyan-300 border-cyan-800 hover:bg-cyan-900/50'
              }`}
              title="Launch execution trace in 3D WebGL Studio"
            >
              <Box size={14} className="text-cyan-400" />
              <span>Inspect in 3D</span>
            </button>
          )}

          {onRetry && !isSuccess && (
            <button
              onClick={onRetry}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                isBright
                  ? 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <RotateCcw size={13} />
              <span>Try Again</span>
            </button>
          )}

          {onNext && isSuccess && (
            <button
              onClick={onNext}
              className="px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-xs"
            >
              <span>Next Challenge</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Mode A: Predict Output Detailed Diff View */}
      {mode === 'predict' && validationResult?.diff && validationResult.diff.length > 0 && (
        <div
          className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
            isBright ? 'bg-white border-slate-200' : 'bg-[#0f131a] border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <Terminal size={14} className="text-amber-500" />
              <span>Output Diff Comparison</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                validationResult.matchPercentage === 100
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {validationResult.matchPercentage}% Matched
            </span>
          </div>

          <div className="rounded-lg border overflow-hidden font-mono text-xs">
            <div
              className={`grid grid-cols-2 p-2 font-semibold text-[11px] border-b ${
                isBright ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div>Your Prediction</div>
              <div>Actual Program Output</div>
            </div>
            {validationResult.diff.map((row, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-2 p-2 border-b last:border-b-0 ${
                  row.isMatch ? 'c3d-diff-match' : 'c3d-diff-mismatch'
                } ${isBright ? 'border-slate-200' : 'border-slate-800/60'}`}
              >
                <div className="overflow-x-auto whitespace-pre">{row.user || '<empty>'}</div>
                <div className="overflow-x-auto whitespace-pre font-bold">{row.actual || '<empty>'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode B: Repair Code Test Suite Breakdown */}
      {mode === 'repair' && testCaseResults && testCaseResults.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold px-1">
            <span>Test Case Results</span>
            <span className="font-mono text-[11px] text-slate-400">
              {testCaseResults.filter((r) => r.passed).length} / {testCaseResults.length} Passed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {testCaseResults.map((tc) => (
              <div
                key={tc.id}
                className={`p-3 rounded-xl border flex flex-col gap-2 transition ${
                  tc.passed
                    ? isBright
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                      : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-100'
                    : isBright
                    ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                    : 'bg-rose-950/20 border-rose-800/40 text-rose-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    {tc.name}
                    {tc.isHidden && (
                      <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-500/20 text-slate-400">
                        Hidden
                      </span>
                    )}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      tc.passed
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {tc.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>

                <div className="flex flex-col gap-1 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span>Expected:</span>
                    <span className="font-semibold text-slate-300 truncate max-w-[140px]">
                      {tc.expectedOutput}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span>Output:</span>
                    <span
                      className={`font-semibold truncate max-w-[140px] ${
                        tc.passed ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tc.actualOutput || (tc.error?.message ? 'Error' : '<empty>')}
                    </span>
                  </div>
                  {tc.durationMs !== undefined && (
                    <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500 mt-0.5">
                      <Clock size={10} /> {tc.durationMs}ms
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Syntax / Runtime Error Diagnostic Callout */}
      {syntaxError && (
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            isBright
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
          }`}
        >
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold flex items-center gap-2">
              <span>{syntaxError.type || 'Runtime Error'}</span>
              {syntaxError.line && (
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                  Line {syntaxError.line}
                </span>
              )}
            </h4>
            <p className="font-mono text-[11px] mt-1 text-rose-400 whitespace-pre-wrap">
              {syntaxError.message}
            </p>
          </div>
        </div>
      )}

      {/* Pedagogical Explanation */}
      {explanation && (
        <div
          className={`p-4 rounded-xl border flex flex-col gap-2 ${
            isBright ? 'bg-slate-50 border-slate-200' : 'bg-[#0f131a] border-slate-800'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
            <Info size={14} />
            <span>Pedagogical Analysis & Logic Flow</span>
          </div>
          <p className="text-xs leading-relaxed opacity-90 whitespace-pre-line font-normal">
            {explanation}
          </p>
        </div>
      )}

      {/* AI Error Diagnostic if Available */}
      {aiExplanation && (
        <div
          className={`p-4 rounded-xl border flex flex-col gap-2 ${
            isBright ? 'bg-cyan-50/50 border-cyan-200' : 'bg-cyan-950/20 border-cyan-800/50'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
            <Sparkles size={14} />
            <span>AI Code Diagnostics</span>
          </div>
          <p className="text-xs leading-relaxed opacity-90 whitespace-pre-line">
            {aiExplanation}
          </p>
        </div>
      )}
    </div>
  );
}
