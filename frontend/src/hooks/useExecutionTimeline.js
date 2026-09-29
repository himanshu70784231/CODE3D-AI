/**
 * CODE3D-AI - Execution Timeline Hook
 * 
 * Re-exports useExecution with strict clamping and stale-closure-free shortcuts.
 */
import { useExecution, SPEED_PRESETS } from './useExecution.js';

export { SPEED_PRESETS, useExecution };
export const useExecutionTimeline = useExecution;
export default useExecutionTimeline;
