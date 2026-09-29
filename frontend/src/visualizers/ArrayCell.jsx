import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * CODE3D-AI - ArrayCell 3D Component
 * Represents a single memory slot in a 3D Array visualization.
 */
export function ArrayCell({
  index,
  value,
  position = [0, 0, 0],
  isActive = false,
  isComparing = false,
  isSwapping = false,
  isSorted = false,
  colorOverride = null,
  onClick = null,
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Subtle floating pulsation for active cell
  useFrame((state) => {
    if (!meshRef.current) return;
    if (isActive) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.08;
    } else {
      meshRef.current.position.y = position[1];
    }
  });

  // Calculate base color based on execution state
  let cellColor = '#1e293b'; // default slate-800
  let emissiveColor = '#0f172a';
  let emissiveIntensity = 0.2;

  if (colorOverride) {
    cellColor = colorOverride;
    emissiveColor = colorOverride;
    emissiveIntensity = 0.6;
  } else if (isSwapping) {
    cellColor = '#f59e0b'; // amber
    emissiveColor = '#b45309';
    emissiveIntensity = 0.9;
  } else if (isComparing) {
    cellColor = '#3b82f6'; // primary blue
    emissiveColor = '#1d4ed8';
    emissiveIntensity = 0.8;
  } else if (isActive) {
    cellColor = '#14b8a6'; // secondary teal
    emissiveColor = '#0f766e';
    emissiveIntensity = 0.9;
  } else if (isSorted) {
    cellColor = '#22c55e'; // green
    emissiveColor = '#15803d';
    emissiveIntensity = 0.5;
  } else if (hovered) {
    cellColor = '#334155';
    emissiveIntensity = 0.4;
  }

  return (
    <group position={position}>
      {/* 3D Cell Box */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick(index, value);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[1.05, 1.05, 1.05]} />
        <meshStandardMaterial
          color={cellColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.25}
          metalness={0.2}
        />
      </mesh>

      {/* Wireframe border for high-tech aesthetic */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(1.06, 1.06, 1.06)]} />
        <lineBasicMaterial
          color={isActive ? '#14b8a6' : isComparing ? '#3b82f6' : isSwapping ? '#f59e0b' : '#334155'}
          linewidth={1}
        />
      </lineSegments>

      {/* Value Text (Front face) */}
      <Text
        position={[0, 0, 0.56]}
        fontSize={0.42}
        color={isActive || isComparing || isSwapping ? '#ffffff' : '#f8fafc'}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {String(value ?? '')}
      </Text>

      {/* Index Label (Below cell) */}
      <Text
        position={[0, -0.85, 0]}
        fontSize={0.28}
        color={isActive ? '#14b8a6' : '#94a3b8'}
        anchorX="center"
        anchorY="middle"
      >
        {`[${index}]`}
      </Text>
    </group>
  );
}

export default ArrayCell;
