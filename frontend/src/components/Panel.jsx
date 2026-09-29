import React from 'react';
import { ChevronDown, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

/**
 * CODE3D-AI - Standard IDE Panel Component
 * Features collapsible header, fullscreen toggle, badges, and action slots.
 */
export function Panel({
  title,
  icon: Icon,
  badge = null,
  isCollapsed = false,
  onToggleCollapse = null,
  isFullscreen = false,
  onToggleFullscreen = null,
  actions = null,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  children,
}) {
  return (
    <div
      className={`flex flex-col overflow-hidden bg-[#101c2d] border border-[#26364a] rounded-md transition-colors ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : ''
      } ${className}`}
    >
      {/* Panel Header */}
      <div
        className={`h-9 px-3 bg-[#142338] border-b border-[#26364a] flex items-center justify-between text-xs font-semibold text-[#f8fafc] select-none shrink-0 ${headerClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-0.5 rounded hover:bg-[#1e2f47] text-[#94a3b8] hover:text-[#f8fafc] transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
              aria-label={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
          )}

          {Icon && <Icon size={14} className="text-[#3b82f6] shrink-0" />}

          <span className="truncate text-xs font-medium tracking-wide">
            {title}
          </span>

          {badge && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1e2f47] text-[#94a3b8] border border-[#26364a]">
              {badge}
            </span>
          )}
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {actions}

          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-1 rounded hover:bg-[#1e2f47] text-[#94a3b8] hover:text-[#f8fafc] transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          )}
        </div>
      </div>

      {/* Panel Body */}
      {!isCollapsed && (
        <div className={`flex-1 overflow-auto bg-[#101c2d] ${bodyClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
}

export default Panel;
