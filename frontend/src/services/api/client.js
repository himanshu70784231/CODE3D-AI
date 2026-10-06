/**
 * CODE3D-AI - Centralized API HTTP Client
 * 
 * Compliant with Section 20 specification:
 * - Uses VITE_BACKEND_URL with resilient local fallbacks
 * - Automatic timeout abort controller
 * - Standardized error envelopes
 * - Token authorization + HttpOnly credentials
 */

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const DEFAULT_URL = isLocalhost ? 'http://localhost:8080/api' : 'https://code3d-ai.onrender.com/api';

const rawUrl =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  DEFAULT_URL;

export const API_BASE_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

export class ApiError extends Error {
  constructor(message, status = 500, data = null, isOffline = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isOffline = isOffline;
  }
}

/**
 * Core Request Dispatcher
 */
export async function request(endpoint, options = {}) {
  const {
    timeout = 10000,
    headers = {},
    params,
    ...fetchOptions
  } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const search = new URLSearchParams(params).toString();
    if (search) {
      url += (url.includes('?') ? '&' : '?') + search;
    }
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('code3d_auth_token') : null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
      credentials: 'include',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      let message = data?.message || data?.error;
      if (!message) {
        if (res.status === 401) message = 'Session expired. Please log in.';
        else if (res.status === 403) message = 'Access denied.';
        else if (res.status === 404) message = 'Requested resource not found.';
        else if (res.status >= 500) message = 'Server experienced an error. Please try again.';
        else message = `Request failed with code ${res.status}`;
      }
      throw new ApiError(message, res.status, data, false);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof ApiError) {
      throw err;
    }

    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out. Backend took too long to respond.', 408, null, false);
    }

    // Network disconnection or server down
    throw new ApiError(
      'Unable to connect to CODE3D backend server. Running in local mode.',
      503,
      null,
      true
    );
  }
}

export const apiClient = {
  get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => request(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: (endpoint, body, options) => request(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),
  delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options }),
};

export default apiClient;
