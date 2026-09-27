import React from 'react';
import { getVisualizerComponent, visualizerRegistry } from './visualizerRegistry';

export default function DsaSceneDispatcher({ dataStructureState, isXRayMode = false, onSelectElement = null }) {
  if (!dataStructureState) return null;

  const rawType = dataStructureState.type ? dataStructureState.type.toLowerCase() : 'array';

  // Check for registers / universal procedural state fallback
  if (
    (rawType === 'universal-execution' || rawType === 'registers' || rawType === 'universal') ||
    (dataStructureState.variables && Object.keys(dataStructureState.variables).length > 0 && (!dataStructureState.values || dataStructureState.values.length === 0))
  ) {
    const UniversalVis = visualizerRegistry.universal;
    return <UniversalVis dataStructureState={dataStructureState} isXRayMode={isXRayMode} onSelectElement={onSelectElement} />;
  }

  const VisualizerComponent = getVisualizerComponent(rawType);
  return <VisualizerComponent dataStructureState={dataStructureState} isXRayMode={isXRayMode} onSelectElement={onSelectElement} />;
}

export { visualizerRegistry };
