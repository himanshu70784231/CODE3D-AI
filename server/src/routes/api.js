import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { isDbOnline } from '../db.js';
import * as authController from '../controllers/authController.js';
import * as executionController from '../controllers/executionController.js';
import * as historyController from '../controllers/historyController.js';
import * as savedController from '../controllers/savedController.js';
import * as projectController from '../controllers/projectController.js';
import * as quizController from '../controllers/quizController.js';
import * as aiController from '../controllers/aiController.js';
import * as settingsController from '../controllers/settingsController.js';
import * as dsaController from '../controllers/dsaController.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = Router();

// Health Check (Section 62)
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isDbOnline() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    service: 'CODE3D-AI Full-Stack Execution & Visualization Engine',
    version: '2.0.0',
    supportedLanguages: ['java', 'cpp', 'python', 'javascript', 'c'],
  });
});

// Authentication Routes (Section 8)
router.post('/auth/register', authController.register);
router.post('/auth/signup', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', requireAuth, authController.getMe);
router.get('/profile', requireAuth, authController.getMe);
router.put('/profile', requireAuth, authController.getMe);

// Execution Routes (Section 17)
router.post('/execute', optionalAuth, executionController.runExecution);
router.post('/executions/run', optionalAuth, executionController.runExecution);
router.post('/execute/run', optionalAuth, executionController.runExecution);
router.post('/analyze', executionController.analyzeCode);
router.get('/execute/languages', (req, res) => {
  res.json({
    success: true,
    languages: ['java', 'cpp', 'python', 'javascript', 'c'],
  });
});

// History & Executions Routes (Section 15 & Section 39)
router.get('/history', optionalAuth, historyController.getHistory);
router.get('/history/:id', optionalAuth, historyController.getHistoryItem);
router.delete('/history/:id', optionalAuth, historyController.deleteHistoryItem);
router.delete('/history', optionalAuth, historyController.clearHistory);
router.get('/executions', optionalAuth, historyController.getHistory);
router.get('/executions/:id', optionalAuth, historyController.getHistoryItem);
router.delete('/executions/:id', optionalAuth, historyController.deleteHistoryItem);

// Saved Visualizations & Programs Routes (Section 14 & Section 39)
router.get('/saved', requireAuth, savedController.getSavedList);
router.get('/saved/:id', requireAuth, savedController.getSavedItem);
router.post('/saved', requireAuth, savedController.createSaved);
router.put('/saved/:id', requireAuth, savedController.updateSaved);
router.delete('/saved/:id', requireAuth, savedController.deleteSaved);
router.get('/programs', requireAuth, savedController.getSavedList);
router.get('/programs/:id', requireAuth, savedController.getSavedItem);
router.post('/programs', requireAuth, savedController.createSaved);
router.put('/programs/:id', requireAuth, savedController.updateSaved);
router.delete('/programs/:id', requireAuth, savedController.deleteSaved);

// Projects Routes (Section 13)
router.get('/projects', requireAuth, projectController.getProjects);
router.get('/projects/:id', requireAuth, projectController.getProjectById);
router.post('/projects', requireAuth, projectController.createProject);
router.put('/projects/:id', requireAuth, projectController.updateProject);
router.delete('/projects/:id', requireAuth, projectController.deleteProject);

// Quiz Attempts Routes (Section 48 & Section 39)
router.get('/quiz/attempts', requireAuth, quizController.getQuizAttempts);
router.post('/quiz/attempts', requireAuth, quizController.recordQuizAttempt);
router.get('/quiz', requireAuth, quizController.getQuizAttempts);
router.post('/quiz/submit', requireAuth, quizController.recordQuizAttempt);

// AI Contextual Explanation Routes (Section 47)
router.post('/ai/explain', aiController.explainContext);
router.post('/explain', aiController.explainContext);

// Settings Routes
router.get('/settings', requireAuth, settingsController.getSettings);
router.put('/settings', requireAuth, settingsController.updateSettings);

// DSA Catalog & Tracking Routes
router.get('/dsa/topics', dsaController.getTopics);
router.get('/dsa/problems', dsaController.getProblems);
router.get('/dsa/problems/:slug', dsaController.getProblemBySlug);
router.get('/dsa/sheets', dsaController.getSheets);
router.get('/dsa/sheets/:slug', dsaController.getSheetBySlug);
router.get('/dsa/progress', requireAuth, dsaController.getProgress);
router.post('/dsa/progress', requireAuth, dsaController.updateProgress);

// Dashboard Statistics Route
router.get('/dashboard/stats', optionalAuth, dashboardController.getDashboardStats);

export default router;
