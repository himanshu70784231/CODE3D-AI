/**
 * CODE3D-AI: Challenge Progress Hook
 * Manages XP, completion states, streaks, and local persistence for challenges.
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'code3d_challenge_progress_v1';

const DEFAULT_STATE = {
  totalXp: 0,
  streak: 0,
  lastActiveDate: null,
  completedPredict: [],
  completedRepair: [],
  attempts: {},
};

export function useChallengeProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_STATE, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to read challenge progress from localStorage:', e);
    }
    return DEFAULT_STATE;
  });

  // Save to localStorage whenever state updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('Failed to save challenge progress to localStorage:', e);
    }
  }, [progress]);

  // Update streak logic
  const updateStreak = useCallback((currStreak, lastDate) => {
    const today = new Date().toISOString().slice(0, 10);
    if (!lastDate) return 1;
    if (lastDate === today) return currStreak || 1;

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (lastDate === yesterday) return (currStreak || 0) + 1;

    return 1;
  }, []);

  /**
   * Record outcome of a Predict Challenge
   */
  const recordPredictResult = useCallback(
    (challengeId, isCorrect, points = 100) => {
      setProgress((prev) => {
        const today = new Date().toISOString().slice(0, 10);
        const existingAttempt = prev.attempts[challengeId] || { count: 0, solved: false };
        const alreadyCompleted = prev.completedPredict.includes(challengeId);

        const newAttempts = {
          ...prev.attempts,
          [challengeId]: {
            count: existingAttempt.count + 1,
            solved: existingAttempt.solved || isCorrect,
            lastPlayed: new Date().toISOString(),
          },
        };

        const newCompleted =
          isCorrect && !alreadyCompleted ? [...prev.completedPredict, challengeId] : prev.completedPredict;

        const xpGained = isCorrect && !alreadyCompleted ? points : isCorrect ? Math.round(points * 0.25) : 10;
        const newStreak = isCorrect ? updateStreak(prev.streak, prev.lastActiveDate) : prev.streak;

        return {
          ...prev,
          totalXp: prev.totalXp + xpGained,
          streak: newStreak,
          lastActiveDate: today,
          completedPredict: newCompleted,
          attempts: newAttempts,
        };
      });
    },
    [updateStreak]
  );

  /**
   * Record outcome of a Repair Challenge
   */
  const recordRepairResult = useCallback(
    (challengeId, allPassed, passedCount, totalCount, points = 150) => {
      setProgress((prev) => {
        const today = new Date().toISOString().slice(0, 10);
        const existingAttempt = prev.attempts[challengeId] || { count: 0, solved: false };
        const alreadyCompleted = prev.completedRepair.includes(challengeId);

        const newAttempts = {
          ...prev.attempts,
          [challengeId]: {
            count: existingAttempt.count + 1,
            solved: existingAttempt.solved || allPassed,
            passRate: `${passedCount}/${totalCount}`,
            lastPlayed: new Date().toISOString(),
          },
        };

        const newCompleted =
          allPassed && !alreadyCompleted ? [...prev.completedRepair, challengeId] : prev.completedRepair;

        const xpGained = allPassed && !alreadyCompleted ? points : allPassed ? Math.round(points * 0.3) : passedCount * 15;
        const newStreak = allPassed ? updateStreak(prev.streak, prev.lastActiveDate) : prev.streak;

        return {
          ...prev,
          totalXp: prev.totalXp + xpGained,
          streak: newStreak,
          lastActiveDate: today,
          completedRepair: newCompleted,
          attempts: newAttempts,
        };
      });
    },
    [updateStreak]
  );

  const isCompleted = useCallback(
    (challengeId, mode = 'predict') => {
      if (mode === 'predict') {
        return progress.completedPredict.includes(challengeId);
      }
      return progress.completedRepair.includes(challengeId);
    },
    [progress.completedPredict, progress.completedRepair]
  );

  const getChallengeAttempt = useCallback(
    (challengeId) => {
      return progress.attempts[challengeId] || null;
    },
    [progress.attempts]
  );

  const resetAllProgress = useCallback(() => {
    setProgress(DEFAULT_STATE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return {
    progress,
    totalXp: progress.totalXp,
    streak: progress.streak,
    completedPredictCount: progress.completedPredict.length,
    completedRepairCount: progress.completedRepair.length,
    totalCompletedCount: progress.completedPredict.length + progress.completedRepair.length,
    recordPredictResult,
    recordRepairResult,
    isCompleted,
    getChallengeAttempt,
    resetAllProgress,
  };
}

export default useChallengeProgress;
