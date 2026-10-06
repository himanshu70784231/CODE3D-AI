import React from 'react';
import { ChevronDown, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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
  const { isBright } = useTheme();

  return (
    <div
      className={`flex flex-col overflow-hidden border rounded-lg transition-colors ${
        isBright
          ? 'bg-[#fcfbf9] border-[#e2dfd8] text-stone-800'
          : 'bg-[#13161b] border-[#252932] text-stone-100'
      } ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : ''
      } ${className}`}
    >
      {/* Panel Header */}
      <div
        className={`h-8 px-3 border-b flex items-center justify-between text-xs font-semibold select-none shrink-0 ${
          isBright
            ? 'bg-[#f7f6f3] border-[#e2dfd8] text-stone-800'
            : 'bg-[#181c23] border-[#252932] text-stone-100'
        } ${headerClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`p-0.5 rounded transition-colors cursor-pointer ${
                isBright ? 'hover:bg-stone-200 text-stone-500 hover:text-stone-900' : 'hover:bg-[#252932] text-stone-400 hover:text-stone-100'
              }`}
              title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
              aria-label={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
          )}

          {Icon && <Icon size={13} className="text-amber-500 shrink-0" />}

          <span className="truncate text-xs font-medium tracking-wide">
            {title}
          </span>

          {badge && (
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
              isBright ? 'bg-stone-100 text-stone-600 border-[#e2dfd8]' : 'bg-[#0e1013] text-stone-400 border-[#252932]'
            }`}>
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
              className={`p-1 rounded transition-colors cursor-pointer ${
                isBright ? 'hover:bg-stone-200 text-stone-500 hover:text-stone-900' : 'hover:bg-[#252932] text-stone-400 hover:text-stone-100'
              }`}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </button>
          )}
        </div>
      </div>

      {/* Panel Body */}
      {!isCollapsed && (
        <div className={`flex-1 overflow-auto ${bodyClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
}

export default Panel;
