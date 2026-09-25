import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for Time Machine execution controls
 */
export function useExecutionTimeline(trace = []) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.5, 1, 1.5, 2
  const [breakpoints, setBreakpoints] = useState(new Set());
  const timerRef = useRef(null);

  const totalSteps = trace ? trace.length : 0;
  const currentStep = (trace && trace[currentStepIndex]) || null;
  const isAtStart = currentStepIndex === 0;
  const isAtEnd = currentStepIndex >= totalSteps - 1;

  // Toggle breakpoint on specific line
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

  // Execution State Machine (IDLE, READY, RUNNING, PAUSED, COMPLETED, STOPPED)
  const executionState = (() => {
    if (totalSteps === 0) return 'IDLE';
    if (isPlaying) return 'RUNNING';
    if (isAtEnd) return 'COMPLETED';
    if (currentStepIndex > 0) return 'PAUSED';
    return 'READY';
  })();

  // Auto-reset index whenever a new execution trace is loaded
  useEffect(() => {
    setCurrentStepIndex(0);
  }, [trace]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev < totalSteps - 1) {
        return prev + 1;
      }
      pause();
      return prev;
    });
  }, [totalSteps, pause]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });
  }, []);

  const goToStep = useCallback((index) => {
    const clamped = Math.max(0, Math.min(index, totalSteps - 1));
    setCurrentStepIndex(clamped);
  }, [totalSteps]);

  const play = useCallback(() => {
    setCurrentStepIndex((prev) => (prev >= totalSteps - 1 ? 0 : prev));
    setIsPlaying(true);
  }, [totalSteps]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const reset = useCallback(() => {
    pause();
    setCurrentStepIndex(0);
  }, [pause]);

  // Interval timer for playback with breakpoint checking
  useEffect(() => {
    if (isPlaying) {
      if (totalSteps <= 1) {
        setIsPlaying(false);
        return;
      }
      const intervalMs = Math.max(250, Math.round(1400 / playbackSpeed));
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          const nextIdx = prev + 1;
          const nextStepObj = trace && trace[nextIdx];
          // If next step hits a set breakpoint, pause on that line!
          if (nextStepObj && breakpoints.has(nextStepObj.lineNumber)) {
            setIsPlaying(false);
            return nextIdx;
          }
          return nextIdx;
        });
      }, intervalMs);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed, totalSteps, trace, breakpoints]);

  // Accumulate stdout output from step 0 up to currentStepIndex
  const cumulativeOutput = (() => {
    if (!trace || trace.length === 0) return [];
    const seen = new Set();
    const result = [];

    // First check if currentStep already has an accumulated array
    const currOut = currentStep?.output;
    if (Array.isArray(currOut) && currOut.length > 0) {
      // Check if previous steps also had outputs
      for (let i = 0; i <= currentStepIndex && i < trace.length; i++) {
        const stepOut = trace[i]?.output;
        if (Array.isArray(stepOut)) {
          for (const line of stepOut) {
            if (line && !seen.has(line)) {
              seen.add(line);
              result.push(line);
            }
          }
        }
      }
      return result.length > 0 ? result : currOut;
    }

    // Otherwise gather from all steps up to now
    for (let i = 0; i <= currentStepIndex && i < trace.length; i++) {
      const stepOut = trace[i]?.output;
      if (Array.isArray(stepOut)) {
        for (const line of stepOut) {
          if (line && !seen.has(line)) {
            seen.add(line);
            result.push(line);
          }
        }
      }
    }
    return result;
  })();

  // Extract the verified correct final output / return value
  const finalCorrectOutput = (() => {
    if (!trace || trace.length === 0) return null;
    const lastStep = trace[trace.length - 1];
    if (!lastStep) return null;

    // 1. Check variables for direct results
    const vars = lastStep.variables || {};
    if (vars.result !== undefined) return String(vars.result);
    if (vars.ans !== undefined) return String(vars.ans);
    if (vars.sorted !== undefined) return String(vars.sorted);
    if (vars.maxProfit !== undefined) return `Max Profit: ${vars.maxProfit}`;
    if (vars.minCoins !== undefined) return `Min Coins: ${vars.minCoins}`;
    if (vars.maxWater !== undefined) return `Max Water: ${vars.maxWater}`;
    if (vars.trappedWater !== undefined) return `Trapped Water: ${vars.trappedWater}`;
    if (vars.maxSum !== undefined) return `Max Subarray Sum: ${vars.maxSum}`;
    if (vars.totalTrapped !== undefined) return `Total Trapped: ${vars.totalTrapped}`;
    if (vars.total !== undefined) return `Total: ${vars.total}`;
    if (vars.sum !== undefined) return `Sum: ${vars.sum}`;

    // 2. Check last step output lines
    if (Array.isArray(lastStep.output) && lastStep.output.length > 0) {
      return lastStep.output[lastStep.output.length - 1];
    }

    // 3. Check dataStructureState label
    if (lastStep.dataStructureState?.label) {
      return lastStep.dataStructureState.label;
    }

    // 4. Return explanation or focusInfo
    return lastStep.dataStructureState?.focusInfo || 'Execution Completed Successfully';
  })();

  return {
    currentStepIndex,
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
    play,
    pause,
    togglePlay,
    reset,
    breakpoints,
    toggleBreakpoint,
    clearBreakpoints,
    executionState,
    cumulativeOutput,
    finalCorrectOutput,
  };
}
