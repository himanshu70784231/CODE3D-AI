/**
 * CODE3D-AI: Repair Challenge Workspace Component
 * Implements Mode B: Edit broken code, compile & test fix against test cases, explain errors.
 */

import React, { useState } from 'react';
import {
  Wrench,
  Play,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Bug,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Box,
  FileCheck,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import ChallengeEditor from './ChallengeEditor';
import ChallengeResults from './ChallengeResults';
import { runAllTestCases } from '../services/challengeRunner';
import { validateRepairResults } from '../services/challengeValidator';
import { AIService } from '../../../services/aiService';

export default function RepairChallenge({
  challenge,
  onComplete = null,
  onNext = null,
  onBack = null,
  onLaunch3D = null,
  isAlreadyCompleted = false,
}) {
  const { isBright } = useTheme();

  // Code Editing State
  const [userCode, setUserCode] = useState(challenge?.buggyCode || '');
  const [highlightErrorLine, setHighlightErrorLine] = useState(null);

  // Test Runner State
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [syntaxError, setSyntaxError] = useState(null);
  const [lastTrace, setLastTrace] = useState([]);

  // AI & Hints State
  const [revealedHintIndex, setRevealedHintIndex] = useState(-1);
  const [aiDiagnosis, setAiDiagnosis] = useState(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  if (!challenge) {
    return (
      <div className="p-8 text-center text-slate-400">
        No challenge selected.{' '}
        <button onClick={onBack} className="text-amber-500 underline ml-2">
          Back to Arena
        </button>
      </div>
    );
  }

  const handleResetCode = () => {
    setUserCode(challenge.buggyCode);
    setTestResults(null);
    setSyntaxError(null);
    setHighlightErrorLine(null);
  };

  const handleRevealHint = () => {
    if (challenge.hints && revealedHintIndex < challenge.hints.length - 1) {
      setRevealedHintIndex((prev) => prev + 1);
    }
  };

  const handleRunTests = async () => {
    setIsRunningTests(true);
    setTestResults(null);
    setSyntaxError(null);
    setHighlightErrorLine(null);

    // Run code against all test cases
    const runnerRes = await runAllTestCases(userCode, challenge.language, challenge.testCases);

    setLastTrace(runnerRes.lastTrace || []);

    if (runnerRes.syntaxError) {
      setSyntaxError(runnerRes.syntaxError);
      if (runnerRes.syntaxError.line) {
        setHighlightErrorLine(runnerRes.syntaxError.line);
      }
    }

    const validation = validateRepairResults(runnerRes.results);
    setTestResults({
      allPassed: runnerRes.allPassed,
      results: runnerRes.results,
      summary: validation.summary,
      passedCount: runnerRes.passedCount,
      totalCount: runnerRes.totalCount,
    });

    setIsRunningTests(false);

    if (runnerRes.allPassed && onComplete) {
      onComplete(challenge.id, true, challenge.points || 150);
    }
  };

  const handleConsultAiDoctor = async () => {
    setIsLoadingAi(true);
    try {
      const errorMsg = syntaxError?.message || `Failing tests in ${challenge.bugType}`;
      const res = await AIService.explainError(errorMsg, userCode, challenge.language);

      if (res && res.message) {
        setAiDiagnosis(res.message);
      } else if (res && res.explanation) {
        setAiDiagnosis(res.explanation);
      } else {
        setAiDiagnosis(challenge.explanation);
      }
    } catch {
      setAiDiagnosis(challenge.explanation);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleVisualize = () => {
    if (onLaunch3D) {
      onLaunch3D({
        id: challenge.id,
        title: challenge.title,
        code: userCode,
        language: challenge.language,
        trace: lastTrace.length > 0 ? lastTrace : null,
        archetype: challenge.archetype || 'array',
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-6xl mx-auto w-full c3d-animate-fade-in pb-12 select-none">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className={`p-1.5 rounded-lg border transition hover:scale-105 cursor-pointer ${
                isBright
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
              title="Return to Challenge Arena Catalog"
            >
              <ArrowLeft size={16} />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight">{challenge.title}</h2>
              {isAlreadyCompleted && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Repaired
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span className="font-semibold text-amber-500">{challenge.category}</span>
              <span>•</span>
              <span
                className={`font-semibold ${
                  challenge.difficulty === 'Easy'
                    ? 'text-emerald-400'
                    : challenge.difficulty === 'Medium'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {challenge.difficulty}
              </span>
              <span>•</span>
              <span className="font-mono">{challenge.points || 150} XP</span>
            </div>
          </div>
        </div>

        {/* Bug Type Badge */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
            <Bug size={13} />
            <span>Bug: {challenge.bugType}</span>
          </span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Monaco Code Editor */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <ChallengeEditor
            code={userCode}
            onChangeCode={setUserCode}
            language={challenge.language}
            readOnly={false}
            height="440px"
            title="Interactive Repair Studio"
            onReset={handleResetCode}
            errorLine={highlightErrorLine}
          />

          {/* Test Runner Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleResetCode}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                isBright
                  ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <RotateCcw size={13} />
              <span>Reset to Buggy Code</span>
            </button>

            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white disabled:opacity-50"
            >
              {isRunningTests ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Compiling & Running Test Suite...</span>
                </>
              ) : (
                <>
                  <Play size={14} className="fill-white" />
                  <span>Test Fix & Run All Cases</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Problem Specs & Test Suite Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Problem Statement Card */}
          <div
            className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
              isBright ? 'bg-white border-slate-200' : 'bg-[#0f131a] border-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
              <FileCheck size={14} />
              <span>Problem Description</span>
            </div>
            <p className="text-xs leading-relaxed opacity-90">{challenge.description}</p>
          </div>

          {/* Visible Test Cases Specifications */}
          <div
            className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
              isBright ? 'bg-white border-slate-200' : 'bg-[#0f131a] border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Test Suite Requirements</span>
              <span className="text-[11px] font-mono text-slate-400">
                {challenge.testCases.length} Cases
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {challenge.testCases.map((tc) => (
                <div
                  key={tc.id}
                  className={`p-2.5 rounded-lg border flex flex-col gap-1 text-[11px] ${
                    isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span>{tc.name}</span>
                    {tc.isHidden && (
                      <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-500/20 text-slate-400">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-slate-400 text-[10px] flex items-center justify-between">
                    <span>Expected:</span>
                    <span className="font-bold text-slate-300 truncate max-w-[150px]">
                      {tc.expectedOutput}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hints Section */}
          {challenge.hints && challenge.hints.length > 0 && (
            <div
              className={`p-3.5 rounded-xl border flex flex-col gap-2 ${
                isBright ? 'bg-white border-slate-200' : 'bg-[#0f131a] border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5 text-amber-500">
                  <HelpCircle size={14} />
                  <span>Repair Hints</span>
                </span>
                {revealedHintIndex < challenge.hints.length - 1 && (
                  <button
                    onClick={handleRevealHint}
                    className="text-[11px] font-semibold text-amber-500 hover:text-amber-400 transition cursor-pointer"
                  >
                    Reveal Hint ({revealedHintIndex + 2}/{challenge.hints.length})
                  </button>
                )}
              </div>

              {revealedHintIndex >= 0 ? (
                <div className="flex flex-col gap-1.5 text-xs">
                  {challenge.hints.slice(0, revealedHintIndex + 1).map((hint, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border text-xs leading-relaxed ${
                        isBright
                          ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                          : 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                      }`}
                    >
                      <span className="font-bold mr-1">Hint {idx + 1}:</span>
                      {hint}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">
                  Stuck? Reveal step-by-step guidance to uncover the bug without giving away the fix.
                </p>
              )}
            </div>
          )}

          {/* AI Code Doctor Assistant */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
              isBright ? 'bg-white border-slate-200' : 'bg-[#0f131a] border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-amber-500" />
              <span className="font-semibold">AI Bug Diagnostic</span>
            </div>
            <button
              onClick={handleConsultAiDoctor}
              disabled={isLoadingAi}
              className="text-amber-500 hover:text-amber-400 font-bold text-xs transition cursor-pointer disabled:opacity-50"
            >
              {isLoadingAi ? 'Analyzing...' : 'Diagnose Bug'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {testResults && (
        <ChallengeResults
          mode="repair"
          isSuccess={testResults.allPassed}
          message={testResults.summary}
          testCaseResults={testResults.results}
          syntaxError={syntaxError}
          explanation={testResults.allPassed ? challenge.explanation : ''}
          aiExplanation={aiDiagnosis}
          onRetry={null}
          onNext={onNext}
          onVisualize3D={handleVisualize}
          earnedXp={challenge.points || 150}
        />
      )}
    </div>
  );
}
