import React, { Suspense, useRef, useState, useCallback } from 'react';
import SceneContainer from '../../visualizers/SceneContainer';
import DsaSceneDispatcher from '../../visualizers/DsaSceneDispatcher';
import Dsa2DFallback from '../../visualizers/Dsa2DFallback';
import { VisualizerErrorBoundary } from '../../components/ErrorBoundaries';
import { useTheme } from '../../context/ThemeContext';
import { Badge } from '../../components/common';
import { Layers, Box } from 'lucide-react';

/**
 * VisualizationViewport Component
 * 
 * Compliant with Section 7, 8, 9, 10 & 33 specification:
 * - 3D WebGL Canvas host with React Three Fiber
 * - 2D Accessible SVG view toggle for screen readers and low-spec devices
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
  const [viewMode, setViewMode] = useState('3d'); // '3d' | '2d'
  const dsState = currentStep?.dataStructureState || currentStep?.dataStructure || { type: 'array', values: [] };
  const dsType = dsState?.type || 'array';

  return (
    <div className="h-full w-full flex flex-col overflow-hidden relative select-none">
      {/* Viewport Top Badge & 2D/3D Switcher Overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <Badge variant="amber" size="xs" mono dot>
          {String(dsType).toUpperCase()} {viewMode.toUpperCase()}
        </Badge>
        {dsState?.label && (
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded border backdrop-blur-sm hidden sm:inline ${
            isBright
              ? 'bg-white/80 border-stone-200 text-stone-700'
              : 'bg-stone-900/80 border-stone-800 text-stone-300'
          }`}>
            {dsState.label}
          </span>
        )}

        {/* 2D / 3D Mode Toggle Switch */}
        <button
          type="button"
          onClick={() => setViewMode((m) => (m === '3d' ? '2d' : '3d'))}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium border backdrop-blur-md transition shadow-xs cursor-pointer ${
            viewMode === '2d'
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
              : isBright
                ? 'bg-white/80 border-stone-200 text-stone-700 hover:text-amber-600'
                : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:text-amber-400'
          }`}
          title={viewMode === '3d' ? 'Switch to Accessible 2D View' : 'Switch to Interactive 3D WebGL'}
        >
          {viewMode === '3d' ? <Box size={11} /> : <Layers size={11} />}
          <span>{viewMode === '3d' ? '2D View' : '3D View'}</span>
        </button>
      </div>

      <VisualizerErrorBoundary>
        {viewMode === '2d' ? (
          <div className="w-full h-full pt-10 overflow-auto">
            <Dsa2DFallback currentStep={currentStep} onSelectElement={onSelectElement} />
          </div>
        ) : (
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
        )}
      </VisualizerErrorBoundary>
    </div>
  );
}
