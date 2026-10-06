import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const POINTER_COLORS = {
  i: '#f59e0b', // sky blue
  j: '#f59e0b', // amber
  left: '#10b981', // emerald
  right: '#ef4444', // red
  start: '#a855f7', // purple
  end: '#ec4899', // pink
  pivot: '#eab308', // yellow
  curr: '#14b8a6', // teal
  mid: '#6366f1', // indigo
};

/**
 * CODE3D-AI - IndexPointer 3D Component
 * Renders an animated directional arrow pointing to a specific index slot.
 */
export function IndexPointer({
  name = 'i',
  position = [0, 1.4, 0],
  color = null,
}) {
  const arrowRef = useRef();
  const pointerColor = color || POINTER_COLORS[name] || '#f59e0b';

  // Subtle bounce animation
  useFrame((state) => {
    if (arrowRef.current) {
      arrowRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 5) * 0.08;
    }
  });

  return (
    <group ref={arrowRef} position={position}>
      {/* Pointer Name Label */}
      <Text
        position={[0, 0.45, 0]}
        fontSize={0.32}
        color={pointerColor}
        anchorX="center"
        anchorY="bottom"
        fontWeight="bold"
      >
        {name}
      </Text>

      {/* Downward Cone Arrow Head */}
      <mesh position={[0, 0.15, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.2, 0.35, 16]} />
        <meshStandardMaterial
          color={pointerColor}
          emissive={pointerColor}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Vertical Arrow Shaft */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.25, 8]} />
        <meshStandardMaterial
          color={pointerColor}
          emissive={pointerColor}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

export default IndexPointer;
