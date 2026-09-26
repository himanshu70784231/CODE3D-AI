import React, { useState } from 'react';
import { Play, RotateCcw, Copy, Download, Sparkles, Terminal, Code2, Check, FileCode2, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getExecutionTrace } from '../services/executionSimulator';
import { validateSourceCode } from '../services/codeValidator';

const TEMPLATES = {
  java: [
    {
      title: 'Arithmetic & Variables',
      desc: 'Simple procedural variable calculations',
      code: `public class Main {
    public static void main(String[] args) {
        int a = 10;
        int b = 20;
        int sum = a + b;
        System.out.println("Sum: " + sum);
    }
}`
    },
    {
      title: 'Array Traversal & Print',
      desc: 'Iterate contiguous memory elements',
      code: `public class Main {
    public static void main(String[] args) {
        int[] arr = {10, 20, 30, 40, 50};
        for (int i = 0; i < arr.length; i++) {
            System.out.println("arr[" + i + "] = " + arr[i]);
        }
    }
}`
    },
    {
      title: 'Two-Pointer Reverse',
      desc: 'Reverse array in-place O(n) time',
      code: `public class Main {
    public static void main(String[] args) {
        int[] nums = {1, 2, 3, 4, 5, 6};
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int temp = nums[left];
            nums[left] = nums[right];
            nums[right] = temp;
            left++;
            right--;
        }
    }
}`
    },
    {
      title: 'Bubble Sort Algorithm',
      desc: 'Compare and swap adjacent elements',
      code: `public class Main {
    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }
}`
    }
  ],
  python: [
    {
      title: 'List Iteration & Sum',
      desc: 'Pythonic list comprehension & prints',
      code: `nums = [10, 20, 30, 40]
total = 0
for x in nums:
    total += x
    print("Running total:", total)`
    },
    {
      title: 'Binary Search',
      desc: 'Logarithmic search on sorted list',
      code: `nums = [10, 20, 30, 40, 50, 60, 70]
target = 40
left = 0
right = len(nums) - 1

while left <= right:
    mid = (left + right) // 2
    if nums[mid] == target:
        print("Found target at index", mid)
        break
    elif nums[mid] < target:
        left = mid + 1
    else:
        right = mid - 1`
    }
  ],
  javascript: [
    {
      title: 'Array Map & Filter',
      desc: 'Functional transformation of numbers',
      code: `const arr = [1, 2, 3, 4, 5];
const evens = arr.filter(n => n % 2 === 0);
console.log("Evens:", evens);`
    }
  ],
  cpp: [
    {
      title: 'Vector Operations',
      desc: 'C++ STL vector push and traverse',
      code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> nums = {15, 30, 45, 60};
    for (int i = 0; i < nums.size(); i++) {
        cout << nums[i] << " ";
    }
    return 0;
}`
    }
  ]
};

export default function PlaygroundPage({ onSendToVisualizer }) {
  const { isBright } = useTheme();
  const [language, setLanguage] = useState('java');
  const [code, setCode] = useState(TEMPLATES.java[0].code);
  const [customInput, setCustomInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [runLogs, setRunLogs] = useState([]);
  const [runError, setRunError] = useState(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = language === 'java' ? 'java' : language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : 'js';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PlaygroundCode.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    const list = TEMPLATES[language] || TEMPLATES.java;
    setCode(list[0].code);
    setRunLogs([]);
    setRunError(null);
  };

  const handleSelectTemplate = (tpl) => {
    setCode(tpl.code);
    setRunLogs([]);
    setRunError(null);
  };

  const handleQuickRun = () => {
    setRunError(null);
    const validation = validateSourceCode(code, language);
    if (!validation.isValid) {
      setRunError(`[Line ${validation.error?.line || 1}] ${validation.error?.message || 'Syntax Error'}`);
      setRunLogs([]);
      return;
    }

    try {
      const trace = getExecutionTrace(code, language, customInput);
      const allOutput = [];
      trace.forEach(step => {
        if (step.output && Array.isArray(step.output)) {
          step.output.forEach(o => {
            if (!allOutput.includes(o)) allOutput.push(o);
          });
        }
      });
      if (allOutput.length === 0) {
        allOutput.push(`Execution completed cleanly across ${trace.length} simulation steps.`);
      }
      setRunLogs(allOutput);
    } catch (e) {
      setRunError(e.message || 'Execution error');
    }
  };

  const handleSendTo3D = () => {
    if (onSendToVisualizer) {
      onSendToVisualizer({
        id: 'playground-code',
        title: 'Playground 3D Program',
        category: 'Playground',
        description: 'Interactive sandbox code loaded into 3D Studio.',
        code,
        language,
        customInput
      });
    }
  };

  return (
    <div className={`flex-1 flex flex-col overflow-y-auto p-4 md:p-6 transition-colors duration-200 ${
      isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              <Code2 size={20} />
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight">Interactive Playground</h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              Sandbox
            </span>
          </div>
          <p className={`text-xs md:text-sm mt-1 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
            Write, test, and instantly project arbitrary code into the full 3D WebGL debugger.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => {
              const newLang = e.target.value;
              setLanguage(newLang);
              const list = TEMPLATES[newLang] || TEMPLATES.java;
              setCode(list[0].code);
              setRunLogs([]);
              setRunError(null);
            }}
            className={`h-9 px-3 rounded-lg text-xs font-semibold border outline-none cursor-pointer transition ${
              isBright ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}
          >
            <option value="java">Java 21 (AST + 3D)</option>
            <option value="python">Python 3</option>
            <option value="javascript">JavaScript (ES6)</option>
            <option value="cpp">C++ 20</option>
          </select>

          {/* Quick Run */}
          <button
            onClick={handleQuickRun}
            className="h-9 px-3.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Play size={14} className="text-emerald-400 fill-emerald-400" />
            <span>Test Run</span>
          </button>

          {/* 3D Launch */}
          <button
            onClick={handleSendTo3D}
            className="h-9 px-4 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 flex items-center gap-2 shadow-md shadow-cyan-500/20 transition cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Launch in 3D</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 flex-1 min-h-[500px]">
        {/* Left Column: Code Editor & Inputs */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Editor Header Toolbar */}
          <div className={`p-3 rounded-t-xl border border-b-0 flex items-center justify-between flex-wrap gap-2 ${
            isBright ? 'bg-slate-100 border-slate-300' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="flex items-center gap-2">
              <FileCode2 size={16} className="text-cyan-500" />
              <span className="text-xs font-mono font-semibold">PlaygroundCode.{language === 'java' ? 'java' : language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : 'js'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                title="Copy code"
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition cursor-pointer ${
                  isBright ? 'bg-white border-slate-300 hover:bg-slate-50' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownload}
                title="Download file"
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition cursor-pointer ${
                  isBright ? 'bg-white border-slate-300 hover:bg-slate-50' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Download size={13} />
                <span className="text-[11px]">Save</span>
              </button>

              <button
                onClick={handleReset}
                title="Reset code"
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition cursor-pointer ${
                  isBright ? 'bg-white border-slate-300 hover:bg-slate-50' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <RotateCcw size={13} />
                <span className="text-[11px]">Reset</span>
              </button>
            </div>
          </div>

          {/* Textarea Code Editor */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className={`w-full flex-1 min-h-[360px] p-4 font-mono text-sm leading-relaxed border outline-none rounded-b-xl resize-y transition ${
              isBright
                ? 'bg-white border-slate-300 text-slate-900 focus:border-cyan-500'
                : 'bg-slate-950/80 border-slate-800 text-slate-100 focus:border-cyan-500/80'
            }`}
          />

          {/* Custom Input Panel */}
          <div className={`p-4 rounded-xl border ${
            isBright ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800/80'
          }`}>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 font-mono text-cyan-600 dark:text-cyan-400">
              Custom Standard Input (stdin tokens / array values)
            </label>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. 5, 2, 8, 1 or 40 80 90"
              className={`w-full px-3.5 py-2 rounded-lg text-xs font-mono border outline-none transition ${
                isBright ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}
            />
          </div>
        </div>

        {/* Right Column: Templates & Live Console Output */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Templates Picker */}
          <div className={`p-4 rounded-xl border flex flex-col gap-3 ${
            isBright ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800/80'
          }`}>
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-cyan-600 dark:text-cyan-400">
              Pre-Configured Templates
            </h3>
            <div className="flex flex-col gap-2">
              {(TEMPLATES[language] || TEMPLATES.java).map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`text-left p-3 rounded-lg border transition cursor-pointer flex flex-col gap-1 ${
                    code === tpl.code
                      ? isBright
                        ? 'bg-cyan-50 border-cyan-300 shadow-xs'
                        : 'bg-cyan-500/10 border-cyan-500/40 shadow-xs'
                      : isBright
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/60'
                  }`}
                >
                  <span className="text-xs font-semibold">{tpl.title}</span>
                  <span className={`text-[11px] ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>{tpl.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Terminal Console */}
          <div className={`p-4 rounded-xl border flex-1 flex flex-col ${
            isBright ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800/80'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b mb-3">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-emerald-400" />
                <span className="text-xs font-bold font-mono">Terminal Output</span>
              </div>
              <button
                onClick={() => { setRunLogs([]); setRunError(null); }}
                className="text-[10px] text-slate-500 hover:text-slate-400 font-mono"
              >
                Clear
              </button>
            </div>

            <div className={`flex-1 min-h-[160px] p-3 rounded-lg font-mono text-xs overflow-y-auto space-y-1.5 ${
              isBright ? 'bg-slate-950 text-slate-200' : 'bg-black/80 text-emerald-400'
            }`}>
              {runError && (
                <div className="text-red-400 bg-red-950/40 p-2 rounded border border-red-800/50">
                  {runError}
                </div>
              )}
              {runLogs.length > 0 ? (
                runLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-slate-600 select-none">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))
              ) : (
                !runError && (
                  <div className="text-slate-600 italic">
                    Click "Test Run" to inspect execution output, or "Launch in 3D" to enter the WebGL studio.
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
