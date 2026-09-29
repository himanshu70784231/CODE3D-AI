/**
 * CODE3D-AI - Array Loop Trace Data & Generator
 * Provides deterministic execution traces for array traversal and iteration.
 */
import { generateArrayLoopTrace } from '../engine/arrayLoopTrace.js';

export { generateArrayLoopTrace };

export const defaultArrayLoopTrace = generateArrayLoopTrace([10, 20, 30, 40]);

export default defaultArrayLoopTrace;
