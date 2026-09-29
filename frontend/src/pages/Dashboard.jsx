import React, { useState, useEffect } from 'react';
import {
  Play,
  Layers,
  Code2,
  Sparkles,
  ArrowRight,
  Box,
  Cpu,
  History,
  BookOpen,
  Terminal,
  Zap,
  CheckCircle2,
  Clock,
  Database,
  ExternalLink,
} from 'lucide-react';
import { SAMPLE_PROGRAMS } from '../utils/sampleCodes.js';
import { ALGORITHM_CATALOG } from '../algorithms/index.js';
import { getExecutionHistory } from '../services/apiService.js';
import { getDashboardStats } from '../services/dashboard.js';

export default function Dashboard({ onNavigate }) {
  const [historyStats, setHistoryStats] = useState({
    totalExecutionsCount: 0,
    successfulCount: 0,
    recentExecutions: [],
  });

  useEffect(() => {
    getDashboardStats()
      .then((res) => {
        if (res?.success && res.stats) {
          const recent = (res.stats.recentExecutions || []).map((e) => ({
            id: e.id,
            programTitle: e.title || 'Simulation',
            language: e.language || 'java',
            totalSteps: e.stepCount || 10,
            status: e.status || 'COMPLETED',
            executedAt: new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
          setHistoryStats({
            totalExecutionsCount: res.stats.totalExecutions || 0,
            successfulCount: res.stats.totalExecutions || 0,
            recentExecutions: recent.slice(0, 5),
          });
        } else {
          fallbackHistory();
        }
      })
      .catch(() => fallbackHistory());

    function fallbackHistory() {
      getExecutionHistory()
        .then((data) => {
          if (data) {
            const successful = (data.recentExecutions || []).filter((e) => e.status === 'COMPLETED').length;
            setHistoryStats({
              totalExecutionsCount: data.totalExecutionsCount || (data.recentExecutions || []).length,
              successfulCount: successful,
              recentExecutions: (data.recentExecutions || []).slice(0, 5),
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  const quickStartTemplates = [
    {
      title: 'Array Traversal & Iteration',
      category: 'Arrays',
      lang: 'Java',
      complexity: 'O(n)',
      desc: 'Step through an array with index pointers, loop conditions, and atomic memory updates.',
      progId: 'array-loop',
    },
    {
      title: 'Binary Search (Two Pointers)',
      category: 'Searching',
      lang: 'Java',
      complexity: 'O(log n)',
      desc: 'Halve the search space iteratively with left, right, and mid pointer visualization.',
      progId: 'binary-search',
    },
    {
      title: 'Bubble Sort (Swapping in 3D)',
      category: 'Sorting',
      lang: 'Java',
      complexity: 'O(n²)',
      desc: 'Observe adjacent comparisons and 3D slot swaps until the array is fully sorted.',
      progId: 'bubble-sort',
    },
    {
      title: 'Two Sum Problem',
      category: 'Hash Map',
      lang: 'Java',
      complexity: 'O(n)',
      desc: 'Find two indices that sum to target using a lookup table in 3D space.',
      progId: 'two-sum',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#08111f] text-[#f8fafc] p-4 sm:p-6 md:p-8 font-sans select-none">
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Workspace Welcome & Continue Banner */}
        <div className="bg-[#101c2d] border border-[#26364a] rounded-lg p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#1e2f47] text-[#38bdf8] border border-[#3b82f6]/40 uppercase tracking-wide">
                Developer IDE Workspace
              </span>
              <span className="text-xs text-[#94a3b8] font-mono">v2.4.0</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f8fafc]">
              CODE<span className="text-[#3b82f6]">3D</span>-AI Studio
            </h1>
            <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
              Step inside code execution memory. Real AST interpretation, synchronized variable inspection,
              and interactive 3D WebGL spatial data structures.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('visualizer')}
              className="h-9 px-4 rounded bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play size={13} className="fill-current" />
              <span>Launch Studio</span>
              <ArrowRight size={13} />
            </button>

            <button
              onClick={() => onNavigate('striver')}
              className="h-9 px-3.5 rounded bg-[#101c2d] hover:bg-[#142338] border border-[#f59e0b]/50 text-[#fbbf24] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen size={13} />
              <span>Striver Sheet</span>
            </button>
          </div>
        </div>

        {/* Quick Start Templates Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
              <Zap size={14} className="text-[#3b82f6]" />
              <span>Quick Start Templates</span>
            </div>
            <button
              onClick={() => onNavigate('algorithms')}
              className="text-xs text-[#38bdf8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all algorithms</span>
              <ArrowRight size={11} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickStartTemplates.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('visualizer')}
                className="bg-[#101c2d] hover:bg-[#142338] border border-[#26364a] hover:border-[#3b82f6] rounded-md p-3.5 flex flex-col justify-between transition-all cursor-pointer group shadow-2xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#94a3b8]">
                    <span>{item.category}</span>
                    <span className="text-[#38bdf8]">{item.complexity}</span>
                  </div>
                  <h3 className="font-semibold text-xs text-[#f8fafc] group-hover:text-[#38bdf8] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-[#94a3b8] line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 flex items-center justify-between text-[11px] text-[#64748b]">
                  <span className="font-mono">{item.lang}</span>
                  <span className="text-[#3b82f6] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>Open</span>
                    <ArrowRight size={10} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two-Column Section: Recent Sessions & 3D Engine Catalog */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Execution History Table (2 cols) */}
          <div className="lg:col-span-2 bg-[#101c2d] border border-[#26364a] rounded-md overflow-hidden flex flex-col">
            <div className="h-9 bg-[#142338] border-b border-[#26364a] px-3.5 flex items-center justify-between text-xs font-semibold text-[#f8fafc]">
              <div className="flex items-center gap-2">
                <History size={13} className="text-[#3b82f6]" />
                <span>Recent Execution Sessions</span>
              </div>
              <button
                onClick={() => onNavigate('history')}
                className="text-[11px] text-[#38bdf8] hover:underline font-normal cursor-pointer"
              >
                View all ({historyStats.totalExecutionsCount})
              </button>
            </div>

            <div className="p-0 overflow-x-auto flex-1">
              {historyStats.recentExecutions.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#64748b] font-mono italic">
                  No recorded simulations yet. Execute code in Studio to log sessions.
                </div>
              ) : (
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-[#26364a] text-[#94a3b8] text-[10px] uppercase tracking-wider bg-[#0d1726]/40">
                      <th className="py-2 px-3 font-semibold">Program</th>
                      <th className="py-2 px-3 font-semibold">Lang</th>
                      <th className="py-2 px-3 font-semibold">Steps</th>
                      <th className="py-2 px-3 font-semibold">Status</th>
                      <th className="py-2 px-3 font-semibold text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2c3d]">
                    {historyStats.recentExecutions.map((row, idx) => (
                      <tr
                        key={idx}
                        onClick={() => onNavigate('visualizer')}
                        className="hover:bg-[#142338] transition-colors cursor-pointer text-[#f8fafc]"
                      >
                        <td className="py-2 px-3 font-medium truncate max-w-[200px]">
                          {row.programTitle}
                        </td>
                        <td className="py-2 px-3 text-[#38bdf8] uppercase text-[10px]">
                          {row.language}
                        </td>
                        <td className="py-2 px-3 text-[#94a3b8]">{row.totalSteps}</td>
                        <td className="py-2 px-3">
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/60 text-[#22c55e] border border-emerald-500/30">
                            {row.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-[#64748b] text-right text-[11px]">
                          {row.executedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* System & Architecture Status (1 col) */}
          <div className="bg-[#101c2d] border border-[#26364a] rounded-md overflow-hidden flex flex-col">
            <div className="h-9 bg-[#142338] border-b border-[#26364a] px-3.5 flex items-center justify-between text-xs font-semibold text-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Cpu size={13} className="text-[#14b8a6]" />
                <span>Runtime Diagnostics</span>
              </div>
            </div>

            <div className="p-3.5 space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-[#26364a]">
                <span className="text-[#94a3b8]">AST Interpreter:</span>
                <span className="text-[#22c55e] font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Active
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-[#26364a]">
                <span className="text-[#94a3b8]">3D GPU Engine:</span>
                <span className="text-[#38bdf8] font-semibold">WebGL 2.0</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-[#26364a]">
                <span className="text-[#94a3b8]">Curated Problems:</span>
                <span className="text-[#f59e0b] font-semibold">182 SDE</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-[#26364a]">
                <span className="text-[#94a3b8]">Database:</span>
                <span className="text-[#c084fc] font-semibold">PostgreSQL</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('dsa')}
                  className="w-full py-1.5 rounded bg-[#1e2f47] hover:bg-[#253956] text-[#38bdf8] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Layers size={12} />
                  <span>Browse DSA Hub</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
