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
  ShieldCheck,
  AlertCircle,
  BarChart3,
  Sliders,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const TOPIC_OPTIONS = [
  { id: 'arrays', label: '1D & 2D Arrays', icon: '🧊' },
  { id: 'linked-list', label: 'Linked Lists', icon: '🔗' },
  { id: 'stacks-queues', label: 'Stacks & Queues', icon: '📚' },
  { id: 'trees', label: 'Trees & BSTs', icon: '🌳' },
  { id: 'sorting', label: 'Sorting & Searching', icon: '⚡' },
  { id: 'dp', label: 'Dynamic Programming', icon: '🧠' },
  { id: 'graphs', label: 'Graphs & Traversals', icon: '🕸️' },
  { id: 'java', label: 'Java OOP & Memory', icon: '☕' },
];

const DIFFICULTY_OPTIONS = [
  { id: 'easy', label: 'Beginner' },
  { id: 'medium', label: 'Intermediate' },
  { id: 'hard', label: 'Advanced' },
];

const COUNT_OPTIONS = [3, 5, 10];

export default function QuizArena() {
  const { isBright, currentAccent } = useTheme();
  const navigate = useNavigate();
  const accentHex = isBright ? currentAccent.bright : currentAccent.dark;

  // Configuration State
  const [topic, setTopic] = useState('arrays');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);

  // Quiz Lifecycle State
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Interaction State for Current Question
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentVerification, setCurrentVerification] = useState(null); // { isCorrect, correctIndex, explanation }

  // Game Stats
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [answerHistory, setAnswerHistory] = useState([]); // for final review

  // Generate / Start Quiz via Server AI Endpoint
  const startQuiz = async () => {
    setLoading(true);
    setError(null);
    setSelectedOption(null);
    setCurrentVerification(null);
    setQuizFinished(false);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setAnswerHistory([]);

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          difficulty,
          count: questionCount,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error?.message || 'Failed to initialize quiz session.');
      }

      setSessionId(data.sessionId);
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err.message || 'Failed to connect to quiz service.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Answer to Backend for Server-Side Verification
  const handleSelectOption = async (optionIdx) => {
    if (currentVerification || submitting || !sessionId) return;

    setSelectedOption(optionIdx);
    setSubmitting(true);
    setError(null);

    const currentQ = questions[currentIndex];

    try {
      const res = await fetch('/api/quiz/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQ.id,
          selectedOption: optionIdx,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error?.message || 'Answer submission failed.');
      }

      setCurrentVerification(data);

      if (data.isCorrect) {
        setScore((s) => s + 1);
        setStreak((st) => {
          const next = st + 1;
          setMaxStreak((ms) => Math.max(ms, next));
          return next;
        });
      } else {
        setStreak(0);
      }

      setAnswerHistory((prev) => [
        ...prev,
        {
          question: currentQ.question,
          codeSnippet: currentQ.codeSnippet,
          options: currentQ.options,
          userSelected: optionIdx,
          correctIndex: data.correctIndex,
          isCorrect: data.isCorrect,
          explanation: data.explanation,
        },
      ]);
    } catch (err) {
      setError(err.message || 'Submission error.');
    } finally {
      setSubmitting(false);
    }
  };

  // Next Question
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setCurrentVerification(null);
    } else {
      setQuizFinished(true);
    }
  };

  // Auto-start on initial mount
  useEffect(() => {
    startQuiz();
  }, []);

  const currentQ = questions[currentIndex];
  const progressPercent = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <div
      className={`min-h-[calc(100vh-3.5rem)] select-none transition-colors p-4 md:p-8 flex flex-col items-center ${
        isBright ? 'bg-slate-50 text-slate-800' : 'bg-[#090d16] text-slate-100'
      }`}
    >
      <div className="w-full max-w-4xl flex flex-col gap-6">
        {/* Top Header & Settings Bar */}
        <div
          className={`p-5 rounded-2xl border backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            isBright ? 'bg-white/90 border-slate-200 shadow-sm' : 'bg-[#0e1424]/90 border-slate-800/80 shadow-xl'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="p-1.5 rounded-lg text-white"
                style={{ backgroundColor: accentHex }}
              >
                <Award className="w-4 h-4" />
              </span>
              <h1 className="text-lg font-black tracking-tight">AI Quiz Arena</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Server-Verified
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive DSA questions validated server-side. Answer keys remain concealed until submission.
            </p>
          </div>

          {/* Quick Config Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className={`h-8 px-2.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer ${
                isBright ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-700 text-slate-200'
              }`}
            >
              {TOPIC_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className={`h-8 px-2.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer ${
                isBright ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-700 text-slate-200'
              }`}
            >
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>

            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className={`h-8 px-2.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer ${
                isBright ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-700 text-slate-200'
              }`}
            >
              {COUNT_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c} Questions
                </option>
              ))}
            </select>

            <button
              onClick={startQuiz}
              disabled={loading}
              style={{ backgroundColor: accentHex }}
              className="h-8 px-3 rounded-xl text-xs font-bold text-slate-950 flex items-center gap-1.5 transition hover:opacity-90 active:scale-97 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              New Quiz
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div
            className={`p-12 rounded-2xl border text-center flex flex-col items-center justify-center gap-3 ${
              isBright ? 'bg-white border-slate-200' : 'bg-[#0e1424] border-slate-800'
            }`}
          >
            <div className="w-10 h-10 rounded-full border-3 border-cyan-400 border-t-transparent animate-spin" />
            <h3 className="text-sm font-bold text-slate-200">Synthesizing Pedagogical Questions...</h3>
            <p className="text-xs text-slate-400">Validating schemas and locking answer keys on server.</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={startQuiz}
              className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* Active Quiz Question Card */}
        {!loading && !quizFinished && currentQ && (
          <div
            className={`p-6 md:p-8 rounded-2xl border backdrop-blur-md flex flex-col gap-6 shadow-xl ${
              isBright ? 'bg-white/95 border-slate-200' : 'bg-[#0e1424]/95 border-slate-800/80'
            }`}
          >
            {/* Question Progress & Live Stats */}
            <div className="flex items-center justify-between gap-4 border-b border-inherit pb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 uppercase font-mono font-bold">
                  {currentQ.topic || topic} • {currentQ.difficulty || difficulty}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1 text-amber-400">
                  <Flame className="w-4 h-4" /> Streak: {streak}
                </span>
                <span className="text-emerald-400 font-mono">
                  Score: {score}/{currentIndex + (currentVerification ? 1 : 0)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: accentHex,
                }}
              />
            </div>

            {/* Question Prompt */}
            <div className="space-y-3">
              <h2 className="text-base md:text-lg font-bold leading-relaxed text-slate-100">
                {currentQ.question}
              </h2>

              {currentQ.codeSnippet && (
                <pre className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
                  <code>{currentQ.codeSnippet}</code>
                </pre>
              )}
            </div>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentQ.options?.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isAnswered = currentVerification !== null;
                const isCorrectOption = isAnswered && idx === currentVerification.correctIndex;
                const isIncorrectChoice = isAnswered && isSelected && !currentVerification.isCorrect;

                let btnStyles = isBright
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 text-slate-200';

                if (isAnswered) {
                  if (isCorrectOption) {
                    btnStyles = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-lg shadow-emerald-500/10';
                  } else if (isIncorrectChoice) {
                    btnStyles = 'bg-rose-500/20 border-rose-500 text-rose-300';
                  } else {
                    btnStyles = 'opacity-40 border-slate-800 text-slate-500';
                  }
                } else if (isSelected) {
                  btnStyles = 'border-cyan-500 bg-cyan-500/10 text-cyan-300 font-bold';
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered || submitting}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-4 rounded-xl border text-left text-xs transition flex items-start gap-3 cursor-pointer ${btnStyles}`}
                  >
                    <span className="w-5 h-5 rounded-full border border-inherit flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 leading-normal">{opt}</span>
                    {isCorrectOption && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {isIncorrectChoice && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation & Next Button */}
            {currentVerification && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  {currentVerification.isCorrect ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Correct Answer!
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" /> Incorrect. Correct Option: {String.fromCharCode(65 + currentVerification.correctIndex)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentVerification.explanation}
                </p>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNext}
                    style={{ backgroundColor: accentHex }}
                    className="h-9 px-5 rounded-xl font-bold text-xs text-slate-950 flex items-center gap-2 transition hover:opacity-90 active:scale-97 cursor-pointer shadow-md"
                  >
                    {currentIndex < questions.length - 1 ? (
                      <>
                        Next Question <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        View Results <Award className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quiz Finished Summary View */}
        {!loading && quizFinished && (
          <div
            className={`p-8 rounded-2xl border backdrop-blur-md flex flex-col gap-6 text-center items-center shadow-2xl ${
              isBright ? 'bg-white border-slate-200' : 'bg-[#0e1424] border-slate-800'
            }`}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl"
              style={{ backgroundColor: accentHex }}
            >
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-100">Quiz Completed!</h2>
              <p className="text-xs text-slate-400 mt-1">
                Verified results for {topic.toUpperCase()} ({difficulty})
              </p>
            </div>

            {/* Score Metrics Grid */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-md">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Score</span>
                <p className="text-xl font-black text-emerald-400 mt-0.5">{score} / {questions.length}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Percentage</span>
                <p className="text-xl font-black text-cyan-400 mt-0.5">
                  {questions.length > 0 ? Math.round((score / questions.length) * 100) : 0}%
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Max Streak</span>
                <p className="text-xl font-black text-amber-400 mt-0.5">{maxStreak}</p>
              </div>
            </div>

            {/* Question Breakdown List */}
            <div className="w-full text-left space-y-3 mt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Detailed Question Review
              </h3>
              {answerHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    item.isCorrect
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-200'
                      : 'bg-rose-500/5 border-rose-500/20 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-slate-300">
                      Q{idx + 1}: {item.question}
                    </span>
                    {item.isCorrect ? (
                      <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Correct
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold text-[10px] flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Incorrect
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">{item.explanation}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={startQuiz}
                style={{ backgroundColor: accentHex }}
                className="h-10 px-6 rounded-xl font-bold text-xs text-slate-950 flex items-center gap-2 transition hover:opacity-90 active:scale-97 cursor-pointer shadow-lg"
              >
                <RotateCcw className="w-4 h-4" /> Retake / New Quiz
              </button>

              <button
                onClick={() => navigate('/visualizer')}
                className="h-10 px-5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-bold text-slate-200 flex items-center gap-2 transition cursor-pointer"
              >
                Return to 3D Visualizer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
