/**
 * CODE3D-AI — Safe Rendering Utilities
 * 
 * Prevents React Error #31 by ensuring values rendered in JSX are always
 * valid React children (strings, numbers, null, or React elements).
 * 
 * React error #31: "Objects are not valid as a React child."
 */

import { isValidElement } from 'react';

/**
 * Converts any value to a safe, renderable string.
 * - string → returned directly
 * - number → returned directly (React renders numbers)
 * - boolean → "true" / "false"
 * - null/undefined → fallback (default: "—")
 * - Error → error.message
 * - React element → returned as-is
 * - Array → comma-separated formatted values
 * - Object → compact JSON string
 * - Function → "[Function]"
 */
export function safeString(value, fallback = '—') {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'function') return '[Function]';
  if (value instanceof Error) return value.message || 'Unknown error';
  if (isValidElement(value)) return value; // React element — safe to render
  if (Array.isArray(value)) {
    return '[' + value.map(v => safeString(v, 'null')).join(', ') + ']';
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '[Object]';
    }
  }
  return String(value);
}

/**
 * Like safeString but specifically for display contexts where
 * we want human-readable output rather than JSON.
 */
export function safeDisplay(value, fallback = '—') {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value || fallback;
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return 'NaN';
    if (!Number.isFinite(value)) return value > 0 ? '∞' : '-∞';
    return String(value);
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'function') return '[Function]';
  if (value instanceof Error) return value.message || 'Error occurred';
  if (isValidElement(value)) return value;
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return '[' + value.map(v => safeDisplay(v, 'null')).join(', ') + ']';
  }
  if (typeof value === 'object') {
    try {
      const str = JSON.stringify(value, null, 0);
      return str.length > 200 ? str.slice(0, 197) + '...' : str;
    } catch {
      return '[Object]';
    }
  }
  return String(value);
}

/**
 * Formats a value for JSON-style display with indentation.
 * Always returns a string.
 */
export function safeJSON(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

/**
 * Extracts a safe error message from any error-like value.
 * Always returns a string.
 */
export function safeErrorMessage(error, fallback = 'An unexpected error occurred.') {
  if (!error) return fallback;
  if (typeof error === 'string') return error || fallback;
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === 'object') {
    return error.message || error.error || error.msg || safeDisplay(error, fallback);
  }
  return String(error) || fallback;
}

/**
 * Validates a 3D position vector. Returns a safe default if invalid.
 */
export function validVector(pos, defaultPos = [0, 0, 0]) {
  if (!Array.isArray(pos) || pos.length < 3) return defaultPos;
  for (let i = 0; i < 3; i++) {
    if (typeof pos[i] !== 'number' || !Number.isFinite(pos[i])) return defaultPos;
  }
  return pos;
}

/**
 * Validates a 3D scale vector. Returns a safe default if invalid.
 */
export function validScale(scale, defaultScale = [1, 1, 1]) {
  if (!Array.isArray(scale) || scale.length < 3) return defaultScale;
  for (let i = 0; i < 3; i++) {
    if (typeof scale[i] !== 'number' || !Number.isFinite(scale[i]) || scale[i] <= 0) return defaultScale;
  }
  return scale;
}

/**
 * Validates a CSS/Three.js color string. Returns a safe default if invalid.
 */
export function validColor(color, defaultColor = '#38bdf8') {
  if (!color || typeof color !== 'string') return defaultColor;
  // Accept hex, rgb, hsl, named colors
  if (/^#[0-9a-fA-F]{3,8}$/.test(color)) return color;
  if (/^(rgb|hsl|oklch|lch)/.test(color)) return color;
  // Named colors — allow anything that doesn't look suspicious
  if (/^[a-zA-Z]+$/.test(color)) return color;
  return defaultColor;
}

/**
 * Safely checks if a collection (array, string, set, object) includes an item.
 * Never throws "X.includes is not a function".
 */
export function safeIncludes(collection, item) {
  if (collection === null || collection === undefined) return false;
  if (Array.isArray(collection)) return collection.includes(item);
  if (typeof collection === 'string') return collection.includes(String(item));
  if (collection instanceof Set) return collection.has(item);
  if (typeof collection === 'object') {
    try {
      return Object.values(collection).includes(item);
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Guarantees a safe array. If input is not an array, returns fallback or empty array.
 */
export function safeArray(val, fallback = []) {
  return Array.isArray(val) ? val : fallback;
}

/**
 * Formats AST execution operation objects into readable human/developer strings.
 * Prevents React Error #31 when operation objects { type, target, value } are rendered in JSX.
 */
export function formatOperation(op, fallback = 'Step Execution') {
  if (!op) return fallback;
  if (typeof op === 'string') return op;
  if (typeof op === 'object') {
    if (op.type && op.target !== undefined) {
      const valStr = op.value !== undefined ? ` = ${safeString(op.value)}` : '';
      return `${op.type}: ${op.target}${valStr}`;
    }
    if (op.type) return String(op.type);
    if (op.name) return String(op.name);
    return safeString(op, fallback);
  }
  return String(op);
}

