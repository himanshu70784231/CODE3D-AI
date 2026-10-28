/**
 * CODE3D-AI: Challenges Feature Module Barrel
 * Predict & Repair Challenge Arena module export.
 */

// Pages & Components
export { default as ChallengeDashboard } from './pages/ChallengeDashboard';
export { default as PredictChallenge } from './components/PredictChallenge';
export { default as RepairChallenge } from './components/RepairChallenge';
export { default as ChallengeEditor } from './components/ChallengeEditor';
export { default as ChallengeResults } from './components/ChallengeResults';
export { default as ChallengeProgress } from './components/ChallengeProgress';

// Services
export {
  default as challengeRunner,
  executeProgram,
  runTestCase,
  runAllTestCases,
} from './services/challengeRunner';

export {
  default as challengeValidator,
  validatePrediction,
  validateRepairResults,
  normalizeOutput,
} from './services/challengeValidator';

// Hooks & Data
export { useChallengeProgress, default as useChallengeProgressDefault } from './hooks/useChallengeProgress';
export { PREDICT_CHALLENGES, REPAIR_CHALLENGES } from './data/challengeData';
