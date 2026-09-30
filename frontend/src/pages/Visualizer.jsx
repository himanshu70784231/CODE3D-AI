import React, { useState, useEffect, useRef, useCallback } from 'react';
import TopNav from '../components/TopNav.jsx';
import EditorPanel from '../components/EditorPanel.jsx';
import ScenePanel from '../components/ScenePanel.jsx';
import VariablePanel from '../components/VariablePanel.jsx';
import ConditionPanel from '../components/ConditionPanel.jsx';
import AiPanel from '../components/AiPanel.jsx';
import OutputConsole from '../components/OutputConsole.jsx';
import Timeline from '../components/Timeline.jsx';
import ResizeHandle from '../components/ResizeHandle.jsx';
import InputGenerator from '../components/InputGenerator.jsx';
import StepInspector from '../components/StepInspector.jsx';
import ComplexityPanel from '../components/ComplexityPanel.jsx';
import DsaSceneDispatcher from '../visualizers/DsaSceneDispatcher.jsx';
import AiAssistantModal from '../components/AiAssistantModal.jsx';
import QuizModal from '../components/QuizModal.jsx';
import CustomCodeModal from '../components/CustomCodeModal.jsx';
import CodeDoctorModal from '../components/CodeDoctorModal.jsx';
import StriverSheetDrawer from '../components/StriverSheetDrawer.jsx';
import CompareModeModal from '../components/CompareModeModal.jsx';
import { VisualizerErrorBoundary, EditorErrorBoundary } from '../components/ErrorBoundaries.jsx';

import { ALGORITHM_CATALOG } from '../algorithms/index.js';
import { useExecutionTimeline } from '../hooks/useExecutionTimeline.js';
import { getExecutionTrace, extractNumbersFromCode } from '../services/executionSimulator.js';
import { validateSourceCode } from '../services/codeValidator.js';
import { DEFAULT_JAVA_CODE, SAMPLE_PROGRAMS, LANGUAGE_DEFAULTS, CURRICULUM_CATEGORIES } from '../utils/sampleCodes.js';
import { STRIVER_PROBLEMS } from '../utils/striverCatalog.js';
import { executeProgram, analyzeCode, checkBackendHealth, recordExecutionHistory, saveProgram } from '../services/apiService.js';
import { executionManager } from '../execution/index.js';
import { safeIncludes } from '../utils/safeRender.js';

