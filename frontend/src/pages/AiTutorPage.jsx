import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Zap,
  Code2,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Terminal,
  Bug,
  RotateCcw,
  Copy,
  Check,
  Languages,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Table,
  Play,
  Share2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getAiExplanation, askAiFollowUp } from '../services/apiService';
import {
  analyzeAlgorithmCode,
  detectAndFixBugs,
  generateDryRunTrace,
  translateCodeToLanguage,
  generateIntelligentAiTutorAnswer,
} from '../services/algorithmicTutorEngine';

// Algorithm Starter Presets across multiple languages
const PRESET_ALGORITHMS = [
  {
    id: 'kadane',
    name: "Kadane's Algorithm",
    category: 'Dynamic Programming / Arrays',
    codes: {
      java: `public class Solution {
    public int maxSubArray(int[] nums) {
        int max = nums[0];
        int sum = 0;
        for (int x : nums) {
            sum = Math.max(x, sum + x);
            max = Math.max(max, sum);
        }
        return max;
    }
}`,
      python: `def maxSubArray(nums: list[int]) -> int:
    max_sum = nums[0]
    curr_sum = 0
    for x in nums:
        curr_sum = max(x, curr_sum + x)
        max_sum = max(max_sum, curr_sum)
    return max_sum`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int max_sum = nums[0];
        int curr_sum = 0;
        for (int x : nums) {
            curr_sum = max(x, curr_sum + x);
            max_sum = max(max_sum, curr_sum);
        }
        return max_sum;
    }
};`,
      c: `int maxSubArray(int* nums, int numsSize) {
    int max_sum = nums[0];
    int curr_sum = 0;
    for (int i = 0; i < numsSize; i++) {
        curr_sum = (curr_sum + nums[i] > nums[i]) ? curr_sum + nums[i] : nums[i];
        if (curr_sum > max_sum) max_sum = curr_sum;
    }
    return max_sum;
}`,
      javascript: `function maxSubArray(nums) {
    let max = nums[0];
    let sum = 0;
    for (const x of nums) {
        sum = Math.max(x, sum + x);
        max = Math.max(max, sum);
    }
    return max;
}`,
    },
  },
  {
    id: 'two-sum',
    name: 'Two Sum (Hash Map)',
    category: 'Hash Tables / Arrays',
    codes: {
      java: `import java.util.HashMap;
import java.util.Map;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`,
      python: `def twoSum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
      cpp: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); i++) {
            int comp = target - nums[i];
            if (map.count(comp)) return {map[comp], i};
            map[nums[i]] = i;
        }
        return {};
    }
};`,
      c: `// Two sum linear search in C
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    *returnSize = 2;
    int* res = (int*)malloc(2 * sizeof(int));
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                res[0] = i; res[1] = j;
                return res;
            }
        }
    }
    return NULL;
}`,
      javascript: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
    }
    return [];
}`,
    },
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'Searching & Divide/Conquer',
    codes: {
      java: `public class Solution {
    public int search(int[] nums, int target) {
        int low = 0;
        int high = nums.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }
}`,
      python: `def search(nums: list[int], target: int) -> int:
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = low + (high - low) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    int search(vector<int>& nums, int target) {
        int low = 0, high = nums.size() - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }
};`,
      c: `int search(int* nums, int numsSize, int target) {
    int low = 0, high = numsSize - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
      javascript: `function search(nums, target) {
    let low = 0, high = nums.length - 1;
    while (low <= high) {
        const mid = Math.floor(low + (high - low) / 2);
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
    },
  },
  {
    id: 'valid-parentheses',
    name: 'Valid Parentheses',
    category: 'Stack / LIFO',
    codes: {
      java: `import java.util.Stack;

public class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`,
      python: `def isValid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack`,
      cpp: `#include <string>
#include <stack>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(') st.push(')');
            else if (c == '{') st.push('}');
            else if (c == '[') st.push(']');
            else if (st.empty() || st.top() != c) return false;
            else st.pop();
        }
        return st.empty();
    }
};`,
      c: `bool isValid(char* s) {
    char stack[10000];
    int top = -1;
    for (int i = 0; s[i] != '\\0'; i++) {
        if (s[i] == '(') stack[++top] = ')';
        else if (s[i] == '{') stack[++top] = '}';
        else if (s[i] == '[') stack[++top] = ']';
        else if (top < 0 || stack[top--] != s[i]) return false;
    }
    return top == -1;
}`,
      javascript: `function isValid(s) {
    const stack = [];
    for (const c of s) {
        if (c === '(') stack.push(')');
        else if (c === '{') stack.push('}');
        else if (c === '[') stack.push(']');
        else if (stack.length === 0 || stack.pop() !== c) return false;
    }
    return stack.length === 0;
}`,
    },
  },
];

