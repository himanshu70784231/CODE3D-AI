import { apiRequest } from './api.js';

const AUTH_USER_KEY = 'code3d_auth_user';
const AUTH_TOKEN_KEY = 'code3d_auth_token';

/**
 * Extracts only safe, public user profile properties.
 * Never includes passwords or sensitive secrets.
 */
function sanitizeUser(rawUser) {
  if (!rawUser) return null;
  return {
    id: rawUser.id || rawUser.userId,
    username: rawUser.username || '',
    email: rawUser.email || '',
    fullName: rawUser.fullName || rawUser.name || rawUser.username || '',
    role: rawUser.role || 'Student Developer',
    avatarUrl: rawUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };
}

/**
 * Synchronously retrieves cached safe user from localStorage for instant UI rendering.
 */
export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('Failed to parse cached auth user:', err);
    return null;
  }
}

/**
 * Synchronously retrieves cached auth token.
 */
export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Authenticates user credentials with the backend.
 * Accepts username or email in any naming format and passes both to the backend.
 */
export async function login({ identifier, username, email, password }) {
  const cleanId = (identifier || username || email || '').trim();
  const cleanPass = (password || '').trim();

  if (!cleanId) {
    return { success: false, message: 'Username or email is required' };
  }
  if (!cleanPass) {
    return { success: false, message: 'Password is required' };
  }

  try {
    const payload = {
      username: cleanId,
      email: cleanId,
      usernameOrEmail: cleanId,
      password: cleanPass,
    };

    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res && res.success) {
      const user = sanitizeUser(res.user || res.data?.user || res);
      if (res.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, res.token);
      }
      if (user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      }
      return { success: true, user, token: res.token };
    }

    return { success: false, message: res?.message || 'Invalid username or password' };
  } catch (err) {
    return { success: false, message: err.message || 'Login failed' };
  }
}

/**
 * Registers a new user account with the backend.
 */
export async function register({ username, email, password, fullName, role }) {
  const cleanUsername = (username || '').trim();
  const cleanEmail = (email || '').trim();
  const cleanPass = (password || '').trim();

  if (!cleanUsername) {
    return { success: false, message: 'Username is required' };
  }
  if (!cleanEmail) {
    return { success: false, message: 'Email is required' };
  }
  if (!cleanPass) {
    return { success: false, message: 'Password is required' };
  }
  if (cleanPass.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long' };
  }

  try {
    const payload = {
      username: cleanUsername,
      email: cleanEmail,
      password: cleanPass,
      fullName: (fullName || cleanUsername).trim(),
      role: (role || 'Student Developer').trim(),
    };

    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res && res.success) {
      const user = sanitizeUser(res.user || res.data?.user || res);
      if (res.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, res.token);
      }
      if (user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      }
      return { success: true, user, token: res.token };
    }

    return { success: false, message: res?.message || 'Registration failed' };
  } catch (err) {
    return { success: false, message: err.message || 'Registration failed' };
  }
}

/**
 * Logs out the current user, clearing session storage and notifying backend.
 */
export async function logout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }
  return { success: true };
}

/**
 * Fetches the currently authenticated user from the backend.
 */
export async function getCurrentUser() {
  const token = getAuthToken();
  const storedUser = getStoredUser();

  try {
    const res = await apiRequest('/auth/me', {
      method: 'GET',
    });

    if (res && res.success && (res.user || res.data)) {
      const user = sanitizeUser(res.user || res.data);
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      }
      return { success: true, user };
    }

    // If backend returns unauthorized or unsuccessful, clear cached user
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    return { success: false, user: null };
  } catch (err) {
    // If backend is unreachable or offline, preserve safe local session
    if (storedUser) {
      return { success: true, user: storedUser };
    }
    return { success: false, user: null };
  }
}
