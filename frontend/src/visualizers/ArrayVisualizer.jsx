import React from 'react';
import ArrayVisualizer3D from './ArrayVisualizer3D.jsx';
import ArrayCell from './ArrayCell.jsx';
import IndexPointer from './IndexPointer.jsx';

/**
 * CODE3D-AI - ArrayVisualizer
 * Modular 3D Array visualization component.
 * Integrates ArrayCell, IndexPointer, and the full interactive 3D Array engine.
 */
export function ArrayVisualizer({ dataStructureState, onSelectElement, ...restProps }) {
  return (
    <ArrayVisualizer3D
      dataStructureState={dataStructureState}
      onSelectElement={onSelectElement}
      {...restProps}
    />
  );
}

export { ArrayCell, IndexPointer, ArrayVisualizer3D };
export default ArrayVisualizer;
