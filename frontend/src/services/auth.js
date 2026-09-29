/**
 * CODE3D-AI Authentication Service Facade
 * Delegates to the unified authService abstraction.
 */
export {
  login,
  login as loginUser,
  register,
  register as registerUser,
  logout,
  logout as logoutUser,
  getCurrentUser,
  getStoredUser,
  getAuthToken,
} from './authService.js';
