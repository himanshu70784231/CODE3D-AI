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
  (isLocalhost ? SPRING_LOCAL_URL : LIVE_RENDER_URL);

/**
 * Standardized HTTP request function
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
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
      const errorMsg = data?.message || data?.error || `HTTP ${res.status}: ${res.statusText}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // If local backend is unreachable in dev, log clear notice
    if (err.status) throw err;

    console.warn(`API call to ${url} failed network connection:`, err.message);
    throw new Error(`Cannot connect to CODE3D backend server at ${API_BASE_URL}. Ensure server is running on port 5000.`);
  }
}
