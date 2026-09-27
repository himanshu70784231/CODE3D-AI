import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';
import * as executionController from '../controllers/executionController.js';
import * as historyController from '../controllers/historyController.js';
import * as savedController from '../controllers/savedController.js';
import * as settingsController from '../controllers/settingsController.js';
import * as dsaController from '../controllers/dsaController.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'CODE3D-AI Full-Stack Execution & Visualization Engine',
    version: '2.0.0',
    supportedLanguages: ['java', 'cpp', 'python', 'javascript', 'c'],
  });
});

// Authentication Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', requireAuth, authController.getMe);

// Execution Routes
router.post('/executions/run', optionalAuth, executionController.runExecution);
router.post('/execute/run', optionalAuth, executionController.runExecution);
router.post('/analyze', executionController.analyzeCode);
router.get('/execute/languages', (req, res) => {
  res.json({
    success: true,
    languages: ['java', 'cpp', 'python', 'javascript', 'c'],
  });
});

// History Routes
router.get('/history', optionalAuth, historyController.getHistory);
router.get('/history/:id', optionalAuth, historyController.getHistoryItem);
router.delete('/history/:id', optionalAuth, historyController.deleteHistoryItem);
router.delete('/history', optionalAuth, historyController.clearHistory);

// Saved Visualizations Routes
router.get('/saved', requireAuth, savedController.getSavedList);
router.get('/saved/:id', requireAuth, savedController.getSavedItem);
router.post('/saved', requireAuth, savedController.createSaved);
router.put('/saved/:id', requireAuth, savedController.updateSaved);
router.delete('/saved/:id', requireAuth, savedController.deleteSaved);

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
