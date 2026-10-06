import apiClient from './client';
import { STRIVER_PROBLEMS } from '../../utils/striverCatalog';
import { ALGORITHM_CATALOG } from '../../algorithms';

export const dsaApi = {
  getTopics: async () => {
    try {
      const res = await apiClient.get('/dsa/topics');
      if (res?.success && res.topics) return res.topics;
    } catch {
      // Offline fallback
    }
    return ALGORITHM_CATALOG;
  },

  getProblemBySlug: async (slug) => {
    try {
      const res = await apiClient.get(`/dsa/problems/${slug}`);
      if (res?.success && res.problem) return res.problem;
    } catch {
      // Offline fallback
    }
    return STRIVER_PROBLEMS.find((p) => p.id === slug || p.slug === slug) || null;
  },

  getStriverProblems: async () => {
    try {
      const res = await apiClient.get('/dsa/striver');
      if (res?.success && res.problems) return res.problems;
    } catch {
      // Offline fallback
    }
    return STRIVER_PROBLEMS;
  },
};

export default dsaApi;
