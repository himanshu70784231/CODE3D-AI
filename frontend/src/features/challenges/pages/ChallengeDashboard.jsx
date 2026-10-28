/**
 * CODE3D-AI: Predict & Repair Challenge Arena Dashboard
 * Central hub for selecting and playing Output Prediction and Code Repair challenges.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Trophy,
  Flame,
  Search,
  Filter,
  CheckCircle2,
  Play,
  Wrench,
  Sparkles,
  ArrowRight,
  Code2,
  Box,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { PREDICT_CHALLENGES, REPAIR_CHALLENGES } from '../data/challengeData';
import { useChallengeProgress } from '../hooks/useChallengeProgress';
import PredictChallenge from '../components/PredictChallenge';
import RepairChallenge from '../components/RepairChallenge';
import ChallengeProgress from '../components/ChallengeProgress';
import '../styles/challenges.css';

export default function ChallengeDashboard({ onLaunchConcept = null }) {
  const { isBright } = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Progress tracking hook
  const {
    totalXp,
    streak,
    completedPredictCount,
    completedRepairCount,
    recordPredictResult,
    recordRepairResult,
    isCompleted,
    resetAllProgress,
  } = useChallengeProgress();

  // Active Tab & Challenge State
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'predict'); // 'predict' | 'repair' | 'progress'
  const [activeChallengeId, setActiveChallengeId] = useState(() => searchParams.get('id') || null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All'); // 'All' | 'Easy' | 'Medium' | 'Hard'
  const [selectedLanguage, setSelectedLanguage] = useState('All'); // 'All' | 'javascript' | 'python' | 'java'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'completed' | 'unsolved'

  // Synchronize state with URL parameters
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    const urlId = searchParams.get('id');
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
    if (urlId !== activeChallengeId) {
      setActiveChallengeId(urlId);
    }
  }, [searchParams]);

  const selectChallenge = (id, tab) => {
    setActiveChallengeId(id);
    if (tab) setActiveTab(tab);
    setSearchParams({ tab: tab || activeTab, id });
  };

  const clearActiveChallenge = () => {
    setActiveChallengeId(null);
    setSearchParams({ tab: activeTab });
  };

  // Switch tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setActiveChallengeId(null);
    setSearchParams({ tab });
  };

  // Find active challenge object
  const currentChallenge = useMemo(() => {
    if (!activeChallengeId) return null;
    if (activeTab === 'predict') {
      return PREDICT_CHALLENGES.find((c) => c.id === activeChallengeId) || null;
    }
    return REPAIR_CHALLENGES.find((c) => c.id === activeChallengeId) || null;
  }, [activeChallengeId, activeTab]);

  // Filtered lists
  const filteredPredictChallenges = useMemo(() => {
    return PREDICT_CHALLENGES.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDiff = selectedDifficulty === 'All' || c.difficulty === selectedDifficulty;
      const matchLang = selectedLanguage === 'All' || c.language === selectedLanguage;
      const completed = isCompleted(c.id, 'predict');
      const matchStatus =
        statusFilter === 'All' ||
        (statusFilter === 'completed' && completed) ||
        (statusFilter === 'unsolved' && !completed);

      return matchSearch && matchDiff && matchLang && matchStatus;
    });
  }, [searchQuery, selectedDifficulty, selectedLanguage, statusFilter, isCompleted]);

  const filteredRepairChallenges = useMemo(() => {
    return REPAIR_CHALLENGES.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.bugType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDiff = selectedDifficulty === 'All' || c.difficulty === selectedDifficulty;
      const matchLang = selectedLanguage === 'All' || c.language === selectedLanguage;
      const completed = isCompleted(c.id, 'repair');
      const matchStatus =
        statusFilter === 'All' ||
        (statusFilter === 'completed' && completed) ||
        (statusFilter === 'unsolved' && !completed);

      return matchSearch && matchDiff && matchLang && matchStatus;
    });
  }, [searchQuery, selectedDifficulty, selectedLanguage, statusFilter, isCompleted]);

  // Navigate next challenge in series
  const handleNextChallenge = () => {
    const list = activeTab === 'predict' ? PREDICT_CHALLENGES : REPAIR_CHALLENGES;
    const currIdx = list.findIndex((c) => c.id === activeChallengeId);
    if (currIdx !== -1 && currIdx < list.length - 1) {
      selectChallenge(list[currIdx + 1].id, activeTab);
    } else {
      clearActiveChallenge();
    }
  };

  // Launch into 3D visualizer
  const handleLaunch3DStudio = (conceptData) => {
    if (onLaunchConcept) {
      onLaunchConcept({
        id: conceptData.id,
        title: `⚔️ ${conceptData.title}`,
        category: 'Arena Challenge',
        description: `Simulated program from Predict & Repair Challenge Arena.`,
        code: conceptData.code,
        language: conceptData.language || 'javascript',
        trace: conceptData.trace || null,
        archetype: conceptData.archetype || 'array',
      });
    } else {
      navigate('/visualizer', {
        state: {
          concept: {
            id: conceptData.id,
            title: `⚔️ ${conceptData.title}`,
            code: conceptData.code,
            language: conceptData.language || 'javascript',
            trace: conceptData.trace || null,
          },
        },
      });
    }
  };

  return (
    <div
      className={`c3d-challenges-root flex-1 overflow-y-auto c3d-challenges-scrollbar p-4 sm:p-6 lg:p-8 min-h-full transition-colors duration-200 ${
        isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'
      }`}
    >
      {/* If a challenge is currently active, render its workspace */}
      {currentChallenge ? (
        activeTab === 'predict' ? (
          <PredictChallenge
            challenge={currentChallenge}
            onComplete={(id, correct, pts) => recordPredictResult(id, correct, pts)}
            onNext={handleNextChallenge}
            onBack={clearActiveChallenge}
            onLaunch3D={handleLaunch3DStudio}
            isAlreadyCompleted={isCompleted(currentChallenge.id, 'predict')}
          />
        ) : (
          <RepairChallenge
            challenge={currentChallenge}
            onComplete={(id, allPassed, pts) =>
              recordRepairResult(id, allPassed, currentChallenge.testCases.length, currentChallenge.testCases.length, pts)
            }
            onNext={handleNextChallenge}
            onBack={clearActiveChallenge}
            onLaunch3D={handleLaunch3DStudio}
            isAlreadyCompleted={isCompleted(currentChallenge.id, 'repair')}
          />
        )
      ) : (
        /* Arena Dashboard Catalog View */
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          {/* Hero Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                  <span className="text-xl">⚔️</span>
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight">Predict & Repair Arena</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hone your code comprehension with real program output predictions and interactive bug repairs.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                  streak > 0
                    ? 'bg-orange-500/10 border-orange-500/30 text-orange-500'
                    : isBright
                    ? 'bg-white border-slate-200 text-slate-500'
                    : 'bg-[#0f131a] border-slate-800 text-slate-400'
                }`}
              >
                <Flame size={15} className={streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : ''} />
                <span>{streak} Day Streak</span>
              </div>

              <div
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                  isBright
                    ? 'bg-white border-slate-200 text-slate-800'
                    : 'bg-[#0f131a] border-slate-800 text-slate-200'
                }`}
              >
                <Trophy size={15} className="text-amber-500" />
                <span>{totalXp} XP</span>
              </div>
            </div>
          </div>

          {/* Mode Tabs Navigation */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTabChange('predict')}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                  activeTab === 'predict'
                    ? 'border-amber-500 text-amber-500'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🔮</span>
                <span>Predict Output ({PREDICT_CHALLENGES.length})</span>
                {completedPredictCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-mono">
                    {completedPredictCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabChange('repair')}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                  activeTab === 'repair'
                    ? 'border-amber-500 text-amber-500'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🔧</span>
                <span>Repair Code ({REPAIR_CHALLENGES.length})</span>
                {completedRepairCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-mono">
                    {completedRepairCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabChange('progress')}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                  activeTab === 'progress'
                    ? 'border-amber-500 text-amber-500'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📊</span>
                <span>Mastery & Stats</span>
              </button>
            </div>
          </div>

          {/* Tab 3: Mastery & Stats Tab */}
          {activeTab === 'progress' && (
            <div className="c3d-animate-fade-in flex flex-col gap-6">
              <ChallengeProgress
                totalXp={totalXp}
                streak={streak}
                completedPredictCount={completedPredictCount}
                totalPredictCount={PREDICT_CHALLENGES.length}
                completedRepairCount={completedRepairCount}
                totalRepairCount={REPAIR_CHALLENGES.length}
                onResetProgress={resetAllProgress}
              />
            </div>
          )}

          {/* Tab 1 & 2: Challenge Browser with Filters and Cards */}
          {activeTab !== 'progress' && (
            <div className="flex flex-col gap-5 c3d-animate-fade-in">
              {/* Search & Filter Controls Bar */}
              <div
                className={`p-3.5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
                  isBright ? 'bg-white border-slate-200' : 'bg-[#0f131a] border-slate-800'
                }`}
              >
                {/* Search Box */}
                <div className="relative w-full md:w-72">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, topic, bug..."
                    className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border outline-hidden transition ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                        : 'bg-[#131722] border-slate-800 text-slate-200 focus:border-amber-500'
                    }`}
                  />
                </div>

                {/* Filter Dropdowns */}
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto select-none">
                  {/* Difficulty */}
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs border outline-hidden cursor-pointer ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-800'
                        : 'bg-[#131722] border-slate-800 text-slate-300'
                    }`}
                  >
                    <option value="All">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>

                  {/* Language */}
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs border outline-hidden cursor-pointer ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-800'
                        : 'bg-[#131722] border-slate-800 text-slate-300'
                    }`}
                  >
                    <option value="All">All Languages</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                  </select>

                  {/* Status */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs border outline-hidden cursor-pointer ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-800'
                        : 'bg-[#131722] border-slate-800 text-slate-300'
                    }`}
                  >
                    <option value="All">All Status</option>
                    <option value="unsolved">Unsolved</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Challenge Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(activeTab === 'predict' ? filteredPredictChallenges : filteredRepairChallenges).map(
                  (challenge) => {
                    const completed = isCompleted(challenge.id, activeTab);

                    return (
                      <div
                        key={challenge.id}
                        onClick={() => selectChallenge(challenge.id, activeTab)}
                        className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 cursor-pointer group ${
                          completed
                            ? isBright
                              ? 'bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-400'
                              : 'bg-emerald-950/10 border-emerald-800/40 hover:border-emerald-600/80'
                            : isBright
                            ? 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-md'
                            : 'bg-[#0e121a] border-slate-800 hover:border-amber-500/60 hover:shadow-lg hover:shadow-black/30'
                        }`}
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                challenge.difficulty === 'Easy'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : challenge.difficulty === 'Medium'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}
                            >
                              {challenge.difficulty}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {completed ? (
                                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                                  <CheckCircle2 size={13} />
                                  <span>Done</span>
                                </span>
                              ) : (
                                <span className="text-[11px] font-mono text-amber-500 font-bold">
                                  +{challenge.points} XP
                                </span>
                              )}
                            </div>
                          </div>

                          <h3 className="font-bold text-sm tracking-tight group-hover:text-amber-500 transition-colors">
                            {challenge.title}
                          </h3>

                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {challenge.description}
                          </p>
                        </div>

                        {/* Bottom Metadata & Play Pill */}
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-slate-400">
                              {challenge.language.toUpperCase()}
                            </span>
                            {activeTab === 'repair' && challenge.bugType && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-medium truncate max-w-[120px]">
                                {challenge.bugType}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-xs font-bold text-amber-500 group-hover:translate-x-1 transition-transform">
                            <span>{completed ? 'Review' : 'Start'}</span>
                            <ChevronRight size={13} />
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* Empty Search State */}
              {(activeTab === 'predict' ? filteredPredictChallenges : filteredRepairChallenges).length === 0 && (
                <div className="p-12 text-center rounded-2xl border border-dashed border-slate-700 flex flex-col items-center gap-2">
                  <span className="text-2xl">🔍</span>
                  <h4 className="font-bold text-sm">No challenges match your search filters</h4>
                  <p className="text-xs text-slate-400">
                    Try clearing the search query or adjusting the difficulty/language filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDifficulty('All');
                      setSelectedLanguage('All');
                      setStatusFilter('All');
                    }}
                    className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-white"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
