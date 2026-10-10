import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Float } from '@react-three/drei';
import * as THREE from 'three';

// Single Animated Primitive Item
function ScenePrimitive({ obj }) {
  const meshRef = useRef();
  const labelRef = useRef();

  useFrame((state, delta) => {
    if (!meshRef.current || !obj.animation || obj.animation.type === 'none') return;

    const speed = obj.animation.speed || 1;
    const time = state.clock.getElapsedTime() * speed;

    if (obj.animation.type === 'rotate') {
      const axis = obj.animation.axis || 'y';
      meshRef.current.rotation[axis] += delta * speed * 1.5;
    } else if (obj.animation.type === 'pulse') {
      const scaleFactor = 1 + Math.sin(time * 3) * 0.12;
      const baseScale = obj.scale || [1, 1, 1];
      meshRef.current.scale.set(
        baseScale[0] * scaleFactor,
        baseScale[1] * scaleFactor,
        baseScale[2] * scaleFactor
      );
    } else if (obj.animation.type === 'bounce') {
      const baseY = obj.position?.[1] || 0;
      meshRef.current.position.y = baseY + Math.abs(Math.sin(time * 2.5)) * 0.4;
    } else if (obj.animation.type === 'orbit') {
      const radius = Math.sqrt(obj.position[0] ** 2 + obj.position[2] ** 2) || 3;
      meshRef.current.position.x = Math.cos(time) * radius;
      meshRef.current.position.z = Math.sin(time) * radius;
    }
  });

  const position = obj.position || [0, 0, 0];
  const rotation = obj.rotation || [0, 0, 0];
  const scale = obj.scale || [1, 1, 1];
  const color = obj.material?.color || '#38bdf8';
  const roughness = obj.material?.roughness ?? 0.3;
  const metalness = obj.material?.metalness ?? 0.2;
  const wireframe = Boolean(obj.material?.wireframe);
  const opacity = obj.material?.opacity ?? 1;
  const isTransparent = opacity < 1;

  const matProps = {
    color,
    roughness,
    metalness,
    wireframe,
    transparent: isTransparent,
    opacity,
  };

  // Connection Line (edges between tree / graph nodes)
  if (obj.type === 'connection_line') {
    const start = position;
    const end = obj.target || [0, 0, 0];
    return (
      <Line
        points={[start, end]}
        color={color}
        lineWidth={2.5}
        transparent
        opacity={0.8}
      />
    );
  }

  // Pointer Ring
  if (obj.type === 'pointer_ring') {
    return (
      <group position={position} rotation={rotation}>
        <mesh ref={meshRef}>
          <torusGeometry args={[scale[0] * 0.8, 0.08, 16, 40]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {obj.label?.text && (
          <Text
            position={obj.label.offset || [0, 0.8, 0]}
            fontSize={0.28}
            color={obj.label.color || '#ffffff'}
            anchorX="center"
            anchorY="middle"
          >
            {obj.label.text}
          </Text>
        )}
      </group>
    );
  }

  return (
    <group position={position} rotation={rotation}>
      <mesh ref={meshRef} scale={scale} castShadow receiveShadow>
        {obj.type === 'sphere' && <sphereGeometry args={[0.5, 32, 32]} />}
        {obj.type === 'cylinder' && <cylinderGeometry args={[0.5, 0.5, 1, 28]} />}
        {obj.type === 'cone' && <coneGeometry args={[0.5, 1, 28]} />}
        {obj.type === 'torus' && <torusGeometry args={[0.5, 0.15, 16, 32]} />}
        {obj.type === 'box' && <boxGeometry args={[1, 1, 1]} />}
        <meshStandardMaterial {...matProps} />
      </mesh>

      {/* 3D Floating Label */}
      {obj.label?.text && (
        <Text
          ref={labelRef}
          position={obj.label.offset || [0, scale[1] / 2 + 0.4, 0]}
          fontSize={0.3}
          color={obj.label.color || '#ffffff'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#090d16"
        >
          {obj.label.text}
        </Text>
      )}
    </group>
  );
}

/**
 * NaturalLanguageSceneRenderer Component
 * Renders approved 3D scene elements parsed from verified JSON schema.
 */
export default function NaturalLanguageSceneRenderer({ scene }) {
  if (!scene || !Array.isArray(scene.objects)) {
    return (
      <group>
        <Text fontSize={0.4} color="#94a3b8" position={[0, 0, 0]}>
          No 3D scene loaded. Type a prompt above.
        </Text>
      </group>
    );
  }

  return (
    <>
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        maxDistance={40}
        minDistance={2}
      />

      {/* Lights */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
      <directionalLight position={[-10, -5, -5]} intensity={0.4} />

      {/* Ground Grid Floor */}
      <gridHelper args={[30, 30, '#334155', '#1e293b']} position={[0, -2, 0]} />

      {/* Render all validated scene objects */}
      <group>
        {scene.objects.map((obj) => (
          <ScenePrimitive key={obj.id} obj={obj} />
        ))}
      </group>
    </>
  );
}
