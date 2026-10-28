/**
 * CODE3D-AI: Challenge Progress Component
 * Displays user mastery, XP levels, daily streaks, and completion analytics.
 */

import React from 'react';
import {
  Trophy,
  Flame,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  BarChart3,
  Award,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export default function ChallengeProgress({
  totalXp = 0,
  streak = 0,
  completedPredictCount = 0,
  totalPredictCount = 0,
  completedRepairCount = 0,
  totalRepairCount = 0,
  onResetProgress = null,
}) {
  const { isBright } = useTheme();

  const predictPct =
    totalPredictCount > 0 ? Math.round((completedPredictCount / totalPredictCount) * 100) : 0;
  const repairPct =
    totalRepairCount > 0 ? Math.round((completedRepairCount / totalRepairCount) * 100) : 0;

  // Derive Rank
  const getRank = (xp) => {
    if (xp >= 1500) return { title: 'Master Algorithmist', level: 5, color: 'text-purple-400' };
    if (xp >= 1000) return { title: 'Senior Debugger', level: 4, color: 'text-amber-400' };
    if (xp >= 500) return { title: 'Code Sleuth', level: 3, color: 'text-cyan-400' };
    if (xp >= 200) return { title: 'Syntax Apprentice', level: 2, color: 'text-emerald-400' };
    return { title: 'Code Novice', level: 1, color: 'text-slate-400' };
  };

  const rank = getRank(totalXp);

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
        isBright
          ? 'bg-white border-slate-200 shadow-xs'
          : 'bg-[#0e121a] border-slate-800 shadow-lg shadow-black/20'
      }`}
    >
      {/* Top Header with Level and Streak */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25">
            <Award size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                Level {rank.level}
              </span>
              <span className={`text-xs font-bold ${rank.color}`}>• {rank.title}</span>
            </div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <span>{totalXp} XP</span>
              <span className="text-xs font-semibold text-slate-400 font-normal">Earned</span>
            </h2>
          </div>
        </div>

        {/* Streak and Total Solved Badges */}
        <div className="flex items-center gap-2.5">
          <div
            className={`px-3 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold ${
              streak > 0
                ? 'bg-orange-500/10 border-orange-500/30 text-orange-500'
                : isBright
                ? 'bg-slate-100 border-slate-200 text-slate-500'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Flame size={16} className={streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : ''} />
            <span>{streak} Day Streak</span>
          </div>

          <div
            className={`px-3 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold ${
              isBright
                ? 'bg-slate-100 border-slate-200 text-slate-800'
                : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}
          >
            <Trophy size={16} className="text-amber-500" />
            <span>{completedPredictCount + completedRepairCount} Solved</span>
          </div>
        </div>
      </div>

      {/* Progress Bars for Both Modes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {/* Predict Output Mastery */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span>🔮</span>
              <span>Predict Output</span>
            </span>
            <span className="font-mono text-slate-400">
              {completedPredictCount} / {totalPredictCount} ({predictPct}%)
            </span>
          </div>
          <div
            className={`h-2.5 w-full rounded-full overflow-hidden ${
              isBright ? 'bg-slate-200' : 'bg-slate-800'
            }`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${predictPct}%` }}
            />
          </div>
        </div>

        {/* Repair Code Mastery */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span>🔧</span>
              <span>Repair Code</span>
            </span>
            <span className="font-mono text-slate-400">
              {completedRepairCount} / {totalRepairCount} ({repairPct}%)
            </span>
          </div>
          <div
            className={`h-2.5 w-full rounded-full overflow-hidden ${
              isBright ? 'bg-slate-200' : 'bg-slate-800'
            }`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{ width: `${repairPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Reset Progress Confirmation */}
      {onResetProgress && (
        <div className="flex justify-end pt-3">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all challenge progress and XP?')) {
                onResetProgress();
              }
            }}
            className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition cursor-pointer"
          >
            <RotateCcw size={11} />
            <span>Reset Stats</span>
          </button>
        </div>
      )}
    </div>
  );
}
