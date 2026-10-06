import apiClient from './client';

export const executionApi = {
  /**
   * Send code to backend execution engine (Spring Boot / Node runner)
   */
  executeCode: async ({ code, language = 'java', input = '', archetype = null }) => {
    return apiClient.post('/executions/run', {
      code,
      language,
      input,
      archetype,
    });
  },

  /**
   * Ping backend to check availability
   */
  checkHealth: async () => {
    try {
      const res = await apiClient.get('/health', { timeout: 3500 });
      return res?.status === 'UP' || res?.status === 'ok' || res?.success === true;
    } catch {
      return false;
    }
  },

  /**
   * Fast syntax validation check
   */
  validateSyntax: async (code, language) => {
    return apiClient.post('/executions/validate', { code, language });
  },
};

export default executionApi;
