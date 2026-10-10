import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Design System & Common
import { VisualizerErrorBoundary, EditorErrorBoundary } from '../components/ErrorBoundaries';

// Feature Layers
import ThreePanelWorkspace from '../features/workspace/ThreePanelWorkspace';
import WorkspaceToolbar from '../features/workspace/WorkspaceToolbar';
import CodeEditorPanel from '../features/editor/CodeEditorPanel';
import VisualizationViewport from '../features/visualization/VisualizationViewport';
import ExplanationPanel from '../features/explanation/ExplanationPanel';
import ExecutionTimelineBar from '../features/timeline/ExecutionTimelineBar';
import OutputConsoleDrawer from '../features/console/OutputConsoleDrawer';
import { normalizeTrace } from '../features/execution/normalizeTrace';

// Modals & Drawers
import StriverSheetDrawer from '../components/StriverSheetDrawer';
import CustomCodeModal from '../components/CustomCodeModal';
import CodeDoctorModal from '../components/CodeDoctorModal';
import QuizModal from '../components/QuizModal';
import CompareModeModal from '../components/CompareModeModal';
import AiAssistantModal from '../components/AiAssistantModal';

// Catalogs & Services
import { getCanonicalConcept, CANONICAL_CONCEPTS } from '../data/canonicalCatalog';
import { useExecutionTimeline } from '../hooks/useExecutionTimeline';
import { executionManager } from '../execution';
import { getExecutionTrace } from '../services/executionSimulator';
import { historyApi } from '../services/api';
import { safeIncludes } from '../utils/safeRender';
import { getAlgorithmCode } from '../utils/multiLanguageTemplates';

/**
 * Visualizer Component - Main Composition & Orchestration Root
 * 
 * Compliant with Sections 2, 4, 5, 6, 7, 8, 9, 10, 12, 13, 22 & 34:
 * Refactored from a 1,340-line monolith into a high-performance composition model.
 */
