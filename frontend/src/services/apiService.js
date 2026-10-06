/**
 * API Client connecting the CODE3D AI frontend to the Spring Boot REST backend.
 */

import { solvePersonalProblem, correctPersonalCode } from './personalProblemSolver';
import { analyzeAlgorithmCode, generateIntelligentAiTutorAnswer } from './algorithmicTutorEngine';

const LIVE_RENDER_URL = 'https://code3d-ai.onrender.com/api';
const LOCAL_URL_8080 = 'http://localhost:8080/api';
const LOCAL_URL_5000 = 'http://localhost:5000/api';

// When accessed from phone, GitHub Pages, or Vercel, always use the live Render backend!
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const rawBackendUrl = import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_NODE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL || 
  (isLocalhost ? LOCAL_URL_8080 : LIVE_RENDER_URL);

let BACKEND_BASE_URL = rawBackendUrl.endsWith('/') ? rawBackendUrl.slice(0, -1) : rawBackendUrl;

async function smartFetch(endpoint, options = {}) {
  const fetchOpts = {
    ...options,
    credentials: 'include',
  };
  try {
    const res = await fetch(`${BACKEND_BASE_URL}${endpoint}`, fetchOpts);
    return res;
  } catch (err) {
    // If local fetch failed, fallback to live Render cloud backend
    if (BACKEND_BASE_URL !== LIVE_RENDER_URL) {
      try {
        console.warn(`Local backend unreachable at ${BACKEND_BASE_URL}. Falling back to live cloud backend...`);
        return await fetch(`${LIVE_RENDER_URL}${endpoint}`, fetchOpts);
      } catch (fallbackErr) {
        console.warn('Live backend also unreachable:', fallbackErr);
      }
    }
    throw err;
  }
}

