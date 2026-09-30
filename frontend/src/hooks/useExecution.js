import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useStepShortcuts } from './useStepShortcuts.js';

export const SPEED_PRESETS = [0.25, 0.5, 1, 1.5, 2, 4];

/**
 * CODE3D-AI - Core Execution & Timeline State Machine
 * 
 * Features strict index bounds clamping [0, trace.length - 1], stale-closure-free
 * step shortcuts, and seamless playback timer management.
 */
export function useExecution(trace = [], isLoading = false, hasError = false) {
  const safeTrace = useMemo(() => (Array.isArray(trace) ? trace : []), [trace]);
  const totalSteps = safeTrace.length;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [breakpoints, setBreakpoints] = useState(() => new Set());

  const timerRef = useRef(null);
  const totalStepsRef = useRef(totalSteps);
  totalStepsRef.current = totalSteps;

  const traceRef = useRef(safeTrace);
  traceRef.current = safeTrace;

  // Strict clamp helper
  const clamp = useCallback((idx, len) => {
    if (typeof idx !== 'number' || Number.isNaN(idx)) return 0;
    if (len <= 0) return 0;
    return Math.max(0, Math.min(Math.floor(idx), len - 1));
  }, []);

  // Clamped safe active index
  const safeIndex = clamp(currentStepIndex, totalSteps);
  const currentStep = totalSteps > 0 ? safeTrace[safeIndex] : null;
  const isAtStart = safeIndex === 0;
  const isAtEnd = totalSteps > 0 && safeIndex >= totalSteps - 1;

  // Clear timer safely
  const clearPlaybackTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Whenever trace array identity changes, reset index cleanly and pause
  useEffect(() => {
    clearPlaybackTimer();
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, [safeTrace, clearPlaybackTimer]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    clearPlaybackTimer();
  }, [clearPlaybackTimer]);

  const play = useCallback(() => {
    if (totalStepsRef.current <= 1) return;
    clearPlaybackTimer();
    setCurrentStepIndex((prev) => (prev >= totalStepsRef.current - 1 ? 0 : prev));
    setIsPlaying(true);
  }, [clearPlaybackTimer]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      if (prev) {
        clearPlaybackTimer();
        return false;
      }
      if (totalStepsRef.current <= 1) return false;
      setCurrentStepIndex((curr) => (curr >= totalStepsRef.current - 1 ? 0 : curr));
      return true;
    });
  }, [clearPlaybackTimer]);

  const nextStep = useCallback(() => {
    pause();
    setCurrentStepIndex((prev) => {
      const max = totalStepsRef.current;
      if (max <= 0) return 0;
      return Math.min(prev + 1, max - 1);
    });
  }, [pause]);

  const prevStep = useCallback(() => {
    pause();
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, [pause]);

  const goToFirst = useCallback(() => {
    pause();
    setCurrentStepIndex(0);
  }, [pause]);

  const goToLast = useCallback(() => {
    pause();
    setCurrentStepIndex(() => {
      const max = totalStepsRef.current;
      return max > 0 ? max - 1 : 0;
    });
  }, [pause]);

  const goToStep = useCallback((index) => {
    pause();
    setCurrentStepIndex(() => clamp(index, totalStepsRef.current));
  }, [pause, clamp]);

  const reset = useCallback(() => {
    pause();
    setCurrentStepIndex(0);
  }, [pause]);

  const increaseSpeed = useCallback(() => {
    setPlaybackSpeed((curr) => {
      const idx = SPEED_PRESETS.indexOf(curr);
      if (idx === -1) return 1;
      return idx < SPEED_PRESETS.length - 1 ? SPEED_PRESETS[idx + 1] : curr;
    });
  }, []);

  const decreaseSpeed = useCallback(() => {
    setPlaybackSpeed((curr) => {
      const idx = SPEED_PRESETS.indexOf(curr);
      if (idx === -1) return 1;
      return idx > 0 ? SPEED_PRESETS[idx - 1] : curr;
    });
  }, []);

  const toggleBreakpoint = useCallback((lineNumber) => {
    if (!lineNumber) return;
    setBreakpoints((prev) => {
      const next = new Set(prev);
      if (next.has(lineNumber)) {
        next.delete(lineNumber);
      } else {
        next.add(lineNumber);
      }
      return next;
    });
  }, []);

  const clearBreakpoints = useCallback(() => {
    setBreakpoints(new Set());
  }, []);

  // Interval timer for playback with strict bound and breakpoint checks
  useEffect(() => {
    if (isPlaying) {
      if (totalSteps <= 1) {
        setIsPlaying(false);
        return;
      }
      const intervalMs = Math.max(80, Math.round(1000 / playbackSpeed));
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          const max = totalStepsRef.current;
          if (prev >= max - 1) {
            setIsPlaying(false);
            return Math.max(0, max - 1);
          }
          const nextIdx = prev + 1;
          const nextStepObj = traceRef.current && traceRef.current[nextIdx];
          if (nextStepObj && breakpoints.has(nextStepObj.lineNumber)) {
            setIsPlaying(false);
            return nextIdx;
          }
          return nextIdx;
        });
      }, intervalMs);
    }

    return () => {
      clearPlaybackTimer();
    };
  }, [isPlaying, playbackSpeed, totalSteps, breakpoints, clearPlaybackTimer]);

  // Integrated Keyboard Shortcuts (Eliminating stale closures)
  useStepShortcuts({
    onPlayPause: togglePlay,
    onNextStep: nextStep,
    onPrevStep: prevStep,
    onReset: reset,
    onFirstStep: goToFirst,
    onLastStep: goToLast,
    onIncreaseSpeed: increaseSpeed,
    onDecreaseSpeed: decreaseSpeed,
    enabled: true,
  });

  // State Machine indicator
  const executionState = useMemo(() => {
    if (hasError) return 'ERROR';
    if (isLoading) return 'LOADING';
    if (totalSteps === 0) return 'IDLE';
    if (isPlaying) return 'PLAYING';
    if (isAtEnd) return 'COMPLETED';
    if (safeIndex > 0) return 'PAUSED';
    return 'READY';
  }, [hasError, isLoading, totalSteps, isPlaying, isAtEnd, safeIndex]);

  // Cumulative standard output lines — always string[]
  const cumulativeOutput = useMemo(() => {
    if (totalSteps === 0) return [];
    if (currentStep && Array.isArray(currentStep.output)) {
      return currentStep.output.map(item => typeof item === 'string' ? item : String(item));
    }
    const result = [];
    for (let i = 0; i <= safeIndex && i < totalSteps; i++) {
      const stepOut = safeTrace[i]?.output;
      if (Array.isArray(stepOut)) {
        for (const line of stepOut) {
          const lineStr = typeof line === 'string' ? line : String(line);
          if (lineStr.trim()) {
            result.push(lineStr);
          }
        }
      }
    }
    return result;
  }, [totalSteps, currentStep, safeIndex, safeTrace]);

  // Verified correct final output — always a string or null
  const finalCorrectOutput = useMemo(() => {
    if (totalSteps === 0) return null;
    const lastStep = safeTrace[totalSteps - 1];
    if (!lastStep) return null;

    if (Array.isArray(lastStep.output) && lastStep.output.length > 0) {
      return lastStep.output.map(item => 
        typeof item === 'string' ? item : (typeof item === 'number' ? String(item) : JSON.stringify(item))
      ).join('\n');
    }
    if (lastStep.returnValue !== undefined && lastStep.returnValue !== null) {
      if (typeof lastStep.returnValue === 'object') {
        try { return JSON.stringify(lastStep.returnValue); } catch { return '[Object]'; }
      }
      return String(lastStep.returnValue);
    }
    if (lastStep.dataStructureState?.values) {
      const vals = lastStep.dataStructureState.values;
      return `[${Array.isArray(vals) ? vals.join(', ') : String(vals)}]`;
    }
    return null;
  }, [totalSteps, safeTrace]);

  return {
    currentStepIndex: safeIndex,
    currentStep,
    totalSteps,
    isPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    isAtStart,
    isAtEnd,
    nextStep,
    prevStep,
    goToStep,
    goToFirst,
    goToLast,
    play,
    pause,
    togglePlay,
    reset,
    increaseSpeed,
    decreaseSpeed,
    breakpoints,
    toggleBreakpoint,
    clearBreakpoints,
    executionState,
    cumulativeOutput,
    finalCorrectOutput,
  };
}

export default useExecution;
