/**
 * CODE3D-AI - Sample Programs & Algorithms Catalog
 * Standard reference data for execution and visualization.
 */
import { DEFAULT_JAVA_CODE, SAMPLE_PROGRAMS, LANGUAGE_DEFAULTS, CURRICULUM_CATEGORIES } from '../utils/sampleCodes.js';

export {
  DEFAULT_JAVA_CODE,
  SAMPLE_PROGRAMS,
  LANGUAGE_DEFAULTS,
  CURRICULUM_CATEGORIES,
};

export const DEFAULT_SAMPLE_PROGRAM = {
  id: 'array-loop',
  title: 'Array Traversal & Iteration',
  category: 'Arrays & Matrices',
  description: 'Iterate through an array of integers and observe loop variables, condition evaluations, and 3D memory cells.',
  difficulty: 'Beginner',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  language: 'java',
  code: DEFAULT_JAVA_CODE,
};

export default DEFAULT_SAMPLE_PROGRAM;
