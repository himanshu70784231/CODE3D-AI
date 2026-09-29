import { useEffect, useRef } from 'react';

/**
 * CODE3D-AI - Resilient Step Shortcuts Hook
 * 
 * Prevents stale closures by maintaining a fresh ref to handlers while
 * binding event listeners safely. Guarantees immediate response to keyboard inputs.
 */
export function useStepShortcuts({
  onPlayPause,
  onNextStep,
  onPrevStep,
  onReset,
  onFirstStep,
  onLastStep,
  onIncreaseSpeed,
  onDecreaseSpeed,
  enabled = true,
} = {}) {
  const handlersRef = useRef({
    onPlayPause,
    onNextStep,
    onPrevStep,
    onReset,
    onFirstStep,
    onLastStep,
    onIncreaseSpeed,
    onDecreaseSpeed,
  });

  // Always keep handlers ref up to date to eliminate stale closures
  useEffect(() => {
    handlersRef.current = {
      onPlayPause,
      onNextStep,
      onPrevStep,
      onReset,
      onFirstStep,
      onLastStep,
      onIncreaseSpeed,
      onDecreaseSpeed,
    };
  });

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      const target = e.target;
      const isInput = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable ||
        target.closest?.('.monaco-editor') ||
        target.closest?.('input') ||
        target.closest?.('textarea')
      );

      if (isInput) return;

      const handlers = handlersRef.current;

      if (e.code === 'Space') {
        e.preventDefault();
        handlers.onPlayPause?.();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handlers.onNextStep?.();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlers.onPrevStep?.();
      } else if (e.code === 'Home') {
        e.preventDefault();
        handlers.onFirstStep?.();
      } else if (e.code === 'End') {
        e.preventDefault();
        handlers.onLastStep?.();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handlers.onReset?.();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handlers.onIncreaseSpeed?.();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handlers.onDecreaseSpeed?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled]);
}

export default useStepShortcuts;
