import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Sparkles,
  Send,
  RotateCcw,
  Code2,
  Box,
  Layers,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Maximize2,
  Eye,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import NaturalLanguageSceneRenderer from '../visualizers/NaturalLanguageSceneRenderer';

const SAMPLE_PROMPTS = [
  {
    label: 'Binary Search Tree (7 Nodes)',
    prompt: 'Create a binary search tree with 7 nodes and highlight the root and leaves',
  },
  {
    label: 'Singly Linked List',
    prompt: 'Create a singly linked list with 5 nodes, values, and next pointers',
  },
  {
    label: 'Call Stack Execution Frames',
    prompt: 'Create a call stack with 4 activation frames stacked vertically',
  },
  {
    label: '3D Memory Array',
    prompt: 'Create a 3D array memory model with 7 elements and proportional heights',
  },
];

export default function NlTo3dPage() {
  const { isBright, currentAccent } = useTheme();
  const accentHex = isBright ? currentAccent.bright : currentAccent.dark;

  const [prompt, setPrompt] = useState(SAMPLE_PROMPTS[0].prompt);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scene, setScene] = useState(null);
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate initial scene on load
  useEffect(() => {
    handleGenerate(SAMPLE_PROMPTS[0].prompt);
  }, []);

  const handleGenerate = async (customPrompt) => {
    const textToRun = (customPrompt || prompt).trim();
    if (!textToRun || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/scene/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToRun }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error?.message || 'Failed to generate 3D scene from prompt.');
      }

      setScene(data.scene);
    } catch (err) {
      setError(err.message || 'Scene generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!scene) return;
    navigator.clipboard.writeText(JSON.stringify(scene, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`min-h-[calc(100vh-3.5rem)] flex flex-col md:flex-row select-none transition-colors ${
        isBright ? 'bg-slate-50 text-slate-800' : 'bg-[#090d16] text-slate-100'
      }`}
    >
      {/* Left Control Sidebar */}
      <div
        className={`w-full md:w-96 flex flex-col border-b md:border-b-0 md:border-r p-4 gap-4 overflow-y-auto ${
          isBright ? 'bg-white border-slate-200' : 'bg-[#0e1424] border-slate-800/80'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="p-1.5 rounded-lg text-white"
              style={{ backgroundColor: accentHex }}
            >
              <Sparkles className="w-4 h-4" />
            </span>
            <h1 className="text-base font-bold tracking-tight">Natural Language to 3D</h1>
          </div>
          <p className="text-xs text-slate-400">
            Describe a data structure or algorithm scene. Verified JSON schema guarantees safe 3D WebGL rendering.
          </p>
        </div>

        {/* Prompt Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
          className="flex flex-col gap-2"
        >
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Describe 3D Scene
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="e.g. Create a binary tree with 7 nodes..."
            className={`w-full p-2.5 rounded-xl text-xs resize-none outline-none border transition ${
              isBright
                ? 'bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-800'
                : 'bg-slate-900 border-slate-700/80 focus:border-cyan-500 text-slate-100'
            }`}
          />

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            style={{
              backgroundColor: accentHex,
              boxShadow: `0 4px 14px ${currentAccent.glow}`,
            }}
            className="h-10 rounded-xl font-bold text-xs text-slate-950 flex items-center justify-center gap-2 transition hover:opacity-90 active:scale-98 disabled:opacity-50 cursor-pointer shadow-md"
          >
            {loading ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                Synthesizing 3D Geometry...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate 3D Scene
              </>
            )}
          </button>
        </form>

        {/* Sample Prompt Chips */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">
            Try Preset Scene Prompts:
          </span>
          <div className="flex flex-col gap-1.5">
            {SAMPLE_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(item.prompt);
                  handleGenerate(item.prompt);
                }}
                className={`text-left text-xs p-2 rounded-lg border transition cursor-pointer ${
                  isBright
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                <span className="font-semibold block text-[11px]">{item.label}</span>
                <span className="text-[10px] text-slate-400 line-clamp-1">{item.prompt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Scene Metadata & JSON Toggle */}
        {scene && (
          <div
            className={`mt-auto p-3 rounded-xl border text-xs flex flex-col gap-2 ${
              isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] text-slate-300 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-cyan-400" />
                {scene.title || 'Validated Scene'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono">
                {scene.objects?.length || 0} Meshes
              </span>
            </div>

            <p className="text-[11px] text-slate-400">{scene.description}</p>

            <div className="flex items-center gap-2 pt-1 border-t border-inherit">
              <button
                onClick={() => setShowJson((prev) => !prev)}
                className="flex-1 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-300 flex items-center justify-center gap-1 transition"
              >
                <Code2 className="w-3 h-3" />
                {showJson ? 'Hide JSON' : 'Inspect JSON Schema'}
              </button>
              <button
                onClick={handleCopyJson}
                className="h-7 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-300 flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            {showJson && (
              <pre className="p-2 rounded bg-slate-950 text-[9px] font-mono text-cyan-300 overflow-x-auto max-h-40 border border-slate-800">
                {JSON.stringify(scene, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Main 3D Canvas Viewport */}
      <div className="flex-1 relative flex flex-col min-h-[450px]">
        {/* Viewport HUD Header */}
        <div className="absolute top-3 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md bg-slate-950/70 border border-slate-800/80 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">
              {scene?.title || '3D WebGL Viewport'}
            </span>
          </div>

          <div className="pointer-events-auto flex items-center gap-1 text-[11px] text-slate-400 px-2 py-1 rounded-lg backdrop-blur-md bg-slate-950/70 border border-slate-800/80">
            <span>Left-click drag to rotate</span>
            <span>•</span>
            <span>Scroll to zoom</span>
          </div>
        </div>

        {/* React Three Fiber Canvas */}
        <Canvas
          camera={{ position: [0, 4, 14], fov: 50 }}
          style={{ width: '100%', height: '100%', outline: 'none' }}
        >
          <NaturalLanguageSceneRenderer scene={scene} />
        </Canvas>
      </div>
    </div>
  );
}
