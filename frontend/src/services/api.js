/**
 * Centralized API Client for CODE3D-AI Frontend
 * Communicates with the backend via VITE_BACKEND_URL or VITE_API_URL.
 * Supports HttpOnly cookie credentials, duplicate /api/api path prevention,
 * and resilient live Render backend connections.
 */

const LOCAL_BACKEND_URL = 'http://localhost:5000/api';
const LIVE_RENDER_URL = 'https://code3d-ai.onrender.com/api';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

function resolveRawBaseUrl() {
  const envUrl = (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
    ''
  ).trim();

  if (envUrl) return envUrl;
  return isLocalhost ? LOCAL_BACKEND_URL : LIVE_RENDER_URL;
}

/**
 * Builds a standardized API URL.
 * Automatically ensures the /api namespace while preventing duplicate /api/api paths.
 */
export function buildApiUrl(baseUrl, endpoint) {
  const rawBase = String(baseUrl || '').trim().replace(/\/+$/, '');
  const rawEndpoint = String(endpoint || '').trim();

  if (/^https?:\/\//i.test(rawEndpoint)) {
    return rawEndpoint;
  }

  const cleanEndpoint = rawEndpoint.startsWith('/') ? rawEndpoint : `/${rawEndpoint}`;

  // If base already ends with /api (case-insensitive)
  if (/\/api$/i.test(rawBase)) {
    // If endpoint also starts with /api/, strip the duplicate /api
    if (/^\/api\//i.test(cleanEndpoint)) {
      return `${rawBase}${cleanEndpoint.slice(4)}`;
    }
    if (cleanEndpoint.toLowerCase() === '/api') {
      return rawBase;
    }
    return `${rawBase}${cleanEndpoint}`;
  }

  // Base does NOT end with /api
  // If endpoint already starts with /api, join directly
  if (/^\/api(\/|$)/i.test(cleanEndpoint)) {
    return `${rawBase}${cleanEndpoint}`;
  }

  // If neither has /api, add /api prefix
  return `${rawBase}/api${cleanEndpoint}`;
}

export const API_BASE_URL = resolveRawBaseUrl();

/**
 * Standardized HTTP request function
 */
export async function apiRequest(endpoint, options = {}) {
  const url = buildApiUrl(API_BASE_URL, endpoint);

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
      const errorMsg =
        data?.message ||
        data?.error?.message ||
        data?.error ||
        `HTTP ${res.status}: ${res.statusText}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status) throw err;

    console.warn(`API call to ${url} failed network connection:`, err.message);
    throw new Error(
      `Cannot connect to CODE3D backend server at ${API_BASE_URL}. Ensure server is running.`
    );
  }
}
