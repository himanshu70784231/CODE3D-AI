import React, { useState } from 'react';
import { Sparkles, Send, Lightbulb, Clock, Database } from 'lucide-react';
import { formatOperation, safeString } from '../utils/safeRender';
import { useTheme } from '../context/ThemeContext';

export function AiPanel({
  currentStep = null,
  timeComplexity = 'O(n)',
  spaceComplexity = 'O(1)',
  code = '',
  onOpenFullTutor = null,
}) {
  const { isBright } = useTheme();
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
    <div className={`flex flex-col h-full text-xs select-none transition-colors duration-200 ${
      isBright ? 'bg-[#fcfbf9] text-stone-800' : 'bg-[#13161b] text-stone-100'
    }`}>
      {/* Header */}
      <div className={`px-3 py-2 border-b flex items-center justify-between text-xs font-semibold transition-colors ${
        isBright ? 'bg-[#f7f6f3] border-[#e2dfd8] text-stone-800' : 'bg-[#181c23] border-[#252932] text-stone-100'
      }`}>
        <div className="flex items-center gap-1.5 text-amber-500">
          <Sparkles size={13} />
          <span>AI Analysis &amp; Tutor</span>
        </div>

        {onOpenFullTutor && (
          <button
            onClick={onOpenFullTutor}
            className="text-[10px] text-amber-500 hover:underline cursor-pointer"
          >
            Open Tutor ↗
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Current Operation & Explanation Card */}
        <div className={`border rounded-lg p-2.5 space-y-1.5 font-mono ${
          isBright ? 'bg-white border-[#e2dfd8]' : 'bg-[#0e1013] border-[#252932]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-500">
              Current Operation
            </span>
            <span className="text-[10px] text-stone-500">
              Line {currentStep?.lineNumber || '—'}
            </span>
          </div>

          <div className="font-semibold text-xs text-amber-400">
            {formatOperation(currentOperation)}
          </div>

          <div className="text-[11px] font-sans pt-1 border-t border-inherit">
            {explanation}
          </div>
        </div>

        {/* Suggestion / AI Hint */}
        <div className={`border rounded-lg p-2.5 flex items-start gap-2 ${
          isBright ? 'bg-amber-50/50 border-amber-200 text-stone-800' : 'bg-amber-500/10 border-amber-500/25 text-amber-200'
        }`}>
          <Lightbulb size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="text-[11px]">
            <span className="font-semibold text-amber-500">Insight: </span>
            {aiHint}
          </div>
        </div>

        {/* Complexity Summary */}
        <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
          <div className={`border rounded p-2 flex items-center gap-2 ${
            isBright ? 'bg-white border-[#e2dfd8]' : 'bg-[#0e1013] border-[#252932]'
          }`}>
            <Clock size={13} className="text-amber-500" />
            <div>
              <div className="text-[9px] text-stone-500 uppercase">Time</div>
              <div className="font-bold">{timeComplexity}</div>
            </div>
          </div>

          <div className={`border rounded p-2 flex items-center gap-2 ${
            isBright ? 'bg-white border-[#e2dfd8]' : 'bg-[#0e1013] border-[#252932]'
          }`}>
            <Database size={13} className="text-emerald-500" />
            <div>
              <div className="text-[9px] text-stone-500 uppercase">Space</div>
              <div className="font-bold">{spaceComplexity}</div>
            </div>
          </div>
        </div>

        {/* Mini Q&A Feed */}
        <div className="space-y-2 pt-1 border-t border-inherit">
          <span className="text-[10px] uppercase font-bold text-stone-500">
            Quick Q&amp;A
          </span>

          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-2 rounded text-[11px] ${
                  m.sender === 'user'
                    ? isBright
                      ? 'bg-amber-100/70 text-amber-950 ml-4'
                      : 'bg-amber-500/20 text-amber-200 ml-4'
                    : isBright
                      ? 'bg-white text-stone-800 border border-[#e2dfd8] mr-2'
                      : 'bg-[#0e1013] text-stone-300 border border-[#252932] mr-2'
                }`}
              >
                {m.text}
              </div>
            ))}
            {isAsking && (
              <div className="text-[10px] text-amber-500 animate-pulse">
                Analyzing execution state...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendQuestion} className={`p-2 border-t flex items-center gap-1.5 shrink-0 ${
        isBright ? 'bg-[#f7f6f3] border-[#e2dfd8]' : 'bg-[#181c23] border-[#252932]'
      }`}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask why this line executed..."
          className={`flex-1 rounded px-2.5 py-1 text-xs border focus:outline-none focus:border-amber-500 ${
            isBright ? 'bg-white border-[#e2dfd8] text-stone-900 placeholder-stone-400' : 'bg-[#0e1013] border-[#252932] text-stone-100 placeholder-stone-500'
          }`}
        />
        <button
          type="submit"
          disabled={!question.trim() || isAsking}
          className="p-1.5 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold disabled:opacity-40 transition-colors cursor-pointer"
          title="Send Question"
        >
          <Send size={12} />
        </button>
      </form>
    </div>
  );
}

export default AiPanel;
