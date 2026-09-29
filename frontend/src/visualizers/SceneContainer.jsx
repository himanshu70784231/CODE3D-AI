import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Center, Grid, Sparkles, ContactShadows } from '@react-three/drei';
import {
  Compass,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  Play,
  Pause,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import OutputHologram3D from './OutputHologram3D';

/**
 * Handles smooth dynamic camera transitions to preset viewpoints (Top, Front, Isometric, Reset, Zoom In/Out, Fit View).
 */
function CameraPresetHandler({ preset, onApplied, controlsRef, count = 4 }) {
  const { camera } = useThree();

  useEffect(() => {
    if (!preset) return;
    if (controlsRef?.current) {
      controlsRef.current.target.set(0, 0, 0);
    }
    if (preset === 'top') {
      camera.position.set(0, 18, 0.01);
    } else if (preset === 'front') {
      camera.position.set(0, 2.5, 12);
    } else if (preset === 'iso') {
      camera.position.set(9, 9, 10);
    } else if (preset === 'zoom-in') {
      camera.position.multiplyScalar(0.8);
    } else if (preset === 'zoom-out') {
      camera.position.multiplyScalar(1.25);
    } else if (preset === 'fit') {
      const n = Math.max(1, count || 4);
      const spacing = 2.1;
      const width = Math.max(5.5, (n - 1) * spacing + 3.0);
      const dist = (width / 2) / Math.tan((camera.fov * Math.PI) / 360) * 1.35;
      camera.position.set(0, 3.8, Math.max(8.5, dist));
      if (controlsRef?.current) {
        controlsRef.current.target.set(0, 0, 0);
      }
    } else if (preset === 'reset') {
      camera.position.set(0, 4.5, 11);
      if (controlsRef?.current) {
        controlsRef.current.reset();
        controlsRef.current.target.set(0, 0, 0);
      }
    }
    camera.lookAt(0, 0, 0);
    if (controlsRef?.current) {
      controlsRef.current.update();
    }
    onApplied();
  }, [preset, camera, onApplied, controlsRef, count]);

  return null;
}

/**
 * Auto-fits camera distance and OrbitControls target dynamically based on data structure scale
 */
function DynamicBoundingCamera({ count = 4, controlsRef }) {
  const { camera, size } = useThree();
  const prevCountRef = useRef(null);

  useEffect(() => {
    if (count === prevCountRef.current) return;
    prevCountRef.current = count;

    const n = Math.max(1, count || 4);
    const spacing = n > 25 ? 1.6 : 2.1;
    const estWidth = Math.max(5.5, (n - 1) * spacing + 3.0);
    const estHeight = 3.8;

    const fovRad = (camera.fov * Math.PI) / 180;
    const aspect = size.width / Math.max(size.height, 1);

    const distV = estHeight / (2 * Math.tan(fovRad / 2));
    const distH = (estWidth / 2) / Math.tan((fovRad * aspect) / 2);
    const targetDist = Math.max(distV, distH, 6.8) * 1.28;

    camera.position.set(0, Math.max(2.8, targetDist * 0.35), Math.max(7.5, targetDist * 0.92));
    camera.lookAt(0, 0, 0);

    if (controlsRef?.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.maxDistance = Math.max(70, targetDist * 3.5);
      controlsRef.current.update();
    }
  }, [count, camera, size, controlsRef]);

  return null;
}

/**
 * SceneContainer provides the pristine 3D viewport canvas, lighting, camera controls,
 * and realistic cyber pedestal stage with maximum visual clarity and zero clutter.
 */
export default function SceneContainer({
  children,
  currentStep = null,
  correctOutput = null,
  isAtEnd = false,
  cumulativeOutput = [],
  isFull3DView = false,
  onToggleFull3D,
  onSelectElement = null,
}) {
  const { isBright } = useTheme();
  const [cameraPreset, setCameraPreset] = useState(null);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);
  const [webglContextLost, setWebglContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const controlsRef = useRef(null);

  const handleContextLost = (e) => {
    e.preventDefault();
    setWebglContextLost(true);
  };

  const handleContextRestored = () => {
    setWebglContextLost(false);
    setCanvasKey((k) => k + 1);
  };

  const handleResetScene = () => {
    setWebglContextLost(false);
    setCanvasKey((k) => k + 1);
    setCameraPreset('reset');
  };

  // Compute data structure scale to dynamically auto-fit camera distance
  const dsState = currentStep?.dataStructureState;
  const elementCount = dsState?.values?.length ?? dsState?.nodes?.length ?? (dsState?.matrix ? dsState.matrix.length * (dsState.matrix[0]?.length || 1) : 4);

  return (
    <div className={`relative w-full h-full min-h-[360px] overflow-hidden select-none transition-colors duration-200 ${
      isBright ? 'bg-slate-100' : 'bg-slate-950'
    }`}>
      {/* Top-Right: Pristine, Modern Camera Dock */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
        {/* Camera Perspective Angle Presets */}
        <div className={`flex items-center backdrop-blur-md border rounded-lg p-0.5 shadow-md ${
          isBright ? 'bg-white/90 border-slate-200 text-slate-700' : 'bg-slate-900/85 border-slate-800 text-slate-300'
        }`}>
          <button
            onClick={() => setCameraPreset('iso')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition hover:text-cyan-500 cursor-pointer ${
              cameraPreset === 'iso' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : ''
            }`}
            title="Isometric 3D Perspective"
          >
            3D
          </button>
          <button
            onClick={() => setCameraPreset('front')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition hover:text-cyan-500 cursor-pointer ${
              cameraPreset === 'front' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : ''
            }`}
            title="Front Elevation View"
          >
            Front
          </button>
          <button
            onClick={() => setCameraPreset('top')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition hover:text-cyan-500 cursor-pointer ${
              cameraPreset === 'top' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : ''
            }`}
            title="Top-Down Plan View"
          >
            Top
          </button>
          {/* Fit View Button */}
          <button
            onClick={() => setCameraPreset('fit')}
            className="px-1.5 py-0.5 rounded text-[11px] font-semibold transition hover:text-cyan-500 flex items-center gap-0.5 cursor-pointer text-slate-400 hover:text-cyan-400"
            title="Fit View: Auto-frame scene to fit all elements"
          >
            <Maximize2 size={11} />
            <span className="hidden sm:inline text-[10px]">Fit</span>
          </button>
          {/* Zoom In Button */}
          <button
            onClick={() => setCameraPreset('zoom-in')}
            className="p-1 rounded text-[11px] transition hover:text-cyan-500 text-slate-400 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={11} />
          </button>
          {/* Zoom Out Button */}
          <button
            onClick={() => setCameraPreset('zoom-out')}
            className="p-1 rounded text-[11px] transition hover:text-cyan-500 text-slate-400 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={11} />
          </button>
          {/* Reset Camera Button */}
          <button
            onClick={() => setCameraPreset('reset')}
            className="p-1 rounded text-[11px] transition hover:text-cyan-500 text-slate-400 cursor-pointer"
            title="Reset Camera to Default Position"
          >
            <RefreshCw size={11} />
          </button>
          {/* Rotate 360 Toggle */}
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition flex items-center gap-0.5 cursor-pointer ${
              isAutoRotating ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-400 hover:text-cyan-400'
            }`}
            title="Toggle Continuous 360 Rotation"
          >
            <RotateCw size={11} className={isAutoRotating ? 'animate-spin' : ''} />
            <span className="hidden sm:inline text-[10px]">Rotate</span>
          </button>
          {/* Pause Animation Toggle */}
          <button
            onClick={() => setIsAnimationPaused(!isAnimationPaused)}
            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition flex items-center gap-0.5 cursor-pointer ${
              isAnimationPaused ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-slate-400 hover:text-amber-400'
            }`}
            title="Pause / Resume 3D Scene Animations"
          >
            {isAnimationPaused ? <Play size={11} /> : <Pause size={11} />}
            <span className="hidden sm:inline text-[10px]">Anim</span>
          </button>
        </div>

        {/* Full 3D Theater Mode Button */}
        {onToggleFull3D && (
          <button
            onClick={onToggleFull3D}
            className={`h-7 px-2 rounded-lg text-xs font-semibold backdrop-blur-md border transition shadow-md cursor-pointer flex items-center gap-1 ${
              isFull3DView
                ? 'bg-purple-600 border-purple-400 text-white shadow-purple-600/30'
                : isBright
                  ? 'bg-white/90 border-slate-200 text-slate-700 hover:text-purple-600 hover:bg-purple-50'
                  : 'bg-slate-900/85 border-slate-800 text-slate-300 hover:text-purple-400 hover:bg-purple-950/40'
            }`}
            title={isFull3DView ? 'Exit 100% Fullscreen Theater Mode' : 'Enter 100% Fullscreen 3D Viewport'}
          >
            {isFull3DView ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            <span className="hidden md:inline">{isFull3DView ? 'Exit' : 'Full 3D'}</span>
          </button>
        )}
      </div>

      {/* WebGL Context Loss Banner */}
      {webglContextLost && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 backdrop-blur-md">
          <span>WebGL context lost.</span>
          <button
            onClick={handleResetScene}
            className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold hover:bg-rose-400 transition"
          >
            Restore 3D View
          </button>
        </div>
      )}

      {/* Main 3D Canvas with Center Stage Focus */}
      <Canvas
        key={canvasKey}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', handleContextLost, false);
          gl.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);
        }}
        camera={{ position: [0, 3.4, 8.5], fov: 38 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={[isBright ? '#f8fafc' : '#070b14']} />
        
        {/* Dynamic Studio Lighting (Ambient + Directional Default Setup) */}
        <ambientLight intensity={isBright ? 1.25 : 0.85} />
        <directionalLight
          position={[12, 18, 12]}
          intensity={isBright ? 2.0 : 1.6}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-12, 10, -6]} intensity={0.6} color={isBright ? '#0284c7' : '#00f2fe'} />
        <pointLight position={[12, 8, 6]} intensity={0.45} color={isBright ? '#6366f1' : '#818cf8'} />
        <pointLight position={[0, 6, 2]} intensity={0.35} color="#ffffff" />

        <Suspense fallback={null}>
          <CameraPresetHandler
            preset={cameraPreset}
            count={elementCount}
            onApplied={() => setCameraPreset(null)}
            controlsRef={controlsRef}
          />

          <DynamicBoundingCamera
            count={elementCount}
            controlsRef={controlsRef}
          />

          {/* Central 3D Data Structure Showcase */}
          <Center top position={[0, -0.3, 0]}>
            {React.isValidElement(children)
              ? React.cloneElement(children, {
                  onSelectElement: (idx, val) => {
                    if (onSelectElement) onSelectElement(idx, val);
                  },
                })
              : children}
          </Center>

          {/* 3D Correct Output Victory Banner (Appears cleanly on completion) */}
          {isAtEnd && correctOutput && (
            <OutputHologram3D
              correctOutput={correctOutput}
              isAtEnd={isAtEnd}
              totalOutputs={cumulativeOutput?.length || 0}
              recentLine={cumulativeOutput?.[cumulativeOutput.length - 1]}
            />
          )}

          {/* Realistic Cyber Pedestal Stage */}
          <group position={[0, -0.04, 0]}>
            <mesh receiveShadow>
              <cylinderGeometry args={[10.2, 10.8, 0.1, 64]} />
              <meshStandardMaterial
                color={isBright ? '#e2e8f0' : '#080d1a'}
                roughness={0.2}
                metalness={0.85}
              />
            </mesh>
            {/* Primary Glowing Perimeter Ring */}
            <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[10.0, 10.18, 64]} />
              <meshBasicMaterial
                color={isBright ? '#0284c7' : '#00f2fe'}
                transparent
                opacity={0.85}
              />
            </mesh>
            {/* Secondary Inner Pulsing Ring */}
            <mesh position={[0, 0.061, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[7.2, 7.28, 64]} />
              <meshBasicMaterial
                color={isBright ? '#6366f1' : '#38bdf8'}
                transparent
                opacity={0.4}
              />
            </mesh>
          </group>

          {/* Cinematic Ambient Particle Sparkles */}
          <Sparkles
            count={50}
            scale={16}
            size={3.0}
            speed={0.35}
            opacity={isBright ? 0.25 : 0.6}
            color={isBright ? '#0284c7' : '#38bdf8'}
          />

          {/* Soft Grounding Contact Shadows */}
          <ContactShadows
            position={[0, -0.02, 0]}
            opacity={isBright ? 0.5 : 0.85}
            scale={26}
            blur={2.5}
            far={4.8}
            color={isBright ? '#64748b' : '#000000'}
          />

          {/* Floor Depth Grid */}
          <Grid
            position={[0, -0.01, 0]}
            args={[32, 32]}
            cellSize={0.75}
            cellThickness={0.7}
            cellColor={isBright ? '#cbd5e1' : '#1e293b'}
            sectionSize={2.25}
            sectionThickness={1.2}
            sectionColor={isBright ? '#94a3b8' : '#334155'}
            fadeDistance={20}
            fadeStrength={1.5}
          />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.08}
          minDistance={1.8}
          maxDistance={45}
          maxPolarAngle={Math.PI / 2 - 0.02}
          autoRotate={isAutoRotating}
          autoRotateSpeed={1.8}
        />
      </Canvas>

      {/* Subtle Camera Interaction Tips */}
      <div className={`absolute bottom-3 left-3 z-10 flex items-center gap-3 text-[11px] backdrop-blur-sm border rounded px-2.5 py-1 transition-colors ${
        isBright
          ? 'bg-white/80 border-slate-200 text-slate-600'
          : 'bg-slate-900/70 border-slate-800/60 text-slate-400'
      }`}>
        <span className="flex items-center gap-1">
          <RotateCw size={11} className={isBright ? 'text-slate-600' : 'text-cyan-400'} /> Rotate: Left-drag
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <ZoomIn size={11} className={isBright ? 'text-slate-600' : 'text-cyan-400'} /> Zoom: Scroll
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Compass size={11} className={isBright ? 'text-slate-600' : 'text-cyan-400'} /> Pan: Right-drag
        </span>
      </div>
    </div>
  );
}
