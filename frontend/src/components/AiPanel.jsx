import React, { useState } from 'react';
import { Sparkles, Send, HelpCircle, Check, Lightbulb, Clock, Database } from 'lucide-react';
import { formatOperation, safeString, safeDisplay } from '../utils/safeRender';

/**
 * CODE3D-AI - AiPanel Component
 * Embedded IDE AI assistant showing step explanation, suggestions, complexity, and quick Q&A.
 */
export function AiPanel({
  currentStep = null,
  timeComplexity = 'O(n)',
  spaceComplexity = 'O(1)',
  code = '',
  onOpenFullTutor = null,
}) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'AI Tutor initialized. Step through execution or ask any question about the algorithm.',
    },
  ]);
  const [isAsking, setIsAsking] = useState(false);

  const explanation = safeString(currentStep?.explanation, 'Executing algorithm step. Watch spatial memory and variable mutations.');
  const currentOperation = currentStep?.operation || currentStep?.eventType || (currentStep?.changedVariable ? `Mutate ${currentStep.changedVariable}` : 'Step Execution');
  const aiHint = safeString(currentStep?.aiHint, 'Keep track of loop boundaries to avoid index out of bounds exceptions.');

  const handleSendQuestion = (e) => {
    e?.preventDefault();
    if (!question.trim()) return;

    const userQ = question.trim();
    setQuestion('');
    setMessages((prev) => [...prev, { sender: 'user', text: userQ }]);
    setIsAsking(true);

    setTimeout(() => {
      let reply = `In this step (Line ${currentStep?.lineNumber || 1}), ${explanation} Time complexity remains ${timeComplexity} and space complexity is ${spaceComplexity}.`;
      if (userQ.toLowerCase().includes('why')) {
        reply = `The loop evaluates condition '${currentStep?.condition?.expression || 'i < length'}' to ensure memory bounds are respected before array access.`;
      } else if (userQ.toLowerCase().includes('complexity')) {
        reply = `Overall Time Complexity is ${timeComplexity} because each element is visited once. Auxiliary Space Complexity is ${spaceComplexity} since modifications are done in-place.`;
      }
      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
      setIsAsking(false);
    }, 400);
  };

  return (
    <div className="flex flex-col h-full bg-[#101c2d] text-xs select-none">
      {/* Header */}
      <div className="px-3 py-2 bg-[#142338] border-b border-[#26364a] flex items-center justify-between text-xs font-semibold text-[#f8fafc]">
        <div className="flex items-center gap-1.5 text-[#8b5cf6]">
          <Sparkles size={13} />
          <span>AI Analysis &amp; Tutor</span>
        </div>

        {onOpenFullTutor && (
          <button
            onClick={onOpenFullTutor}
            className="text-[10px] text-[#c084fc] hover:underline cursor-pointer"
          >
            Open Tutor ↗
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Current Operation & Explanation Card */}
        <div className="bg-[#0d1726] border border-[#26364a] rounded-md p-2.5 space-y-1.5 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#8b5cf6]">
              Current Operation
            </span>
            <span className="text-[10px] text-[#94a3b8]">
              Line {currentStep?.lineNumber || '—'}
            </span>
          </div>

          <div className="font-semibold text-xs text-[#38bdf8]">
            {formatOperation(currentOperation)}
          </div>

          <div className="text-[11px] text-[#f8fafc] font-sans pt-1 border-t border-[#1e2c3d]">
            {explanation}
          </div>
        </div>

        {/* Suggestion / AI Hint */}
        <div className="bg-[#0d1726]/70 border border-[#8b5cf6]/30 rounded-md p-2.5 flex items-start gap-2">
          <Lightbulb size={14} className="text-[#a855f7] shrink-0 mt-0.5" />
          <div className="text-[11px] text-[#e2e8f0]">
            <span className="font-semibold text-[#c084fc]">Insight: </span>
            {aiHint}
          </div>
        </div>

        {/* Complexity Summary */}
        <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
          <div className="bg-[#0d1726] border border-[#26364a] rounded p-2 flex items-center gap-2">
            <Clock size={13} className="text-[#3b82f6]" />
            <div>
              <div className="text-[9px] text-[#94a3b8] uppercase">Time</div>
              <div className="font-bold text-[#f8fafc]">{timeComplexity}</div>
            </div>
          </div>

          <div className="bg-[#0d1726] border border-[#26364a] rounded p-2 flex items-center gap-2">
            <Database size={13} className="text-[#14b8a6]" />
            <div>
              <div className="text-[9px] text-[#94a3b8] uppercase">Space</div>
              <div className="font-bold text-[#f8fafc]">{spaceComplexity}</div>
            </div>
          </div>
        </div>

        {/* Mini Q&A Feed */}
        <div className="space-y-2 pt-1 border-t border-[#26364a]">
          <span className="text-[10px] uppercase font-bold text-[#94a3b8]">
            Quick Q&amp;A
          </span>

          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-2 rounded text-[11px] ${
                  m.sender === 'user'
                    ? 'bg-[#1e2f47] text-[#f8fafc] ml-4'
                    : 'bg-[#0d1726] text-[#cbd5e1] border border-[#26364a] mr-2'
                }`}
              >
                {m.text}
              </div>
            ))}
            {isAsking && (
              <div className="text-[10px] text-[#a855f7] animate-pulse">
                Analyzing execution state...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendQuestion} className="p-2 border-t border-[#26364a] bg-[#0d1726] flex items-center gap-1.5 shrink-0">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask why this line executed..."
          className="flex-1 bg-[#101c2d] border border-[#26364a] rounded px-2.5 py-1 text-xs text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-[#8b5cf6]"
        />
        <button
          type="submit"
          disabled={!question.trim() || isAsking}
          className="p-1.5 rounded bg-[#8b5cf6] hover:bg-[#7c3aed] text-white disabled:opacity-40 transition-colors cursor-pointer"
          title="Send Question"
        >
          <Send size={12} />
        </button>
      </form>
    </div>
  );
}

export default AiPanel;
