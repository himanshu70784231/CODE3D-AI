import React, { useState } from 'react';
import { Terminal, Target, Play, AlertCircle, Shuffle, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Export helper utilities for array generation
export const generateRandomArray = (size = 8) => {
  const s = Math.min(20, Math.max(3, Number(size) || 8));
  const res = [];
  for (let i = 0; i < s; i++) res.push(Math.floor(Math.random() * 90) + 10);
  return res;
};

export const generateSortedArray = (size = 8) => {
  const s = Math.min(20, Math.max(3, Number(size) || 8));
  const res = [];
  let cur = Math.floor(Math.random() * 15) + 5;
  for (let i = 0; i < s; i++) {
    cur += Math.floor(Math.random() * 8) + 3;
    res.push(cur);
  }
  return res;
};

export const generateReverseSortedArray = (size = 8) => generateSortedArray(size).reverse();

export const generateNearlySortedArray = (size = 8) => {
  const arr = generateSortedArray(size);
  if (arr.length >= 4) {
    const i1 = Math.floor(Math.random() * (arr.length - 2));
    const temp = arr[i1];
    arr[i1] = arr[i1 + 1];
    arr[i1 + 1] = temp;
  }
  return arr;
};

/**
 * Interactive Program Input System (stdin)
 * Supports dynamic quick-preset chips (Random, Nearly Sorted, Reversed, Sorted)
 * and tactile glow button design system.
 */
export default function InputGenerator({
  onApplyInput,
  onGenerate,
  currentValues = [10, 20, 30, 40],
  isSearching = false,
  showTarget = false,
  currentTarget = 30,
}) {
  const { isBright, currentAccent } = useTheme();
  const accentHex = isBright ? currentAccent.bright : currentAccent.dark;
  
  const [customText, setCustomText] = useState(
    Array.isArray(currentValues) ? currentValues.join(', ') : '10, 20, 30, 40'
  );
  const [targetVal, setTargetVal] = useState(currentTarget || 23);
  const [validationError, setValidationError] = useState(null);

  const applyValues = (values, target) => {
    if (onApplyInput) {
      onApplyInput(values, target);
    } else if (onGenerate) {
      onGenerate({ values, target });
    }
  };

  const handleApply = () => {
    setValidationError(null);
    const parsed = customText
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(Number)
      .filter((n) => !isNaN(n));

    if (parsed.length === 0) {
      setValidationError('Please enter valid numbers (e.g. 10, 20, 30, 40).');
      return;
    }
    if (parsed.length > 30) {
      setValidationError('Maximum 30 elements recommended for optimal 3D clarity.');
      return;
    }

    applyValues(parsed, targetVal);
  };

  const handleQuickPreset = (type) => {
    let arr = [];
    if (type === 'random') arr = generateRandomArray(7);
    else if (type === 'sorted') arr = generateSortedArray(7);
    else if (type === 'reverse') arr = generateReverseSortedArray(7);
    else if (type === 'nearly') arr = generateNearlySortedArray(7);
    
    setCustomText(arr.join(', '));
    setValidationError(null);
    applyValues(arr, targetVal);
  };

  const targetVisible = isSearching || showTarget;

  return (
    <div className={`px-3 py-2 border-b text-xs select-none transition-colors ${
      isBright ? 'bg-slate-50/95 border-slate-200 text-slate-800' : 'bg-[#090e1a] border-slate-800/80 text-slate-200'
    }`}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Input Header Icon */}
        <div className={`flex items-center gap-1.5 shrink-0 font-mono text-[11px] ${
          isBright ? 'text-slate-600' : 'text-slate-400'
        }`}>
          <Terminal size={13} style={{ color: accentHex }} />
          <span className={`font-semibold ${isBright ? 'text-slate-800' : 'text-slate-200'}`}>
            Input:
          </span>
        </div>

        {/* Custom Input Field */}
        <div className="flex-1 flex items-center gap-1.5">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder="e.g. 10, 20, 30, 40, 50"
            className={`w-full px-2.5 py-1 rounded-lg text-xs font-mono border focus:outline-none transition ${
              isBright
                ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-400'
                : 'bg-[#040711] border-slate-700/80 text-cyan-300 placeholder:text-slate-600 focus:border-cyan-500'
            }`}
          />
        </div>

        {/* Quick Array Preset Chips */}
        <div className="flex items-center gap-1 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => handleQuickPreset('random')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-mono border transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1 ${
              isBright
                ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
            title="Generate random array"
          >
            <Shuffle size={10} style={{ color: accentHex }} />
            <span>Random</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickPreset('nearly')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-mono border transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1 ${
              isBright
                ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
            title="Generate nearly-sorted array with single inversion"
          >
            <TrendingUp size={10} className="text-emerald-400" />
            <span>Nearly Sorted</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickPreset('reverse')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-mono border transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1 ${
              isBright
                ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
            title="Generate reversed array"
          >
            <TrendingDown size={10} className="text-amber-400" />
            <span>Reversed</span>
          </button>
        </div>

        {/* Target value input if searching */}
        {targetVisible && (
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <Target size={12} style={{ color: accentHex }} /> Target:
            </span>
            <input
              type="number"
              value={targetVal}
              onChange={(e) => setTargetVal(Number(e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              className={`w-14 px-2 py-1 rounded-lg text-xs font-mono border text-center focus:outline-none ${
                isBright ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#040711] border-slate-700 text-cyan-300'
              }`}
            />
          </div>
        )}

        {/* Apply Input Button with glow */}
        <button
          onClick={handleApply}
          className="btn-primary-glow px-3 py-1 text-xs shrink-0 cursor-pointer flex items-center gap-1 shadow-md"
          style={{ backgroundColor: accentHex }}
          title="Apply input data into code execution and 3D simulation"
        >
          <Play size={11} className="fill-slate-950" />
          <span>Apply Input</span>
        </button>
      </div>

      {/* Validation warning if present */}
      {validationError && (
        <div className="text-[10px] text-rose-400 flex items-center gap-1 pt-1 font-mono">
          <AlertCircle size={11} />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}
