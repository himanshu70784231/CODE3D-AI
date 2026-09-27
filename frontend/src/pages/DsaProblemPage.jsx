import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProblemBySlug, updateProgress } from '../services/dsa.js';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Layers, Play, CheckCircle2, Lightbulb, Clock, HardDrive, ArrowLeft, Code2 } from 'lucide-react';

export default function DsaProblemPage({ onVisualizeProblem }) {
  const { problemSlug } = useParams();
  const { isBright } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState('java');

  useEffect(() => {
    getProblemBySlug(problemSlug)
      .then((res) => {
        if (res?.success && res.problem) {
          setProblem(res.problem);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [problemSlug]);

  const handleLaunch = () => {
    if (!problem) return;
    if (onVisualizeProblem) {
      onVisualizeProblem({
        id: problem.id,
        title: problem.title,
        category: problem.topic?.name || 'DSA',
        description: problem.description,
        difficulty: problem.difficulty,
        timeComplexity: problem.timeComplexity,
        spaceComplexity: problem.spaceComplexity,
        code: problem.starterCode?.[activeCodeTab] || '',
        language: activeCodeTab,
        defaultInput: problem.defaultInput,
      });
    } else {
      navigate('/visualize');
    }
  };

  const handleMarkSolved = async () => {
    if (!problem || !isAuthenticated) return;
    try {
      await updateProgress({ problemId: problem.id, status: 'SOLVED' });
      alert('Marked problem as SOLVED in your cloud profile!');
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-xs">
        Loading problem details from database...
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex-1 p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">Problem Not Found</h2>
        <button
          onClick={() => navigate('/dsa')}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-500 text-slate-950"
        >
          Return to DSA Hub
        </button>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-y-auto p-4 md:p-8 select-none transition-colors ${
      isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'
    }`}>
      <div className="max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/dsa')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Problem Hub</span>
        </button>

        {/* Problem Header */}
        <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isBright ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {problem.topic?.name || 'Algorithm'}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                problem.difficulty === 'EASY'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : problem.difficulty === 'MEDIUM'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {problem.difficulty}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold">{problem.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleMarkSolved}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer"
              >
                <CheckCircle2 size={13} />
                <span>Mark Solved</span>
              </button>
            )}
            <button
              onClick={handleLaunch}
              className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <Play size={13} className="fill-current" />
              <span>Visualize in 3D</span>
            </button>
          </div>
        </div>

        {/* Problem Description */}
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isBright ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Problem Statement</h2>
          <p className="text-sm leading-relaxed">{problem.description}</p>

          <div className="flex items-center gap-6 pt-3 border-t border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Clock size={13} />
              <span>Time: {problem.timeComplexity}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <HardDrive size={13} />
              <span>Space: {problem.spaceComplexity}</span>
            </div>
          </div>
        </div>

        {/* Code tabs */}
        {problem.starterCode && (
          <div className={`rounded-2xl border overflow-hidden ${
            isBright ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 bg-slate-900/60">
              <div className="flex items-center gap-2">
                <Code2 size={14} className="text-cyan-400" />
                <span className="text-xs font-bold">Solution Implementation</span>
              </div>
              <div className="flex items-center gap-1">
                {Object.keys(problem.starterCode).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveCodeTab(lang)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition cursor-pointer ${
                      activeCodeTab === lang
                        ? 'bg-cyan-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <pre className="p-4 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
              {problem.starterCode[activeCodeTab] || '// No starter code available'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