const QUICK_PROMPT_PILLS = [
  '⏱️ Explain Time Complexity',
  '🛡️ Find Edge Cases & Traps',
  '🇮🇳 Hindi / Hinglish me samjhao',
  '📋 Show Step-by-Step Dry Run',
  '🐛 Scan & Fix Bugs in Code',
  '🧊 How does this render in 3D?',
  '⚡ How to Optimize Solution?',
];

export default function AiTutorPage({ onSendToVisualizer }) {
  const { isBright, currentAccent } = useTheme();
  const accentHex = isBright ? currentAccent.bright : currentAccent.dark;

  // Language & Preset State
  const [selectedLanguage, setSelectedLanguage] = useState('java');
  const [selectedPresetId, setSelectedPresetId] = useState('kadane');
  const [code, setCode] = useState(PRESET_ALGORITHMS[0].codes.java);
  const [copiedCode, setCopiedCode] = useState(false);

  // Analysis Modes: 'complexity' | 'bugs' | 'optimizer' | 'dryrun'
  const [activeMode, setActiveMode] = useState('complexity');

  // Input & Chat State
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // Deep Analysis State
  const [analysis, setAnalysis] = useState(() => analyzeAlgorithmCode(PRESET_ALGORITHMS[0].codes.java, 'java'));
  const [bugReport, setBugReport] = useState(() => detectAndFixBugs(PRESET_ALGORITHMS[0].codes.java, 'java'));
  const [dryRunData, setDryRunData] = useState(() => generateDryRunTrace(PRESET_ALGORITHMS[0].codes.java, 'java'));

  // Chat History
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: `👋 **Namaste & Welcome to CODE3D-AI Pedagogical Tutor!**\n\nI can deeply explain algorithm complexities, provide Big-O proofs, scan for runtime bugs, generate step-by-step dry run tables, and show you how your code comes to life in the 3D Studio.\n\n*Feel free to ask questions in English or Hinglish!*`,
    },
  ]);

  // Sync code when preset or language changes
  const handleSelectPreset = (presetId) => {
    setSelectedPresetId(presetId);
    const preset = PRESET_ALGORITHMS.find((p) => p.id === presetId);
    if (preset) {
      const newCode = preset.codes[selectedLanguage] || preset.codes.java;
      setCode(newCode);
      refreshAnalysis(newCode, selectedLanguage);
    }
  };

  const handleLanguageChange = (newLang) => {
    setSelectedLanguage(newLang);
    const preset = PRESET_ALGORITHMS.find((p) => p.id === selectedPresetId);
    if (preset && preset.codes[newLang]) {
      setCode(preset.codes[newLang]);
      refreshAnalysis(preset.codes[newLang], newLang);
    } else {
      const translated = translateCodeToLanguage(code, selectedLanguage, newLang);
      if (translated && !translated.startsWith('// Translation')) {
        setCode(translated);
        refreshAnalysis(translated, newLang);
      } else {
        refreshAnalysis(code, newLang);
      }
    }
  };

  const refreshAnalysis = (currentCode, lang) => {
    const meta = analyzeAlgorithmCode(currentCode, lang);
    setAnalysis(meta);
    setBugReport(detectAndFixBugs(currentCode, lang));
    setDryRunData(generateDryRunTrace(currentCode, lang));
  };

  // Re-run analysis on manual code changes
  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await getAiExplanation({ code, language: selectedLanguage, question: 'Analyze complexity' });
      if (res && res.success) {
        setAnalysis({
          title: res.title || 'Code Analysis',
          timeComplexity: res.timeComplexity || 'O(n)',
          spaceComplexity: res.spaceComplexity || 'O(1)',
          bestCase: 'O(1)',
          worstCase: res.timeComplexity || 'O(n)',
          summary: res.explanation || 'Code analyzed successfully.',
          insights: res.insights || [],
          edgeCases: res.edgeCases || [],
          detectedStructures: [],
          loopsCount: 1,
        });
      }
    } catch {
      refreshAnalysis(code, selectedLanguage);
    } finally {
      refreshAnalysis(code, selectedLanguage);
      setLoading(false);
    }
  };

  // Chat message submission
  const handleSendChat = async (qText) => {
    const prompt = (qText || question).trim();
    if (!prompt) return;

    const userMsg = { sender: 'user', text: prompt };
    setChatMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const resp = await askAiFollowUp(prompt, code, selectedLanguage);
      const aiReply = resp?.answer || generateIntelligentAiTutorAnswer(prompt, code, selectedLanguage);
      setChatMessages((prev) => [...prev, { sender: 'ai', text: aiReply }]);
    } catch {
      const fallbackReply = generateIntelligentAiTutorAnswer(prompt, code, selectedLanguage);
      setChatMessages((prev) => [...prev, { sender: 'ai', text: fallbackReply }]);
    } finally {
      setLoading(false);
    }
  };

  // Auto scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, loading]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleApplyBugFix = () => {
    if (bugReport.correctedCode) {
      setCode(bugReport.correctedCode);
      refreshAnalysis(bugReport.correctedCode, selectedLanguage);
      setActiveMode('complexity');
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `✅ **Bug Fix Applied!** The corrected code has been loaded into your editor. All off-by-one errors and integer overflow guards have been resolved.`,
        },
      ]);
    }
  };

  const handleSendTo3D = () => {
    if (onSendToVisualizer) {
      onSendToVisualizer({
        id: `ai-${selectedPresetId}`,
        title: analysis.title || 'AI Tutor Code',
        category: 'AI Tutor',
        description: analysis.summary || 'Code analyzed in AI Tutor.',
        code,
        language: selectedLanguage,
        timeComplexity: analysis.timeComplexity,
        spaceComplexity: analysis.spaceComplexity,
      });
    }
  };

  return (
    <div className={`flex-1 flex flex-col overflow-y-auto p-3 sm:p-5 transition-colors duration-200 select-none ${
      isBright ? 'bg-[#f7f6f3] text-stone-900' : 'bg-[#0a0d14] text-slate-100'
    }`}>
      {/* ========================================================
          1. TOPBAR: TITLE, PRESETS & QUICK LAUNCHERS
          ======================================================== */}
      <div className={`p-4 rounded-2xl border transition-all mb-4 template-card ${
        isBright ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#10141f] border-slate-800'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title & Live Status */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-950 font-bold shadow-md shrink-0"
              style={{ backgroundColor: accentHex }}
            >
              <Bot size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold font-display tracking-tight">
                  AI Code &amp; Algorithm Tutor
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-500 border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Intelligence
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                Big-O Mathematical Proofs • Runtime Bug Hunter • Step-by-Step Dry Runs • Hinglish &amp; English
              </p>
            </div>
          </div>

          {/* Preset Selector & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Algorithm Presets Dropdown */}
            <select
              value={selectedPresetId}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className={`h-9 px-3 rounded-xl text-xs font-semibold border outline-none cursor-pointer transition ${
                isBright
                  ? 'bg-slate-100 border-slate-300 text-slate-800'
                  : 'bg-slate-900 border-slate-700 text-slate-200'
              }`}
            >
              {PRESET_ALGORITHMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Language Selector */}
            <div className={`flex items-center p-0.5 rounded-xl border ${
              isBright ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-slate-800'
            }`}>
              {['java', 'python', 'cpp', 'javascript'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`h-7 px-2.5 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
                    selectedLanguage === lang
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : isBright
                        ? 'text-slate-600 hover:text-slate-950'
                        : 'text-slate-400 hover:text-slate-200'
                  }`}
                  style={{
                    backgroundColor: selectedLanguage === lang ? accentHex : undefined,
                    color: selectedLanguage === lang ? '#0f172a' : undefined,
                  }}
                >
                  {lang === 'javascript' ? 'JS' : lang}
                </button>
              ))}
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 border ${
                isBright
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              <Zap size={14} className="text-amber-500" />
              <span>{loading ? 'Analyzing...' : 'Analyze'}</span>
            </button>

            {/* Launch in 3D Button */}
            <button
              onClick={handleSendTo3D}
              style={{
                backgroundColor: accentHex,
                boxShadow: `0 4px 14px ${currentAccent.glow}`,
              }}
              className="h-9 px-4 rounded-xl text-xs font-bold text-slate-950 flex items-center gap-1.5 transition hover:opacity-90 active:scale-97 cursor-pointer shadow-md"
            >
              <Sparkles size={14} />
              <span>Launch in 3D</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. MAIN WORKSPACE GRID: CODE & ANALYSIS (LEFT) vs CHAT (RIGHT)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* LEFT COLUMN (COL 1-6): CODE STUDIO & ANALYSIS TABS */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Code Input Card */}
          <div className={`p-4 rounded-2xl border flex flex-col gap-2.5 template-card ${
            isBright ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#10141f] border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-inherit">
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-amber-500" />
                <span className="text-xs font-bold font-mono uppercase tracking-wider">
                  Source Code Editor ({selectedLanguage.toUpperCase()})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition cursor-pointer ${
                    isBright ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-slate-800 text-slate-400'
                  }`}
                  title="Copy code"
                >
                  {copiedCode ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span className="text-[11px]">{copiedCode ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <textarea
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                refreshAnalysis(e.target.value, selectedLanguage);
              }}
              spellCheck={false}
              className={`w-full min-h-[220px] p-3 font-mono text-xs leading-relaxed rounded-xl border outline-none resize-y transition custom-scrollbar ${
                isBright
                  ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                  : 'bg-[#090c12] border-slate-800 text-slate-100 focus:border-amber-500/80'
              }`}
            />
          </div>

          {/* Analysis View Tabs */}
          <div className={`p-1 rounded-xl border flex items-center gap-1 ${
            isBright ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-slate-800'
          }`}>
            {[
              { id: 'complexity', label: 'Complexity & Proofs', icon: Cpu },
              { id: 'bugs', label: 'Bug Hunter', icon: Bug, count: bugReport.issues.length },
              { id: 'dryrun', label: 'Dry Run Trace', icon: Table },
              { id: 'optimizer', label: 'Optimizer Tips', icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveMode(tab.id)}
                  className={`flex-1 h-8 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    isActive
                      ? isBright
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'bg-slate-800 text-white font-bold'
                      : isBright
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-slate-200'
                  }`}
                  style={{
                    borderBottom: isActive ? `2px solid ${accentHex}` : undefined,
                  }}
                >
                  <Icon size={14} className={isActive ? 'text-amber-500' : ''} />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 text-[10px] flex items-center justify-center font-bold">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Dynamic Content Panel based on activeMode */}
          {activeMode === 'complexity' && (
            <div className="flex flex-col gap-3">
              {/* Complexity Metric Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-2xl border template-card ${
                  isBright ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#10141f] border-slate-800'
                }`}>
                  <div className="flex items-center gap-2 text-amber-500">
                    <Cpu size={16} />
                    <span className="text-[11px] font-bold font-mono uppercase tracking-wider">
                      Time Complexity
                    </span>
                  </div>
                  <div className="text-2xl font-black font-mono mt-1 text-amber-500">
                    {analysis.timeComplexity}
                  </div>
                  <p className={`text-[11px] mt-1 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                    Worst: {analysis.worstCase} • Best: {analysis.bestCase}
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border template-card ${
                  isBright ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#10141f] border-slate-800'
                }`}>
                  <div className="flex items-center gap-2 text-cyan-500">
                    <Sparkles size={16} />
                    <span className="text-[11px] font-bold font-mono uppercase tracking-wider">
                      Space Complexity
                    </span>
                  </div>
                  <div className="text-2xl font-black font-mono mt-1 text-cyan-400">
                    {analysis.spaceComplexity}
                  </div>
                  <p className={`text-[11px] mt-1 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                    Auxiliary memory stack &amp; heap footprint
                  </p>
                </div>
              </div>

              {/* Key Invariants & Edge Cases */}
              <div className={`p-4 rounded-2xl border flex flex-col gap-3 template-card ${
                isBright ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#10141f] border-slate-800'
              }`}>
                <div>
                  <div className="flex items-center gap-2 mb-2 text-emerald-500">
                    <CheckCircle2 size={16} />
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider">
                      Key Algorithmic Invariants
                    </h3>
                  </div>
                  <ul className="space-y-1.5">
                    {analysis.insights.map((insight, idx) => (
                      <li key={idx} className={`text-xs flex items-start gap-2 ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-inherit">
                  <div className="flex items-center gap-2 mb-2 text-amber-500">
                    <AlertTriangle size={16} />
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider">
                      Critical Boundary &amp; Edge Cases
                    </h3>
                  </div>
                  <ul className="space-y-1.5">
                    {analysis.edgeCases.map((ec, idx) => (
                      <li key={idx} className={`text-xs flex items-start gap-2 ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{ec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'bugs' && (
            <div className={`p-4 rounded-2xl border flex flex-col gap-3 template-card ${
              isBright ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#10141f] border-slate-800'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-inherit">
                <div className="flex items-center gap-2">
                  <Bug size={16} className={bugReport.hasBugs ? 'text-rose-500' : 'text-emerald-500'} />
                  <span className="text-xs font-bold font-mono uppercase tracking-wider">
                    {bugReport.hasBugs ? `${bugReport.issues.length} Potential Issues Detected` : 'All Syntax & Bounds Clean'}
                  </span>
                </div>
                {bugReport.hasBugs && (
                  <button
                    onClick={handleApplyBugFix}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                  >
                    <Check size={12} />
                    <span>Auto-Fix Code</span>
                  </button>
                )}
              </div>

              {bugReport.hasBugs ? (
                <div className="space-y-3">
                  {bugReport.issues.map((iss, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        isBright ? 'bg-rose-50 border-rose-200 text-rose-950' : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle size={14} className="text-rose-500" />
                        <span>{iss.message}</span>
                      </div>
                      <p className="opacity-80 text-[11px] leading-relaxed">{iss.explanation}</p>
                      <div className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                        👉 Suggestion: {iss.fix}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl text-center space-y-2">
                  <CheckCircle2 size={24} className="text-emerald-500 mx-auto" />
                  <p className="text-xs font-semibold">No critical off-by-one or bounds traps found in code.</p>
                  <p className={`text-[11px] ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
                    Array indices, loop invariants, and bracket delimiters are well bounded.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeMode === 'dryrun' && (
            <div className={`p-4 rounded-2xl border flex flex-col gap-3 template-card ${
              isBright ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#10141f] border-slate-800'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-inherit">
                <div className="flex items-center gap-2">
                  <Table size={16} className="text-cyan-500" />
                  <span className="text-xs font-bold font-mono uppercase tracking-wider">
                    {dryRunData.title}
                  </span>
                </div>
                <span className="text-[11px] font-mono opacity-70">{dryRunData.input}</span>
              </div>

              <div className="overflow-x-auto max-h-[300px] custom-scrollbar">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-inherit opacity-70 text-[10px] uppercase">
                      <th className="py-2 px-2">Step</th>
                      <th className="py-2 px-2">Index / Val</th>
                      <th className="py-2 px-2">Operation</th>
                      <th className="py-2 px-2">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit">
                    {dryRunData.steps.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-500/5">
                        <td className="py-2 px-2 text-amber-500 font-bold">{s.step}</td>
                        <td className="py-2 px-2">{s.element ?? s.midValue ?? s.state ?? '-'}</td>
                        <td className="py-2 px-2">{s.calculation ?? s.decision ?? s.detail}</td>
                        <td className="py-2 px-2 text-emerald-500 font-bold">{s.maxSoFar ?? s.action ?? 'OK'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-2.5 rounded-xl border border-inherit text-xs font-mono font-bold text-center bg-slate-500/5">
                Outcome: {dryRunData.finalResult}
              </div>
            </div>
          )}

          {activeMode === 'optimizer' && (
            <div className={`p-4 rounded-2xl border flex flex-col gap-3 template-card ${
              isBright ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#10141f] border-slate-800'
            }`}>
              <div className="flex items-center gap-2 pb-2 border-b border-inherit">
                <TrendingUp size={16} className="text-emerald-500" />
                <span className="text-xs font-bold font-mono uppercase tracking-wider">
                  Algorithmic Optimization Roadmap
                </span>
              </div>
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="p-3 rounded-xl border border-inherit space-y-1">
                  <div className="font-bold text-amber-500">1. From Quadratic O(n²) to Linear O(n)</div>
                  <p className="opacity-80">
                    If using nested loops for lookup or pair checking, replace the inner scan with a <strong>Hash Map</strong> or <strong>Two Pointers</strong> to achieve linear amortized time.
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-inherit space-y-1">
                  <div className="font-bold text-cyan-500">2. In-Place Auxiliary Space O(1)</div>
                  <p className="opacity-80">
                    Avoid creating secondary arrays when pointers can mutate the collection directly in memory registers.
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-inherit space-y-1">
                  <div className="font-bold text-emerald-500">3. Binary Search O(log n) Halving</div>
                  <p className="opacity-80">
                    When the input collection is sorted or monotonic, replace linear scanning with binary interval halving.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (COL 7-12): INTERACTIVE AI TUTOR CHAT */}
        <div className={`lg:col-span-6 rounded-2xl border flex flex-col h-[700px] template-card ${
          isBright ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#10141f] border-slate-800'
        }`}>
          {/* Chat Header */}
          <div className="p-3.5 border-b border-inherit flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                <Bot size={15} />
              </div>
              <div>
                <span className="text-xs font-bold font-mono">CODE3D AI Interactive Dialogue</span>
                <span className="text-[10px] block opacity-60">Pedagogical Mentor • Supports Hinglish</span>
              </div>
            </div>
            <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2.5 border-b border-inherit flex gap-1.5 overflow-x-auto select-none custom-scrollbar">
            {QUICK_PROMPT_PILLS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendChat(q)}
                className={`text-[11px] whitespace-nowrap px-3 py-1 rounded-full border transition cursor-pointer ${
                  isBright
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Message Scroll */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-950 font-bold shadow-xs"
                    style={{ backgroundColor: accentHex }}
                  >
                    <Bot size={14} />
                  </div>
                )}
                <div className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-sm'
                    : isBright
                      ? 'bg-slate-100 text-slate-800 border border-slate-200 rounded-tl-none whitespace-pre-wrap'
                      : 'bg-[#141824] text-slate-200 border border-slate-800 rounded-tl-none whitespace-pre-wrap'
                }`}
                style={{
                  backgroundColor: msg.sender === 'user' ? accentHex : undefined,
                }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5 items-center text-xs text-amber-500 font-mono">
                <span className="animate-spin text-sm">⚙️</span>
                <span>AI Tutor reasoning through AST and memory invariants...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="p-3 border-t border-inherit flex items-center gap-2"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything (e.g., 'Why is space O(1)?', 'Hindi me samjhao', 'Find bugs')..."
              className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs border outline-none transition ${
                isBright
                  ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-500'
                  : 'bg-[#090c12] border-slate-800 text-slate-200 focus:border-amber-500'
              }`}
            />
            <button
              type="submit"
              disabled={!question.trim() || loading}
              style={{
                backgroundColor: accentHex,
              }}
              className="p-2.5 rounded-xl text-slate-950 font-bold transition disabled:opacity-50 cursor-pointer shadow-xs active:scale-95"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
