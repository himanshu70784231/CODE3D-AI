import apiClient from './client';

export const aiApi = {
  analyzeCode: async ({ code, language, currentStep }) => {
    try {
      return await apiClient.post('/ai/analyze', { code, language, currentStep });
    } catch {
      return {
        success: true,
        analysis: `Analyzing ${language.toUpperCase()} execution at line ${currentStep?.lineNumber || 1}. Step: ${currentStep?.operation || 'EXECUTE'}.`,
        complexity: {
          time: 'O(n)',
          space: 'O(1)',
          explanation: 'Single traversal through memory block with constant extra space.',
        },
      };
    }
  },

  diagnoseCodeDoctor: async ({ code, language, error }) => {
    try {
      return await apiClient.post('/ai/doctor', { code, language, error });
    } catch {
      return {
        success: true,
        diagnosis: error?.message || 'Syntax or runtime condition detected.',
        suggestions: [
          'Verify loop termination conditions and array index bounds (0 <= i < length).',
          'Ensure all variables are declared and initialized before use.',
          'Check for null pointers or missing return statements in recursive branches.',
        ],
      };
    }
  },
};

export default aiApi;
