import React, { useState, useEffect } from 'react';
import { History, CheckCircle, Award, Code2, Database, Clock, RefreshCw, Trash2, Play, Zap, Eye, X, Lock, LogIn, UserPlus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getExecutionHistory, clearExecutionHistory, deleteHistoryItem } from '../services/apiService';

export default function HistoryPage({ onRerunProgram }) {
  const { isBright } = useTheme();
  const { isAuthenticated, openLoginModal, openRegisterModal } = useAuth();
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [viewCodeRecord, setViewCodeRecord] = useState(null);

  const filteredExecutions = (historyData?.recentExecutions || []).filter((rec) => {
    const matchesLang = selectedLanguage === 'ALL' || (rec.language || 'java').toLowerCase() === selectedLanguage.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q ||
      String(rec.programTitle || '').toLowerCase().includes(q) ||
      String(rec.conceptId || '').toLowerCase().includes(q);
    return matchesLang && matchesQuery;
  });

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getExecutionHistory();
      setHistoryData(data);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all execution and quiz history?')) {
      clearExecutionHistory();
      loadHistory();
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm(`Delete execution #${id}?`)) {
      await deleteHistoryItem(id);
      loadHistory();
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className={`flex-1 flex items-center justify-center p-6 md:p-12 transition-colors select-none ${
        isBright ? 'bg-[#f7f6f3] text-stone-900' : 'bg-[#0e1013] text-stone-100'
      }`}>
        <div className={`w-full max-w-sm p-6 rounded-xl border shadow-sm text-center relative overflow-hidden transition-all ${
          isBright
            ? 'bg-white border-[#e2dfd8]'
            : 'bg-[#13161b] border-[#252932]'
        }`}>
          <div className="inline-flex p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 mb-3">
            <Lock size={24} className="stroke-[2.2]" />
          </div>
          <h2 className="text-lg font-bold tracking-tight mb-1 text-stone-900 dark:text-stone-100">
            Execution History Protected
          </h2>
          <p className={`text-xs leading-relaxed max-w-xs mx-auto mb-5 ${isBright ? 'text-stone-600' : 'text-stone-400'}`}>
            Please sign in to view your saved execution logs, statement traces, and quiz assessment history.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => openLoginModal('login')}
              className="w-full py-2 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition duration-150 shadow-md bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20 cursor-pointer active:translate-y-px"
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => openRegisterModal()}
              className={`w-full py-2 px-4 rounded-lg font-semibold text-xs border flex items-center justify-center gap-2 transition duration-150 cursor-pointer active:translate-y-px ${
                isBright
                  ? 'border-[#e2dfd8] hover:bg-stone-50 text-stone-700'
                  : 'border-[#252932] hover:bg-[#181c23] text-stone-300'
              }`}
            >
              <UserPlus size={13} />
              <span>Create Free Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-10 select-none transition-colors duration-200 ${
      isBright ? 'bg-[#f7f6f3] text-stone-900' : 'bg-[#0e1013] text-stone-100'
    }`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium mb-2 border bg-amber-500/10 border-amber-500/30 text-amber-500">
              <Database size={13} />
              <span>{historyData?.isBackendConnected ? 'PostgreSQL Database Persistent Stream' : 'Browser Persistent Workspace (Active)'}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Execution History &amp; Logs
            </h1>
            <p className={`text-xs mt-1 ${isBright ? 'text-stone-600' : 'text-stone-400'}`}>
              Audit trail of program simulations, statement traces, and quiz assessment results.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                isBright
                  ? 'bg-white border-rose-300 text-rose-700 hover:bg-rose-50'
                  : 'bg-[#13161b] border-rose-900/40 text-rose-400 hover:bg-rose-950/40'
              }`}
              title="Clear all recorded history"
            >
              <Trash2 size={13} />
              <span>Clear History</span>
            </button>

            <button
              onClick={loadHistory}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                isBright
                  ? 'bg-white border-[#e2dfd8] text-stone-700 hover:bg-stone-50'
                  : 'bg-[#13161b] border-[#252932] text-stone-300 hover:text-white hover:bg-[#181c23]'
              }`}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`border rounded-xl p-4 transition-colors ${
            isBright ? 'bg-white border-[#e2dfd8]' : 'bg-[#13161b] border-[#252932]'
          }`}>
            <span className={`text-xs uppercase font-medium ${isBright ? 'text-stone-500' : 'text-stone-400'}`}>
              Total Executions
            </span>
            <div className="text-2xl font-bold font-mono mt-1 text-amber-500">
              {historyData?.totalExecutionsCount ?? 0}
            </div>
            <span className="text-[10px] text-stone-500">Database recorded</span>
          </div>

          <div className={`border rounded-xl p-4 transition-colors ${
            isBright ? 'bg-white border-[#e2dfd8]' : 'bg-[#13161b] border-[#252932]'
          }`}>
            <span className={`text-xs uppercase font-medium ${isBright ? 'text-stone-500' : 'text-stone-400'}`}>
              Quizzes Completed
            </span>
            <div className="text-2xl font-bold font-mono mt-1 text-emerald-500">
              {historyData?.totalQuizzesTaken ?? 0}
            </div>
            <span className="text-[10px] text-stone-500">Assessment logs</span>
          </div>

          <div className={`border rounded-xl p-4 transition-colors ${
            isBright ? 'bg-white border-[#e2dfd8]' : 'bg-[#13161b] border-[#252932]'
          }`}>
            <span className={`text-xs uppercase font-medium ${isBright ? 'text-stone-500' : 'text-stone-400'}`}>
              Database Engine
            </span>
            <div className="text-lg font-bold font-mono mt-1">
              PostgreSQL / Neon
            </div>
            <span className="text-[10px] font-medium text-emerald-500">Active &amp; connected</span>
          </div>

          <div className={`border rounded-xl p-4 transition-colors ${
            isBright ? 'bg-white border-[#e2dfd8]' : 'bg-[#13161b] border-[#252932]'
          }`}>
            <span className={`text-xs uppercase font-medium ${isBright ? 'text-stone-500' : 'text-stone-400'}`}>
              AST Engine
            </span>
            <div className="text-lg font-bold font-mono mt-1 text-amber-500">
              JavaParser 3.26
            </div>
            <span className="text-[10px] text-stone-500">Syntax tree verified</span>
          </div>
        </div>

        {/* Executions Table */}
        <div className={`border rounded-xl p-5 space-y-4 transition-colors ${
          isBright ? 'bg-white border-[#e2dfd8]' : 'bg-[#13161b] border-[#252932]'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Clock size={16} className="text-amber-500" />
              <span>Recent Code Executions</span>
            </div>

            {/* Search and Language Filter */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search executions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border outline-none ${
                  isBright ? 'bg-stone-50 border-[#e2dfd8] text-stone-900 focus:border-amber-500' : 'bg-[#0e1013] border-[#252932] text-stone-100 focus:border-amber-500'
                }`}
              />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer ${
                  isBright ? 'bg-stone-50 border-[#e2dfd8] text-stone-900 focus:border-amber-500' : 'bg-[#0e1013] border-[#252932] text-stone-100 focus:border-amber-500'
                }`}
              >
                <option value="ALL">All Languages</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className={`w-full text-left text-xs font-mono ${isBright ? 'text-stone-700' : 'text-stone-300'}`}>
              <thead className={`text-[10px] uppercase tracking-wider border-b ${
                isBright
                  ? 'bg-stone-50 text-stone-600 border-[#e2dfd8]'
                  : 'bg-[#181c23] text-stone-400 border-[#252932]'
              }`}>
                <tr>
                  <th className="py-2.5 px-3">Run ID</th>
                  <th className="py-2.5 px-3">Program Name</th>
                  <th className="py-2.5 px-3">Language</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date / Time</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isBright ? 'divide-stone-100' : 'divide-stone-800/40'}`}>
                {filteredExecutions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-stone-500 italic">
                      No matching executions found. Run code in the Code Playground or 3D Visualizer to log entries.
                    </td>
                  </tr>
                ) : (
                  filteredExecutions.map((rec, idx) => (
                    <tr key={idx} className={`transition ${isBright ? 'hover:bg-stone-50' : 'hover:bg-[#181c23]/60'}`}>
                      <td className="py-2.5 px-3 font-bold text-amber-500">#{String(rec.id).slice(-6)}</td>
                      <td className={`py-2.5 px-3 font-sans font-medium ${isBright ? 'text-stone-900' : 'text-white'}`}>
                        {rec.programTitle}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase font-semibold ${
                          isBright ? 'bg-stone-100 text-stone-700 border border-stone-200' : 'bg-[#181c23] text-amber-300'
                        }`}>
                          {rec.language || 'java'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isBright ? 'bg-stone-100 text-stone-600' : 'bg-stone-800/60 text-stone-300'
                        }`}>
                          {rec.conceptId || 'custom'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-stone-400">
                        {rec.executionTimeMs ? `${rec.executionTimeMs}ms` : '<10ms'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                          rec.status === 'COMPLETED'
                            ? isBright ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                            : isBright ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-amber-950/60 border-amber-800/60 text-amber-400'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-stone-500">{String(rec.executedAt).slice(0, 19).replace('T', ' ')}</td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {rec.code && (
                            <button
                              onClick={() => setViewCodeRecord(rec)}
                              className={`p-1.5 rounded transition cursor-pointer border ${
                                isBright
                                  ? 'border-[#e2dfd8] text-stone-600 hover:bg-stone-100'
                                  : 'border-[#252932] text-stone-300 hover:bg-[#181c23] hover:text-white'
                              }`}
                              title="View Source Code"
                            >
                              <Eye size={12} />
                            </button>
                          )}

                          {onRerunProgram && (
                            <button
                              onClick={() => onRerunProgram(rec)}
                              className="px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xs"
                              title="Load code and re-run in 3D Visualizer"
                            >
                              <Zap size={11} className="fill-current" />
                              <span className="hidden sm:inline">Rerun</span>
                            </button>
                          )}

                          <button
                            onClick={(e) => handleDelete(rec.id, e)}
                            className={`p-1.5 rounded transition cursor-pointer border ${
                              isBright
                                ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                : 'border-rose-900/50 text-rose-400 hover:bg-rose-950/40'
                            }`}
                            title="Delete this execution record"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quiz Results Table */}
        <div className={`border rounded-xl p-5 space-y-4 transition-colors ${
          isBright ? 'bg-white border-[#e2dfd8]' : 'bg-[#13161b] border-[#252932]'
        }`}>
          <div className="flex items-center gap-2 text-sm font-bold">
            <Award size={16} className="text-emerald-500" />
            <span>Quiz Assessment History</span>
          </div>

          <div className="overflow-x-auto">
            <table className={`w-full text-left text-xs font-mono ${isBright ? 'text-stone-700' : 'text-stone-300'}`}>
              <thead className={`text-[10px] uppercase tracking-wider border-b ${
                isBright
                  ? 'bg-stone-50 text-stone-600 border-[#e2dfd8]'
                  : 'bg-[#181c23] text-stone-400 border-[#252932]'
              }`}>
                <tr>
                  <th className="py-2.5 px-3">Attempt ID</th>
                  <th className="py-2.5 px-3">Topic / Concept</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isBright ? 'divide-stone-100' : 'divide-stone-800/40'}`}>
                {historyData?.recentQuizzes?.map((q, idx) => (
                  <tr key={idx} className={`transition ${isBright ? 'hover:bg-stone-50' : 'hover:bg-[#181c23]/60'}`}>
                    <td className="py-2.5 px-3 font-bold text-emerald-500">#{q.id}</td>
                    <td className="py-2.5 px-3 font-sans font-medium uppercase">{q.conceptId}</td>
                    <td className="py-2.5 px-3">{q.score} / {q.totalQuestions}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-16 h-1.5 rounded-full overflow-hidden ${isBright ? 'bg-stone-200' : 'bg-stone-800'}`}>
                          <div
                            className="h-full rounded-full bg-amber-500"
                            style={{ width: `${q.accuracy}%` }}
                          />
                        </div>
                        <span>{q.accuracy}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-stone-500">{String(q.completedAt).slice(0, 19).replace('T', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Code Inspection Modal */}
      {viewCodeRecord && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${
            isBright ? 'bg-white border-[#e2dfd8]' : 'bg-[#13161b] border-[#252932] text-stone-100'
          }`}>
            <div className={`px-5 py-3 border-b flex items-center justify-between ${
              isBright ? 'bg-stone-50 border-[#e2dfd8]' : 'bg-[#181c23] border-[#252932]'
            }`}>
              <div>
                <h3 className="font-bold text-sm">{viewCodeRecord.programTitle}</h3>
                <span className="text-xs text-stone-400 font-mono">
                  {viewCodeRecord.language} • {viewCodeRecord.conceptId || 'custom'}
                </span>
              </div>
              <button
                onClick={() => setViewCodeRecord(null)}
                className="p-1 rounded-lg hover:bg-stone-800/50 text-stone-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto bg-[#0e1013]">
              <pre className="text-xs font-mono text-amber-300 whitespace-pre leading-relaxed">
                {viewCodeRecord.code}
              </pre>
            </div>
            <div className={`px-5 py-3 border-t flex items-center justify-between ${
              isBright ? 'bg-stone-50 border-[#e2dfd8]' : 'bg-[#181c23] border-[#252932]'
            }`}>
              <button
                onClick={() => setViewCodeRecord(null)}
                className="px-3 py-1.5 text-xs rounded border border-[#252932] text-stone-300 hover:bg-[#181c23] cursor-pointer"
              >
                Close
              </button>
              {onRerunProgram && (
                <button
                  onClick={() => {
                    const rec = viewCodeRecord;
                    setViewCodeRecord(null);
                    onRerunProgram(rec);
                  }}
                  className="px-4 py-1.5 text-xs rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold flex items-center gap-1.5 cursor-pointer shadow-sm active:translate-y-px"
                >
                  <Zap size={13} className="fill-current" />
                  <span>Re-run in 3D Visualizer</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
