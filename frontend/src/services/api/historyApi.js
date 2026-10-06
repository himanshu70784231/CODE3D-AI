import apiClient from './client';

export const historyApi = {
  getHistory: async () => {
    try {
      const res = await apiClient.get('/history');
      if (res?.success && res.history) return res.history;
    } catch {
      // Offline fallback
    }
    return JSON.parse(localStorage.getItem('code3d_execution_history') || '[]');
  },

  recordExecution: async (executionRecord) => {
    // Record to local storage
    const localHistory = JSON.parse(localStorage.getItem('code3d_execution_history') || '[]');
    const newEntry = {
      ...executionRecord,
      id: executionRecord.id || `exec-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    localHistory.unshift(newEntry);
    localStorage.setItem('code3d_execution_history', JSON.stringify(localHistory.slice(0, 100)));

    try {
      return await apiClient.post('/history/record', newEntry);
    } catch {
      return { success: true, localOnly: true, record: newEntry };
    }
  },

  saveProgram: async (program) => {
    const saved = JSON.parse(localStorage.getItem('code3d_saved_programs') || '[]');
    const newProgram = {
      ...program,
      id: program.id || `prog-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    saved.unshift(newProgram);
    localStorage.setItem('code3d_saved_programs', JSON.stringify(saved));

    try {
      return await apiClient.post('/programs/save', newProgram);
    } catch {
      return { success: true, localOnly: true, program: newProgram };
    }
  },

  getSavedPrograms: async () => {
    try {
      const res = await apiClient.get('/programs/saved');
      if (res?.success && res.programs) return res.programs;
    } catch {
      // Offline fallback
    }
    return JSON.parse(localStorage.getItem('code3d_saved_programs') || '[]');
  },
};

export default historyApi;
