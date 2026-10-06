import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Code2,
  Cpu,
  Layers,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const PRESET_DEMOS = [
  {
    id: 'bubble-sort',
    name: 'Bubble Sort 3D',
    category: 'Sorting',
    complexity: 'O(n²)',
    initialArray: [45, 12, 85, 32, 60, 24, 75],
    code: `for (int i = 0; i < n - 1; i++) {
  for (int j = 0; j < n - i - 1; j++) {
    if (arr[j] > arr[j + 1]) {
      swap(arr[j], arr[j + 1]);
    }
  }
}`,
    generateSteps: () => {
      const arr = [45, 12, 85, 32, 60, 24, 75];
      const steps = [];
      const n = arr.length;
      steps.push({ arr: [...arr], i: 0, j: 0, swapped: false, activeIndices: [0, 1], line: 1, desc: 'Initial array loaded into 3D heap memory.' });
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          steps.push({ arr: [...arr], i, j, swapped: false, activeIndices: [j, j + 1], line: 3, desc: `Comparing arr[${j}] (${arr[j]}) with arr[${j + 1}] (${arr[j + 1]}).` });
          if (arr[j] > arr[j + 1]) {
            const temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
            steps.push({ arr: [...arr], i, j, swapped: true, activeIndices: [j, j + 1], line: 4, desc: `Swap executed! ${arr[j]} ⇄ ${arr[j + 1]}` });
          }
        }
      }
      steps.push({ arr: [...arr], i: n - 1, j: n - 1, swapped: false, activeIndices: [], line: 6, desc: 'Array completely sorted! All elements in monotonic order.' });
      return steps;
    },
  },
  {
    id: 'binary-search',
    name: 'Binary Search 3D',
    category: 'Searching',
    complexity: 'O(log n)',
    initialArray: [10, 22, 35, 48, 62, 77, 91],
    code: `int low = 0, high = n - 1, target = 62;
while (low <= high) {
  int mid = low + (high - low) / 2;
  if (arr[mid] == target) return mid;
  if (arr[mid] < target) low = mid + 1;
  else high = mid - 1;
}`,
    generateSteps: () => {
      const arr = [10, 22, 35, 48, 62, 77, 91];
      const steps = [];
      let low = 0, high = arr.length - 1, target = 62;
      steps.push({ arr: [...arr], low, high, mid: 3, activeIndices: [0, 6], line: 1, desc: `Search space initialized: low=0, high=6. Target = ${target}` });
      while (low <= high) {
        const mid = Math.floor(low + (high - low) / 2);
        steps.push({ arr: [...arr], low, high, mid, activeIndices: [mid], line: 3, desc: `Inspecting mid index ${mid} (value = ${arr[mid]}).` });
        if (arr[mid] === target) {
          steps.push({ arr: [...arr], low, high, mid, found: true, activeIndices: [mid], line: 4, desc: `Target ${target} located in 3D array at index ${mid}!` });
          break;
        }
        if (arr[mid] < target) {
          low = mid + 1;
          steps.push({ arr: [...arr], low, high, mid, activeIndices: [low, high], line: 5, desc: `${arr[mid]} < ${target}. Discarding left partition. low = ${low}.` });
        } else {
          high = mid - 1;
          steps.push({ arr: [...arr], low, high, mid, activeIndices: [low, high], line: 6, desc: `${arr[mid]} > ${target}. Discarding right partition. high = ${high}.` });
        }
      }
      return steps;
    },
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers 3D',
    category: 'Array',
    complexity: 'O(n)',
    initialArray: [2, 5, 11, 15, 20, 30, 42],
    code: `int left = 0, right = n - 1, target = 25;
while (left < right) {
  int sum = arr[left] + arr[right];
  if (sum == target) return true;
  if (sum < target) left++;
  else right--;
}`,
    generateSteps: () => {
      const arr = [2, 5, 11, 15, 20, 30, 42];
      const steps = [];
      let left = 0, right = arr.length - 1, target = 25;
      steps.push({ arr: [...arr], left, right, sum: arr[left] + arr[right], activeIndices: [left, right], line: 1, desc: `Pointers initialized at boundaries: left=0, right=6. Target sum=${target}.` });
      while (left < right) {
        const sum = arr[left] + arr[right];
        steps.push({ arr: [...arr], left, right, sum, activeIndices: [left, right], line: 3, desc: `Sum of arr[${left}] (${arr[left]}) + arr[${right}] (${arr[right]}) = ${sum}.` });
        if (sum === target) {
          steps.push({ arr: [...arr], left, right, sum, found: true, activeIndices: [left, right], line: 4, desc: `Target sum ${target} confirmed! Indices [${left}, ${right}].` });
          break;
        }
        if (sum < target) {
          left++;
          steps.push({ arr: [...arr], left, right, sum, activeIndices: [left, right], line: 5, desc: `${sum} < ${target}. Incrementing left pointer to ${left}.` });
        } else {
          right--;
          steps.push({ arr: [...arr], left, right, sum, activeIndices: [left, right], line: 6, desc: `${sum} > ${target}. Decrementing right pointer to ${right}.` });
        }
      }
      return steps;
    },
  },
];

