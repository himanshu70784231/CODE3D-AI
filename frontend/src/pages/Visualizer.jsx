import React, { useState, useEffect } from 'react';
import CodeEditor from '../components/CodeEditor';
import StatePanel from '../components/StatePanel';
import OutputConsole from '../components/OutputConsole';
import Timeline from '../components/Timeline';
import SceneContainer from '../visualizers/SceneContainer';
import DsaSceneDispatcher from '../visualizers/DsaSceneDispatcher';
import AiAssistantModal from '../components/AiAssistantModal';
import QuizModal from '../components/QuizModal';
import CustomCodeModal from '../components/CustomCodeModal';
import CodeDoctorModal from '../components/CodeDoctorModal';
import StriverSheetDrawer from '../components/StriverSheetDrawer';
import { useExecutionTimeline } from '../hooks/useExecutionTimeline';
import { getExecutionTrace, extractNumbersFromCode } from '../services/executionSimulator';
import { validateSourceCode } from '../services/codeValidator';
import { DEFAULT_JAVA_CODE, SAMPLE_PROGRAMS, LANGUAGE_DEFAULTS, CURRICULUM_CATEGORIES } from '../utils/sampleCodes';
import { STRIVER_PROBLEMS } from '../utils/striverCatalog';
import { executeProgram, analyzeCode, checkBackendHealth, recordExecutionHistory } from '../services/apiService';
import { useTheme } from '../context/ThemeContext';
import {
  Code2,
  Sparkles,
  HelpCircle,
  Layers,
  Cpu,
  Server,
  Check,
  Lightbulb,
  Stethoscope,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Play,
  Trophy,
  BookOpen
} from 'lucide-react';

