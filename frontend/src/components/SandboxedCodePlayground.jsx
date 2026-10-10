import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import {
  Play,
  Square,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Terminal,
  Code2,
  Box,
  CheckCircle,
  ExternalLink,
  Flame,
  Info,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const PLAYGROUND_PRESETS = [
  {
    id: 'torus-knot',
    title: 'Animated Torus Knot',
    description: 'Dynamic 3D geometry with metallic shaders and continuous orbital rotation.',
    code: `// CODE3D-AI Sandboxed Three.js Runner
// Standard Three.js objects (scene, camera, renderer, THREE) are pre-initialized.

// 1. Create Torus Knot Geometry
const geometry = new THREE.TorusKnotGeometry(2.5, 0.7, 128, 32);
const material = new THREE.MeshStandardMaterial({
  color: 0x38bdf8,
  roughness: 0.25,
  metalness: 0.8,
  wireframe: false,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// 2. Add Ambient and Point Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xf59e0b, 2.5, 50);
pointLight.position.set(8, 12, 10);
scene.add(pointLight);

// 3. Animation Loop Hook
window.__animate = (time) => {
  mesh.rotation.x = time * 0.0008;
  mesh.rotation.y = time * 0.0012;
};
`,
  },
  {
    id: 'dsa-bars',
    title: '3D Array Bar Elevation',
    description: 'Data structure array memory visualization with height corresponding to integer values.',
    code: `// 3D Memory Bar Chart Visualizer
const arr = [15, 30, 65, 42, 85, 24, 90, 50];
const barGroup = new THREE.Group();

arr.forEach((val, i) => {
  const height = (val / 100) * 6;
  const geom = new THREE.CylinderGeometry(0.5, 0.5, height, 32);
  const hue = (i / arr.length) * 360;
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(\`hsl(\${hue}, 80%, 55%)\`),
    roughness: 0.3,
    metalness: 0.5,
  });
  const bar = new THREE.Mesh(geom, mat);
  bar.position.set((i - arr.length / 2) * 1.6, height / 2, 0);
  barGroup.add(bar);
});

scene.add(barGroup);
scene.add(new THREE.AmbientLight(0xffffff, 0.9));

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(10, 20, 15);
scene.add(dirLight);

camera.position.set(0, 6, 16);

window.__animate = (time) => {
  barGroup.rotation.y = Math.sin(time * 0.0005) * 0.4;
};
`,
  },
  {
    id: 'particle-system',
    title: 'Particle Orbital Matrix',
    description: '1,200 points rotating in orbital concentric rings with perspective geometry.',
    code: `// Particle Cloud Ring Simulation
const particleCount = 1200;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 2 + Math.random() * 6;
  positions[i * 3] = Math.cos(angle) * radius;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
  positions[i * 3 + 2] = Math.sin(angle) * radius;

  colors[i * 3] = 0.2 + Math.random() * 0.8;
  colors[i * 3 + 1] = 0.5 + Math.random() * 0.5;
  colors[i * 3 + 2] = 1.0;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
  size: 0.12,
  vertexColors: true,
  transparent: true,
  opacity: 0.85,
});

const points = new THREE.Points(geometry, material);
scene.add(points);

scene.add(new THREE.AmbientLight(0xffffff, 1.0));
camera.position.set(0, 5, 14);

window.__animate = (time) => {
  points.rotation.y = time * 0.0004;
  points.rotation.x = Math.sin(time * 0.0002) * 0.2;
};
`,
  },
];

export default function SandboxedCodePlayground() {
  const { isBright, currentAccent } = useTheme();
  const accentHex = isBright ? currentAccent.bright : currentAccent.dark;

  const [selectedPreset, setSelectedPreset] = useState(PLAYGROUND_PRESETS[0]);
  const [code, setCode] = useState(PLAYGROUND_PRESETS[0].code);
  const [isRunning, setIsRunning] = useState(true);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  const iframeRef = useRef(null);

  // Generates complete isolated HTML for the sandbox
  const generateSandboxSrcDoc = (userCode) => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #070a12; }
    canvas { width: 100%; height: 100%; display: block; }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
  <div id="container"></div>
  <script>
    // Console log interception to parent
    const sendLog = (level, msg) => {
      window.parent.postMessage({ type: 'SANDBOX_LOG', level, msg }, '*');
    };
    const sendError = (err) => {
      window.parent.postMessage({ type: 'SANDBOX_ERROR', error: String(err) }, '*');
    };

    window.onerror = function(msg, url, line) {
      sendError(msg + ' (Line ' + line + ')');
      return true;
    };

    // Pre-initialize safe standard Three.js canvas
    let scene, camera, renderer, animFrameId;
    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 3, 12);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      document.body.appendChild(renderer.domElement);

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      // Execute User Code
      ${userCode}

      // Start render loop
      function loop(timestamp) {
        animFrameId = requestAnimationFrame(loop);
        if (typeof window.__animate === 'function') {
          window.__animate(timestamp);
        }
        renderer.render(scene, camera);
      }
      animFrameId = requestAnimationFrame(loop);

      window.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'STOP') {
          cancelAnimationFrame(animFrameId);
        }
      });
    } catch (e) {
      sendError(e.message || String(e));
    }
  </script>
