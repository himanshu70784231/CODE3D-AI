/**
 * CODE3D-AI - Canonical Data Models & Problem Catalog
 * 
 * Compliant with Section 30 specification:
 * Single source of truth for Concepts and Practice Problems.
 */

import { ALGORITHM_CATALOG } from '../algorithms';
import { STRIVER_PROBLEMS } from '../utils/striverCatalog';
import { SAMPLE_PROGRAMS, DEFAULT_JAVA_CODE } from '../utils/sampleCodes';

export const CANONICAL_CATEGORIES = [
  'All',
  'Arrays',
  'Sorting',
  'Searching',
  'Linked Lists',
  'Stacks & Queues',
  'Trees & BST',
  'Heaps',
  'Graphs',
  'Dynamic Programming',
  'Recursion',
  'Two Pointers',
  'Sliding Window',
];

/**
 * Normalizes algorithm definition into canonical Concept schema
 */
export function toCanonicalConcept(algo) {
  if (!algo) return null;

  return {
    id: algo.id,
    title: algo.name || algo.title || algo.id,
    category: algo.category || 'Arrays',
    difficulty: algo.difficulty || 'Medium',
    description: algo.description || algo.summary || 'Step-by-step algorithm visualization.',
    language: algo.language || 'java',
    starterCode: algo.code || algo.starterCode || DEFAULT_JAVA_CODE,
    code: algo.code || algo.starterCode || DEFAULT_JAVA_CODE,
    timeComplexity: algo.timeComplexity || 'O(n)',
    spaceComplexity: algo.spaceComplexity || 'O(1)',
    visualizationType: algo.visualizerType || algo.visualizationType || 'array',
    defaultInput: algo.defaultInput,
  };
}

/**
 * Normalizes practice problem into canonical Problem schema
 */
export function toCanonicalProblem(prob) {
  if (!prob) return null;

  return {
    id: prob.id || prob.slug,
    title: prob.title || prob.name,
    source: prob.source || 'Striver SDE Sheet',
    difficulty: prob.difficulty || 'Medium',
    category: prob.category || 'Arrays',
    code: prob.code || prob.starterCode || DEFAULT_JAVA_CODE,
    constraints: prob.constraints || '1 <= N <= 10^5',
    visualizationType: prob.visualizationType || prob.visualizerType || 'array',
    timeComplexity: prob.timeComplexity || 'O(n)',
    spaceComplexity: prob.spaceComplexity || 'O(1)',
    description: prob.description || prob.problemStatement || 'Solve and visualize in 3D.',
  };
}

// Canonical Lists
export const CANONICAL_CONCEPTS = ALGORITHM_CATALOG.map(toCanonicalConcept);
export const CANONICAL_PROBLEMS = STRIVER_PROBLEMS.map(toCanonicalProblem);

export function getCanonicalConcept(id) {
  if (!id) return CANONICAL_CONCEPTS[0];
  const clean = String(id).toLowerCase().trim().replace(/[\s_]/g, '-');
  return (
    CANONICAL_CONCEPTS.find(
      (c) => c.id.toLowerCase() === clean || c.id.replace(/-/g, '') === clean.replace(/-/g, '')
    ) || CANONICAL_CONCEPTS[0]
  );
}

export function getCanonicalProblem(id) {
  if (!id) return CANONICAL_PROBLEMS[0];
  const clean = String(id).toLowerCase().trim();
  return (
    CANONICAL_PROBLEMS.find(
      (p) => p.id.toLowerCase() === clean || p.title.toLowerCase().replace(/[\s-]/g, '') === clean
    ) || null
  );
}

export function searchCatalog(query = '', category = 'All') {
  const q = query.toLowerCase().trim();

  return CANONICAL_CONCEPTS.filter((item) => {
    const matchesCat = category === 'All' || item.category.toLowerCase().includes(category.toLowerCase());
    const matchesQuery = !q || item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });
}
