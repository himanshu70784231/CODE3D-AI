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
          {/* Empty State Overlay when no program is loaded */}
          {(!code || !code.trim() || (!currentStep && !statusLabel)) && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-[#070b14]/80 backdrop-blur-xs text-center select-none pointer-events-auto">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 shadow-lg shadow-cyan-500/10 animate-pulse">
                <Box size={28} className="stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Your 3D workspace is waiting.</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-4">
                Paste code or select an algorithm template to generate your interactive 3D visualization.
              </p>
            </div>
          )}

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
