/**
 * CODE3D-AI - Execution Service
 * Unified service coordinating syntax validation, AST analysis, backend compilation,
 * and deterministic client-side simulation.
 */
import { executeProgram as apiExecuteProgram, analyzeCode as apiAnalyzeCode, checkBackendHealth as apiCheckHealth, recordExecutionHistory as apiRecordHistory } from './apiService.js';
import { getExecutionTrace as simGetTrace, extractNumbersFromCode as simExtractNumbers } from './executionSimulator.js';
import { validateSourceCode as simValidateCode } from './codeValidator.js';
import { executionManager } from '../execution/index.js';

export const checkBackendHealth = apiCheckHealth;
export const recordExecutionHistory = apiRecordHistory;
export const extractNumbersFromCode = simExtractNumbers;
export const validateSourceCode = simValidateCode;

/**
 * Run program code with backend fallback to client AST simulator
 */
export async function executeCode({ code, language = 'java', input = '', archetype = null, preferBackend = false }) {
  try {
    const res = await executionManager.run({
      code,
      language,
      input,
      archetype,
      preferBackend,
    });
    return res;
  } catch (err) {
    // Graceful fallback to simulator
    const fallbackTrace = simGetTrace(code, language, input, archetype);
    return {
      success: true,
      steps: fallbackTrace,
      language,
      totalSteps: fallbackTrace.length,
      fallback: true,
    };
  }
}

/**
 * Get deterministic execution trace for visualization
 */
export function getExecutionTrace(code, language = 'java', input = '', archetype = null) {
  return simGetTrace(code, language, input, archetype);
}

/**
 * Analyze code complexity
 */
export async function analyzeComplexity(code, language = 'java') {
  try {
    const analysis = await apiAnalyzeCode(code, language);
    return analysis;
  } catch {
    return {
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
    };
  }
}

export default {
  checkBackendHealth,
  executeCode,
  getExecutionTrace,
  validateSourceCode,
  extractNumbersFromCode,
  analyzeComplexity,
  recordExecutionHistory,
};
