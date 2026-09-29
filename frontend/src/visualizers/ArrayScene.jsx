import React, { useRef, useEffect } from 'react';
import ArrayVisualizer3D from './ArrayVisualizer3D.jsx';

/**
 * CODE3D-AI - ArrayScene
 * 
 * Wraps Array 3D visualizer with rigorous WebGL resource disposal routines.
 * Disposes all geometries, materials, and textures recursively on unmount
 * to prevent GPU memory leaks and WebGL context loss.
 */
export function ArrayScene({ dataStructureState, onSelectElement, ...restProps }) {
  const sceneRef = useRef(null);

  useEffect(() => {
    const root = sceneRef.current;
    return () => {
      if (!root) return;

      root.traverse((obj) => {
        if (!obj) return;

        // Dispose geometries
        if (obj.geometry && typeof obj.geometry.dispose === 'function') {
          obj.geometry.dispose();
        }

        // Dispose materials and textures
        if (obj.material) {
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          materials.forEach((mat) => {
            if (!mat) return;
            // Dispose texture maps
            ['map', 'lightMap', 'bumpMap', 'normalMap', 'specularMap', 'envMap', 'alphaMap'].forEach((mapProp) => {
              if (mat[mapProp] && typeof mat[mapProp].dispose === 'function') {
                mat[mapProp].dispose();
              }
            });
            if (typeof mat.dispose === 'function') {
              mat.dispose();
            }
          });
        }
      });
    };
  }, []);

  return (
    <group ref={sceneRef}>
      <ArrayVisualizer3D
        dataStructureState={dataStructureState}
        onSelectElement={onSelectElement}
        {...restProps}
      />
    </group>
  );
}

export default ArrayScene;
