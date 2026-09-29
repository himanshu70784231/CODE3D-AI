import React from 'react';
import { Box, Maximize2, Minimize2, RotateCcw, ChevronDown, ChevronRight, Eye, Focus } from 'lucide-react';
import SceneContainer from '../visualizers/SceneContainer.jsx';

/**
 * CODE3D-AI - ScenePanel Component
 * Wraps 3D WebGL Scene in a dedicated IDE panel with viewport controls,
 * camera reset, theater mode toggle, and active step status badge.
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
  const statusLabel = currentStep?.dataStructureState?.label || null;
  const activeDetails = currentStep?.dataStructureState?.focusInfo || null;

  return (
    <div
      className={`flex flex-col h-full bg-[#08111f] border border-[#26364a] rounded-md overflow-hidden transition-colors ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : ''
      }`}
    >
      {/* 3D Scene Header Bar */}
      <div className="h-9 bg-[#0d1726] border-b border-[#26364a] px-3 flex items-center justify-between text-xs select-none shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded hover:bg-[#1e2f47] text-[#94a3b8] hover:text-[#f8fafc] transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand 3D Scene' : 'Collapse 3D Scene'}
            >
              {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
            </button>
          )}

          <Box size={14} className="text-[#14b8a6] shrink-0" />

          <span className="font-medium text-xs text-[#f8fafc] tracking-wide">
            3D Spatial Memory
          </span>

          {statusLabel && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101c2d] text-[#14b8a6] border border-[#14b8a6]/30 font-semibold truncate max-w-[200px]">
              {statusLabel}
            </span>
          )}
        </div>

        {/* 3D Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {activeDetails && (
            <span className="hidden md:inline-block text-[10px] text-[#94a3b8] font-mono truncate max-w-[150px]">
              {activeDetails}
            </span>
          )}

          {/* Fullscreen / Theater Mode */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-1 rounded hover:bg-[#1e2f47] text-[#94a3b8] hover:text-[#f8fafc] transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D Viewport'}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          )}
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      {!isCollapsed && (
        <div className="flex-1 relative overflow-hidden bg-[#08111f]">
          <SceneContainer
            currentStep={currentStep}
            code={code}
            statusLabel={statusLabel}
            activeDetails={activeDetails}
            correctOutput={correctOutput}
            isAtEnd={isAtEnd}
            cumulativeOutput={cumulativeOutput}
            isFull3DView={isFullscreen}
            onToggleFull3D={onToggleFullscreen}
            onSelectElement={onSelectElement}
          >
            {children}
          </SceneContainer>
        </div>
      )}
    </div>
  );
}

export default ScenePanel;
