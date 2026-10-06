import React, { useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { IconButton, Badge } from '../../components/common';

const SPEEDS = [0.25, 0.5, 1, 1.5, 2];

/**
 * ExecutionTimelineBar Component
 * 
 * Compliant with Section 7 specification:
 * - Controls: First, Previous, Play/Pause, Next, Last, Reset, Speed
 * - Step scrubber & jump controls
 * - Fully synchronized with Monaco, 3D, and State Panel
 */
export default function ExecutionTimelineBar({
  currentStepIndex = 0,
  totalSteps = 1,
  currentStep = null,
  isPlaying = false,
  playbackSpeed = 1,
  onChangePlaybackSpeed,
  onFirstStep,
  onPrevStep,
  onPlay,
  onPause,
  onNextStep,
  onLastStep,
  onReset,
  onGoToStep,
  isAtStart = true,
  isAtEnd = false,
  className = '',
}) {
  const { isBright } = useTheme();

  // Keyboard shortcut listener: Left Arrow (prev), Right Arrow (next), Space (play/pause)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in Monaco editor or input field
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.classList.contains('monaco-editor')) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) onPause();
        else onPlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        onPrevStep();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        onNextStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, onPlay, onPause, onPrevStep, onNextStep]);

  const currentStepNum = currentStepIndex + 1;
  const progressPercent = totalSteps > 1 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0;
  const operation = currentStep?.operation || currentStep?.eventType || 'EXECUTE';

  return (
    <div
      className={`h-12 px-3 border-t flex items-center justify-between select-none shrink-0 gap-3 ${
        isBright
          ? 'bg-stone-50 border-stone-200 text-stone-900'
          : 'bg-[#13161b] border-stone-850 text-stone-100'
      } ${className}`}
    >
      {/* Left: Step Playback Controls */}
      <div className="flex items-center gap-1 shrink-0">
        <IconButton
          icon={SkipBack}
          size="sm"
          disabled={isAtStart}
          onClick={onFirstStep}
          title="First Step"
          ariaLabel="First Step"
        />

        <IconButton
          icon={ChevronLeft}
          size="sm"
          disabled={isAtStart}
          onClick={onPrevStep}
          title="Previous Step (Left Arrow)"
          ariaLabel="Previous Step"
        />

        <button
          type="button"
          onClick={isPlaying ? onPause : onPlay}
          className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center transition shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
          title={isPlaying ? 'Pause (Space)' : 'Play Timeline (Space)'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="ml-0.5" />}
        </button>

        <IconButton
          icon={ChevronRight}
          size="sm"
          disabled={isAtEnd}
          onClick={onNextStep}
          title="Next Step (Right Arrow)"
          ariaLabel="Next Step"
        />

        <IconButton
          icon={SkipForward}
          size="sm"
          disabled={isAtEnd}
          onClick={onLastStep}
          title="Last Step"
          ariaLabel="Last Step"
        />

        <IconButton
          icon={RotateCcw}
          size="sm"
          onClick={onReset}
          title="Reset to Step 1"
          ariaLabel="Reset to Step 1"
        />
      </div>

      {/* Center: Interactive Scrubber Slider & Step Details */}
      <div className="flex-1 max-w-xl flex items-center gap-3 px-2">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono font-semibold">
            {currentStepNum}
            <span className="text-stone-500 font-normal"> / {totalSteps}</span>
          </span>
          <Badge variant="amber" size="xs" mono>
            {operation}
          </Badge>
        </div>

        {/* Range Slider Track */}
        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStepIndex}
            onChange={(e) => onGoToStep(Number(e.target.value))}
            className="w-full h-1.5 bg-stone-700/60 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
            aria-label="Timeline Scrubber"
          />
        </div>
      </div>

      {/* Right: Playback Speed Switcher */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[11px] font-mono text-stone-500 mr-1 hidden sm:inline">Speed:</span>
        <div className="flex items-center gap-0.5 rounded-lg p-0.5 border border-stone-800 bg-stone-900/60">
          {SPEEDS.map((spd) => {
            const isSelected = playbackSpeed === spd;
            return (
              <button
                key={spd}
                type="button"
                onClick={() => onChangePlaybackSpeed(spd)}
                className={`px-1.5 py-0.5 text-[11px] font-mono rounded transition cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : isBright
                      ? 'text-stone-600 hover:text-stone-900'
                      : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {spd}x
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
