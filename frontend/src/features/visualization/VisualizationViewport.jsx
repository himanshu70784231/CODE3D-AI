import React, { Suspense, useRef, useState, useCallback } from 'react';
import SceneContainer from '../../visualizers/SceneContainer';
import DsaSceneDispatcher from '../../visualizers/DsaSceneDispatcher';
import { VisualizerErrorBoundary } from '../../components/ErrorBoundaries';
import { useTheme } from '../../context/ThemeContext';
import { Badge } from '../../components/common';
import { Layers } from 'lucide-react';

/**
 * VisualizationViewport Component
 * 
 * Compliant with Section 8, 9, 10 & 33 specification:
 * - 3D WebGL Canvas host
 * - Dynamic data structure dispatching
 * - Synchronized element hover and selection
 * - Safe error boundaries
 */
export default function VisualizationViewport({
  currentStep = null,
  currentStepIndex = 0,
  totalSteps = 1,
  onSelectElement = null,
  isFull3DView = false,
  onToggleFull3D = null,
}) {
  const { isBright } = useTheme();
  const dsState = currentStep?.dataStructureState || currentStep?.dataStructure || { type: 'array', values: [] };
  const dsType = dsState?.type || 'array';

  return (
    <div className="h-full w-full flex flex-col overflow-hidden relative select-none">
      {/* Viewport Top Badge Overlay */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none flex items-center gap-2">
        <Badge variant="amber" size="xs" mono dot>
          {String(dsType).toUpperCase()} 3D
        </Badge>
        {dsState?.label && (
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded border backdrop-blur-sm ${
            isBright
              ? 'bg-white/80 border-stone-200 text-stone-700'
              : 'bg-stone-900/80 border-stone-800 text-stone-300'
          }`}>
            {dsState.label}
          </span>
        )}
      </div>

      <VisualizerErrorBoundary>
        <SceneContainer
          currentStep={currentStep}
          isFull3DView={isFull3DView}
          onToggleFull3D={onToggleFull3D}
          onSelectElement={onSelectElement}
        >
          <DsaSceneDispatcher
            dataStructureState={dsState}
            onSelectElement={onSelectElement}
          />
        </SceneContainer>
      </VisualizerErrorBoundary>
    </div>
  );
}
