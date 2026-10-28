/**
 * CODE3D-AI: Predict Challenge Workspace Component
 * Implements Mode A: Predict program output, compare with real stdout, and inspect execution.
 */

import React, { useState } from 'react';
import {
  HelpCircle,
  Play,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Terminal,
  Layers,
  Box,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import ChallengeEditor from './ChallengeEditor';
import ChallengeResults from './ChallengeResults';
import { executeProgram } from '../services/challengeRunner';
import { validatePrediction } from '../services/challengeValidator';
import { AIService } from '../../../services/aiService';

export default function PredictChallenge({
  challenge,
  onComplete = null,
  onNext = null,
  onBack = null,
  onLaunch3D = null,
  isAlreadyCompleted = false,
}) {
  const { isBright } = useTheme();

  // Prediction State
  const [predictionMode, setPredictionMode] = useState('option'); // 'option' | 'direct'
  const [selectedOption, setSelectedOption] = useState(null);
  const [directOutput, setDirectOutput] = useState('');

  // Execution & Validation State
  const [isExecuting, setIsExecuting] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [executionOutput, setExecutionOutput] = useState(null);
  const [executionTrace, setExecutionTrace] = useState([]);
  const [aiInsight, setAiInsight] = useState(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Hints State
  const [revealedHintIndex, setRevealedHintIndex] = useState(-1);

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

  const handleRevealHint = () => {
    if (challenge.hints && revealedHintIndex < challenge.hints.length - 1) {
      setRevealedHintIndex((prev) => prev + 1);
    }
  };

  const handleSubmitPrediction = async () => {
    if (predictionMode === 'option' && selectedOption === null) {
      alert('Please select an option before submitting!');
      return;
    }
    if (predictionMode === 'direct' && !directOutput.trim()) {
      alert('Please enter your predicted output before submitting!');
      return;
    }

    setIsExecuting(true);
    setValidationResult(null);

    // 1. Run the real program through the execution engine
    const execRes = await executeProgram({
      code: challenge.code,
      language: challenge.language,
      input: challenge.input || '',
      archetype: challenge.archetype || 'variables',
    });

    setExecutionOutput(execRes.output);
    setExecutionTrace(execRes.trace || []);

    // 2. Validate prediction against real/expected output
    const validation = validatePrediction({
      userOutput: directOutput,
      expectedOutput: challenge.expectedOutput,
      selectedOptionIndex: selectedOption,
      correctOptionIndex: challenge.correctOptionIndex,
      mode: predictionMode,
    });

    setValidationResult(validation);
    setIsExecuting(false);

    if (validation.isCorrect && onComplete) {
      onComplete(challenge.id, true, challenge.points || 100);
    }
  };

  const handleFetchAiExplanation = async () => {
    setIsLoadingAi(true);
    try {
      const res = await AIService.explainCode(challenge.code, challenge.language);
      if (res && res.message) {
        setAiInsight(res.message);
      } else if (res && res.explanation) {
        setAiInsight(res.explanation);
      } else {
        setAiInsight(challenge.explanation);
      }
    } catch {
      setAiInsight(challenge.explanation);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleRetry = () => {
    setValidationResult(null);
    setSelectedOption(null);
    setDirectOutput('');
  };

  const handleVisualize = () => {
    if (onLaunch3D) {
      onLaunch3D({
        id: challenge.id,
        title: challenge.title,
        code: challenge.code,
        language: challenge.language,
        trace: executionTrace.length > 0 ? executionTrace : null,
        archetype: challenge.archetype || 'array',
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-6xl mx-auto w-full c3d-animate-fade-in pb-12 select-none">
      {/* Challenge Navigation Bar */}
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
                  <CheckCircle2 size={11} /> Solved
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
              <span className="font-mono">{challenge.points || 100} XP</span>
            </div>
          </div>
        </div>

        {/* Mode Switcher: Option vs Direct Input */}
        <div className="flex items-center gap-2">
          <div
            className={`p-1 rounded-xl border flex items-center text-xs font-semibold ${
              isBright ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <button
              onClick={() => setPredictionMode('option')}
              className={`px-3 py-1 rounded-lg transition ${
                predictionMode === 'option'
                  ? isBright
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'bg-slate-800 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Multiple Choice
            </button>
            <button
              onClick={() => setPredictionMode('direct')}
              className={`px-3 py-1 rounded-lg transition ${
                predictionMode === 'direct'
                  ? isBright
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'bg-slate-800 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Terminal CLI Input
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Monaco Code Viewer */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <ChallengeEditor
            code={challenge.code}
            language={challenge.language}
            readOnly={true}
            height="400px"
            title={`${challenge.title} (Read-Only Snippet)`}
          />

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
                  <span>Progressive Hints</span>
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
                  Need a clue? Click &quot;Reveal Hint&quot; to inspect subtle nuances without spoiling the answer.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Prediction Workspace */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div
            className={`p-4 rounded-xl border flex flex-col gap-3.5 ${
              isBright ? 'bg-white border-slate-200' : 'bg-[#0f131a] border-slate-800'
            }`}
          >
            <div>
              <h3 className="font-bold text-sm">Predict Program Output</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {predictionMode === 'option'
                  ? 'Select the exact value or string printed to standard output.'
                  : 'Type the exact stdout output produced by this program.'}
              </p>
            </div>

            {/* Mode A1: Multiple Choice Options */}
            {predictionMode === 'option' && challenge.options && (
              <div className="grid grid-cols-1 gap-2.5">
                {challenge.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const optionLetters = ['A', 'B', 'C', 'D'];

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(idx)}
                      disabled={validationResult !== null}
                      className={`c3d-option-card p-3 rounded-xl border text-left flex items-start gap-3 transition cursor-pointer ${
                        isSelected
                          ? isBright
                            ? 'bg-amber-50 border-amber-400 text-slate-900 shadow-xs'
                            : 'bg-amber-950/30 border-amber-500 text-amber-100 shadow-md shadow-amber-950/20'
                          : isBright
                          ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                          : 'bg-[#131722] border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-amber-500 text-white'
                            : isBright
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {optionLetters[idx]}
                      </div>
                      <div className="font-mono text-xs whitespace-pre-wrap break-all self-center">
                        {opt}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Mode A2: Direct Terminal Output Input */}
            {predictionMode === 'direct' && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Terminal size={12} />
                  <span>Direct Standard Output Buffer:</span>
                </div>
                <textarea
                  value={directOutput}
                  onChange={(e) => setDirectOutput(e.target.value)}
                  disabled={validationResult !== null}
                  rows={4}
                  placeholder="e.g. 10 or [20, 40]"
                  className={`w-full p-3 rounded-xl font-mono text-xs border outline-hidden transition ${
                    isBright
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                      : 'bg-[#131722] border-slate-800 text-slate-100 focus:border-amber-500'
                  }`}
                />
              </div>
            )}

            {/* Submission Button */}
            {!validationResult && (
              <button
                onClick={handleSubmitPrediction}
                disabled={isExecuting}
                className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <span>Executing Real Program...</span>
                  </>
                ) : (
                  <>
                    <Play size={14} className="fill-white" />
                    <span>Run & Verify Prediction</span>
                  </>
                )}
              </button>
            )}

            {/* AI Assistant Diagnostic Trigger */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-400">Need AI insight?</span>
              <button
                onClick={handleFetchAiExplanation}
                disabled={isLoadingAi}
                className="text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={12} />
                <span>{isLoadingAi ? 'Consulting AI...' : 'Ask AI Tutor'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {validationResult && (
        <ChallengeResults
          mode="predict"
          isSuccess={validationResult.isCorrect}
          message={validationResult.message}
          validationResult={validationResult}
          explanation={challenge.explanation}
          aiExplanation={aiInsight}
          onRetry={handleRetry}
          onNext={onNext}
          onVisualize3D={handleVisualize}
          earnedXp={challenge.points || 100}
        />
      )}
    </div>
  );
}
