import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  CheckCircle,
  XCircle,
  Award,
  RotateCcw,
  Sparkles,
  BookOpen,
  Flame,
  ArrowRight,
  ExternalLink,
  Layers,
  Timer,
  Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchQuizQuestions, recordQuizHistory } from '../services/apiService';
import { QUIZ_BANK, getQuizForConcept } from '../utils/quizBank';
import { useTheme } from '../context/ThemeContext';

const TOPIC_CHIPS = [
  { id: 'bubble-sort', label: 'Bubble Sort', icon: '⚡' },
  { id: 'binary-search', label: 'Binary Search', icon: '🔍' },
  { id: 'linked-list', label: 'Linked List', icon: '🔗' },
  { id: 'array-loop', label: '1D Arrays', icon: '🧊' },
  { id: 'matrix', label: '2D Matrices', icon: '▦' },
  { id: 'stack', label: 'Stack LIFO', icon: '📚' },
  { id: 'bst', label: 'BST Trees', icon: '🌳' },
  { id: 'graphs', label: 'Graphs', icon: '🕸️' },
  { id: 'dp-hashing', label: 'DP & Hashing', icon: '🧠' },
];

export default function QuizArena() {
  const { isBright, currentAccent } = useTheme();
  const navigate = useNavigate();
  const accentHex = isBright ? currentAccent.bright : currentAccent.dark;

  const [selectedConcept, setSelectedConcept] = useState('bubble-sort');
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchQuizQuestions(selectedConcept)
      .then((data) => {
        if (data && data.length > 0) {
          setQuestions(data);
        } else {
          setQuestions(getQuizForConcept(selectedConcept));
        }
        setLoading(false);
        resetQuiz();
      })
      .catch(() => {
        setQuestions(getQuizForConcept(selectedConcept));
        setLoading(false);
        resetQuiz();
      });
  }, [selectedConcept]);

  const resetQuiz = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setQuizFinished(false);
  };

  const handleSelect = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === questions[currentQIndex].correctIndex;
    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((st) => {
        const next = st + 1;
        setMaxStreak((ms) => Math.max(ms, next));
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      recordQuizHistory({
        conceptId: selectedConcept,
        score,
        totalQuestions: questions.length,
      });
    }
  };

  const currentQ = questions[currentQIndex];
  const progressPercent = questions.length > 0 ? Math.round(((currentQIndex + 1) / questions.length) * 100) : 0;

  const handleLaunch3DStudy = () => {
    navigate('/visualizer');
  };

  return (
    <div
      className={`flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 select-none transition-colors duration-300 ${
        isBright ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#040711] text-slate-100'
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Header with Topic Badges & Gamified Streak */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge-neon">
                <HelpCircle size={13} />
                <span>ALGORITHMIC ARENA</span>
              </span>

              {streak >= 2 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-500 border border-amber-500/40 animate-pulse">
                  <Flame size={14} className="fill-amber-500" />
                  <span>{streak}x Combo Streak!</span>
                </span>
              )}
            </div>

            <h1 className={`text-2xl sm:text-3xl font-black font-display tracking-tight ${isBright ? 'text-slate-950' : 'text-white'}`}>
              Interactive Assessment Arena
            </h1>
            <p className={`text-xs sm:text-sm max-w-xl ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
              Predict asymptotic bounds, trace variable mutations, and master interview problem heuristics with instant visual feedback.
            </p>
          </div>

          {/* Gamified Live Score Counter */}
          <div className={`p-3 rounded-2xl border flex items-center gap-4 self-start md:self-auto ${
            isBright ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <div className="text-center px-2">
              <span className="text-[10px] font-mono uppercase opacity-60 block">Score</span>
              <span className="text-xl font-black font-mono" style={{ color: accentHex }}>
                {score}/{questions.length || 0}
              </span>
            </div>

            <div className="h-8 w-px bg-slate-500/20" />

            <div className="text-center px-2">
              <span className="text-[10px] font-mono uppercase opacity-60 block">Best Streak</span>
              <span className="text-xl font-black font-mono text-amber-500">
                {maxStreak} 🔥
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Topic Selector Chips */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase font-bold opacity-60 block">
            Select Topic Arena:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5">
            {TOPIC_CHIPS.map((chip) => (
              <button
                key={chip.id}
                onClick={() => setSelectedConcept(chip.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  selectedConcept === chip.id
                    ? 'font-bold text-white shadow-md'
                    : isBright
                      ? 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                      : 'bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-300'
                }`}
                style={{
                  backgroundColor: selectedConcept === chip.id ? accentHex : undefined,
                  boxShadow: selectedConcept === chip.id ? `0 4px 14px ${currentAccent.glow}` : undefined,
                }}
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Quiz Card */}
        <div className="bento-card template-card p-6 md:p-8">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div
                className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto"
                style={{ borderColor: `${accentHex} transparent ${accentHex} ${accentHex}` }}
              />
              <p className="text-xs font-mono opacity-70">
                Loading algorithmic problem set...
              </p>
            </div>
          ) : quizFinished ? (
            /* Completion Card with Trophy & 3D Launch CTA */
            <div className="text-center py-10 space-y-6">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce"
                style={{
                  backgroundColor: isBright ? `${currentAccent.bright}20` : `${currentAccent.dark}25`,
                  color: accentHex,
                }}
              >
                <Award size={48} />
              </div>

              <div className="space-y-2">
                <span className="badge-neon">ASSESSMENT COMPLETE</span>
                <h3 className={`text-2xl sm:text-3xl font-black font-display ${isBright ? 'text-slate-950' : 'text-white'}`}>
                  Excellent Problem Solving!
                </h3>
                <p className={`text-sm max-w-md mx-auto ${isBright ? 'text-slate-600' : 'text-slate-300'}`}>
                  You solved <strong style={{ color: accentHex }}>{score}</strong> out of {questions.length} questions correctly (
                  <strong>{Math.round((score / Math.max(1, questions.length)) * 100)}%</strong> accuracy) with a max streak of{' '}
                  <strong className="text-amber-500">{maxStreak}</strong>.
                </p>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={resetQuiz}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition cursor-pointer ${
                    isBright
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  }`}
                >
                  <RotateCcw size={15} />
                  <span>Retry Quiz</span>
                </button>

                <button
                  onClick={handleLaunch3DStudy}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg transition cursor-pointer"
                  style={{
                    backgroundColor: accentHex,
                    boxShadow: `0 4px 16px ${currentAccent.glow}`,
                  }}
                >
                  <Sparkles size={15} />
                  <span>Visualize in 3D Studio</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ) : currentQ ? (
            <div className="space-y-6">
              {/* Question Progress Tracker Bar */}
              <div className="space-y-2 pb-2">
                <div className="flex items-center justify-between text-xs font-mono opacity-75">
                  <span>
                    Question {currentQIndex + 1} of {questions.length}
                  </span>
                  <span>{progressPercent}% Complete</span>
                </div>

                <div className="w-full h-2 rounded-full overflow-hidden bg-slate-500/15">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: accentHex,
                    }}
                  />
                </div>
              </div>

              {/* Question Statement */}
              <h2
                className={`text-base sm:text-lg md:text-xl font-bold font-display leading-relaxed ${
                  isBright ? 'text-slate-900' : 'text-white'
                }`}
              >
                {currentQ.question}
              </h2>

              {/* Interactive Options */}
              <div className="space-y-3 pt-1">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = isAnswered && idx === currentQ.correctIndex;
                  const isWrong = isAnswered && isSelected && idx !== currentQ.correctIndex;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={isAnswered}
                      className={`w-full p-4 rounded-2xl border text-sm text-left font-medium transition-all duration-200 flex items-center justify-between cursor-pointer ${
                        isCorrect
                          ? isBright
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/30'
                            : 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold ring-2 ring-emerald-500/40'
                          : isWrong
                            ? isBright
                              ? 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/30'
                              : 'bg-rose-950/60 border-rose-500 text-rose-200 ring-2 ring-rose-500/40'
                            : isSelected
                              ? 'border-2'
                              : isBright
                                ? 'bg-slate-50/80 hover:bg-slate-100 border-slate-200 text-slate-800'
                                : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-200'
                      }`}
                      style={{
                        borderColor: isSelected && !isAnswered ? accentHex : undefined,
                      }}
                    >
                      <div className="flex items-center gap-3.5">
                        <span
                          className={`w-7 h-7 rounded-xl text-xs flex items-center justify-center font-mono font-bold transition-colors ${
                            isCorrect
                              ? 'bg-emerald-500 text-white'
                              : isWrong
                                ? 'bg-rose-500 text-white'
                                : isBright
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </div>

                      {isCorrect && (
                        <CheckCircle
                          size={20}
                          className={isBright ? 'text-emerald-600 shrink-0' : 'text-emerald-400 shrink-0'}
                        />
                      )}
                      {isWrong && (
                        <XCircle
                          size={20}
                          className={isBright ? 'text-rose-600 shrink-0' : 'text-rose-400 shrink-0'}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next Question Drawer */}
              {isAnswered && (
                <div
                  className={`rounded-2xl p-4 sm:p-5 space-y-3 mt-4 border transition-all animate-fade-in ${
                    isBright
                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">💡</span>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: accentHex }}>
                      Why this is correct:
                    </span>
                  </div>

                  <p className={`text-xs sm:text-sm leading-relaxed ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
                    {currentQ.explanation}
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={handleLaunch3DStudy}
                      className="text-xs font-semibold flex items-center gap-1.5 opacity-75 hover:opacity-100 cursor-pointer"
                      style={{ color: accentHex }}
                    >
                      <Layers size={13} />
                      <span>Visualize concept in 3D</span>
                    </button>

                    <button
                      onClick={handleNext}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs text-white transition shadow-md cursor-pointer flex items-center gap-1.5"
                      style={{
                        backgroundColor: accentHex,
                        boxShadow: `0 4px 14px ${currentAccent.glow}`,
                      }}
                    >
                      <span>{currentQIndex < questions.length - 1 ? 'Next Question' : 'View Results'}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
