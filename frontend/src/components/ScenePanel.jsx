import React from 'react';
import {
  Box,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronRight,
  Compass,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import SceneContainer from '../visualizers/SceneContainer.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

/**
 * CODE3D-AI - ScenePanel Component
 * Wraps 3D WebGL Scene in a clean architectural viewport with telemetry.
 */
export function ScenePanel({
  currentStep,
  code,
  correctOutput = null,
  isAtEnd = false,
  cumulativeOutput = [],
  onSelectElement = null,
  isCollapsed = false,
  onToggleCollapse = null,
  isFullscreen = false,
  onToggleFullscreen = null,
  children,
}) {
  const { isBright, currentAccent } = useTheme();
  const statusLabel = currentStep?.dataStructureState?.label || null;
  const activeDetails = currentStep?.dataStructureState?.focusInfo || null;

  const accentHex = isBright ? currentAccent.bright : currentAccent.dark;

  return (
    <div
      className={`flex flex-col h-full overflow-hidden transition-colors ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : ''
      } ${
        isBright
          ? 'bg-[#f7f6f3]'
          : 'bg-[#0e1013]'
      }`}
    >
      {/* 3D Scene Header Bar */}
      <div
        className={`h-8.5 border-b px-3 flex items-center justify-between text-xs select-none shrink-0 transition-colors ${
          isBright
            ? 'bg-[#f7f5f0] border-[#e2ded5] text-stone-800'
            : 'bg-[#14171d] border-[#242831] text-stone-100'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`p-1 rounded transition-colors cursor-pointer ${
                isBright ? 'hover:bg-stone-200 text-stone-600' : 'hover:bg-stone-800 text-stone-400'
              }`}
              title={isCollapsed ? 'Expand 3D Scene' : 'Collapse 3D Scene'}
            >
              {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
            </button>
          )}

          <Box size={13} className="text-amber-500 shrink-0" />

          <span
            className={`font-bold text-xs tracking-wide ${
              isBright ? 'text-stone-900' : 'text-stone-100'
            }`}
          >
            3D Spatial Memory
          </span>

          {statusLabel && (
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded font-bold border truncate max-w-[200px]"
              style={{
                backgroundColor: `${accentHex}15`,
                borderColor: `${accentHex}40`,
                color: accentHex,
              }}
            >
              {statusLabel}
            </span>
          )}
        </div>

        {/* 3D Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {activeDetails && (
            <span
              className={`hidden md:inline-block text-[10px] font-mono truncate max-w-[150px] ${
                isBright ? 'text-stone-500' : 'text-stone-400'
              }`}
            >
              {activeDetails}
            </span>
          )}

          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className={`p-1 rounded cursor-pointer ${
                isBright ? 'hover:bg-stone-200 text-stone-600' : 'hover:bg-stone-800 text-stone-300'
              }`}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D View'}
            >
              {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </button>
          )}
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        <SceneContainer
          currentStep={currentStep}
          correctOutput={correctOutput}
          isAtEnd={isAtEnd}
          cumulativeOutput={cumulativeOutput}
          onSelectElement={onSelectElement}
          onToggleFull3D={onToggleFullscreen}
          isFull3DView={isFullscreen}
        >
          {children}
        </SceneContainer>
      </div>
    </div>
  );
}

export default ScenePanel;