export default function Visualizer({ initialConcept, initialOpenStriver = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine starting concept from props, router state, or default canonical concept
  const startingConcept = useMemo(() => {
    const raw = initialConcept || location?.state?.concept;
    if (raw) return raw;
    return getCanonicalConcept('bubble-sort');
  }, [initialConcept, location?.state]);

  // Core Program State
  const [currentConcept, setCurrentConcept] = useState(startingConcept);
  const [code, setCode] = useState(startingConcept?.code || startingConcept?.starterCode || '');
  const [lastExecutedCode, setLastExecutedCode] = useState(startingConcept?.code || startingConcept?.starterCode || '');
  const [language, setLanguage] = useState(startingConcept?.language || 'java');
  const [customInput, setCustomInput] = useState('');

  // Complexity State
  const [timeComplexity, setTimeComplexity] = useState(startingConcept?.timeComplexity || 'O(n)');
  const [spaceComplexity, setSpaceComplexity] = useState(startingConcept?.spaceComplexity || 'O(1)');

  // Execution Lifecycle State
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState(null);
  const [selectedVariable, setSelectedVariable] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  // Layout View Modes
  const [viewMode, setViewMode] = useState('default'); // 'default' | 'fullscreen3d' | 'focusCode' | 'focusExplanation'
  const [showConsole, setShowConsole] = useState(false);

  // Modals State
  const [isStriverOpen, setIsStriverOpen] = useState(initialOpenStriver);
  const [isCustomCodeOpen, setIsCustomCodeOpen] = useState(false);
  const [isCodeDoctorOpen, setIsCodeDoctorOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Initialize normalized trace
  const [trace, setTrace] = useState(() => {
    if (startingConcept?.trace && startingConcept.trace.length > 0) {
      return normalizeTrace(startingConcept.trace, {
        time: startingConcept.timeComplexity || 'O(n)',
        space: startingConcept.spaceComplexity || 'O(1)',
      });
    }
    const rawTrace = getExecutionTrace(
      startingConcept?.code || startingConcept?.starterCode || '',
      startingConcept?.language || 'java'
    );
    return normalizeTrace(rawTrace, {
      time: startingConcept.timeComplexity || 'O(n)',
      space: startingConcept.spaceComplexity || 'O(1)',
    });
  });

  // Timeline Hook
  const {
    currentStepIndex,
    currentStep,
    totalSteps,
    isPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    isAtStart,
    isAtEnd,
    nextStep,
    prevStep,
    goToStep,
    play,
    pause,
    reset,
    breakpoints,
    toggleBreakpoint,
    cumulativeOutput,
  } = useExecutionTimeline(trace);

  const isCodeDirty = code !== lastExecutedCode;

  // Sync when concept changes from navigation
  useEffect(() => {
    const incoming = initialConcept || location?.state?.concept;
    if (incoming) {
      setCurrentConcept(incoming);
      const incomingCode = incoming.code || incoming.starterCode || '';
      setCode(incomingCode);
      setLastExecutedCode(incomingCode);
      if (incoming.language) setLanguage(incoming.language);
      if (incoming.timeComplexity) setTimeComplexity(incoming.timeComplexity);
      if (incoming.spaceComplexity) setSpaceComplexity(incoming.spaceComplexity);

      const raw = incoming.trace && incoming.trace.length > 0
        ? incoming.trace
        : getExecutionTrace(incomingCode, incoming.language || 'java');

      const normalized = normalizeTrace(raw, {
        time: incoming.timeComplexity || 'O(n)',
        space: incoming.spaceComplexity || 'O(1)',
      });
      setTrace(normalized);
      reset();
      setTimeout(() => play(), 100);
    }
  }, [initialConcept, location?.state]);

  // Master Run Pipeline
  const handleRunCode = useCallback(async () => {
    if (!code || !code.trim() || isExecuting) return;

    setIsExecuting(true);
    setExecutionError(null);

    try {
      const runRes = await executionManager.run({
        code,
        language,
        input: customInput,
        archetype: currentConcept?.visualizationType || currentConcept?.id,
      });

      if (!runRes.success) {
        setExecutionError(runRes.error?.message || 'Execution error detected.');
        setIsExecuting(false);
        return;
      }

      const normalized = normalizeTrace(runRes.steps, {
        time: currentConcept?.timeComplexity || 'O(n)',
        space: currentConcept?.spaceComplexity || 'O(1)',
      });

      setTrace(normalized);
      setLastExecutedCode(code);
      reset();
      setTimeout(() => play(), 80);

      // Record to history
      historyApi.recordExecution({
        title: currentConcept?.title || 'Custom Algorithm',
        code,
        language,
        status: 'SUCCESS',
        stepCount: normalized.length,
      });
    } catch (err) {
      setExecutionError(err.message || 'Execution failed. Please verify syntax.');
    } finally {
      setIsExecuting(false);
    }
  }, [code, language, customInput, currentConcept, isExecuting, reset, play]);

  // Reset to original starter code
  const handleResetCode = useCallback(() => {
    const origCode = getAlgorithmCode(
      currentConcept?.id || 'array-loop',
      language,
      currentConcept?.code || currentConcept?.starterCode || ''
    );
    setCode(origCode);
    setLastExecutedCode(origCode);
    setExecutionError(null);

    const raw = currentConcept?.trace && currentConcept.trace.length > 0
      ? currentConcept.trace
      : getExecutionTrace(origCode, language);

    setTrace(normalizeTrace(raw, { time: timeComplexity, space: spaceComplexity }));
    reset();
  }, [currentConcept, language, timeComplexity, spaceComplexity, reset]);

  // Clear code
  const handleClearCode = useCallback(() => {
    setCode('');
    setExecutionError(null);
  }, []);

  // Language Change: update language and load corresponding language template
  const handleLanguageChange = useCallback((newLang) => {
    setLanguage(newLang);
    setExecutionError(null);

    const newCode = getAlgorithmCode(
      currentConcept?.id || 'array-loop',
      newLang,
      currentConcept?.code || currentConcept?.starterCode || ''
    );
    if (newCode) {
      setCode(newCode);
      setLastExecutedCode(newCode);
    }
  }, [currentConcept]);

  // Bidirectional: Variable click -> seek timeline or highlight 3D
  const handleSelectVariable = useCallback((name) => {
    setSelectedVariable(name);
    if (!trace || trace.length === 0) return;

    // Find next step where this variable mutates
    const forwardStep = trace.findIndex(
      (step, idx) => idx >= currentStepIndex && step.changedVariable === name
    );
    if (forwardStep !== -1) {
      goToStep(forwardStep);
      return;
    }

    // Otherwise find any step where variable was declared/mutated
    const anyStep = trace.findIndex((step) => step.changedVariable === name);
    if (anyStep !== -1) {
      goToStep(anyStep);
    }
  }, [trace, currentStepIndex, goToStep]);

  // Bidirectional: 3D Element click -> seek timeline step
  const handleSelectElementFrom3D = useCallback((index) => {
    if (!trace || trace.length === 0 || typeof index !== 'number') return;

    const forwardStep = trace.findIndex((step, idx) => {
      if (idx <= currentStepIndex) return false;
      const ds = step.dataStructureState || step.dataStructure;
      return ds?.activeIndex === index || (ds?.pointers && safeIncludes(Object.values(ds.pointers), index));
    });

    if (forwardStep !== -1) {
      goToStep(forwardStep);
      return;
    }

    const anyStep = trace.findIndex((step) => {
      const ds = step.dataStructureState || step.dataStructure;
      return ds?.activeIndex === index || (ds?.pointers && safeIncludes(Object.values(ds.pointers), index));
    });

    if (anyStep !== -1) {
      goToStep(anyStep);
    }
  }, [trace, currentStepIndex, goToStep]);

  // Save Program Trace
  const handleSaveProgram = useCallback(async () => {
    setSaveStatus('SAVING');
    try {
      await historyApi.saveProgram({
        title: currentConcept?.title || 'Custom Algorithm',
        code,
        language,
        trace,
        timeComplexity,
        spaceComplexity,
      });
      setSaveStatus('SAVED');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus(null);
    }
  }, [currentConcept, code, language, trace, timeComplexity, spaceComplexity]);

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden select-none">
      {/* Top Workspace Toolbar */}
      <WorkspaceToolbar
        language={language}
        onLanguageChange={handleLanguageChange}
        isCodeDirty={isCodeDirty}
        isExecuting={isExecuting}
        executionError={executionError}
        onRunCode={handleRunCode}
        onResetCode={handleResetCode}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showConsole={showConsole}
        onToggleConsole={() => setShowConsole((prev) => !prev)}
        onSaveProgram={handleSaveProgram}
        saveStatus={saveStatus}
        algorithmTitle={currentConcept?.title || 'Algorithm Studio'}
      />

      {/* Central 3-Panel Resizable Workspace */}
      <ThreePanelWorkspace
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showConsole={showConsole}
        codePanel={
          <EditorErrorBoundary code={code} onChangeCode={setCode}>
            <CodeEditorPanel
              code={code}
              onChangeCode={setCode}
              currentLineNumber={currentStep?.lineNumber || 1}
              language={language}
              isCodeDirty={isCodeDirty}
              isExecuting={isExecuting}
              executionError={executionError}
              onRunCode={handleRunCode}
              onResetCode={handleResetCode}
              onClearCode={handleClearCode}
              customInput={customInput}
              onChangeCustomInput={setCustomInput}
              breakpoints={breakpoints}
              onToggleBreakpoint={toggleBreakpoint}
            />
          </EditorErrorBoundary>
        }
        scenePanel={
          <VisualizationViewport
            currentStep={currentStep}
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            onSelectElement={handleSelectElementFrom3D}
            isFull3DView={viewMode === 'fullscreen3d'}
            onToggleFull3D={() => setViewMode((m) => (m === 'fullscreen3d' ? 'default' : 'fullscreen3d'))}
          />
        }
        explanationPanel={
          <ExplanationPanel
            currentStep={currentStep}
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            timeComplexity={timeComplexity}
            spaceComplexity={spaceComplexity}
            onSelectVariable={handleSelectVariable}
            selectedVariable={selectedVariable}
          />
        }
        consoleDrawer={
          <OutputConsoleDrawer
            output={cumulativeOutput || currentStep?.output || []}
            executionError={executionError}
            isExecuting={isExecuting}
            onClear={() => {}}
            onClose={() => setShowConsole(false)}
          />
        }
      />

      {/* Docked Execution Timeline Scrubber */}
      <ExecutionTimelineBar
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        currentStep={currentStep}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        onChangePlaybackSpeed={setPlaybackSpeed}
        onFirstStep={() => goToStep(0)}
        onPrevStep={prevStep}
        onPlay={play}
        onPause={pause}
        onNextStep={nextStep}
        onLastStep={() => goToStep(totalSteps - 1)}
        onReset={reset}
        onGoToStep={goToStep}
        isAtStart={isAtStart}
        isAtEnd={isAtEnd}
      />

      {/* Modular Drawers & Modals */}
      {isStriverOpen && (
        <StriverSheetDrawer
          isOpen={isStriverOpen}
          onClose={() => setIsStriverOpen(false)}
          onSelectProblem={(prob) => {
            setIsStriverOpen(false);
            if (prob) {
              setCurrentConcept(prob);
              setCode(prob.code || prob.starterCode || '');
              setLastExecutedCode(prob.code || prob.starterCode || '');
              handleRunCode();
            }
          }}
        />
      )}

      {isCustomCodeOpen && (
        <CustomCodeModal
          isOpen={isCustomCodeOpen}
          onClose={() => setIsCustomCodeOpen(false)}
          onLoadCustomCode={({ code: newCode, language: newLang }) => {
            setIsCustomCodeOpen(false);
            if (newCode) {
              setCode(newCode);
              setLastExecutedCode('');
              if (newLang) setLanguage(newLang);
              handleRunCode();
            }
          }}
        />
      )}

      {isCodeDoctorOpen && (
        <CodeDoctorModal
          isOpen={isCodeDoctorOpen}
          onClose={() => setIsCodeDoctorOpen(false)}
          code={code}
          language={language}
          error={executionError}
          onApplyFix={(fixedCode) => {
            setIsCodeDoctorOpen(false);
            if (fixedCode) {
              setCode(fixedCode);
              handleRunCode();
            }
          }}
        />
      )}

      {isQuizOpen && (
        <QuizModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          concept={currentConcept}
        />
      )}

      {isCompareOpen && (
        <CompareModeModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
        />
      )}

      {isAiOpen && (
        <AiAssistantModal
          isOpen={isAiOpen}
          onClose={() => setIsAiOpen(false)}
          currentConcept={currentConcept}
          code={code}
        />
      )}
    </div>
  );
}
