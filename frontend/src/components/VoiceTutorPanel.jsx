import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Code2,
  AlertTriangle,
  X,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useTheme } from '../context/ThemeContext';

export default function VoiceTutorPanel({
  explanationData = null,
  code = '',
  language = 'java',
  currentLineNumber = null,
  onHighlightLine = null,
  onExplainCode = null,
  onExplainLine = null,
  isExplaining = false,
  onClose = null,
}) {
  const { isBright } = useTheme();
  const {
    supported,
    speaking,
    paused,
    voiceLanguage,
    rate,
    voices,
    voiceName,
    speechError,
    clearSpeechError,
    setVoiceLanguage,
    setRate,
    setVoiceName,
    speak,
    speakSequence,
    pause,
    resume,
    stop,
    repeat,
  } = useTextToSpeech();

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [silentMode, setSilentMode] = useState(false);
  const autoPlayOnExplainRef = React.useRef(false);

  const steps = explanationData?.lineSteps || [];
  const activeStep = steps[currentStepIdx] || steps[0] || null;

  // Whenever active step changes, inform parent editor to highlight line
  useEffect(() => {
    if (activeStep?.lineNumber && typeof onHighlightLine === 'function') {
      onHighlightLine(activeStep.lineNumber);
    }
  }, [activeStep, onHighlightLine]);

  // When new explanationData arrives, reset step index to 0 and autoplay if requested
  useEffect(() => {
    if (explanationData?.lineSteps?.length) {
      setCurrentStepIdx(0);
      if (autoPlayOnExplainRef.current) {
        autoPlayOnExplainRef.current = false;
        speakSequence(explanationData.lineSteps, {
          startIndex: 0,
          onStepChange: (idx, item) => {
            setCurrentStepIdx(idx);
            if (item.lineNumber && typeof onHighlightLine === 'function') {
              onHighlightLine(item.lineNumber);
            }
          },
        });
      }
    }
  }, [explanationData, onHighlightLine, speakSequence]);

  // Handle Play All sequence
  const handlePlayAll = () => {
    if (steps.length === 0) {
      if (explanationData?.overview) {
        speak(explanationData.overview, { force: true });
      } else if (onExplainCode) {
        autoPlayOnExplainRef.current = true;
        onExplainCode();
      }
      return;
    }

    setSilentMode(false);
    speakSequence(steps, {
      startIndex: currentStepIdx,
      onStepChange: (idx, item) => {
        setCurrentStepIdx(idx);
        if (item.lineNumber && typeof onHighlightLine === 'function') {
          onHighlightLine(item.lineNumber);
        }
      },
      onComplete: () => {
        // completed sequence
      },
    });
  };

  const handleSpeakCurrentStep = (stepToSpeak = activeStep) => {
    if (!stepToSpeak) return;
    setSilentMode(false);
    if (stepToSpeak.lineNumber && typeof onHighlightLine === 'function') {
      onHighlightLine(stepToSpeak.lineNumber);
    }
    const textToNarrate = stepToSpeak.text || `Line ${stepToSpeak.lineNumber}. ${stepToSpeak.explanation}`;
    speak(textToNarrate, { force: true, lineNumber: stepToSpeak.lineNumber });
  };

  const handleNext = () => {
    if (currentStepIdx < steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      if (!silentMode && speaking) {
        handleSpeakCurrentStep(steps[nextIdx]);
      } else if (steps[nextIdx]?.lineNumber && typeof onHighlightLine === 'function') {
        onHighlightLine(steps[nextIdx].lineNumber);
      }
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      if (!silentMode && speaking) {
        handleSpeakCurrentStep(steps[prevIdx]);
      } else if (steps[prevIdx]?.lineNumber && typeof onHighlightLine === 'function') {
        onHighlightLine(steps[prevIdx].lineNumber);
      }
    }
  };

  const handleTogglePlay = () => {
    if (speaking) {
      if (paused) resume();
      else pause();
    } else {
      handlePlayAll();
    }
  };

  const handleStopAll = () => {
    stop();
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xl ${
        isBright
          ? 'bg-white border-slate-300 text-slate-800 shadow-slate-300'
          : 'bg-[#090d16]/95 border-amber-500/40 text-slate-100 shadow-amber-950/40 backdrop-blur-md'
      }`}
    >
      {/* Top Header */}
      <div
        className={`px-4 py-3 border-b flex items-center justify-between gap-2 ${
          isBright ? 'bg-gradient-to-r from-amber-50/60 to-slate-100 border-slate-200' : 'bg-gradient-to-r from-amber-950/30 to-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Volume2 size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide">Universal AI Voice Tutor</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase font-semibold">
                {language}
              </span>
            </div>
            <span className="text-[10px] opacity-70">
              {steps.length > 0
                ? `Step ${currentStepIdx + 1} of ${steps.length}`
                : isExplaining
                ? 'AI is analyzing code...'
                : 'Spoken learning & line sync ready'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language selector: English / Hindi */}
          <select
            value={voiceLanguage}
            onChange={(e) => setVoiceLanguage(e.target.value)}
            className={`text-[11px] h-7 px-2 rounded-lg border cursor-pointer font-medium ${
              isBright ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700 text-amber-200'
            }`}
            title="Narration Language"
          >
            <option value="en-US">English</option>
            <option value="hi-IN">Hindi (हिंदी)</option>
          </select>

          {/* Speed selector */}
          <select
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className={`text-[11px] h-7 px-1.5 rounded-lg border cursor-pointer font-medium ${
              isBright ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700'
            }`}
            title="Speaking Speed"
          >
            <option value={0.8}>0.8×</option>
            <option value={1}>1.0×</option>
            <option value={1.2}>1.2×</option>
          </select>

          {onClose && (
            <button
              onClick={() => {
                stop();
                onClose();
              }}
              className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-slate-700/40 transition cursor-pointer"
              title="Close Voice Tutor"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Speech / Audio Error Banner */}
      {speechError && (
        <div className="px-4 py-2 bg-rose-500/10 border-b border-rose-500/30 flex items-center justify-between text-xs text-rose-300 gap-2">
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-rose-400 shrink-0" />
            <span>{speechError}</span>
          </div>
          <button
            onClick={clearSpeechError}
            className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 transition cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Unsupported Browser Banner */}
      {!supported && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
          <AlertTriangle size={14} className="text-amber-400 shrink-0" />
          <span>Browser Speech Synthesis is not supported in this browser. Please use Chrome, Edge, or Safari.</span>
        </div>
      )}

      {/* Backend Fallback Note */}
      {explanationData?.errorMessage && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/30 flex items-center justify-between text-xs text-amber-300 gap-2">
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-amber-400 shrink-0" />
            <span>Note: {explanationData.errorMessage}. Using code-aware analysis.</span>
          </div>
        </div>
      )}

      {/* Main Body */}
      <div className="p-4 space-y-3.5">
        {/* Action Triggers: Explain Code & Explain Current Line */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onExplainCode && onExplainCode()}
            disabled={isExplaining}
            className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50 ${
              isBright
                ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
            }`}
          >
            {isExplaining ? (
              <RefreshCw size={13} className="animate-spin text-amber-400" />
            ) : (
              <Sparkles size={13} className="text-amber-400" />
            )}
            <span>Explain Code</span>
          </button>

          <button
            type="button"
            onClick={() => onExplainLine && onExplainLine(currentLineNumber || 1)}
            disabled={isExplaining}
            className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50 ${
              isBright
                ? 'bg-cyan-50 border-cyan-300 text-cyan-900 hover:bg-cyan-100'
                : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25'
            }`}
          >
            <Code2 size={13} className="text-cyan-400" />
            <span>Explain Line {currentLineNumber ? `L${currentLineNumber}` : '1'}</span>
          </button>
        </div>

        {/* Loading Indicator */}
        {isExplaining && (
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-3 text-xs text-amber-200">
            <RefreshCw size={16} className="animate-spin text-amber-400 shrink-0" />
            <span>Analyzing code structure with AI and generating line-by-line speech...</span>
          </div>
        )}

        {/* Overview Box */}
        {explanationData?.overview && (
          <div
            className={`p-3 rounded-xl text-xs leading-relaxed border ${
              isBright
                ? 'bg-cyan-50/60 border-cyan-200 text-slate-700'
                : 'bg-cyan-950/20 border-cyan-800/40 text-cyan-100'
            }`}
          >
            <p className="font-medium">{explanationData.overview}</p>
            {explanationData.complexity && (
              <div className="mt-2.5 flex flex-wrap gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 font-mono text-cyan-300 font-semibold">
                  Time: {explanationData.complexity.time}
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 font-mono text-purple-300 font-semibold">
                  Space: {explanationData.complexity.space}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Active Line Step Card */}
        {activeStep ? (
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              isBright
                ? 'bg-slate-50 border-slate-200'
                : 'bg-slate-950/70 border-slate-800 shadow-inner'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Code2 size={12} />
                Line {activeStep.lineNumber}
              </span>
              <span className="text-[10px] opacity-60 font-mono truncate max-w-[200px]">
                {activeStep.codeLine}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-slate-300">
              {activeStep.explanation}
            </p>
          </div>
        ) : !isExplaining && !explanationData?.overview ? (
          <div className="p-3.5 rounded-xl border border-dashed border-slate-700 text-center text-xs text-slate-400 space-y-1">
            <p className="font-medium text-slate-300">No explanation generated yet.</p>
            <p className="text-[11px] text-slate-500">
              Click <strong>Explain Code</strong> or <strong>Explain Line</strong> above to start spoken AI walkthrough.
            </p>
          </div>
        ) : null}

        {/* Error warning if present */}
        {explanationData?.error && (
          <div className="p-2.5 rounded-lg text-xs bg-rose-950/40 border border-rose-800/50 text-rose-200 flex items-start gap-2">
            <AlertTriangle size={15} className="text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Execution Error Guidance:</p>
              <p className="opacity-90">{explanationData.error}</p>
            </div>
          </div>
        )}

        {/* Playback & Step Controls */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleTogglePlay}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 transition cursor-pointer shadow-sm"
              title={speaking ? (paused ? 'Resume Narration' : 'Pause Narration') : 'Play All Steps'}
            >
              {speaking && !paused ? (
                <>
                  <Pause size={13} /> Pause
                </>
              ) : (
                <>
                  <Play size={13} /> {paused ? 'Resume' : 'Play All'}
                </>
              )}
            </button>

            {speaking && (
              <button
                onClick={handleStopAll}
                className="p-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                title="Stop Speech"
              >
                <Square size={13} />
              </button>
            )}

            {activeStep && (
              <button
                onClick={() => handleSpeakCurrentStep(activeStep)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-700 hover:border-amber-500 transition cursor-pointer"
                title="Speak Current Line Only"
              >
                <Volume2 size={13} />
                <span>Repeat Line</span>
              </button>
            )}

            <button
              onClick={repeat}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Repeat Last Narration"
            >
              <RotateCcw size={13} />
            </button>
          </div>

          {/* Stepper Controls */}
          {steps.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                disabled={currentStepIdx === 0}
                className="p-1.5 rounded-lg border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:border-amber-500 transition cursor-pointer"
                title="Previous Step"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[10px] font-mono px-1 opacity-70">
                {currentStepIdx + 1}/{steps.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentStepIdx === steps.length - 1}
                className="p-1.5 rounded-lg border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:border-amber-500 transition cursor-pointer"
                title="Next Step"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