export async function checkBackendHealth() {
  try {
    const res = await smartFetch('/health', { method: 'GET' });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function fetchDsaConcepts() {
  try {
    const res = await smartFetch('/dsa/topics');
    if (!res.ok) throw new Error('Failed to fetch DSA concepts');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using local DSA concept catalog');
    return null;
  }
}

export async function executeProgram(code, conceptId = null, language = 'java', input = null) {
  try {
    const res = await smartFetch('/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, conceptId, language, input, title: conceptId || 'Custom Execution' }),
    });
    if (!res.ok) throw new Error('Execution failed on backend');
    return await res.json();
  } catch (err) {
    console.warn('Backend execution unavailable:', err);
    return null;
  }
}

// Projects API (Section 13)
export async function fetchProjects() {
  try {
    const res = await smartFetch('/projects');
    if (!res.ok) throw new Error('Failed to fetch projects');
    return await res.json();
  } catch (err) {
    return { success: false, projects: [] };
  }
}

export async function saveProject(projectData) {
  try {
    const res = await smartFetch('/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Failed to save project.' };
  }
}

export async function deleteProject(id) {
  try {
    const res = await smartFetch(`/projects/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Failed to delete project.' };
  }
}

// Saved Programs API (Section 29 & Section 39)
export async function saveProgram(programData) {
  try {
    const res = await smartFetch('/programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(programData),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {}

  // Fallback to local storage persistence
  try {
    const existing = JSON.parse(localStorage.getItem('code3d_saved_programs') || '[]');
    const newEntry = {
      id: Date.now(),
      title: programData.title || 'Untitled Program',
      description: programData.description || '',
      code: programData.code,
      language: programData.language || 'java',
      timeComplexity: programData.timeComplexity || 'O(n)',
      spaceComplexity: programData.spaceComplexity || 'O(1)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    existing.unshift(newEntry);
    localStorage.setItem('code3d_saved_programs', JSON.stringify(existing));
    return { success: true, data: newEntry };
  } catch (e) {
    return { success: false, message: 'Failed to save program' };
  }
}

export async function fetchSavedPrograms() {
  try {
    const res = await smartFetch('/programs');
    if (res.ok) {
      const data = await res.json();
      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        return data;
      }
    }
  } catch (err) {}

  const localSaved = JSON.parse(localStorage.getItem('code3d_saved_programs') || '[]');
  return { success: true, data: localSaved, saved: localSaved };
}

export async function deleteSavedProgram(id) {
  try {
    await smartFetch(`/programs/${id}`, { method: 'DELETE' });
  } catch (err) {}

  try {
    const localSaved = JSON.parse(localStorage.getItem('code3d_saved_programs') || '[]');
    const filtered = localSaved.filter((p) => p.id !== id);
    localStorage.setItem('code3d_saved_programs', JSON.stringify(filtered));
  } catch (e) {}

  return { success: true };
}

// Quiz Attempts API (Section 48)
export async function saveQuizAttempt(attemptData) {
  try {
    const res = await smartFetch('/quiz/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attemptData),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Failed to save quiz attempt.' };
  }
}

export async function fetchQuizAttempts() {
  try {
    const res = await smartFetch('/quiz/attempts');
    if (!res.ok) throw new Error('Failed to fetch quiz attempts');
    return await res.json();
  } catch (err) {
    return { success: false, attempts: [] };
  }
}

// Backward compatible alias
export const executeJavaProgram = executeProgram;

export async function analyzeCode(code, language = 'java') {
  try {
    const res = await smartFetch('/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
    });
    if (!res.ok) throw new Error('Analysis failed on backend');
    return await res.json();
  } catch (err) {
    console.warn('Backend analysis unavailable:', err);
    return null;
  }
}

// Backward compatible alias
export const analyzeJavaCode = analyzeCode;

export async function requestAiExplanation(code, lineNumber, stepNumber, queryType, level, language = 'java', question = null) {
  try {
    const res = await smartFetch('/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, lineNumber, stepNumber, queryType, level, language, question }),
    });
    if (!res.ok) throw new Error('AI explanation request failed');
    return await res.json();
  } catch (err) {
    console.warn('AI explanation unavailable:', err);
    return null;
  }
}

export async function fetchQuizQuestions(conceptId) {
  try {
    const res = await smartFetch(`/quiz?conceptId=${encodeURIComponent(conceptId)}`);
    if (!res.ok) throw new Error('Quiz fetch failed');
    return await res.json();
  } catch (err) {
    console.warn('Quiz service unavailable:', err);
    return null;
  }
}

// User Authentication API
export async function loginUser(credentials) {
  try {
    const res = await smartFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return await res.json();
  } catch (err) {
    console.warn('Login request failed:', err);
    return { success: false, message: 'Backend unreachable. Please check connection.' };
  }
}

export async function registerUser(userData) {
  try {
    const res = await smartFetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return await res.json();
  } catch (err) {
    console.warn('Registration request failed:', err);
    return { success: false, message: 'Backend unreachable. Please check connection.' };
  }
}

const STORAGE_KEY_EXECUTIONS = 'code3d_db_executions_v2';
const STORAGE_KEY_QUIZZES = 'code3d_db_quizzes_v2';

function isStorageAvailable() {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch (e) {
    return false;
  }
}

function getLocalExecutions() {
  if (!isStorageAvailable()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXECUTIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Recovered from corrupted execution history in localStorage:', e);
    return [];
  }
}

function saveLocalExecutions(list) {
  if (!isStorageAvailable()) return;
  try {
    const safeList = Array.isArray(list) ? list.slice(0, 100) : [];
    localStorage.setItem(STORAGE_KEY_EXECUTIONS, JSON.stringify(safeList));
  } catch (e) {
    console.warn('Storage quota exceeded or error writing executions to localStorage:', e);
  }
}

function getLocalQuizzes() {
  if (!isStorageAvailable()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUIZZES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Recovered from corrupted quiz history in localStorage:', e);
    return [];
  }
}

function saveLocalQuizzes(list) {
  if (!isStorageAvailable()) return;
  try {
    const safeList = Array.isArray(list) ? list.slice(0, 50) : [];
    localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(safeList));
  } catch (e) {
    console.warn('Storage quota exceeded or error writing quizzes to localStorage:', e);
  }
}

/**
 * Record a code execution event in the database (local + backend)
 */
export async function recordExecutionHistory({
  programTitle,
  conceptId,
  language = 'java',
  totalSteps = 1,
  status = 'COMPLETED',
  code = '',
  output = ''
}) {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (' + new Date().toLocaleDateString() + ')';
  const newRecord = {
    id: Date.now(),
    programTitle: programTitle || 'Java Program',
    conceptId: conceptId || 'custom',
    language: language || 'java',
    totalSteps: totalSteps || 1,
    status: status || 'COMPLETED',
    code: code || '',
    output: typeof output === 'string' ? output : (Array.isArray(output) ? output.join('\n') : ''),
    executedAt: timestamp,
  };

  // 1. Save immediately to persistent client-side database
  const localList = getLocalExecutions();
  localList.unshift(newRecord);
  saveLocalExecutions(localList);

  // 2. Asynchronously sync with Spring Boot backend
  try {
    smartFetch('/history/execution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        programTitle: newRecord.programTitle,
        conceptId: newRecord.conceptId,
        totalSteps: newRecord.totalSteps,
        status: newRecord.status,
      }),
    }).catch(() => {});
  } catch (err) {}

  return newRecord;
}

/**
 * Record a quiz assessment in the database (local + backend)
 */
export async function recordQuizHistory({
  conceptId,
  score = 0,
  totalQuestions = 1,
  accuracy
}) {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (' + new Date().toLocaleDateString() + ')';
  const computedAccuracy = accuracy !== undefined ? accuracy : Math.round((score / Math.max(1, totalQuestions)) * 100);

  const newRecord = {
    id: Date.now(),
    conceptId: conceptId || 'general',
    score: score || 0,
    totalQuestions: totalQuestions || 1,
    accuracy: computedAccuracy,
    completedAt: timestamp,
  };

  // 1. Save to persistent client-side database
  const localList = getLocalQuizzes();
  localList.unshift(newRecord);
  saveLocalQuizzes(localList);

  // 2. Asynchronously sync with Spring Boot backend
  try {
    smartFetch('/history/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conceptId: newRecord.conceptId,
        score: newRecord.score,
        totalQuestions: newRecord.totalQuestions,
      }),
    }).catch(() => {});
  } catch (err) {}

  return newRecord;
}

/**
 * Retrieve full execution and quiz history, merging cloud backend and local storage.
 */
export async function getExecutionHistory() {
  const localExecutions = getLocalExecutions();
  const localQuizzes = getLocalQuizzes();

  let backendData = null;
  try {
    const res = await smartFetch('/history');
    if (res.ok) {
      backendData = await res.json();
    }
  } catch (err) {
    console.warn('Backend history service unreachable, using local database:', err);
  }

  const backendExecs = backendData?.recentExecutions || [];
  const backendQuizzes = backendData?.recentQuizzes || [];

  // Merge unique records with local records on top
  const combinedExecutions = [...localExecutions];
  for (const b of backendExecs) {
    if (!combinedExecutions.some((e) => e.programTitle === b.programTitle && e.executedAt === b.executedAt)) {
      combinedExecutions.push(b);
    }
  }

  const combinedQuizzes = [...localQuizzes];
  for (const b of backendQuizzes) {
    if (!combinedQuizzes.some((q) => q.conceptId === b.conceptId && q.completedAt === b.completedAt)) {
      combinedQuizzes.push(b);
    }
  }

  // Return real historical records (empty if no simulations have been run yet)

  return {
    totalExecutionsCount: (backendData?.totalExecutionsCount || 0) + localExecutions.length,
    totalQuizzesTaken: (backendData?.totalQuizzesTaken || 0) + localQuizzes.length,
    recentExecutions: combinedExecutions,
    recentQuizzes: combinedQuizzes,
    isBackendConnected: Boolean(backendData),
  };
}

export function clearExecutionHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY_EXECUTIONS);
    localStorage.removeItem(STORAGE_KEY_QUIZZES);
    smartFetch('/history', { method: 'DELETE' }).catch(() => {});
  } catch (e) {}
}

export async function deleteHistoryItem(id) {
  try {
    // Remove from local storage if present
    const local = getLocalExecutions();
    const updated = local.filter((item) => String(item.id) !== String(id));
    saveLocalExecutions(updated);

    // Call backend DELETE endpoint
    if (id) {
      await smartFetch(`/history/${id}`, { method: 'DELETE' }).catch(() => {});
    }
    return true;
  } catch (e) {
    console.warn('Failed to delete history item:', e);
    return false;
  }
}

// Personal Problem Solver & Auto-Correction API
export async function correctAndVisualizeCode(code, language = 'java') {
  try {
    const res = await smartFetch('/code/correct-and-visualize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.correctedCode) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend Personal Problem Solver API unavailable, activating client solver:', err);
  }
  // Guaranteed client-side personal problem solver and 3D trace generator fallback
  return solvePersonalProblem(code, language);
}

export async function autoCorrectCode(code, language = 'java') {
  try {
    const res = await smartFetch('/code/correct-and-visualize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.correctedCode) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend auto-correct API unavailable, using client corrector:', err);
  }
  return correctPersonalCode(code, language);
}

export const solveAndVisualizePersonalProblem = correctAndVisualizeCode;

export async function getAiExplanation({ code, language = 'java', question = '' }) {
  try {
    const res = await smartFetch('/ai/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language, question }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.explanation) {
        const localMeta = analyzeAlgorithmCode(code, language);
        return {
          success: true,
          title: data.title || localMeta.title,
          timeComplexity: data.timeComplexity || localMeta.timeComplexity,
          spaceComplexity: data.spaceComplexity || localMeta.spaceComplexity,
          explanation: data.explanation || localMeta.summary,
          insights: data.insights || localMeta.insights,
          edgeCases: data.edgeCases || localMeta.edgeCases,
        };
      }
    }
  } catch (err) {
    console.warn('Backend AI explanation unavailable, using local AST analyzer:', err);
  }

  // Resilient Local AST / Algorithmic Intelligence
  const localAnalysis = analyzeAlgorithmCode(code, language);
  return {
    success: true,
    title: localAnalysis.title,
    timeComplexity: localAnalysis.timeComplexity,
    spaceComplexity: localAnalysis.spaceComplexity,
    explanation: localAnalysis.summary,
    insights: localAnalysis.insights,
    edgeCases: localAnalysis.edgeCases,
  };
}

export async function askAiFollowUp(prompt, code, language = 'java') {
  try {
    const res = await smartFetch('/ai/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: prompt, prompt, code, language, queryType: 'ASK_QUESTION' }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && (data.answer || data.explanation)) {
        return { answer: data.answer || data.explanation };
      }
    }
  } catch (err) {
    console.warn('Backend AI Q&A unavailable, generating intelligent tutor answer:', err);
  }

  // Generate deep, tailored pedagogical answer (supports Hinglish & English)
  const answer = generateIntelligentAiTutorAnswer(prompt, code, language);
  return { answer };
}
