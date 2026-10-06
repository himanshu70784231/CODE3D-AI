import apiClient from './client';

export const quizApi = {
  getQuestions: async (topic = 'arrays') => {
    try {
      const res = await apiClient.get('/quiz/questions', { params: { topic } });
      if (res?.success && res.questions) return res.questions;
    } catch {
      // Local fallback
    }
    return null;
  },

  submitResult: async (payload) => {
    try {
      return await apiClient.post('/quiz/submit', payload);
    } catch {
      // Save locally in offline mode
      const history = JSON.parse(localStorage.getItem('code3d_quiz_history') || '[]');
      history.unshift({
        ...payload,
        id: 'quiz-' + Date.now(),
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('code3d_quiz_history', JSON.stringify(history.slice(0, 50)));
      return { success: true, localOnly: true };
    }
  },

  getHistory: async () => {
    try {
      const res = await apiClient.get('/quiz/history');
      if (res?.success && res.history) return res.history;
    } catch {
      // Offline fallback
    }
    return JSON.parse(localStorage.getItem('code3d_quiz_history') || '[]');
  },
};

export default quizApi;