export default function Visualizer({ initialConcept, initialOpenStriver = false }) {
  const { isBright } = useTheme();
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

  // View Layout Toggles requested by user:
  // 1. Program State panel visibility toggle
  // 2. 100% Fullscreen 3D Theater Mode
  const [showStatePanel, setShowStatePanel] = useState(true);
  const [isFull3DView, setIsFull3DView] = useState(false);

  // Direct Form User Input
  const [formInputValues, setFormInputValues] = useState('10, 20, 30, 40');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState(null);
  const [syntaxErrorLine, setSyntaxErrorLine] = useState(null);

  // Modals & responsive view state
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isCustomCodeOpen, setIsCustomCodeOpen] = useState(false);
  const [isCodeDoctorOpen, setIsCodeDoctorOpen] = useState(false);
  const [isStriverSheetOpen, setIsStriverSheetOpen] = useState(initialOpenStriver);
  const [activeStriverProblem, setActiveStriverProblem] = useState(null);
  const [mobileTab, setMobileTab] = useState('3d'); // '3d' | 'code' | 'state'

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
    cumulativeOutput,
    finalCorrectOutput,
  } = useExecutionTimeline(trace);

  // Dynamic Box Resizing State (Editor width % and Console height px)
  const [editorWidthPercent, setEditorWidthPercent] = useState(35);
  const [consoleHeightPx, setConsoleHeightPx] = useState(165);
  const [isResizingEditor, setIsResizingEditor] = useState(false);
  const [isResizingConsole, setIsResizingConsole] = useState(false);

  // Handle dragging horizontal splitter between Code Editor and 3D Viewport
  const startEditorResize = (e) => {
    e.preventDefault();
    setIsResizingEditor(true);
    const onMouseMove = (moveEvent) => {
      const containerWidth = window.innerWidth;
      const newPercent = Math.min(65, Math.max(20, (moveEvent.clientX / containerWidth) * 100));
      setEditorWidthPercent(Math.round(newPercent));
    };
    const onMouseUp = () => {
      setIsResizingEditor(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Handle dragging vertical splitter between 3D Canvas and Output Console
  const startConsoleResize = (e) => {
    e.preventDefault();
    setIsResizingConsole(true);
    const startY = moveEvent => moveEvent.clientY;
    const initialHeight = consoleHeightPx;
    const initialY = e.clientY;
    const onMouseMove = (moveEvent) => {
      const deltaY = initialY - moveEvent.clientY;
      const newHeight = Math.min(380, Math.max(70, initialHeight + deltaY));
      setConsoleHeightPx(Math.round(newHeight));
    };
    const onMouseUp = () => {
      setIsResizingConsole(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth().then((isUp) => {
      setBackendOnline(isUp);
    });
  }, []);

  // Synchronize formInputValues whenever code or selected sample changes
  useEffect(() => {
    const nums = extractNumbersFromCode(code);
    if (nums && nums.length > 0) {
      setFormInputValues(nums.join(', '));
    }
  }, [selectedSample]);

  // Update visualizer state whenever initialConcept changes
  useEffect(() => {
    if (initialConcept) {
      setSelectedSample(initialConcept);
      setCode(initialConcept.code);
      setLastExecutedCode(initialConcept.code);
      if (initialConcept.language) {
        setLanguage(initialConcept.language);
      }
      setTimeComplexity(initialConcept.timeComplexity || 'O(n)');
      setSpaceComplexity(initialConcept.spaceComplexity || 'O(1)');

      if (initialConcept.trace && initialConcept.trace.length > 0) {
        setTrace(initialConcept.trace);
        reset();
        setTimeout(() => play(), 100);
      } else if (backendOnline && initialConcept.id && initialConcept.id !== 'custom') {
        executeProgram(initialConcept.code, initialConcept.id, initialConcept.language || 'java')
          .then((res) => {
            if (res?.steps?.length > 0) {
              setTrace(res.steps);
            } else {
              setTrace(getExecutionTrace(initialConcept.code, initialConcept.language || 'java'));
            }
            reset();
            setTimeout(() => play(), 100);
          })
          .catch(() => {
            setTrace(getExecutionTrace(initialConcept.code, initialConcept.language || 'java'));
            reset();
            setTimeout(() => play(), 100);
          });
      } else {
        setTrace(getExecutionTrace(initialConcept.code, initialConcept.language || 'java'));
        reset();
        setTimeout(() => play(), 100);
      }
    }
  }, [initialConcept, backendOnline]);

  // Handle preset selection
  const handleSelectProgram = async (prog) => {
    setSelectedSample(prog);
    setCode(prog.code);
    setLastExecutedCode(prog.code);
    setLanguage('java');
    setTimeComplexity(prog.timeComplexity);
    setSpaceComplexity(prog.spaceComplexity);

    // Update form input field with preset numbers
    const nums = extractNumbersFromCode(prog.code);
    if (nums && nums.length > 0) {
      setFormInputValues(nums.join(', '));
    }

    let finalSteps = null;
    if (backendOnline) {
      try {
        const res = await executeProgram(prog.code, prog.id, 'java');
        if (res && res.steps && res.steps.length > 0) {
          finalSteps = res.steps;
        }
      } catch (e) {}
    }

    if (!finalSteps || finalSteps.length === 0) {
      finalSteps = getExecutionTrace(prog.code, 'java');
    }

    setTrace(finalSteps);
    reset();
    setTimeout(() => play(), 100);

    recordExecutionHistory({
      programTitle: prog.title,
      conceptId: prog.id,
      language: 'java',
      totalSteps: finalSteps.length,
      status: 'COMPLETED',
      code: prog.code,
    });
  };

  // Handle language change from editor
  const handleLanguageChange = async (newLang) => {
    setLanguage(newLang);
    const template = LANGUAGE_DEFAULTS[newLang] || DEFAULT_JAVA_CODE;
    setCode(template);
    setLastExecutedCode(template);
    setSelectedSample({
      id: 'custom',
      title: `${newLang.toUpperCase()} Traversal`,
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

    if (backendOnline) {
      const [execRes, astRes] = await Promise.all([
        executeProgram(template, 'custom', newLang),
        analyzeCode(template, newLang),
      ]);
      if (execRes && execRes.steps && execRes.steps.length > 0) {
        setTrace(execRes.steps);
        reset();
      }
      if (astRes) {
        if (astRes.timeComplexity) setTimeComplexity(astRes.timeComplexity);
        if (astRes.spaceComplexity) setSpaceComplexity(astRes.spaceComplexity);
      }
    } else {
      setTrace(getExecutionTrace(template, newLang));
      reset();
    }
  };

  // Directly apply User Form Input into code and 3D visualizer
  const applyNewValuesToCode = async (vals) => {
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

    // Run dynamic trace with new input values preserving the algorithm
    let newSteps = getExecutionTrace(
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

  const handleApplyFormInput = () => {
    const vals = extractNumbersFromCode(formInputValues);
    applyNewValuesToCode(vals);
  };

  const handleApplyPresetValues = (vals) => {
    setFormInputValues(vals.join(', '));
    applyNewValuesToCode(vals);
  };

  // Handle user applying custom code from modal
  const handleCustomCodeApply = async ({ code: customCode, language: customLang }) => {
    setLanguage(customLang);
    setCode(customCode);
    setLastExecutedCode(customCode);
    setSelectedSample({
      id: 'custom',
      title: `⚡ Custom ${customLang.toUpperCase()} Code`,
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

    let newSteps = null;
    if (backendOnline) {
      try {
        const [execRes, astRes] = await Promise.all([
          executeProgram(customCode, 'custom', customLang),
          analyzeCode(customCode, customLang),
        ]);

        if (execRes && execRes.steps && execRes.steps.length > 0) {
          newSteps = execRes.steps;
        }
        if (astRes) {
          if (astRes.timeComplexity) setTimeComplexity(astRes.timeComplexity);
          if (astRes.spaceComplexity) setSpaceComplexity(astRes.spaceComplexity);
        }
      } catch (err) {
        console.warn('Backend custom execution failed, using simulator:', err);
      }
    }

    if (!newSteps || newSteps.length === 0) {
      newSteps = getExecutionTrace(customCode, customLang);
    }

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

  // Execute User Code Pipeline: Code Editor -> Verification -> 3D Trace -> Animation
  const handleRunCode = async () => {
    // If currently playing, clicking pause halts animation
    if (isPlaying) {
      pause();
      return;
    }
    // If paused mid-way and code has not changed, clicking resumes
    if (!isCodeDirty && !isAtEnd && !isAtStart && !syntaxErrorLine) {
      play();
      return;
    }

    if (!code || !code.trim()) {
      setExecutionError('Cannot execute empty code! Please write code or select a sample problem.');
      return;
    }

    // 1. Precise Multi-Language Syntax Validation
    const validation = validateSourceCode(code, language);
    if (!validation.isValid) {
      const err = validation.error;
      setSyntaxErrorLine(err.line);
      setExecutionError(`[Syntax Error at Line ${err.line}] ${err.message} — ${err.suggestion}`);
      setIsExecuting(false);
      pause();
      return;
    }

    const nums = extractNumbersFromCode(code);
    if (nums && nums.length > 0) {
      setFormInputValues(nums.join(', '));
    }

    setSyntaxErrorLine(null);
    setIsExecuting(true);
    setExecutionError(null);

    try {
      let newSteps = null;
      if (backendOnline) {
        try {
          const conceptId = activeStriverProblem ? `striver-${activeStriverProblem.striverId || activeStriverProblem.id}` : 'custom';
          const [execRes, astRes] = await Promise.all([
            executeProgram(code, conceptId, language, formInputValues),
            analyzeCode(code, language),
          ]);
          if (execRes?.steps?.length > 0) newSteps = execRes.steps;
          if (astRes?.timeComplexity) setTimeComplexity(astRes.timeComplexity);
          if (astRes?.spaceComplexity) setSpaceComplexity(astRes.spaceComplexity);
        } catch (backendErr) {
          console.warn('Backend execution failed, falling back to simulator:', backendErr);
        }
      }

      if (!newSteps || newSteps.length === 0) {
        newSteps = getExecutionTrace(code, language, formInputValues, activeStriverProblem?.archetype);
      }

      if (newSteps && newSteps.length > 0) {
        setTrace(newSteps);
        setLastExecutedCode(code);
        reset();
        setTimeout(() => play(), 60);

        recordExecutionHistory({
          programTitle: selectedSample?.title || (activeStriverProblem ? activeStriverProblem.title : 'Custom Code Execution'),
          conceptId: activeStriverProblem ? `striver-${activeStriverProblem.striverId || activeStriverProblem.id}` : (selectedSample?.id || 'custom'),
          language: language,
          totalSteps: newSteps.length,
          status: 'COMPLETED',
          code: code,
        });
      } else {
        setExecutionError('Could not parse execution steps for this code. Please check for syntax errors or missing brackets.');
      }
    } catch (err) {
      console.error('Execution pipeline error:', err);
      setExecutionError(`Execution Error: ${err.message || 'Unknown error occurred while parsing code.'}`);
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

  // Handle Personal Problem applied solution & 3D visualization
  const handleApplyCorrectedCode = async ({
    code: correctedCode,
    language: correctedLang,
    trace: correctedTrace,
    problemTitle,
    timeComplexity: tc,
    spaceComplexity: sc,
    launch3D = true,
  }) => {
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

    const nums = extractNumbersFromCode(correctedCode);
    if (nums && nums.length > 0) {
      setFormInputValues(nums.join(', '));
    }

    if (correctedTrace && correctedTrace.length > 0) {
      setTrace(correctedTrace);
      reset();
      if (launch3D) {
        setTimeout(() => play(), 50);
      }
    } else {
      let newSteps = null;
      if (backendOnline) {
        try {
          const [execRes, astRes] = await Promise.all([
            executeProgram(correctedCode, 'custom', correctedLang),
            analyzeCode(correctedCode, correctedLang),
          ]);
          if (execRes?.steps?.length > 0) newSteps = execRes.steps;
          if (astRes?.timeComplexity) setTimeComplexity(astRes.timeComplexity);
          if (astRes?.spaceComplexity) setSpaceComplexity(astRes.spaceComplexity);
        } catch (err) {
          console.warn('Backend repaired execution failed, using simulator:', err);
        }
      }

      if (!newSteps || newSteps.length === 0) {
        newSteps = getExecutionTrace(correctedCode, correctedLang);
      }

      if (newSteps && newSteps.length > 0) {
        setTrace(newSteps);
        reset();
        if (launch3D) {
          setTimeout(() => play(), 50);
        }
      }
    }

    recordExecutionHistory({
      programTitle: problemTitle ? `💡 ${problemTitle}` : `💡 Personal Problem (${correctedLang.toUpperCase()})`,
      conceptId: 'personal-problem',
      language: correctedLang,
      totalSteps: (correctedTrace?.length || 1),
      status: 'COMPLETED',
      code: correctedCode,
    });
  };

  // Handle user selecting a Striver SDE Sheet question from drawer
  const handleSelectStriverProblem = async (problem) => {
    setIsStriverSheetOpen(false); // Automatically dismiss drawer so 3D scene is immediately visible
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

    // Synthesize verified 3D execution trace with matched archetype and accurate inputs/outputs
    const newSteps = getExecutionTrace(
      problem.code,
      problem.language || language,
      problem.defaultInput,
      problem.archetype
    );

    // Enrich complexity metrics in background if backend is online
    if (backendOnline) {
      analyzeCode(problem.code, problem.language || language)
        .then((astRes) => {
          if (astRes?.timeComplexity) setTimeComplexity(astRes.timeComplexity);
          if (astRes?.spaceComplexity) setSpaceComplexity(astRes.spaceComplexity);
        })
        .catch(() => {});
    }

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

  // Synchronized Timeline Play handler
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

  // Window-level Ctrl+Enter / Cmd+Enter listener to trigger instant 3D execution
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, language, backendOnline, isCodeDirty]);

  return (
    <div className={`flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden select-none transition-colors duration-200 ${
      isBright ? 'bg-slate-100 text-slate-900' : 'bg-[#070b14] text-slate-100'
    }`}>
      {/* Visualizer Header Controls */}
      <div className={`min-h-10 border-b px-3 py-1.5 flex items-center justify-between text-xs overflow-x-auto no-scrollbar gap-2 transition-colors ${
        isBright
          ? 'bg-white border-slate-200 text-slate-700 shadow-sm'
          : 'bg-[#0b0f19] border-slate-800/80 text-slate-300'
      }`}>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className={`font-semibold flex items-center gap-1.5 ${isBright ? 'text-slate-800' : 'text-slate-200'}`}>
            <Layers size={14} className={isBright ? 'text-cyan-600' : 'text-cyan-400'} />
            <span className="hidden sm:inline">Concept:</span>
          </span>

          {/* Categorized Concept Dropdown grouped by Curriculum & Striver Sheet */}
          <select
            value={selectedSample.id}
            onChange={(e) => {
              const val = e.target.value;
              if (val.startsWith('striver-')) {
                const id = parseInt(val.replace('striver-', ''), 10);
                const p = STRIVER_PROBLEMS.find((prob) => prob.id === id);
                if (p) {
                  handleSelectStriverProblem({
                    id: `striver-${p.id}`,
                    striverId: p.id,
                    title: p.title,
                    shortTitle: p.shortTitle,
                    day: p.day,
                    dayNumber: p.dayNumber,
                    category: p.category,
                    difficulty: p.difficulty,
                    archetype: p.archetype,
                    timeComplexity: p.timeComplexity,
                    spaceComplexity: p.spaceComplexity,
                    description: p.description,
                    defaultInput: p.defaultInput,
                    code: p.javaCode,
                    language: 'java',
                  });
                }
              } else {
                const found = SAMPLE_PROGRAMS.find((p) => p.id === val);
                if (found) handleSelectProgram(found);
              }
            }}
            className={`h-8 border rounded-lg px-2.5 text-xs font-medium focus:outline-none focus:border-cyan-500 cursor-pointer max-w-[160px] sm:max-w-none transition-colors ${
              isBright
                ? 'bg-white border-slate-300 text-slate-900 font-semibold'
                : 'bg-slate-950 border-slate-700/80 text-cyan-300'
            }`}
          >
            {(selectedSample.id === 'custom' || selectedSample.id === 'personal-problem') && (
              <option value={selectedSample.id}>
                {selectedSample.title || '⚡ Custom Execution'}
              </option>
            )}
            <optgroup label="📜 Striver SDE Sheet (Top Flagships)">
              {STRIVER_PROBLEMS.slice(0, 40).map((p) => (
                <option key={`striver-${p.id}`} value={`striver-${p.id}`}>
                  {p.title} ({p.difficulty})
                </option>
              ))}
            </optgroup>
            {CURRICULUM_CATEGORIES.map((category) => {
              const items = SAMPLE_PROGRAMS.filter((p) => p.category === category);
              if (items.length === 0) return null;
              return (
                <optgroup key={category} label={`📂 ${category}`}>
                  {items.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.difficulty})
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>

          {/* Prominent Personal Problem Button */}
          <button
            onClick={() => setIsCodeDoctorOpen(true)}
            className={`h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold transition shadow-xs shrink-0 border cursor-pointer ${
              isBright
                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                : 'bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 text-amber-300 border-amber-500/40'
            }`}
            title="Personal Problem: Solve custom DSA problems & auto-visualize in 3D"
          >
            <Lightbulb size={13} className={isBright ? 'text-amber-700' : 'text-amber-400'} />
            <span>Personal Problem 💡</span>
          </button>

          {/* Prominent "Input Any Code" Button */}
          <button
            onClick={() => setIsCustomCodeOpen(true)}
            className={`h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold transition shadow-xs shrink-0 border cursor-pointer ${
              isBright
                ? 'bg-cyan-100 text-cyan-900 border-cyan-300 hover:bg-cyan-200'
                : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border-cyan-500/40'
            }`}
            title="Input any code in JS, C, C++, Python, or Java to visualize in 3D"
          >
            <Code2 size={13} className={isBright ? 'text-cyan-700' : 'text-cyan-400'} />
            <span>Input Code ⚡</span>
          </button>

          {/* Striver SDE Sheet Toggle Button */}
          <button
            onClick={() => setIsStriverSheetOpen((prev) => !prev)}
            className={`h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold transition shadow-xs shrink-0 border cursor-pointer ${
              isStriverSheetOpen
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-amber-500/20'
                : isBright
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border-amber-500/40 shadow-amber-500/10'
            }`}
            title="Toggle Striver SDE Sheet: 182 Core DSA Problems with 3D Visualization"
          >
            <BookOpen size={13} className={isStriverSheetOpen ? 'text-slate-950' : 'text-amber-400'} />
            <span>Striver Sheet 📜</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 font-mono">182</span>
          </button>
        </div>

        {/* Center: Complexity Badges & Backend status */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono shrink-0">
          <div className={`h-8 flex items-center border rounded-lg px-2.5 ${
            isBright ? 'bg-slate-50 border-slate-300 text-slate-700' : 'bg-slate-950/70 border-slate-800'
          }`}>
            Time: <strong className={`ml-1 ${isBright ? 'text-cyan-700 font-bold' : 'text-cyan-400 font-bold'}`}>{timeComplexity}</strong>
          </div>
          <div className={`h-8 flex items-center border rounded-lg px-2.5 ${
            isBright ? 'bg-slate-50 border-slate-300 text-slate-700' : 'bg-slate-950/70 border-slate-800'
          }`}>
            Space: <strong className={`ml-1 ${isBright ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold'}`}>{spaceComplexity}</strong>
          </div>
        </div>

        {/* Right Controls: State Panel Toggle, Full 3D Theater Mode, AI Tutor & Quiz */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Toggle Program State Panel Button */}
          <button
            onClick={() => setShowStatePanel((prev) => !prev)}
            className={`h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold transition border shadow-xs cursor-pointer ${
              showStatePanel
                ? isBright
                  ? 'bg-cyan-50 border-cyan-300 text-cyan-800'
                  : 'bg-cyan-950/70 border-cyan-700/50 text-cyan-300'
                : isBright
                  ? 'bg-slate-100 border-slate-300 text-slate-500 hover:text-slate-800'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={showStatePanel ? 'Hide Program State panel to expand 3D viewport' : 'Show Program State panel'}
          >
            {showStatePanel ? <Eye size={12} /> : <EyeOff size={12} />}
            <span className="hidden sm:inline">State:</span>
            <span>{showStatePanel ? 'ON' : 'OFF'}</span>
          </button>

          {/* Fullscreen 3D Theater Mode Toggle Button */}
          <button
            onClick={() => setIsFull3DView((prev) => !prev)}
            className={`h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold transition border shadow-xs cursor-pointer ${
              isFull3DView
                ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-600/30'
                : isBright
                  ? 'bg-purple-50 hover:bg-purple-100 border-purple-300 text-purple-800'
                  : 'bg-purple-950/70 hover:bg-purple-900 border-purple-700/50 text-purple-300'
            }`}
            title={isFull3DView ? 'Exit Full 3D Theater mode and show Studio' : 'Full 3D Mode: Expand 3D canvas to 100% full screen'}
          >
            {isFull3DView ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            <span className="hidden sm:inline">{isFull3DView ? 'Exit 3D' : 'Full 3D'}</span>
          </button>

          <button
            onClick={() => setIsAiOpen(true)}
            className={`h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold transition border shadow-xs cursor-pointer ${
              isBright
                ? 'bg-cyan-50 hover:bg-cyan-100 border-cyan-300 text-cyan-800'
                : 'bg-cyan-950/70 hover:bg-cyan-900 border-cyan-700/50 text-cyan-300'
            }`}
          >
            <Sparkles size={13} className={isBright ? 'text-cyan-600' : 'text-cyan-400'} />
            <span className="hidden sm:inline">AI Tutor</span>
          </button>

          <button
            onClick={() => setIsQuizOpen(true)}
            className={`h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold transition border shadow-xs cursor-pointer ${
              isBright
                ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                : 'bg-emerald-950/70 hover:bg-emerald-900 border-emerald-700/50 text-emerald-300'
            }`}
          >
            <HelpCircle size={13} className={isBright ? 'text-emerald-600' : 'text-emerald-400'} />
            <span className="hidden sm:inline">Quiz</span>
          </button>
        </div>
      </div>

      {/* Mobile View Switcher (Visible only on mobile devices) */}
      <div className={`md:hidden flex items-center border-b p-1 shrink-0 ${
        isBright ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800/80'
      }`}>
        <button
          onClick={() => setMobileTab('3d')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition ${
            mobileTab === '3d'
              ? isBright
                ? 'bg-cyan-100 text-cyan-800 border border-cyan-300 shadow-sm'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : isBright ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🧊 3D Scene</span>
        </button>
        <button
          onClick={() => setMobileTab('code')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition ${
            mobileTab === 'code'
              ? isBright
                ? 'bg-cyan-100 text-cyan-800 border border-cyan-300 shadow-sm'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : isBright ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>💻 Code Editor</span>
        </button>
        <button
          onClick={() => setMobileTab('state')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition ${
            mobileTab === 'state'
              ? isBright
                ? 'bg-cyan-100 text-cyan-800 border border-cyan-300 shadow-sm'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : isBright ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>📊 Variables</span>
        </button>
      </div>

      {/* Execution Pipeline Warning / Error Alert */}
      {executionError && (
        <div className={`px-4 py-2 text-xs flex items-center justify-between border-b animate-fadeIn z-20 shrink-0 ${
          isBright
            ? 'bg-rose-50 text-rose-900 border-rose-200'
            : 'bg-rose-950/40 text-rose-200 border-rose-800/60'
        }`}>
          <div className="flex items-center gap-2">
            <span className="font-bold">⚠️ Notice:</span>
            <span>{executionError}</span>
          </div>
          <button
            onClick={() => setExecutionError(null)}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition cursor-pointer ${
              isBright
                ? 'bg-white hover:bg-rose-100 border-rose-300 text-rose-800'
                : 'bg-rose-900/60 hover:bg-rose-900 border-rose-700 text-rose-200'
            }`}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Studio Workspace with Draggable Box Resizers */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative select-none">
        {/* Left Box: Monaco Code Editor */}
        {!isFull3DView && (
          <div
            className={`${mobileTab === 'code' ? 'block w-full' : 'hidden'} md:block h-full overflow-hidden shrink-0 transition-all duration-75`}
            style={{ width: isFull3DView ? 0 : `${editorWidthPercent}%` }}
          >
            <CodeEditor
              code={code}
              onChangeCode={(val) => {
                setCode(val);
                if (syntaxErrorLine) setSyntaxErrorLine(null);
                if (executionError) setExecutionError(null);
              }}
              language={language}
              onChangeLanguage={handleLanguageChange}
              onOpenCustomCode={() => setIsCustomCodeOpen(true)}
              onOpenCodeDoctor={() => setIsCodeDoctorOpen(true)}
              onOpenPersonalProblem={() => setIsCodeDoctorOpen(true)}
              onOpenStriverSheet={() => setIsStriverSheetOpen(true)}
              onOpenLeetCode={() => setIsStriverSheetOpen(true)}
              currentLineNumber={currentStep?.lineNumber || null}
              syntaxErrorLine={syntaxErrorLine}
              isPlaying={isPlaying}
              onPlay={handleRunCode}
              onRunCode={handleRunCode}
              onResetCode={handleResetCode}
              isExecuting={isExecuting}
              isCodeDirty={isCodeDirty}
              onPause={pause}
              onNext={nextStep}
              onPrev={prevStep}
              onReset={reset}
              isAtStart={isAtStart}
              isAtEnd={isAtEnd}
            />
          </div>
        )}

        {/* Draggable & Hover Resizing Divider Bar between Code Editor and 3D Visualizer */}
        {!isFull3DView && (
          <div
            onMouseDown={startEditorResize}
            className={`hidden md:flex flex-col items-center justify-center w-2 relative group cursor-col-resize z-20 transition-colors ${
              isResizingEditor
                ? 'bg-cyan-500 shadow-lg shadow-cyan-500/50'
                : isBright
                ? 'bg-slate-200 hover:bg-cyan-400'
                : 'bg-slate-800/80 hover:bg-cyan-500/80'
            }`}
            title={`Drag to resize Code vs 3D Box (Current: ${editorWidthPercent}%)`}
          >
            {/* Hover Grab Handle Dots */}
            <div className="w-1 h-8 rounded-full bg-slate-400/50 group-hover:bg-slate-900 group-hover:scale-y-125 transition-all"></div>

            {/* Quick Preset Buttons on Hover */}
            <div className="absolute top-2 left-3 hidden group-hover:flex items-center gap-1 backdrop-blur-md bg-slate-950/90 border border-slate-700 rounded-lg p-1 text-[10px] shadow-xl z-30 pointer-events-auto">
              <span className="text-slate-400 font-mono px-1">Editor:</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditorWidthPercent(25);
                }}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-cyan-600 text-cyan-300 font-mono"
              >
                25%
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditorWidthPercent(35);
                }}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-cyan-600 text-cyan-300 font-mono"
              >
                35%
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditorWidthPercent(50);
                }}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-cyan-600 text-cyan-300 font-mono"
              >
                50%
              </button>
            </div>
          </div>
        )}

        {/* Center Box: 3D Visualization + Console + User Input Bar */}
        <div className={`
          ${mobileTab === '3d' ? 'flex' : 'hidden'} 
          md:flex flex-1 h-full flex-col overflow-hidden transition-all duration-75 border-r border-slate-800/80
        `}>
          {/* Direct Interactive Form User Input Bar */}
          <div className={`px-3 py-1.5 border-b flex flex-wrap items-center justify-between gap-2 text-xs transition-colors shrink-0 ${
            isBright ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0b0f19] border-slate-800 text-slate-200'
          }`}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className={`font-semibold text-[11px] shrink-0 flex items-center gap-1 ${
                isBright ? 'text-cyan-700' : 'text-cyan-400'
              }`}>
                <Sparkles size={13} />
                <span className="hidden sm:inline">Input Data:</span>
              </span>
              {activeStriverProblem && (
                <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                  <BookOpen size={10} className="text-amber-400" />
                  <span>#{activeStriverProblem.striverId || activeStriverProblem.id}</span>
                </span>
              )}
              <input
                type="text"
                value={formInputValues}
                onChange={(e) => setFormInputValues(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFormInput()}
                placeholder="e.g. 15, 42, 8, 99, 23, 67"
                className={`flex-1 min-w-0 px-2.5 py-0.5 rounded text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-cyan-500 transition ${
                  isBright
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-700 text-cyan-300 placeholder:text-slate-600'
                }`}
              />
              <button
                onClick={handleApplyFormInput}
                className={`px-2.5 py-0.5 rounded font-semibold text-xs transition shadow-sm shrink-0 cursor-pointer ${
                  isBright
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/20'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-cyan-500/20'
                }`}
                title="Apply these values directly into code and visualize in 3D"
              >
                Apply & Run ⚡
              </button>
            </div>

            {/* Quick Data Presets */}
            <div className="flex items-center gap-1 shrink-0 text-[11px]">
              <span className="text-slate-500 hidden xl:inline">Presets:</span>
              <button
                onClick={() => handleApplyPresetValues([14, 52, 8, 91, 33, 47])}
                className={`px-1.5 py-0.5 rounded transition ${
                  isBright
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title="Random custom numbers"
              >
                🎲 Random
              </button>
              <button
                onClick={() => handleApplyPresetValues([5, 12, 19, 28, 35, 42])}
                className={`px-1.5 py-0.5 rounded transition ${
                  isBright
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title="Sorted ascending numbers"
              >
                📈 Sorted
              </button>
              <button
                onClick={() => handleApplyPresetValues([50, 40, 30, 20, 10])}
                className={`px-1.5 py-0.5 rounded transition ${
                  isBright
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title="Reverse descending numbers"
              >
                📉 Reverse
              </button>
              <button
                onClick={() => handleApplyPresetValues([1, 8, 6, 2, 5, 4, 8, 3, 7])}
                className={`px-1.5 py-0.5 rounded transition ${
                  isBright
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title="Peaks and water walls"
              >
                🌊 Waves
              </button>
            </div>
          </div>

          {/* 3D Canvas Viewport Box */}
          <div className="flex-1 relative min-h-[220px]">
            <SceneContainer
              currentStep={currentStep}
              code={code}
              statusLabel={currentStep?.dataStructureState?.label || null}
              activeDetails={currentStep?.dataStructureState?.focusInfo || null}
              correctOutput={finalCorrectOutput}
              isAtEnd={isAtEnd}
              cumulativeOutput={cumulativeOutput}
              isFull3DView={isFull3DView}
              onToggleFull3D={() => setIsFull3DView((prev) => !prev)}
            >
              <DsaSceneDispatcher
                dataStructureState={currentStep?.dataStructureState}
              />
            </SceneContainer>
          </div>

          {/* Draggable & Hover Resizing Divider Bar between 3D Canvas and Console */}
          {!isFull3DView && (
            <div
              onMouseDown={startConsoleResize}
              className={`h-2 w-full relative group cursor-row-resize z-20 flex items-center justify-center transition-colors ${
                isResizingConsole
                  ? 'bg-cyan-500 shadow-lg shadow-cyan-500/50'
                  : isBright
                  ? 'bg-slate-200 hover:bg-cyan-400'
                  : 'bg-slate-800/80 hover:bg-cyan-500/80'
              }`}
              title={`Drag to resize Console Height (Current: ${consoleHeightPx}px)`}
            >
              {/* Horizontal Grip Line */}
              <div className="w-12 h-1 rounded-full bg-slate-400/50 group-hover:bg-slate-900 group-hover:scale-x-125 transition-all"></div>

              {/* Quick Height Preset Buttons on Hover */}
              <div className="absolute right-3 -top-7 hidden group-hover:flex items-center gap-1 backdrop-blur-md bg-slate-950/90 border border-slate-700 rounded-lg p-1 text-[10px] shadow-xl z-30 pointer-events-auto">
                <span className="text-slate-400 font-mono px-1">Console:</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConsoleHeightPx(90);
                  }}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-cyan-600 text-cyan-300 font-mono"
                >
                  90px
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConsoleHeightPx(165);
                  }}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-cyan-600 text-cyan-300 font-mono"
                >
                  165px
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConsoleHeightPx(260);
                  }}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-cyan-600 text-cyan-300 font-mono"
                >
                  260px
                </button>
              </div>
            </div>
          )}

          {/* Integrated Output Console Box */}
          {!isFull3DView && (
            <div style={{ height: `${consoleHeightPx}px` }} className="shrink-0 overflow-hidden transition-all duration-75">
              <OutputConsole
                output={cumulativeOutput}
                correctOutput={finalCorrectOutput}
                isAtEnd={isAtEnd}
              />
            </div>
          )}
        </div>

        {/* Right Column: Program State Inspector */}
        {!isFull3DView && showStatePanel && (
          <div className={`${mobileTab === 'state' ? 'block w-full' : 'hidden'} md:block w-72 lg:w-80 h-full overflow-hidden shrink-0 transition-all duration-300`}>
            <StatePanel
              currentStep={currentStep}
              totalSteps={totalSteps}
              correctOutput={finalCorrectOutput}
              isAtEnd={isAtEnd}
            />
          </div>
        )}
      </div>

      {/* Bottom Full-Width Time Machine Timeline */}
      <div className="w-full">
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
        />
      </div>

      {/* Modals */}
      <AiAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        code={code}
        currentLineNumber={currentStep?.lineNumber || 6}
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
        onApplyCorrectedCode={handleApplyCorrectedCode}
        currentLanguage={language}
        currentCode={code}
      />

      <StriverSheetDrawer
        isOpen={isStriverSheetOpen}
        onToggle={() => setIsStriverSheetOpen((prev) => !prev)}
        onSelectProblem={handleSelectStriverProblem}
        currentLanguage={language}
      />
    </div>
  );
}
