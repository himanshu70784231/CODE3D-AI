/**
 * Centralized API Client for CODE3D-AI Frontend
 * Communicates with the Node.js/Express backend via VITE_API_URL.
 * Supports HttpOnly cookie credentials and resilient fallbacks.
 */

const LIVE_RENDER_URL = 'https://code3d-ai.onrender.com/api';
const SPRING_LOCAL_URL = 'http://localhost:8080/api';
const DEFAULT_LOCAL_URL = 'http://localhost:8080/api';

const isLocalhost = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export let API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  (isLocalhost ? SPRING_LOCAL_URL : LIVE_RENDER_URL);

/**
 * Standardized HTTP request function
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const token = typeof window !== 'undefined' ? localStorage.getItem('code3d_auth_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const fetchOptions = {
    ...options,
    headers,
    credentials: 'include', // Automatically send/receive HttpOnly session cookies
  };

  try {
    const res = await fetch(url, fetchOptions);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      let errorMsg = data?.message || data?.error;
      if (!errorMsg) {
        if (res.status === 401) errorMsg = 'Invalid username or password.';
        else if (res.status === 403) errorMsg = 'Access denied. Please log in.';
        else if (res.status === 409) errorMsg = 'An account with these details already exists.';
        else if (res.status === 400) errorMsg = 'Invalid request parameters.';
        else if (res.status >= 500) errorMsg = 'Server is currently experiencing issues. Please try again shortly.';
        else errorMsg = `Request failed (HTTP ${res.status})`;
      }
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status) throw err;
    // Network / offline failure
    throw new Error('Unable to connect to CODE3D backend server. Please verify the service is running.');
  }
}

