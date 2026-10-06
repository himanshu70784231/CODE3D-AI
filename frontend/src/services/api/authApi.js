import apiClient from './client';

export const authApi = {
  login: async (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },

  register: async (userData) => {
    return apiClient.post('/auth/register', userData);
  },

  guestLogin: async (customName = 'Guest Explorer') => {
    try {
      return await apiClient.post('/auth/guest', { name: customName });
    } catch {
      // Local fallback for offline mode
      return {
        success: true,
        user: {
          id: 'guest-' + Date.now(),
          username: customName.toLowerCase().replace(/\s+/g, '-'),
          fullName: customName,
          role: 'Guest Explorer',
          isGuest: true,
        },
      };
    }
  },

  getCurrentUser: async () => {
    return apiClient.get('/auth/me');
  },

  logout: async () => {
    return apiClient.post('/auth/logout', {});
  },
};

export default authApi;
