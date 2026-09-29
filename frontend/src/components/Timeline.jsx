import React, { useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Gauge,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

/**
 * CODE3D-AI - Timeline Component
 * Professional execution control bar and step scrubber synchronized with
 * Monaco Editor, Variables Inspector, 3D Spatial Canvas, and Output Stream.
 */
export function Timeline({
  currentStepIndex = 0,
  totalSteps = 0,
  isPlaying = false,
  playbackSpeed = 1,
  setPlaybackSpeed = null,
  onPlay = null,
  onPause = null,
  onPrev = null,
  onNext = null,
  onReset = null,
  onGoToStep = null,
  onGoToFirst = null,
  onGoToLast = null,
  isAtStart = true,
  isAtEnd = false,
  isCodeDirty = false,
  currentStep = null,
  trace = [],
}) {
  const speeds = [0.25, 0.5, 1, 1.5, 2, 4];
  const stepListRef = useRef(null);

  // Auto-scroll active step node into view
  useEffect(() => {
    if (!stepListRef.current) return;
    const activeNode = stepListRef.current.querySelector(`[data-step-index="${currentStepIndex}"]`);
    if (activeNode) {
      activeNode.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentStepIndex]);

  const activeStepNum = currentStepIndex + 1;
  const safeTotal = Math.max(1, totalSteps);

  return (
    <div className="bg-[#0d1726] border-t border-[#26364a] px-3 py-1.5 flex flex-col gap-1.5 select-none text-xs text-[#f8fafc]">
      {/* Top Controls Row */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto">
        {/* Playback Button Group */}
        <div className="flex items-center gap-1 shrink-0">
          {/* First Step */}
          <button
            onClick={onGoToFirst || (() => onGoToStep && onGoToStep(0))}
            disabled={isAtStart || safeTotal <= 1}
            className="p-1 rounded hover:bg-[#1e2f47] text-[#94a3b8] hover:text-[#f8fafc] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="First Step (Step 1)"
          >
            <ChevronsLeft size={14} />
          </button>

          {/* Previous Step */}
          <button
            onClick={onPrev}
            disabled={isAtStart || safeTotal <= 1}
            className="p-1 rounded hover:bg-[#1e2f47] text-[#94a3b8] hover:text-[#f8fafc] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous Step (Shift + F10)"
          >
            <SkipBack size={14} />
          </button>

          {/* Play / Pause */}
          {isPlaying ? (
            <button
              onClick={onPause}
              className="h-6 px-2.5 rounded bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
              title="Pause Simulation (F5)"
            >
              <Pause size={12} className="fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={onPlay}
              disabled={safeTotal <= 1 && !isCodeDirty}
              className={`h-6 px-2.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs ${
                isCodeDirty
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white animate-pulse'
                  : 'bg-[#3b82f6] hover:bg-[#2563eb] text-white shadow-blue-500/20'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title={isCodeDirty ? 'Execute modified code (Ctrl+Enter)' : isAtEnd ? 'Replay Simulation' : 'Play Simulation (F5)'}
            >
              <Play size={12} className="fill-current" />
              <span>{isCodeDirty ? 'Run' : isAtEnd ? 'Replay' : 'Play'}</span>
            </button>
          )}

          {/* Next Step */}
          <button
            onClick={onNext}
            disabled={isAtEnd || safeTotal <= 1}
            className="p-1 rounded hover:bg-[#1e2f47] text-[#94a3b8] hover:text-[#f8fafc] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next Step (F10)"
          >
            <SkipForward size={14} />
          </button>

          {/* Last Step */}
          <button
            onClick={onGoToLast || (() => onGoToStep && onGoToStep(safeTotal - 1))}
            disabled={isAtEnd || safeTotal <= 1}
            className="p-1 rounded hover:bg-[#1e2f47] text-[#94a3b8] hover:text-[#f8fafc] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Last Step"
          >
            <ChevronsRight size={14} />
          </button>

          {/* Replay / Reset */}
          <button
            onClick={onReset}
            className="p-1 rounded hover:bg-[#1e2f47] text-[#94a3b8] hover:text-[#f8fafc] transition-colors cursor-pointer ml-1"
            title="Reset to Step 1 (Esc)"
          >
            <RotateCcw size={13} />
          </button>
        </div>

        {/* Center: Step X / Y Counter */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[#94a3b8]">Step:</span>
          <span className="font-bold text-[#38bdf8] bg-[#101c2d] px-2 py-0.5 rounded border border-[#26364a]">
            {activeStepNum} / {safeTotal}
          </span>
          {currentStep?.lineNumber && (
            <span className="text-[11px] text-[#94a3b8] hidden sm:inline">
              (Line {currentStep.lineNumber})
            </span>
          )}
        </div>

        {/* Right: Speed Selector */}
        {setPlaybackSpeed && (
          <div className="flex items-center gap-1 text-[11px] font-mono">
            <Gauge size={12} className="text-[#94a3b8]" />
            <div className="flex items-center bg-[#101c2d] border border-[#26364a] rounded p-0.5">
              {speeds.map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-[#3b82f6] text-white font-bold'
                      : 'text-[#94a3b8] hover:text-[#f8fafc]'
                  }`}
                  title={`${spd}x playback speed`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step Scrubber Bar with Step Cards */}
      <div
        ref={stepListRef}
        className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none"
      >
        {Array.from({ length: safeTotal }).map((_, idx) => {
          const isCurrent = idx === currentStepIndex;
          const isPassed = idx < currentStepIndex;
          const stepData = trace && trace[idx];
          const lineNum = stepData?.lineNumber || null;
          const operation = stepData?.operation || (stepData?.changedVariable ? `Δ ${stepData.changedVariable}` : null);

          return (
            <button
              key={idx}
              data-step-index={idx}
              onClick={() => onGoToStep && onGoToStep(idx)}
              className={`h-7 px-2 rounded flex items-center gap-1.5 font-mono text-[10px] shrink-0 border transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-[#14b8a6]/20 border-[#14b8a6] text-[#2dd4bf] font-bold shadow-xs'
                  : isPassed
                  ? 'bg-[#101c2d] border-[#26364a] text-[#94a3b8] hover:border-[#3b82f6]'
                  : 'bg-[#08111f] border-[#1e2c3d] text-[#64748b] hover:border-[#26364a]'
              }`}
              title={`Step ${idx + 1}${lineNum ? ` (Line ${lineNum})` : ''}: ${stepData?.explanation || 'Click to view'}`}
            >
              <span>{idx + 1}</span>
              {lineNum && <span className="text-[#64748b]">L{lineNum}</span>}
              {operation && (
                <span className="hidden md:inline truncate max-w-[70px] text-[#94a3b8]">
                  {operation}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Timeline;