/**
 * 3D Bar representation for array elements
 */
function Array3DScene({ step, isBright, currentAccent }) {
  const arr = step?.arr || [45, 12, 85, 32, 60, 24, 75];
  const maxVal = Math.max(...arr, 1);
  const activeIndices = step?.activeIndices || [];
  const primaryAccent = currentAccent ? (isBright ? currentAccent.bright : currentAccent.dark) : (isBright ? '#0284c7' : '#38bdf8');

  return (
    <group position={[-((arr.length - 1) * 1.3) / 2, -1.2, 0]}>
      {arr.map((val, idx) => {
        const isActive = activeIndices.includes(idx);
        const isSwapped = step?.swapped && isActive;
        const isFound = step?.found && isActive;

        const height = Math.max(0.6, (val / maxVal) * 3.4);
        const xPos = idx * 1.3;

        const barColor = isFound
          ? '#10b981'
          : isSwapped
            ? '#ef4444'
            : isActive
              ? primaryAccent
              : isBright ? '#cbd5e1' : '#1e293b';

        return (
          <group key={idx} position={[xPos, height / 2, 0]}>
            {/* 3D Cylindrical or Box Bar */}
            <mesh>
              <boxGeometry args={[0.85, height, 0.85]} />
              <meshStandardMaterial
                color={barColor}
                metalness={0.6}
                roughness={0.25}
                emissive={isActive ? barColor : '#000000'}
                emissiveIntensity={isActive ? (isBright ? 0.35 : 0.6) : 0}
              />
            </mesh>

            {/* Glowing Pointer Halo if active */}
            {isActive && (
              <mesh position={[0, height / 2 + 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.55, 0.05, 16, 32]} />
                <meshBasicMaterial color={barColor} />
              </mesh>
            )}

            {/* 3D Value Label */}
            <Text
              position={[0, height / 2 + 0.85, 0]}
              fontSize={0.32}
              color={isBright ? '#0f172a' : '#f8fafc'}
              anchorX="center"
              anchorY="middle"
            >
              {String(val)}
            </Text>

            {/* 3D Index Label below bar */}
            <Text
              position={[0, -height / 2 - 0.35, 0]}
              fontSize={0.25}
              color={isBright ? '#64748b' : '#94a3b8'}
              anchorX="center"
              anchorY="middle"
            >
              {`[${idx}]`}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

export default function Interactive3DPlayground({ onLaunchStudio }) {
  const { isBright, currentAccent } = useTheme();
  const navigate = useNavigate();

  const [selectedDemo, setSelectedDemo] = useState(PRESET_DEMOS[0]);
  const [steps, setSteps] = useState(() => PRESET_DEMOS[0].generateSteps());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(600);

  // Re-generate steps when demo changes
  useEffect(() => {
    const s = selectedDemo.generateSteps();
    setSteps(s);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [selectedDemo]);

  // Automated playback timer
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speedMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, steps.length, speedMs]);

  const currentStep = steps[currentStepIndex] || steps[0];

  const handleLaunchFullStudio = () => {
    if (onLaunchStudio) {
      onLaunchStudio({
        id: selectedDemo.id,
        title: selectedDemo.name,
        category: selectedDemo.category,
        description: `Live interactive session of ${selectedDemo.name}.`,
        code: selectedDemo.code,
        language: 'java',
        timeComplexity: selectedDemo.complexity,
      });
    } else {
      navigate('/visualizer');
    }
  };

  return (
    <div className={`w-full rounded-2xl border overflow-hidden shadow-2xl transition-all duration-300 ${
      isBright
        ? 'bg-white border-slate-200 shadow-slate-200/80'
        : 'bg-[#080f1e]/90 border-slate-800 shadow-black/60'
    }`}>
      {/* Playground Header Bar */}
      <div className={`p-4 md:px-6 border-b flex flex-wrap items-center justify-between gap-3 ${
        isBright ? 'bg-slate-50 border-slate-200' : 'bg-[#0c1527] border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/30">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-base font-bold font-display tracking-tight ${isBright ? 'text-slate-900' : 'text-white'}`}>
                Live 3D Test-Drive Playground
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                Interactive WebGL
              </span>
            </div>
            <p className={`text-xs ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
              Select an algorithm below and click Play to observe physical 3D heap mutations and pointer traversals.
            </p>
          </div>
        </div>

        {/* Algorithm Preset Switchers */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {PRESET_DEMOS.map((demo) => (
            <button
              key={demo.id}
              onClick={() => setSelectedDemo(demo)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                selectedDemo.id === demo.id
                  ? isBright
                    ? 'bg-cyan-600 text-white font-bold shadow-sm'
                    : 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                  : isBright
                    ? 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <span>{demo.name}</span>
              <span className={`text-[10px] font-mono opacity-80`}>({demo.complexity})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Playground Body: 3D Canvas + Live Step Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
        {/* Left 3D WebGL Canvas Viewport (7 Cols) */}
        <div className={`lg:col-span-7 relative min-h-[320px] lg:min-h-0 flex flex-col ${
          isBright ? 'bg-slate-100/70' : 'bg-[#040814]'
        }`}>
          {/* 3D Canvas */}
          <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
            <Canvas camera={{ position: [0, 2.5, 7.8], fov: 46 }}>
              <ambientLight intensity={isBright ? 1.4 : 0.8} />
              <directionalLight position={[10, 15, 10]} intensity={isBright ? 2.0 : 1.5} />
              <pointLight position={[-10, 5, -5]} intensity={1.2} color="#06b6d4" />
              <pointLight position={[10, -5, 5]} intensity={1.2} color="#a855f7" />

              <Array3DScene step={currentStep} isBright={isBright} currentAccent={currentAccent} />
              <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.8} minPolarAngle={Math.PI / 3.5} />
            </Canvas>
          </div>

          {/* Floating Step Description Toast inside 3D Canvas */}
          <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
            <div className={`p-2.5 rounded-xl border backdrop-blur-md shadow-lg flex items-center justify-between text-xs pointer-events-auto ${
              isBright
                ? 'bg-white/90 border-slate-200 text-slate-800'
                : 'bg-slate-900/90 border-slate-800 text-slate-200'
            }`}>
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shrink-0" />
                <span className="font-mono font-medium truncate">{currentStep?.desc}</span>
              </div>
              <span className="font-mono text-[11px] opacity-75 shrink-0 ml-2">
                Step {currentStepIndex + 1}/{steps.length}
              </span>
            </div>
          </div>
        </div>

        {/* Right Code & Inspector Panel (5 Cols) */}
        <div className={`lg:col-span-5 p-4 md:p-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l ${
          isBright ? 'bg-white border-slate-200' : 'bg-[#091224] border-slate-800'
        }`}>
          {/* Top Code Block */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <Code2 size={14} className="text-cyan-500" />
                <span className="text-xs font-bold font-mono uppercase tracking-wide">
                  Algorithm Trace Preview
                </span>
              </div>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                isBright ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                {selectedDemo.category}
              </span>
            </div>

            {/* Code Snippet with active line highlight */}
            <div className={`p-3 rounded-xl border font-mono text-xs overflow-x-auto ${
              isBright ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#050b18] border-slate-800/90 text-slate-200'
            }`}>
              {selectedDemo.code.split('\n').map((lineText, idx) => {
                const lineNum = idx + 1;
                const isCurrentLine = currentStep?.line === lineNum;
                return (
                  <div
                    key={idx}
                    className={`flex items-center px-1.5 py-0.5 rounded transition ${
                      isCurrentLine
                        ? isBright
                          ? 'bg-cyan-100 text-cyan-950 font-bold border-l-2 border-cyan-600'
                          : 'bg-cyan-500/20 text-cyan-300 font-bold border-l-2 border-cyan-400'
                        : 'opacity-70'
                    }`}
                  >
                    <span className="w-5 text-[10px] opacity-40 select-none">{lineNum}</span>
                    <span className="whitespace-pre">{lineText}</span>
                  </div>
                );
              })}
            </div>

            {/* Variable Status Pills */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className={`p-2.5 rounded-lg border flex flex-col ${
                isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}>
                <span className="text-[10px] font-mono uppercase opacity-60">Complexity</span>
                <span className="text-sm font-bold font-mono text-cyan-500">{selectedDemo.complexity}</span>
              </div>
              <div className={`p-2.5 rounded-lg border flex flex-col ${
                isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}>
                <span className="text-[10px] font-mono uppercase opacity-60">Active Mutation</span>
                <span className="text-sm font-bold font-mono text-amber-500">
                  {currentStep?.swapped ? 'Swap [i ⇄ j]' : currentStep?.found ? 'Match Found' : 'Comparing'}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Interactive Playback Controls + Launch Button */}
          <div className="pt-4 border-t space-y-3">
            {/* Playback Buttons */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentStepIndex((p) => Math.max(0, p - 1))}
                  disabled={currentStepIndex === 0}
                  className="p-2 rounded-lg border hover:bg-slate-500/10 transition cursor-pointer disabled:opacity-30"
                  title="Previous Step"
                >
                  <SkipBack size={14} />
                </button>

                <button
                  onClick={() => setIsPlaying((p) => !p)}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition cursor-pointer"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isPlaying ? 'Pause' : 'Play 3D Step'}</span>
                </button>

                <button
                  onClick={() => setCurrentStepIndex((p) => Math.min(steps.length - 1, p + 1))}
                  disabled={currentStepIndex >= steps.length - 1}
                  className="p-2 rounded-lg border hover:bg-slate-500/10 transition cursor-pointer disabled:opacity-30"
                  title="Next Step"
                >
                  <SkipForward size={14} />
                </button>

                <button
                  onClick={() => {
                    setCurrentStepIndex(0);
                    setIsPlaying(false);
                  }}
                  className="p-2 rounded-lg border hover:bg-slate-500/10 transition cursor-pointer"
                  title="Reset Demo"
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              {/* Speed Switcher */}
              <div className="flex items-center gap-1 text-[11px] font-mono">
                {[
                  { label: '0.5x', ms: 1000 },
                  { label: '1x', ms: 600 },
                  { label: '2x', ms: 300 },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setSpeedMs(s.ms)}
                    className={`px-2 py-1 rounded transition cursor-pointer ${
                      speedMs === s.ms
                        ? 'bg-cyan-500/20 text-cyan-500 font-bold border border-cyan-500/40'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Launch in Full Studio CTA Button */}
            <button
              onClick={handleLaunchFullStudio}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 text-white flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
            >
              <span>Open in Full 3D Code Studio (Custom Input &amp; AST)</span>
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