</body>
</html>`;
  };

  // Run the code in the iframe
  const handleRun = () => {
    setError(null);
    setLogs([]);
    setIsRunning(true);
    if (iframeRef.current) {
      iframeRef.current.srcdoc = generateSandboxSrcDoc(code);
    }
  };

  // Stop running animation
  const handleStop = () => {
    setIsRunning(false);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'STOP' }, '*');
    }
  };

  // Reset to starter preset code
  const handleReset = () => {
    setCode(selectedPreset.code);
    handleRun();
  };

  // Select Preset
  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setCode(preset.code);
    setError(null);
    setLogs([]);
    setIsRunning(true);
    if (iframeRef.current) {
      iframeRef.current.srcdoc = generateSandboxSrcDoc(preset.code);
    }
  };

  // Listen to sandbox messages
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data?.type === 'SANDBOX_LOG') {
        setLogs((prev) => [...prev.slice(-20), `[${e.data.level}] ${e.data.msg}`]);
      } else if (e.data?.type === 'SANDBOX_ERROR') {
        setError(e.data.error);
        setIsRunning(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Initial mount load
  useEffect(() => {
    handleRun();
  }, []);

  return (
    <div
      className={`min-h-[calc(100vh-3.5rem)] flex flex-col md:flex-row select-none transition-colors ${
        isBright ? 'bg-slate-50 text-slate-800' : 'bg-[#090d16] text-slate-100'
      }`}
    >
      {/* Code Editor & Controls Panel */}
      <div
        className={`w-full md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r ${
          isBright ? 'bg-white border-slate-200' : 'bg-[#0d1322] border-slate-800/80'
        }`}
      >
        {/* Top Header & Presets Bar */}
        <div className="p-3 border-b border-inherit flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className="p-1.5 rounded-lg text-white"
              style={{ backgroundColor: accentHex }}
            >
              <Code2 className="w-4 h-4" />
            </span>
            <div>
              <h1 className="text-xs font-bold tracking-tight">3D Code Playground</h1>
              <p className="text-[10px] text-slate-400">Isolated Three.js Sandbox Runtime</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowSecurityModal(true)}
              className="h-7 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex items-center gap-1 hover:bg-emerald-500/20 transition cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Security Policy
            </button>
          </div>
        </div>

        {/* Preset Selector Tabs */}
        <div className="px-3 py-2 border-b border-inherit flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Presets:</span>
          {PLAYGROUND_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium whitespace-nowrap transition cursor-pointer ${
                selectedPreset.id === p.id
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-400 font-bold'
                  : isBright
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                  : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-400'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 min-h-[350px]">
          <MonacoEditor
            height="100%"
            language="javascript"
            theme={isBright ? 'vs' : 'vs-dark'}
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              fontSize: 12,
              lineNumbers: 'on',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              tabSize: 2,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Action Toolbar */}
        <div className="p-3 border-t border-inherit flex items-center justify-between gap-2 bg-inherit">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRun}
              style={{
                backgroundColor: accentHex,
                boxShadow: `0 4px 12px ${currentAccent.glow}`,
              }}
              className="h-8 px-4 rounded-xl text-xs font-bold text-slate-950 flex items-center gap-1.5 transition hover:opacity-90 active:scale-97 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Code
            </button>

            <button
              onClick={handleStop}
              disabled={!isRunning}
              className="h-8 px-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" />
              Stop
            </button>

            <button
              onClick={handleReset}
              className="h-8 px-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          <span className="text-[10px] text-slate-400 font-mono">
            {isRunning ? '● Sandbox Active' : '○ Execution Paused'}
          </span>
        </div>

        {/* Console / Error Display */}
        {(error || logs.length > 0) && (
          <div className="p-2 border-t border-inherit bg-slate-950 font-mono text-xs max-h-32 overflow-y-auto">
            {error && (
              <div className="text-red-400 flex items-start gap-1 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {logs.map((log, idx) => (
              <div key={idx} className="text-slate-400 text-[11px]">{log}</div>
            ))}
          </div>
        )}
      </div>

      {/* Sandbox 3D Viewport Panel */}
      <div className="w-full md:w-1/2 relative bg-[#070a12] flex flex-col">
        {/* Sandbox HUD Overlay */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto px-2.5 py-1 rounded-lg backdrop-blur-md bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>WebGL Canvas Sandbox</span>
          </div>
          <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800">
            iframe sandbox="allow-scripts"
          </span>
        </div>

        {/* Sandboxed Iframe (Opaque Origin) */}
        <iframe
          ref={iframeRef}
          title="CODE3D Sandboxed Playground"
          sandbox="allow-scripts"
          className="w-full h-full border-none flex-1 min-h-[450px]"
        />
      </div>

      {/* Security Policy Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0d1322] p-6 shadow-2xl text-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold">Playground Security Architecture</h3>
            </div>

            <div className="text-xs space-y-2.5 text-slate-300 leading-relaxed">
              <p>
                <strong>1. Client-Side Isolation:</strong> User code runs exclusively inside an isolated iframe configured with <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">sandbox="allow-scripts"</code> without <code className="text-rose-300 bg-slate-900 px-1 py-0.5 rounded">allow-same-origin</code>.
              </p>
              <p>
                <strong>2. Secret & Token Protection:</strong> Because same-origin privileges are denied, the sandboxed environment has strictly zero access to parent cookies, JWT session tokens, localStorage, or parent DOM APIs.
              </p>
              <p>
                <strong>3. Server Protection:</strong> Arbitrary code is NEVER transmitted or executed on the backend server.
              </p>
              <p>
                <strong>4. Controlled Messaging Bridge:</strong> All communication between the sandbox and the workspace occurs across a narrow <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">postMessage</code> channel for log and error telemetry only.
              </p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowSecurityModal(false)}
                className="h-8 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
