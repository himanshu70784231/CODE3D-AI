import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

/**
 * Interactive 3D Central Quantum Core representing algorithmic state
 */
function HologramCore({ isBright, currentAccent }) {
  const meshRef = useRef();
  const wireframeRef = useRef();
  const innerCoreRef = useRef();

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.35;
      meshRef.current.rotation.y += delta * 0.45;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.x -= delta * 0.25;
      wireframeRef.current.rotation.z += delta * 0.3;
    }
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y += delta * 0.8;
    }
  });

  const primaryColor = isBright ? currentAccent.bright : currentAccent.dark;
  const secondaryColor = isBright ? '#6366f1' : '#a855f7';

  return (
    <group position={[0, 0, 0]}>
      {/* Innermost dense glowing core */}
      <mesh ref={innerCoreRef} scale={0.75}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={isBright ? 0.6 : 1.2}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Outer pulsing distorted translucent shell */}
      <mesh ref={meshRef} scale={1.45}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color={primaryColor}
          attach="material"
          distort={0.4}
          speed={2.5}
          roughness={0.15}
          metalness={0.8}
          wireframe={false}
          transparent
          opacity={isBright ? 0.7 : 0.6}
        />
      </mesh>

      {/* Outer rotating holographic wireframe cage */}
      <mesh ref={wireframeRef} scale={2.05}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={secondaryColor}
          wireframe
          transparent
          opacity={isBright ? 0.45 : 0.75}
        />
      </mesh>
    </group>
  );
}

/**
 * Orbiting Data Structure Nodes (representing heap records & array indices)
 */
function OrbitingNodes({ isBright, currentAccent }) {
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.32;
    }
  });

  const nodes = useMemo(() => {
    const items = [];
    const count = 8;
    const radius = 3.3;
    const primary = isBright ? currentAccent.bright : currentAccent.dark;
    const colors = [
      primary,
      '#06b6d4',
      '#8b5cf6',
      '#f59e0b',
      '#10b981',
      '#ec4899',
      '#3b82f6',
      primary,
    ];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(angle * 2.5) * 0.85;
      items.push({ pos: [x, y, z], color: colors[i % colors.length], id: i });
    }
    return items;
  }, [isBright, currentAccent]);

  return (
    <group ref={groupRef}>
      {nodes.map((node) => (
        <Float key={node.id} speed={2.2} rotationIntensity={1.2} floatIntensity={1.8}>
          <mesh position={node.pos}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial
              color={node.color}
              metalness={0.8}
              roughness={0.2}
              emissive={node.color}
              emissiveIntensity={isBright ? 0.3 : 0.6}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/**
 * Concentric 3D Pointer & Quantum Gyro Rings
 */
function PointerRings({ isBright, currentAccent }) {
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();

  useFrame((_, delta) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.45;
      ring1Ref.current.rotation.x += delta * 0.18;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.38;
      ring2Ref.current.rotation.y += delta * 0.22;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y -= delta * 0.25;
      ring3Ref.current.rotation.x += delta * 0.15;
    }
  });

  const primary = isBright ? currentAccent.bright : currentAccent.dark;

  return (
    <group>
      {/* Ring 1 (Loop Pointer i) */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.55, 0.035, 16, 64]} />
        <meshBasicMaterial color={primary} transparent opacity={isBright ? 0.75 : 0.9} />
      </mesh>

      {/* Ring 2 (Loop Pointer j) */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.9, 0.025, 16, 64]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={isBright ? 0.6 : 0.8} />
      </mesh>

      {/* Ring 3 (Outer Horizon Ring) */}
      <mesh ref={ring3Ref} rotation={[0, Math.PI / 4, Math.PI / 6]}>
        <torusGeometry args={[3.2, 0.015, 16, 64]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={isBright ? 0.4 : 0.6} />
      </mesh>
    </group>
  );
}

/**
 * Main Hero 3D WebGL Canvas
 */
export default function Hero3DCanvas() {
  const { isBright, currentAccent } = useTheme();

  const accentHex = isBright ? currentAccent.bright : currentAccent.dark;

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 2, 7.8], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={isBright ? 1.3 : 0.85} />
        <directionalLight position={[10, 15, 10]} intensity={isBright ? 2.0 : 1.5} />
        <pointLight position={[-8, -5, -8]} intensity={1.5} color={accentHex} />
        <pointLight position={[8, 5, 5]} intensity={1.5} color="#8b5cf6" />

        <Sparkles
          count={isBright ? 45 : 90}
          scale={9.5}
          size={isBright ? 2.8 : 3.8}
          speed={0.45}
          opacity={isBright ? 0.5 : 0.8}
          color={accentHex}
        />

        <HologramCore isBright={isBright} currentAccent={currentAccent} />
        <OrbitingNodes isBright={isBright} currentAccent={currentAccent} />
        <PointerRings isBright={isBright} currentAccent={currentAccent} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.95}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.6}
        />
      </Canvas>
    </div>
  );
}
