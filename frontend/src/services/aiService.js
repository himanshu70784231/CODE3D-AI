/**
 * CODE3D-AI - Standardized AI Service Interface
 * 
 * Secure frontend AI dispatcher communicating with the backend /api/ai/explain endpoint.
 * Private API keys (e.g. GROQ_API_KEY) remain strictly server-side.
 */

import { apiRequest } from './api.js';

export class AIService {
  static async explainCode(code, language = 'java') {
    try {
      const data = await apiRequest('/ai/explain', {
        method: 'POST',
        body: JSON.stringify({
          action: 'EXPLAIN_CODE',
          code,
          language,
          question: 'Explain this code',
          level: 'Beginner',
          output: [],
          history: [],
        }),
      });
      return data;
    } catch (err) {
      return { configured: true, error: err.message };
    }
  }

  static async explainStep(step, code, language = 'java') {
    try {
      const data = await apiRequest('/ai/explain', {
        method: 'POST',
        body: JSON.stringify({
          action: 'EXPLAIN_STEP',
          code,
          language,
          currentStep: step,
          level: 'Beginner',
          output: [],
          history: [],
        }),
      });
      return data;
    } catch (err) {
      return { configured: true, error: err.message };
    }
  }

  static async explainError(error, code, language = 'java') {
    try {
      const data = await apiRequest('/ai/explain', {
        method: 'POST',
        body: JSON.stringify({
          action: 'DEBUG_CODE',
          code,
          language,
          error,
          question: 'Find errors in my code',
          level: 'Beginner',
          output: [],
          history: [],
        }),
      });
      return data;
    } catch (err) {
      return { configured: true, error: err.message };
    }
  }

  static async generateHints(problemTitle, code) {
    try {
      const data = await apiRequest('/ai/explain', {
        method: 'POST',
        body: JSON.stringify({
          action: 'CHAT',
          code,
          language: 'java',
          question: `Give hints for solving: ${problemTitle}`,
          level: 'Beginner',
          output: [],
          history: [],
        }),
      });
      return data;
    } catch (err) {
      return { configured: true, error: err.message };
    }
  }

  static async identifyAlgorithm(code) {
    try {
      const data = await apiRequest('/ai/explain', {
        method: 'POST',
        body: JSON.stringify({
          action: 'ANALYZE_COMPLEXITY',
          code,
          language: 'java',
          question: 'Analyze algorithm and complexity',
          level: 'Beginner',
          output: [],
          history: [],
        }),
      });
      return data;
    } catch (err) {
      return { configured: true, error: err.message };
    }
  }
}
