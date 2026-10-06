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
import { formatOperation } from '../utils/safeRender';
import { useTheme } from '../context/ThemeContext';

/**
 * CODE3D-AI - Timeline Component
 * Professional execution control bar and step scrubber synchronized with
 * Monaco Editor, Variables Inspector, 3D Spatial Canvas, and Output Stream.
 * Seamless Dark Space and Clean Bright mode execution.
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
  const { isBright, currentAccent } = useTheme();
  const accentHex = isBright ? currentAccent.bright : currentAccent.dark;
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
    <div className={`border-t px-3 py-1.5 flex flex-col gap-1.5 select-none text-xs transition-colors duration-150 ${
      isBright
        ? 'bg-[#f7f6f3] border-[#e2ded5] text-stone-800'
        : 'bg-[#121419] border-[#242831] text-stone-100'
    }`}>
      {/* Top Controls Row */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto">
        {/* Playback Button Group */}
        <div className="flex items-center gap-1 shrink-0">
          {/* First Step */}
          <button
            onClick={onGoToFirst || (() => onGoToStep && onGoToStep(0))}
            disabled={isAtStart || safeTotal <= 1}
            className={`p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer ${
              isBright
                ? 'hover:bg-stone-200 text-stone-600 hover:text-stone-900'
                : 'hover:bg-stone-800 text-stone-400 hover:text-stone-100'
            }`}
            title="First Step (Step 1)"
          >
            <ChevronsLeft size={14} />
          </button>

          {/* Previous Step */}
          <button
            onClick={onPrev}
            disabled={isAtStart || safeTotal <= 1}
            className={`p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer ${
              isBright
                ? 'hover:bg-stone-200 text-stone-600 hover:text-stone-900'
                : 'hover:bg-stone-800 text-stone-400 hover:text-stone-100'
            }`}
            title="Previous Step (Shift + F10)"
          >
            <SkipBack size={14} />
          </button>

          {/* Play / Pause */}
          {isPlaying ? (
            <button
              onClick={onPause}
              className="h-6.5 px-3 rounded-md bg-stone-800 hover:bg-stone-700 text-amber-400 border border-amber-500/40 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs active:scale-95"
              title="Pause Simulation (F5)"
            >
              <Pause size={12} className="fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={onPlay}
              disabled={safeTotal <= 1 && !isCodeDirty}
              className={`h-6.5 px-3 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                isCodeDirty
                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 ring-2 ring-amber-400/50'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
              }`}
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
            className={`p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer ${
              isBright
                ? 'hover:bg-stone-200 text-stone-600 hover:text-stone-900'
                : 'hover:bg-stone-800 text-stone-400 hover:text-stone-100'
            }`}
            title="Next Step (F10)"
          >
            <SkipForward size={14} />
          </button>

          {/* Last Step */}
          <button
            onClick={onGoToLast || (() => onGoToStep && onGoToStep(safeTotal - 1))}
            disabled={isAtEnd || safeTotal <= 1}
            className={`p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer ${
              isBright
                ? 'hover:bg-stone-200 text-stone-600 hover:text-stone-900'
                : 'hover:bg-stone-800 text-stone-400 hover:text-stone-100'
            }`}
            title="Last Step"
          >
            <ChevronsRight size={14} />
          </button>

          {/* Replay / Reset */}
          <button
            onClick={onReset}
            className={`p-1 rounded transition-colors cursor-pointer ml-1 ${
              isBright
                ? 'hover:bg-stone-200 text-stone-600 hover:text-stone-900'
                : 'hover:bg-stone-800 text-stone-400 hover:text-stone-100'
            }`}
            title="Reset to Step 1 (Esc)"
          >
            <RotateCcw size={13} />
          </button>
        </div>

        {/* Center: Step X / Y Counter */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className={isBright ? 'text-stone-500' : 'text-stone-400'}>Execution:</span>
          <span
            className="font-bold px-2 py-0.5 rounded border text-xs"
            style={{
              backgroundColor: `${accentHex}18`,
              borderColor: `${accentHex}40`,
              color: accentHex,
            }}
          >
            Step {activeStepNum} / {safeTotal}
          </span>
          {currentStep?.lineNumber && (
            <span className={`text-[11px] hidden sm:inline ${isBright ? 'text-stone-500' : 'text-stone-400'}`}>
              (Line {currentStep.lineNumber})
            </span>
          )}
        </div>

        {/* Right: Speed Selector */}
        {setPlaybackSpeed && (
          <div className="flex items-center gap-1 text-[11px] font-mono">
            <Gauge size={12} className={isBright ? 'text-stone-500' : 'text-stone-400'} />
            <div className={`flex items-center border rounded-md p-0.5 ${
              isBright ? 'bg-white border-stone-300 shadow-2xs' : 'bg-[#101216] border-stone-700'
            }`}>
              {speeds.map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded text-[10px] transition-all cursor-pointer ${
                    playbackSpeed === spd
                      ? 'font-bold shadow-2xs'
                      : isBright
                        ? 'text-stone-600 hover:text-stone-900'
                        : 'text-stone-400 hover:text-stone-100'
                  }`}
                  style={playbackSpeed === spd ? {
                    backgroundColor: accentHex,
                    color: '#0e1013',
                  } : {}}
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
              className={`h-6.5 px-2 rounded-md flex items-center gap-1 font-mono text-[10px] shrink-0 border transition-all cursor-pointer ${
                isCurrent
                  ? 'font-bold shadow-xs scale-102 bg-amber-500 text-stone-950 border-amber-400'
                  : isPassed
                  ? isBright
                    ? 'bg-white border-stone-300 text-stone-800 hover:border-stone-400'
                    : 'bg-[#181c22] border-stone-700 text-stone-200 hover:border-stone-500'
                  : isBright
                    ? 'bg-stone-100 border-stone-200 text-stone-400 hover:border-stone-300'
                    : 'bg-[#101216] border-stone-800 text-stone-600 hover:border-stone-700'
              }`}
              title={`Step ${idx + 1}${lineNum ? ` (Line ${lineNum})` : ''}: ${stepData?.explanation || 'Click to view'}`}
            >
              <span>{idx + 1}</span>
              {lineNum && <span className={isCurrent ? 'text-stone-900 opacity-75' : isBright ? 'text-stone-400' : 'text-stone-500'}>L{lineNum}</span>}
              {operation && (
                <span className={`hidden md:inline truncate max-w-[70px] ${
                  isCurrent ? 'text-stone-900' : isBright ? 'text-stone-600' : 'text-stone-400'
                }`}>
                  {formatOperation(operation)}
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
