import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle, XCircle, Award, RotateCcw, Sparkles, BookOpen } from 'lucide-react';
import { fetchQuizQuestions, recordQuizHistory } from '../services/apiService';
import { QUIZ_BANK, getQuizForConcept } from '../utils/quizBank';
import { useTheme } from '../context/ThemeContext';

export default function QuizArena() {
  const { isBright } = useTheme();
  const [selectedConcept, setSelectedConcept] = useState('bubble-sort');
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchQuizQuestions(selectedConcept).then((data) => {
      if (data && data.length > 0) {
        setQuestions(data);
      } else {
        setQuestions(getQuizForConcept(selectedConcept));
      }
      setLoading(false);
      resetQuiz();
    }).catch(() => {
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
    setQuizFinished(false);
  };

  const handleSelect = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === questions[currentQIndex].correctIndex) {
      setScore((s) => s + 1);
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

  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-10 select-none transition-colors duration-200 ${
      isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'
    }`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium mb-2 border ${
              isBright
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-emerald-950/60 border-emerald-800/50 text-emerald-400'
            }`}>
              <HelpCircle size={13} />
              <span>Algorithmic Assessment Arena</span>
            </div>
            <h1 className={`text-3xl font-extrabold ${isBright ? 'text-slate-900' : 'text-white'}`}>
              DSA Interactive Quiz
            </h1>
            <p className={`text-xs mt-1 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
              Challenge yourself by predicting variable mutations, pointer traversals, and asymptotic bounds.
            </p>
          </div>

          {/* Concept Picker */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>Topic:</span>
            <select
              value={selectedConcept}
              onChange={(e) => setSelectedConcept(e.target.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer border transition-colors ${
                isBright
                  ? 'bg-white border-slate-300 text-slate-800 shadow-sm font-semibold'
                  : 'bg-slate-900 border-slate-700 text-cyan-300'
              }`}
            >
              <option value="array-loop">1D Arrays &amp; Memory</option>
              <option value="matrix">2D Matrices &amp; Row-Major</option>
              <option value="linked-list">Singly &amp; Doubly Linked Lists</option>
              <option value="stack">Stack (LIFO &amp; Monotonic)</option>
              <option value="queue">Queue (FIFO, Deque &amp; Heaps)</option>
              <option value="bst">Binary Search Tree (BST)</option>
              <option value="trees-advanced">Advanced Trees (AVL &amp; LCA)</option>
              <option value="bubble-sort">Bubble Sort Algorithm</option>
              <option value="binary-search">Binary Search</option>
              <option value="recursion">Recursion &amp; Call Stack</option>
              <option value="graphs">Graph Algorithms (BFS/DFS/Dijkstra)</option>
              <option value="dp-hashing">Dynamic Programming &amp; Hashing</option>
              <option value="c-lang">C Pointers &amp; Memory</option>
              <option value="cpp-lang">C++ STL &amp; Vectors</option>
              <option value="python-lang">Python Lists &amp; Dicts</option>
              <option value="js-lang">JavaScript ES6+ &amp; Event Loop</option>
            </select>
          </div>
        </div>

        {/* Main Quiz Card */}
        <div className={`border rounded-2xl p-6 md:p-8 shadow-xl transition-colors ${
          isBright
            ? 'bg-white border-slate-200 shadow-slate-200 text-slate-800'
            : 'bg-slate-900/70 border-slate-800/90 text-slate-100'
        }`}>
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className={`text-xs font-mono ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>Loading questions from backend...</p>
            </div>
          ) : quizFinished ? (
            <div className="text-center py-10 space-y-5">
              <div className="w-20 h-20 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-500 mx-auto">
                <Award size={40} />
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${isBright ? 'text-slate-900' : 'text-white'}`}>Assessment Complete!</h3>
                <p className={`text-sm mt-2 ${isBright ? 'text-slate-600' : 'text-slate-300'}`}>
                  You scored <strong className={`text-lg font-bold ${isBright ? 'text-cyan-700' : 'text-cyan-400'}`}>{score}</strong> out of {questions.length} (
                  {Math.round((score / questions.length) * 100)}% accuracy)
                </p>
              </div>

              <div className="pt-4 flex justify-center gap-4">
                <button
                  onClick={resetQuiz}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer border ${
                    isBright
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  }`}
                >
                  <RotateCcw size={15} />
                  <span>Retry Quiz</span>
                </button>
              </div>
            </div>
          ) : currentQ ? (
            <div className="space-y-6">
              {/* Question progress */}
              <div className={`flex items-center justify-between text-xs font-mono pb-4 border-b ${
                isBright ? 'text-slate-500 border-slate-100' : 'text-slate-400 border-slate-800'
              }`}>
                <span>Question {currentQIndex + 1} of {questions.length}</span>
                <span className={`px-3 py-1 rounded-full border ${
                  isBright ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}>
                  Current Score: <strong className={isBright ? 'text-cyan-700 font-bold' : 'text-cyan-400'}>{score}</strong>
                </span>
              </div>

              {/* Question statement */}
              <h2 className={`text-base md:text-lg font-bold leading-relaxed ${
                isBright ? 'text-slate-900' : 'text-white'
              }`}>
                {currentQ.question}
              </h2>

              {/* Options */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = isAnswered && idx === currentQ.correctIndex;
                  const isWrong = isAnswered && isSelected && idx !== currentQ.correctIndex;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={isAnswered}
                      className={`w-full p-4 rounded-xl border text-sm text-left font-medium transition flex items-center justify-between cursor-pointer ${
                        isCorrect
                          ? isBright
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold shadow-2xs'
                            : 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                          : isWrong
                          ? isBright
                            ? 'bg-rose-50 border-rose-400 text-rose-950'
                            : 'bg-rose-950/60 border-rose-500 text-rose-200'
                          : isSelected
                          ? isBright
                            ? 'bg-cyan-50 border-cyan-500 text-cyan-950'
                            : 'bg-cyan-950/50 border-cyan-500 text-cyan-200'
                          : isBright
                          ? 'bg-slate-50/70 border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-100'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-mono font-bold ${
                          isBright ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isCorrect && <CheckCircle size={18} className={isBright ? 'text-emerald-600 shrink-0' : 'text-emerald-400 shrink-0'} />}
                      {isWrong && <XCircle size={18} className={isBright ? 'text-rose-600 shrink-0' : 'text-rose-400 shrink-0'} />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next */}
              {isAnswered && (
                <div className={`rounded-xl p-4 space-y-3 mt-4 border transition-colors ${
                  isBright
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}>
                  <span className={`text-xs font-bold uppercase tracking-wider block ${
                    isBright ? 'text-cyan-700' : 'text-cyan-400'
                  }`}>
                    Why this is correct:
                  </span>
                  <p className={`text-xs leading-relaxed font-sans ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
                    {currentQ.explanation}
                  </p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNext}
                      className={`px-5 py-2 rounded-lg font-bold text-xs transition cursor-pointer ${
                        isBright
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                      }`}
                    >
                      {currentQIndex < questions.length - 1 ? 'Next Question →' : 'View Results'}
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