import {
  Layers,
  BookOpen,
  Code2,
  Lightbulb,
  Settings,
  Sparkles,
  Cpu,
  Variable,
  GitBranch,
  Terminal,
  Clock,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';

export default function Visualizer({ initialConcept, initialOpenStriver = false }) {
  // Core Program & Execution State
  const [selectedSample, setSelectedSample] = useState(initialConcept || SAMPLE_PROGRAMS[0]);
  const [code, setCode] = useState(initialConcept?.code || DEFAULT_JAVA_CODE);
  const [lastExecutedCode, setLastExecutedCode] = useState(initialConcept?.code || DEFAULT_JAVA_CODE);
  const isCodeDirty = code !== lastExecutedCode;

  const [language, setLanguage] = useState(initialConcept?.language || 'java');
  const [trace, setTrace] = useState(() => {
    if (initialConcept?.trace && initialConcept.trace.length > 0) {
      return initialConcept.trace;
    }
    return getExecutionTrace(initialConcept?.code || DEFAULT_JAVA_CODE, initialConcept?.language || 'java');
  });

  const [backendOnline, setBackendOnline] = useState(false);
  const [timeComplexity, setTimeComplexity] = useState(initialConcept?.timeComplexity || SAMPLE_PROGRAMS[0].timeComplexity);
  const [spaceComplexity, setSpaceComplexity] = useState(initialConcept?.spaceComplexity || SAMPLE_PROGRAMS[0].spaceComplexity);
  const [formInputValues, setFormInputValues] = useState('10, 20, 30, 40');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState(null);
  const [syntaxErrorLine, setSyntaxErrorLine] = useState(null);

  // Modals & Navigation Drawers
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isCustomCodeOpen, setIsCustomCodeOpen] = useState(false);
  const [isCodeDoctorOpen, setIsCodeDoctorOpen] = useState(false);
  const [isStriverSheetOpen, setIsStriverSheetOpen] = useState(initialOpenStriver);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [activeStriverProblem, setActiveStriverProblem] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // null | 'SAVING' | 'SAVED' | 'ERROR'

  // Workspace Panel Dimensions & Collapse States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('concepts'); // 'concepts' | 'striver' | 'input' | 'solver'
  const [sidebarWidthPx, setSidebarWidthPx] = useState(240);

  const [editorWidthPercent, setEditorWidthPercent] = useState(38);
  const [rightPanelWidthPx, setRightPanelWidthPx] = useState(340);
  const [bottomPanelHeightPx, setBottomPanelHeightPx] = useState(175);

  const [editorCollapsed, setEditorCollapsed] = useState(false);
  const [sceneCollapsed, setSceneCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [bottomPanelCollapsed, setBottomPanelCollapsed] = useState(false);
  const [fullscreenPanel, setFullscreenPanel] = useState(null); // null | 'editor' | 'scene' | 'right' | 'bottom'

  const [rightPanelTab, setRightPanelTab] = useState('state'); // 'state' | 'variables' | 'condition' | 'ai'
  const [bottomPanelTab, setBottomPanelTab] = useState('console'); // 'console' | 'timeline'

  // Execution Timeline Hook
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
    finalCorrectOutput,
  } = useExecutionTimeline(trace);

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth().then((isUp) => setBackendOnline(isUp));
  }, []);

  // Sync form input numbers when code or sample changes
  useEffect(() => {
    const nums = extractNumbersFromCode(code);
    if (nums && nums.length > 0) {
      setFormInputValues(nums.join(', '));
    }
  }, [selectedSample]);

  // Load initialConcept if passed from outside
  useEffect(() => {
    if (initialConcept) {
      setSelectedSample(initialConcept);
      setCode(initialConcept.code);
      setLastExecutedCode(initialConcept.code);
      if (initialConcept.language) setLanguage(initialConcept.language);
      setTimeComplexity(initialConcept.timeComplexity || 'O(n)');
      setSpaceComplexity(initialConcept.spaceComplexity || 'O(1)');

      if (initialConcept.trace && initialConcept.trace.length > 0) {
        setTrace(initialConcept.trace);
        reset();
        setTimeout(() => play(), 100);
      } else {
        const fallback = getExecutionTrace(initialConcept.code, initialConcept.language || 'java');
        setTrace(fallback);
        reset();
        setTimeout(() => play(), 100);
      }
    }
  }, [initialConcept]);

  // Handle program save
  const handleSaveProgram = async () => {
    setSaveStatus('SAVING');
    try {
      await saveProgram({
        title: selectedSample?.title || 'Custom Algorithm',
        description: selectedSample?.description || 'Saved from Visualizer',
        code,
        language,
        timeComplexity,
        spaceComplexity,
      });
      setSaveStatus('SAVED');
      setTimeout(() => setSaveStatus(null), 2500);
    } catch {
      setSaveStatus('ERROR');
      setTimeout(() => setSaveStatus(null), 2500);
    }
  };

  // Preset program selection
  const handleSelectProgram = async (prog) => {
    setSelectedSample(prog);
    setCode(prog.code);
    setLastExecutedCode(prog.code);
    setLanguage(prog.language || 'java');
    setTimeComplexity(prog.timeComplexity);
    setSpaceComplexity(prog.spaceComplexity);

    const nums = extractNumbersFromCode(prog.code);
    if (nums && nums.length > 0) {
      setFormInputValues(nums.join(', '));
    }

    const steps = getExecutionTrace(prog.code, prog.language || 'java');
    setTrace(steps);
    reset();
    setTimeout(() => play(), 80);

    recordExecutionHistory({
      programTitle: prog.title,
      conceptId: prog.id,
      language: prog.language || 'java',
      totalSteps: steps.length,
      status: 'COMPLETED',
      code: prog.code,
    });
  };

  // 3D Algorithm catalog selection
  const handleSelectAlgorithm = (algo) => {
    const input = Array.isArray(algo.defaultInput) ? algo.defaultInput : [45, 12, 89, 23, 7, 64, 31];
    const target = algo.defaultTarget !== undefined ? algo.defaultTarget : 23;
    const res = algo.generator(input, target);

    setSelectedSample({
      id: algo.id,
      title: algo.name,
      category: algo.category,
      description: algo.description,
      difficulty: 'Standard',
      timeComplexity: algo.complexity?.time?.average || 'O(n)',
      spaceComplexity: algo.complexity?.space || 'O(1)',
      code: algo.code?.java || '',
      language: 'java',
      complexity: algo.complexity,
    });
    setCode(algo.code?.java || '');
    setLastExecutedCode(algo.code?.java || '');
    setLanguage('java');
    setTimeComplexity(algo.complexity?.time?.average || 'O(n)');
    setSpaceComplexity(algo.complexity?.space || 'O(1)');
    setFormInputValues(Array.isArray(input) ? input.join(', ') : String(input));
    setTrace(res.steps);
    reset();
    setTimeout(() => play(), 80);

    recordExecutionHistory({
      programTitle: algo.name,
      conceptId: algo.id,
      language: 'java',
      totalSteps: res.steps.length,
      status: 'COMPLETED',
      code: algo.code?.java || '',
    });
  };

  // Striver Problem Selection
  const handleSelectStriverProblem = (problem) => {
    setIsStriverSheetOpen(false);
    setActiveStriverProblem(problem);
    const sampleObj = {
      id: problem.id || `striver-${problem.striverId}`,
      title: problem.title,
      category: problem.category,
      description: `${problem.day}: ${problem.title}`,
      difficulty: problem.difficulty,
      timeComplexity: problem.timeComplexity,
      spaceComplexity: problem.spaceComplexity,
      code: problem.code,
    };
    setSelectedSample(sampleObj);
    setCode(problem.code);
    setLastExecutedCode(problem.code);
    if (problem.language) setLanguage(problem.language);
    setTimeComplexity(problem.timeComplexity);
    setSpaceComplexity(problem.spaceComplexity);

    if (problem.defaultInput) {
      setFormInputValues(problem.defaultInput);
    }

    const newSteps = getExecutionTrace(
      problem.code,
      problem.language || language,
      problem.defaultInput,
      problem.archetype
    );

    if (newSteps && newSteps.length > 0) {
      setTrace(newSteps);
      reset();
      setTimeout(() => play(), 60);

      recordExecutionHistory({
        programTitle: problem.title,
        conceptId: `striver-${problem.striverId || problem.id}`,
        language: problem.language || language,
        totalSteps: newSteps.length,
        status: 'COMPLETED',
        code: problem.code,
      });
    }
  };

  // Language Change
  const handleLanguageChange = async (newLang) => {
    setLanguage(newLang);
    const template = LANGUAGE_DEFAULTS[newLang] || DEFAULT_JAVA_CODE;
    setCode(template);
    setLastExecutedCode(template);
    setSelectedSample({
      id: 'custom',
      title: `${newLang.toUpperCase()} Execution`,
      category: 'Multi-Language',
      description: `Dynamic ${newLang.toUpperCase()} execution trace in 3D space.`,
      difficulty: 'Beginner',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      code: template,
    });

    const nums = extractNumbersFromCode(template);
    if (nums && nums.length > 0) {
      setFormInputValues(nums.join(', '));
    }

    const traceSteps = getExecutionTrace(template, newLang);
    setTrace(traceSteps);
    reset();
  };

  // Apply Form Input numbers to code
  const applyNewValuesToCode = (vals) => {
    if (!vals || vals.length === 0) return;
    const inputStr = vals.join(', ');
    setFormInputValues(inputStr);

    let updatedCode = code;
    const hasBracketNumbers = /\[[0-9,\s\-]+\]/.test(updatedCode);
    const hasBraceNumbers = /\{[0-9,\s\-]+\}/.test(updatedCode);

    if (language === 'python' || language === 'javascript') {
      if (hasBracketNumbers) {
        updatedCode = updatedCode.replace(/\[[0-9,\s\-]+\]/, `[${inputStr}]`);
        setCode(updatedCode);
        setLastExecutedCode(updatedCode);
      }
    } else {
      if (hasBraceNumbers) {
        updatedCode = updatedCode.replace(/\{[0-9,\s\-]+\}/, `{${inputStr}}`);
        setCode(updatedCode);
        setLastExecutedCode(updatedCode);
      }
    }

    const newSteps = getExecutionTrace(
      updatedCode,
      language,
      inputStr,
      activeStriverProblem?.archetype
    );

    if (newSteps && newSteps.length > 0) {
      setTrace(newSteps);
      reset();
      setTimeout(() => play(), 60);
    }
  };

  // Custom Code Modal Apply
  const handleCustomCodeApply = async ({ code: customCode, language: customLang }) => {
    setLanguage(customLang);
    setCode(customCode);
    setLastExecutedCode(customCode);
    setSelectedSample({
      id: 'custom',
      title: `Custom ${customLang.toUpperCase()} Code`,
      category: 'Custom Algorithms',
      description: 'User-submitted code dynamically analyzed and rendered in 3D.',
      difficulty: 'Custom',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      code: customCode,
    });

    const nums = extractNumbersFromCode(customCode);
    if (nums && nums.length > 0) {
      setFormInputValues(nums.join(', '));
    }

    const newSteps = getExecutionTrace(customCode, customLang);
    if (newSteps && newSteps.length > 0) {
      setTrace(newSteps);
      reset();
      setTimeout(() => play(), 50);

      recordExecutionHistory({
        programTitle: `Custom ${customLang.toUpperCase()} Code`,
        conceptId: 'custom',
        language: customLang,
        totalSteps: newSteps.length,
        status: 'COMPLETED',
        code: customCode,
      });
    }
  };

  // Run Code Pipeline
  const handleRunCode = async () => {
    if (isPlaying) {
      pause();
      return;
    }
    if (!isCodeDirty && !isAtEnd && !isAtStart && !syntaxErrorLine) {
      play();
      return;
    }

    if (!code || !code.trim()) {
      setExecutionError('Cannot execute empty code! Please enter code or select a sample.');
      return;
    }

    const validation = validateSourceCode(code, language);
    if (!validation.isValid) {
      const err = validation.error;
      setSyntaxErrorLine(err.line);
      setExecutionError(`[Syntax Diagnostic at Line ${err.line}] ${err.message} — ${err.suggestion}`);
      setIsExecuting(false);
      pause();
      return;
    }

    setSyntaxErrorLine(null);
    setIsExecuting(true);
    setExecutionError(null);

    try {
      const runRes = await executionManager.run({
        code,
        language,
        input: formInputValues,
        archetype: activeStriverProblem?.archetype,
        preferBackend: backendOnline,
      });

      if (!runRes.success) {
        const err = runRes.error || {};
        setSyntaxErrorLine(err.line || 1);
        setExecutionError(err.message || 'Could not parse execution steps. Please check syntax.');
        return;
      }

      const newSteps = runRes.steps;
      if (newSteps && newSteps.length > 0) {
        setTrace(newSteps);
        setLastExecutedCode(code);
        reset();
        setTimeout(() => play(), 60);

        recordExecutionHistory({
          programTitle: selectedSample?.title || 'Code Execution',
          conceptId: activeStriverProblem ? `striver-${activeStriverProblem.id}` : (selectedSample?.id || 'custom'),
          language,
          totalSteps: newSteps.length,
          status: 'COMPLETED',
          code,
        });
      } else {
        setExecutionError('Could not parse execution steps for this code.');
      }
    } catch (err) {
      setExecutionError(`Execution Diagnostic: ${err.message || 'Error occurred while running code.'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleResetCode = () => {
    const templateCode = selectedSample?.code || DEFAULT_JAVA_CODE;
    setCode(templateCode);
    setLastExecutedCode(templateCode);
    setExecutionError(null);
    const traceSteps = getExecutionTrace(templateCode, language);
    setTrace(traceSteps);
    reset();
  };

  // Bidirectional interaction: 3D Element Click -> Seek Timeline & Code Line
  const handleSelectElementFrom3D = (index) => {
    if (!trace || trace.length === 0) return;
    const forwardStep = trace.findIndex((step, idx) => {
      if (idx < currentStepIndex) return false;
      const ds = step.dataStructureState;
      return ds?.activeIndex === index || (ds?.pointers && safeIncludes(Object.values(ds.pointers), index));
    });
    if (forwardStep !== -1) {
      goToStep(forwardStep);
      return;
    }
    const anyStep = trace.findIndex((step) => {
      const ds = step.dataStructureState;
      return ds?.activeIndex === index || (ds?.pointers && safeIncludes(Object.values(ds.pointers), index));
    });
    if (anyStep !== -1) {
      goToStep(anyStep);
    }
  };

  // Bidirectional interaction: Editor Line Click -> Seek Timeline
  const handleSelectLineFromEditor = (lineNumber) => {
    if (!trace || trace.length === 0 || !lineNumber) return;
    const matchedStep = trace.findIndex((step) => step.lineNumber === lineNumber);
    if (matchedStep !== -1) {
      goToStep(matchedStep);
    }
  };

  // Handle Personal Problem Solver applied code
  const handleApplyDoctorCode = ({ code: correctedCode, language: correctedLang, problemTitle, timeComplexity: tc, spaceComplexity: sc }) => {
    setLanguage(correctedLang);
    setCode(correctedCode);
    setLastExecutedCode(correctedCode);
    if (tc) setTimeComplexity(tc);
    if (sc) setSpaceComplexity(sc);
    setSelectedSample({
      id: 'personal-problem',
      title: problemTitle ? `💡 ${problemTitle}` : `💡 Personal Problem (${correctedLang.toUpperCase()})`,
      category: 'Personal Problem',
      description: 'Custom personal problem solved and fully simulated in 3D WebGL.',
      difficulty: 'Custom',
      timeComplexity: tc || 'O(n)',
      spaceComplexity: sc || 'O(1)',
      code: correctedCode,
    });

    const newSteps = getExecutionTrace(correctedCode, correctedLang);
    if (newSteps && newSteps.length > 0) {
      setTrace(newSteps);
      reset();
      setTimeout(() => play(), 50);
    }
  };

  // Timeline Play / Resume
  const handleTimelinePlay = () => {
    if (isCodeDirty) {
      handleRunCode();
    } else {
      if (isAtEnd) {
        goToStep(0);
      }
      play();
    }
  };

  // Window-level Ctrl+Enter shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, language, isCodeDirty, isPlaying]);

  // Resizing logic with pointer capture & window dispatch
  const handleResizeEditor = useCallback((moveEvent) => {
    const totalWidth = window.innerWidth - (sidebarOpen ? sidebarWidthPx : 48) - (rightPanelCollapsed ? 32 : rightPanelWidthPx);
    if (totalWidth <= 0) return;
    const newPercent = Math.min(65, Math.max(20, (moveEvent.clientX / window.innerWidth) * 100));
    setEditorWidthPercent(Math.round(newPercent));
  }, [sidebarOpen, sidebarWidthPx, rightPanelCollapsed, rightPanelWidthPx]);

  const handleResizeRightPanel = useCallback((moveEvent) => {
    const newWidth = Math.max(220, Math.min(600, window.innerWidth - moveEvent.clientX));
    setRightPanelWidthPx(newWidth);
  }, []);

  const handleResizeBottomPanel = useCallback((moveEvent) => {
    const newHeight = Math.max(70, Math.min(420, window.innerHeight - moveEvent.clientY));
    setBottomPanelHeightPx(newHeight);
  }, []);

  const handleResizeSidebar = useCallback((moveEvent) => {
    const newWidth = Math.max(160, Math.min(400, moveEvent.clientX - 48));
    setSidebarWidthPx(newWidth);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-[#08111f] text-[#f8fafc] select-none font-sans">
      {/* Top Professional IDE Toolbar */}
      <TopNav
        projectName={selectedSample?.title || 'Execution Workspace'}
        language={language}
        onChangeLanguage={handleLanguageChange}
        onRun={handleRunCode}
        isRunning={isExecuting}
        isPlaying={isPlaying}
        onExplainAi={() => {
          setRightPanelCollapsed(false);
          setRightPanelTab('ai');
        }}
        onVisualize={() => {
          setSceneCollapsed(false);
        }}
        onSave={handleSaveProgram}
        isSaving={saveStatus === 'SAVING'}
        saveSuccess={saveStatus === 'SAVED'}
        onOpenSettings={() => {}}
        onOpenCodeDoctor={() => setIsCodeDoctorOpen(true)}
        onOpenStriverSheet={() => setIsStriverSheetOpen(true)}
      />

      {/* Execution Diagnostic Alert Bar */}
      {executionError && (
        <div className="px-4 py-2 text-xs flex items-center justify-between border-b border-[#ef4444]/40 bg-rose-950/50 text-[#fca5a5] shrink-0 z-20">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#ef4444]">Diagnostic:</span>
            <span>{typeof executionError === 'string' ? executionError : (executionError?.message || String(executionError))}</span>
          </div>
          <button
            onClick={() => setExecutionError(null)}
            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#101c2d] hover:bg-[#1e2f47] border border-[#ef4444]/40 text-[#fca5a5] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Multi-Panel Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ========================================================
            LEFT ZONE: ACTIVITY BAR & COLLAPSIBLE SIDEBAR
            ======================================================== */}
        <div className="flex h-full shrink-0 z-20">
          {/* Left Vertical Activity Icon Strip (48px) */}
          <div className="w-12 h-full bg-[#0d1726] border-r border-[#26364a] flex flex-col items-center py-2 gap-2 shrink-0 select-none">
            <button
              onClick={() => {
                if (sidebarOpen && sidebarTab === 'concepts') setSidebarOpen(false);
                else {
                  setSidebarTab('concepts');
                  setSidebarOpen(true);
                }
              }}
              className={`w-9 h-9 rounded flex items-center justify-center transition-colors cursor-pointer ${
                sidebarOpen && sidebarTab === 'concepts'
                  ? 'bg-[#1e2f47] text-[#38bdf8] border border-[#3b82f6]/40'
                  : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#101c2d]'
              }`}
              title="Concepts & Algorithms Catalog"
            >
              <Layers size={18} />
            </button>

            <button
              onClick={() => setIsStriverSheetOpen(true)}
              className="w-9 h-9 rounded flex items-center justify-center text-[#f59e0b] hover:bg-[#101c2d] hover:text-[#fbbf24] transition-colors cursor-pointer"
              title="Striver SDE Sheet (182 Questions)"
            >
              <BookOpen size={18} />
            </button>

            <button
              onClick={() => setIsCustomCodeOpen(true)}
              className="w-9 h-9 rounded flex items-center justify-center text-[#2dd4bf] hover:bg-[#101c2d] hover:text-[#5eead4] transition-colors cursor-pointer"
              title="Input Any Custom Code"
            >
              <Code2 size={18} />
            </button>

            <button
              onClick={() => setIsCodeDoctorOpen(true)}
              className="w-9 h-9 rounded flex items-center justify-center text-[#fbbf24] hover:bg-[#101c2d] hover:text-[#fef08a] transition-colors cursor-pointer"
              title="Personal Problem Solver"
            >
              <Lightbulb size={18} />
            </button>

            <div className="flex-1" />

            <button
              onClick={() => setIsCompareOpen(true)}
              className="w-9 h-9 rounded flex items-center justify-center text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#101c2d] transition-colors cursor-pointer"
              title="Compare Mode"
            >
              <Clock size={16} />
            </button>
          </div>

          {/* Left Expanded Sidebar Panel */}
          {sidebarOpen && (
            <div
              style={{ width: `${sidebarWidthPx}px` }}
              className="h-full bg-[#101c2d] border-r border-[#26364a] flex flex-col overflow-hidden text-xs"
            >
              <div className="h-9 px-3 bg-[#142338] border-b border-[#26364a] flex items-center justify-between text-xs font-semibold text-[#f8fafc] shrink-0">
                <span className="uppercase tracking-wider text-[11px] text-[#94a3b8]">
                  {sidebarTab === 'concepts' ? 'Algorithm Catalog' : 'Sidebar'}
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded hover:bg-[#1e2f47] text-[#94a3b8] hover:text-[#f8fafc] cursor-pointer"
                  title="Close Sidebar"
                >
                  <X size={13} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                <div className="text-[10px] uppercase font-bold text-[#64748b] px-2 pt-1">
                  ⚡ 3D Algorithm Engine
                </div>
                {ALGORITHM_CATALOG.map((algo) => (
                  <button
                    key={algo.id}
                    onClick={() => handleSelectAlgorithm(algo)}
                    className={`w-full text-left px-2.5 py-1.5 rounded transition-colors text-xs flex items-center justify-between cursor-pointer ${
                      selectedSample?.id === algo.id
                        ? 'bg-[#1e2f47] text-[#38bdf8] font-bold border border-[#3b82f6]/40'
                        : 'text-[#cbd5e1] hover:bg-[#142338] hover:text-[#f8fafc]'
                    }`}
                  >
                    <span className="truncate">{algo.name}</span>
                    <span className="text-[10px] text-[#64748b] font-mono">{algo.complexity?.time?.average || 'O(n)'}</span>
                  </button>
                ))}

                <div className="text-[10px] uppercase font-bold text-[#64748b] px-2 pt-3 border-t border-[#26364a]">
                  📂 Curriculum Topics
                </div>
                {SAMPLE_PROGRAMS.slice(0, 16).map((prog) => (
                  <button
                    key={prog.id}
                    onClick={() => handleSelectProgram(prog)}
                    className={`w-full text-left px-2.5 py-1.5 rounded transition-colors text-xs flex items-center justify-between cursor-pointer ${
                      selectedSample?.id === prog.id
                        ? 'bg-[#1e2f47] text-[#38bdf8] font-bold border border-[#3b82f6]/40'
                        : 'text-[#cbd5e1] hover:bg-[#142338] hover:text-[#f8fafc]'
                    }`}
                  >
                    <span className="truncate">{prog.title}</span>
                    <span className="text-[10px] text-[#64748b] font-mono">{prog.difficulty}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sidebar Width Drag Handle */}
          {sidebarOpen && (
            <ResizeHandle
              orientation="horizontal"
              onResize={handleResizeSidebar}
              title="Drag to resize sidebar width"
            />
          )}
        </div>

        {/* ========================================================
            CENTER & BOTTOM MAIN WORKSPACE
            ======================================================== */}
        <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          {/* Top Half: Code Editor & 3D Visualization */}
          <div className="flex-1 flex overflow-hidden min-h-0 relative">
            {/* Center Left: Monaco Code Editor */}
            {!editorCollapsed && (
              <div
                style={{
                  width: sceneCollapsed ? '100%' : `${editorWidthPercent}%`,
                }}
                className={`h-full flex flex-col overflow-hidden shrink-0 ${
                  fullscreenPanel === 'editor' ? 'fixed inset-0 z-50 bg-[#101c2d]' : ''
                }`}
              >
                <EditorErrorBoundary>
                  <EditorPanel
                    code={code}
                    onChangeCode={(val) => {
                      setCode(val);
                      if (syntaxErrorLine) setSyntaxErrorLine(null);
                      if (executionError) setExecutionError(null);
                    }}
                    language={language}
                    onChangeLanguage={handleLanguageChange}
                    currentLineNumber={currentStep?.lineNumber || null}
                    syntaxErrorLine={syntaxErrorLine}
                    isPlaying={isPlaying}
                    onRun={handleRunCode}
                    onReset={handleResetCode}
                    isExecuting={isExecuting}
                    isCodeDirty={isCodeDirty}
                    breakpoints={breakpoints}
                    onToggleBreakpoint={toggleBreakpoint}
                    onSelectLine={handleSelectLineFromEditor}
                    isCollapsed={editorCollapsed}
                    onToggleCollapse={() => setEditorCollapsed(true)}
                    isFullscreen={fullscreenPanel === 'editor'}
                    onToggleFullscreen={() =>
                      setFullscreenPanel((prev) => (prev === 'editor' ? null : 'editor'))
                    }
                    onOpenCustomCode={() => setIsCustomCodeOpen(true)}
                    onOpenCodeDoctor={() => setIsCodeDoctorOpen(true)}
                    onOpenPersonalProblem={() => setIsCodeDoctorOpen(true)}
                    onOpenStriverSheet={() => setIsStriverSheetOpen(true)}
                  />
                </EditorErrorBoundary>
              </div>
            )}

            {/* Collapsed Editor Vertical Tab Bar */}
            {editorCollapsed && (
              <div
                onClick={() => setEditorCollapsed(false)}
                className="w-8 h-full bg-[#101c2d] border-r border-[#26364a] hover:bg-[#142338] transition-colors flex flex-col items-center py-3 cursor-pointer shrink-0"
                title="Expand Code Editor"
              >
                <ChevronRight size={14} className="text-[#38bdf8] mb-2" />
                <span className="panel-collapsed-tab text-[10px] font-mono tracking-widest text-[#94a3b8] uppercase">
                  Code Editor
                </span>
              </div>
            )}

            {/* Draggable Divider between Code Editor and 3D Viewport */}
            {!editorCollapsed && !sceneCollapsed && (
              <ResizeHandle
                orientation="horizontal"
                onResize={handleResizeEditor}
                title={`Drag to resize Code vs 3D Box (Current: ${editorWidthPercent}%)`}
              />
            )}

            {/* Center Right: 3D Visualization Canvas */}
            {!sceneCollapsed && (
              <div
                className={`flex-1 h-full flex flex-col overflow-hidden min-w-[200px] ${
                  fullscreenPanel === 'scene' ? 'fixed inset-0 z-50 bg-[#08111f]' : ''
                }`}
              >
                {/* Interactive Array Input Generator Bar */}
                <div className="shrink-0 border-b border-[#26364a] bg-[#0d1726]">
                  <InputGenerator
                    currentValues={extractNumbersFromCode(formInputValues) || [45, 12, 89, 23, 7, 64, 31]}
                    currentTarget={23}
                    showTarget={selectedSample?.category === 'Searching' || safeIncludes(selectedSample?.id, 'search')}
                    onGenerate={({ values, target }) => {
                      const inputStr = values.join(', ');
                      setFormInputValues(inputStr);

                      const algo = ALGORITHM_CATALOG.find(
                        (a) => a.id === selectedSample.id || `algo-${a.id}` === selectedSample.id
                      );
                      if (algo) {
                        const res = algo.generator(values, target);
                        setTrace(res.steps);
                        reset();
                        setTimeout(() => play(), 80);
                        return;
                      }

                      applyNewValuesToCode(values);
                    }}
                  />
                </div>

                {/* 3D WebGL Scene Container */}
                <div className="flex-1 relative overflow-hidden bg-[#08111f]">
                  <VisualizerErrorBoundary onReset={reset}>
                    <ScenePanel
                      currentStep={currentStep}
                      code={code}
                      correctOutput={finalCorrectOutput}
                      isAtEnd={isAtEnd}
                      cumulativeOutput={cumulativeOutput}
                      onSelectElement={handleSelectElementFrom3D}
                      isCollapsed={sceneCollapsed}
                      onToggleCollapse={() => setSceneCollapsed(true)}
                      isFullscreen={fullscreenPanel === 'scene'}
                      onToggleFullscreen={() =>
                        setFullscreenPanel((prev) => (prev === 'scene' ? null : 'scene'))
                      }
                    >
                      <DsaSceneDispatcher dataStructureState={currentStep?.dataStructureState} />
                    </ScenePanel>
                  </VisualizerErrorBoundary>
                </div>
              </div>
            )}

            {/* Collapsed 3D Scene Vertical Tab Bar */}
            {sceneCollapsed && (
              <div
                onClick={() => setSceneCollapsed(false)}
                className="w-8 h-full bg-[#08111f] border-l border-[#26364a] hover:bg-[#101c2d] transition-colors flex flex-col items-center py-3 cursor-pointer shrink-0"
                title="Expand 3D Visualization"
              >
                <ChevronLeft size={14} className="text-[#14b8a6] mb-2" />
                <span className="panel-collapsed-tab text-[10px] font-mono tracking-widest text-[#94a3b8] uppercase">
                  3D Visualization
                </span>
              </div>
            )}
          </div>

          {/* Draggable Divider between Main Top Area and Bottom Dock */}
          {!bottomPanelCollapsed && (
            <ResizeHandle
              orientation="vertical"
              onResize={handleResizeBottomPanel}
              title={`Drag to resize Bottom Panel Height (Current: ${bottomPanelHeightPx}px)`}
            />
          )}

          {/* Bottom Dock: Output Console + Execution Timeline */}
          {!bottomPanelCollapsed ? (
            <div
              style={{ height: `${bottomPanelHeightPx}px` }}
              className={`shrink-0 flex flex-col overflow-hidden bg-[#08111f] border-t border-[#26364a] ${
                fullscreenPanel === 'bottom' ? 'fixed inset-0 z-50 bg-[#08111f]' : ''
              }`}
            >
              {/* Bottom Dock Header Tabs */}
              <div className="h-7 bg-[#0d1726] border-b border-[#26364a] px-3 flex items-center justify-between text-xs select-none shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBottomPanelTab('console')}
                    className={`h-5 px-2 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                      bottomPanelTab === 'console'
                        ? 'bg-[#142338] text-[#38bdf8] font-bold border border-[#26364a]'
                        : 'text-[#94a3b8] hover:text-[#f8fafc]'
                    }`}
                  >
                    <Terminal size={11} />
                    <span>Console &amp; Output</span>
                  </button>

                  <button
                    onClick={() => setBottomPanelTab('timeline')}
                    className={`h-5 px-2 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                      bottomPanelTab === 'timeline'
                        ? 'bg-[#142338] text-[#14b8a6] font-bold border border-[#26364a]'
                        : 'text-[#94a3b8] hover:text-[#f8fafc]'
                    }`}
                  >
                    <Clock size={11} />
                    <span>Timeline Scrubber</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setFullscreenPanel((prev) => (prev === 'bottom' ? null : 'bottom'))
                    }
                    className="p-1 rounded hover:bg-[#1e2f47] text-[#94a3b8] hover:text-[#f8fafc] cursor-pointer"
                    title={fullscreenPanel === 'bottom' ? 'Exit Fullscreen' : 'Expand Dock'}
                  >
                    {fullscreenPanel === 'bottom' ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
                  </button>

                  <button
                    onClick={() => setBottomPanelCollapsed(true)}
                    className="p-1 rounded hover:bg-[#1e2f47] text-[#94a3b8] hover:text-[#f8fafc] cursor-pointer"
                    title="Collapse Bottom Dock"
                  >
                    <X size={11} />
                  </button>
                </div>
              </div>

              {/* Bottom Dock Content */}
              <div className="flex-1 overflow-hidden">
                {bottomPanelTab === 'console' ? (
                  <OutputConsole
                    output={cumulativeOutput}
                    correctOutput={finalCorrectOutput}
                    isAtEnd={isAtEnd}
                    error={executionError}
                  />
                ) : (
                  <Timeline
                    currentStepIndex={currentStepIndex}
                    totalSteps={totalSteps}
                    isPlaying={isPlaying}
                    playbackSpeed={playbackSpeed}
                    setPlaybackSpeed={setPlaybackSpeed}
                    onPlay={handleTimelinePlay}
                    isCodeDirty={isCodeDirty}
                    onPause={pause}
                    onPrev={prevStep}
                    onNext={nextStep}
                    onReset={reset}
                    onGoToStep={goToStep}
                    isAtStart={isAtStart}
                    isAtEnd={isAtEnd}
                    currentStep={currentStep}
                    trace={trace}
                  />
                )}
              </div>
            </div>
          ) : (
            /* Collapsed Bottom Bar */
            <div className="h-7 bg-[#0d1726] border-t border-[#26364a] px-3 flex items-center justify-between text-xs text-[#94a3b8] shrink-0 select-none">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setBottomPanelCollapsed(false)}
                  className="flex items-center gap-1.5 hover:text-[#f8fafc] cursor-pointer"
                  title="Expand Bottom Dock"
                >
                  <Terminal size={12} className="text-[#38bdf8]" />
                  <span>Output Console</span>
                </button>
                <span className="text-[#26364a]">|</span>
                <span className="font-mono text-[11px]">
                  Step {currentStepIndex + 1} / {Math.max(1, totalSteps)}
                </span>
              </div>

              <button
                onClick={() => setBottomPanelCollapsed(false)}
                className="text-[10px] text-[#38bdf8] hover:underline cursor-pointer"
              >
                Expand Dock ↑
              </button>
            </div>
          )}
        </div>

        {/* Draggable Divider between Main Center Area and Right Inspector Panel */}
        {!rightPanelCollapsed && (
          <ResizeHandle
            orientation="horizontal"
            onResize={handleResizeRightPanel}
            title={`Drag to resize Right Inspector (Current: ${rightPanelWidthPx}px)`}
          />
        )}

        {/* ========================================================
            RIGHT ZONE: RESIZABLE & COLLAPSIBLE INSPECTOR
            ======================================================== */}
        {!rightPanelCollapsed ? (
          <div
            style={{ width: `${rightPanelWidthPx}px` }}
            className={`h-full flex flex-col bg-[#101c2d] border-l border-[#26364a] shrink-0 overflow-hidden text-xs ${
              fullscreenPanel === 'right' ? 'fixed inset-0 z-50 bg-[#101c2d]' : ''
            }`}
          >
            {/* Inspector Tab Bar */}
            <div className="h-9 bg-[#142338] border-b border-[#26364a] px-2 flex items-center justify-between text-xs select-none shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setRightPanelTab('state')}
                  className={`h-6 px-2 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    rightPanelTab === 'state'
                      ? 'bg-[#101c2d] text-[#38bdf8] border border-[#26364a]'
                      : 'text-[#94a3b8] hover:text-[#f8fafc]'
                  }`}
                  title="Program State & Execution Step"
                >
                  <Cpu size={12} />
                  <span>State</span>
                </button>

                <button
                  onClick={() => setRightPanelTab('variables')}
                  className={`h-6 px-2 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    rightPanelTab === 'variables'
                      ? 'bg-[#101c2d] text-[#f59e0b] border border-[#26364a]'
                      : 'text-[#94a3b8] hover:text-[#f8fafc]'
                  }`}
                  title="Variables Inspector Table"
                >
                  <Variable size={12} />
                  <span>Vars</span>
                </button>

                <button
                  onClick={() => setRightPanelTab('condition')}
                  className={`h-6 px-2 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    rightPanelTab === 'condition'
                      ? 'bg-[#101c2d] text-[#2dd4bf] border border-[#26364a]'
                      : 'text-[#94a3b8] hover:text-[#f8fafc]'
                  }`}
                  title="Condition Evaluation"
                >
                  <GitBranch size={12} />
                  <span>Cond</span>
                </button>

                <button
                  onClick={() => setRightPanelTab('ai')}
                  className={`h-6 px-2 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    rightPanelTab === 'ai'
                      ? 'bg-[#101c2d] text-[#c084fc] border border-[#26364a]'
                      : 'text-[#94a3b8] hover:text-[#f8fafc]'
                  }`}
                  title="AI Tutor & Explanation"
                >
                  <Sparkles size={12} />
                  <span>AI</span>
                </button>
              </div>

              {/* Inspector Header Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setFullscreenPanel((prev) => (prev === 'right' ? null : 'right'))
                  }
                  className="p-1 rounded hover:bg-[#1e2f47] text-[#94a3b8] hover:text-[#f8fafc] cursor-pointer"
                  title={fullscreenPanel === 'right' ? 'Exit Fullscreen' : 'Expand Inspector'}
                >
                  {fullscreenPanel === 'right' ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                </button>

                <button
                  onClick={() => setRightPanelCollapsed(true)}
                  className="p-1 rounded hover:bg-[#1e2f47] text-[#94a3b8] hover:text-[#f8fafc] cursor-pointer"
                  title="Collapse Inspector"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* Inspector Tab Content Area */}
            <div className="flex-1 overflow-y-auto">
              {rightPanelTab === 'state' && (
                <div className="p-3 space-y-3">
                  <StepInspector currentStep={currentStep} totalSteps={totalSteps} />
                  {selectedSample?.complexity && (
                    <ComplexityPanel
                      complexity={selectedSample.complexity}
                      algorithmName={selectedSample?.title || 'Algorithm'}
                    />
                  )}
                  {currentStep?.condition && (
                    <ConditionPanel
                      condition={currentStep.condition}
                      currentLine={currentStep.lineNumber}
                      currentOperation={currentStep.operation}
                    />
                  )}
                </div>
              )}

              {rightPanelTab === 'variables' && (
                <VariablePanel
                  variables={currentStep?.variables || {}}
                  scope={currentStep?.scope || 'main'}
                  changedVariable={currentStep?.changedVariable}
                  previousValue={currentStep?.previousValue}
                />
              )}

              {rightPanelTab === 'condition' && (
                <div className="p-3 space-y-3">
                  <ConditionPanel
                    condition={currentStep?.condition}
                    currentLine={currentStep?.lineNumber}
                    currentOperation={currentStep?.operation}
                  />
                </div>
              )}

              {rightPanelTab === 'ai' && (
                <AiPanel
                  currentStep={currentStep}
                  timeComplexity={timeComplexity}
                  spaceComplexity={spaceComplexity}
                  code={code}
                  onOpenFullTutor={() => setIsAiOpen(true)}
                />
              )}
            </div>
          </div>
        ) : (
          /* Collapsed Right Inspector Vertical Tab Bar */
          <div
            onClick={() => setRightPanelCollapsed(false)}
            className="w-8 h-full bg-[#101c2d] border-l border-[#26364a] hover:bg-[#142338] transition-colors flex flex-col items-center py-3 cursor-pointer shrink-0"
            title="Expand Inspector"
          >
            <ChevronLeft size={14} className="text-[#8b5cf6] mb-2" />
            <span className="panel-collapsed-tab text-[10px] font-mono tracking-widest text-[#94a3b8] uppercase">
              Inspector
            </span>
          </div>
        )}
      </div>

      {/* Floating Bottom Full-Width Timeline (Always visible at very bottom) */}
      <div className="w-full shrink-0 z-30">
        <Timeline
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          setPlaybackSpeed={setPlaybackSpeed}
          onPlay={handleTimelinePlay}
          isCodeDirty={isCodeDirty}
          onPause={pause}
          onPrev={prevStep}
          onNext={nextStep}
          onReset={reset}
          onGoToStep={goToStep}
          isAtStart={isAtStart}
          isAtEnd={isAtEnd}
          currentStep={currentStep}
          trace={trace}
        />
      </div>

      {/* Global Specialized Modals */}
      <AiAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        code={code}
        currentLineNumber={currentStep?.lineNumber || 1}
        currentStepNumber={currentStepIndex + 1}
      />

      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        conceptId={selectedSample.id}
      />

      <CustomCodeModal
        isOpen={isCustomCodeOpen}
        onClose={() => setIsCustomCodeOpen(false)}
        onApplyCustomCode={handleCustomCodeApply}
        currentLanguage={language}
      />

      <CodeDoctorModal
        isOpen={isCodeDoctorOpen}
        onClose={() => setIsCodeDoctorOpen(false)}
        onApplyCorrectedCode={handleApplyDoctorCode}
        currentLanguage={language}
        currentCode={code}
      />

      <StriverSheetDrawer
        isOpen={isStriverSheetOpen}
        onToggle={() => setIsStriverSheetOpen((prev) => !prev)}
        onSelectProblem={handleSelectStriverProblem}
        currentLanguage={language}
      />

      <CompareModeModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />
    </div>
  );
}
