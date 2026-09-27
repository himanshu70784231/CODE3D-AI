import React, { useState } from 'react';
import { Sparkles, Shuffle, ArrowUpRight, ArrowDownRight, RefreshCw, Sliders, Target, Check, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function InputGenerator({
  onApplyInput,
  currentValues = [10, 20, 30, 40],
  isSearching = false,
  currentTarget = 30,
  onApplyTarget = null,
}) {
  const { isBright } = useTheme();
  const [arraySize, setArraySize] = useState(8);
  const [customText, setCustomText] = useState(
    Array.isArray(currentValues) ? currentValues.join(', ') : '15, 42, 8, 99, 23, 67'
  );
  const [targetVal, setTargetVal] = useState(currentTarget || 23);
  const [activeMode, setActiveMode] = useState('random');
  const [validationError, setValidationError] = useState(null);

  // Generate helpers
  const generateRandom = (size = arraySize) => {
    const s = Math.min(20, Math.max(3, Number(size) || 8));
    const res = [];
    for (let i = 0; i < s; i++) {
      res.push(Math.floor(Math.random() * 90) + 10);
    }
    return res;
  };

  const generateSorted = (size = arraySize) => {
    const s = Math.min(20, Math.max(3, Number(size) || 8));
    const start = Math.floor(Math.random() * 15) + 5;
    const res = [];
    let cur = start;
    for (let i = 0; i < s; i++) {
      cur += Math.floor(Math.random() * 8) + 3;
      res.push(cur);
    }
    return res;
  };

  const generateReverseSorted = (size = arraySize) => {
    return generateSorted(size).reverse();
  };

  const generateNearlySorted = (size = arraySize) => {
    const arr = generateSorted(size);
    if (arr.length >= 4) {
      // Swap 1 or 2 adjacent pairs
      const i1 = Math.floor(Math.random() * (arr.length - 2));
      const temp = arr[i1];
      arr[i1] = arr[i1 + 1];
      arr[i1 + 1] = temp;
    }
    return arr;
  };

  const handleGenerate = (mode) => {
    setActiveMode(mode);
    setValidationError(null);
    let arr = [];

    if (mode === 'random') {
      arr = generateRandom();
    } else if (mode === 'sorted') {
      arr = generateSorted();
    } else if (mode === 'reverse') {
      arr = generateReverseSorted();
    } else if (mode === 'nearly-sorted') {
      arr = generateNearlySorted();
    } else if (mode === 'custom') {
      // Parse custom text
      const parsed = customText
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map(Number)
        .filter((n) => !isNaN(n));

      if (parsed.length === 0) {
        setValidationError('Please enter at least 2 valid numbers separated by commas.');
        return;
      }
      if (parsed.length > 25) {
        setValidationError('Maximum array size is 25 elements for optimal 3D clarity.');
        return;
      }
      arr = parsed;
    }

    setCustomText(arr.join(', '));

    // If searching, pick a target from array or keep target
    let target = targetVal;
    if (isSearching) {
      if (Math.random() > 0.3 && arr.length > 0) {
        target = arr[Math.floor(Math.random() * arr.length)];
        setTargetVal(target);
      }
    }

    onApplyInput(arr, target);
  };

  const handleCustomApply = () => {
    handleGenerate('custom');
  };

  return (
    <div className={`p-3 rounded-xl border text-xs select-none transition-colors space-y-2.5 ${
      isBright ? 'bg-white border-slate-200 text-slate-800 shadow-xs' : 'bg-slate-900/80 border-slate-800 text-slate-200'
    }`}>
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-bold text-xs">
          <Sparkles size={14} className={isBright ? 'text-cyan-600' : 'text-cyan-400'} />
          <span>Input Generator</span>
        </div>

        {/* Size Slider */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-slate-500">Size:</span>
          <input
            type="range"
            min={3}
            max={20}
            value={arraySize}
            onChange={(e) => {
              const sz = parseInt(e.target.value, 10);
              setArraySize(sz);
              if (activeMode !== 'custom') {
                handleGenerate(activeMode);
              }
            }}
            className="w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className={`px-1.5 py-0.2 rounded font-bold border text-[10px] ${
            isBright ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-cyan-300'
          }`}>
            {arraySize}
          </span>
        </div>
      </div>

      {/* Preset Generator Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        <button
          onClick={() => handleGenerate('random')}
          className={`px-2 py-1.5 rounded-lg border text-left flex items-center gap-1.5 font-semibold transition cursor-pointer ${
            activeMode === 'random'
              ? isBright ? 'bg-cyan-100 border-cyan-400 text-cyan-900 shadow-xs' : 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-sm'
              : isBright ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-400'
          }`}
          title="Generate random unsorted values"
        >
          <Shuffle size={13} className="text-cyan-400" />
          <span>🎲 Random</span>
        </button>

        <button
          onClick={() => handleGenerate('sorted')}
          className={`px-2 py-1.5 rounded-lg border text-left flex items-center gap-1.5 font-semibold transition cursor-pointer ${
            activeMode === 'sorted'
              ? isBright ? 'bg-cyan-100 border-cyan-400 text-cyan-900 shadow-xs' : 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-sm'
              : isBright ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-400'
          }`}
          title="Generate ascending sorted values"
        >
          <ArrowUpRight size={13} className="text-emerald-400" />
          <span>📈 Sorted</span>
        </button>

        <button
          onClick={() => handleGenerate('reverse')}
          className={`px-2 py-1.5 rounded-lg border text-left flex items-center gap-1.5 font-semibold transition cursor-pointer ${
            activeMode === 'reverse'
              ? isBright ? 'bg-cyan-100 border-cyan-400 text-cyan-900 shadow-xs' : 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-sm'
              : isBright ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-400'
          }`}
          title="Generate descending reverse-sorted values (worst-case for some sorts)"
        >
          <ArrowDownRight size={13} className="text-rose-400" />
          <span>📉 Reverse</span>
        </button>

        <button
          onClick={() => handleGenerate('nearly-sorted')}
          className={`px-2 py-1.5 rounded-lg border text-left flex items-center gap-1.5 font-semibold transition cursor-pointer ${
            activeMode === 'nearly-sorted'
              ? isBright ? 'bg-cyan-100 border-cyan-400 text-cyan-900 shadow-xs' : 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-sm'
              : isBright ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-400'
          }`}
          title="Generate sorted array with only 1 or 2 displaced elements"
        >
          <RefreshCw size={13} className="text-amber-400" />
          <span>⚡ Nearly Sorted</span>
        </button>
      </div>

      {/* Custom Input & Search Target Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
        {/* Custom Comma-Separated Input */}
        <div className="flex-1 flex items-center gap-1.5">
          <input
            type="text"
            value={customText}
            onChange={(e) => {
              setCustomText(e.target.value);
              setActiveMode('custom');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomApply()}
            placeholder="Custom comma-separated values (e.g. 15, 42, 8, 99)"
            className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-cyan-500 transition ${
              isBright
                ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                : 'bg-slate-950 border-slate-700 text-cyan-300 placeholder:text-slate-600'
            }`}
          />
        </div>

        {/* Target value input if searching */}
        {isSearching && (
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Target size={12} className="text-cyan-400" /> Target:
            </span>
            <input
              type="number"
              value={targetVal}
              onChange={(e) => setTargetVal(Number(e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomApply()}
              className={`w-16 px-2 py-1.5 rounded-lg text-xs font-mono border text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                isBright ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-cyan-300'
              }`}
            />
          </div>
        )}

        {/* Visualize Button */}
        <button
          onClick={handleCustomApply}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition shadow-sm shrink-0 cursor-pointer flex items-center justify-center gap-1 ${
            isBright
              ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/20'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-cyan-500/30'
          }`}
          title="Apply input and run visualization"
        >
          <span>Visualize ⚡</span>
        </button>
      </div>

      {/* Error message if invalid */}
      {validationError && (
        <div className="text-[11px] text-rose-500 flex items-center gap-1 pt-0.5">
          <AlertCircle size={12} />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}
