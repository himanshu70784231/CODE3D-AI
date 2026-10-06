import React, { useState, useEffect, useRef, useCallback } from 'react';
import ResizableDivider from '../../components/common/ResizableDivider';
import { useTheme } from '../../context/ThemeContext';
import { Code2, Box, Info, Terminal } from 'lucide-react';

const STORAGE_KEY = 'code3d_workspace_layout_v2';
const DEFAULT_SPLIT = { left: 30, center: 45, right: 25 };

/**
 * ThreePanelWorkspace Component
 * 
 * Compliant with Section 4 & 22 specification:
 * - Desktop: 3-column resizable layout (Code | 3D | Explanation) with draggable splitters.
 * - Mobile (<768px): Tabbed layout (one major panel visible at a time).
 * - Persists layout preferences to localStorage.
 * - Focus & Fullscreen modes without layout jumping.
 */
export default function ThreePanelWorkspace({
  codePanel,
  scenePanel,
  explanationPanel,
  consoleDrawer,
  showConsole = false,
  viewMode = 'default', // 'default' | 'fullscreen3d' | 'focusCode' | 'focusExplanation'
  onViewModeChange,
}) {
  const { isBright } = useTheme();
  const containerRef = useRef(null);

  // Load layout from localStorage or default
  const [widths, setWidths] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.left && parsed.center && parsed.right) {
          const sum = parsed.left + parsed.center + parsed.right;
          if (Math.abs(sum - 100) < 1) return parsed;
        }
      }
    } catch {}
    return DEFAULT_SPLIT;
  });

  // Mobile active tab: '3d' | 'code' | 'explanation' | 'console'
  const [mobileTab, setMobileTab] = useState('3d');
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save to localStorage when widths change in default mode
  const saveWidths = useCallback((newWidths) => {
    setWidths(newWidths);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWidths));
    } catch {}
  }, []);

  // Reset layout to 30% | 45% | 25%
  const handleResetLayout = useCallback(() => {
    saveWidths(DEFAULT_SPLIT);
    if (onViewModeChange) onViewModeChange('default');
  }, [saveWidths, onViewModeChange]);

  // Handle Drag Divider 1 (between Left and Center)
  const handleResizeDivider1 = useCallback(
    (e) => {
      if (!containerRef.current || viewMode !== 'default') return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const totalWidth = rect.width;
      if (totalWidth <= 0) return;

      const newLeft = Math.max(18, Math.min(50, (currentX / totalWidth) * 100));
      const remaining = 100 - newLeft;
      const currentRightRatio = widths.right / (widths.center + widths.right || 1);
      const newRight = Math.max(18, Math.min(45, remaining * currentRightRatio));
      const newCenter = Math.max(25, 100 - newLeft - newRight);

      saveWidths({ left: newLeft, center: newCenter, right: newRight });
    },
    [widths, saveWidths, viewMode]
  );

  // Handle Drag Divider 2 (between Center and Right)
  const handleResizeDivider2 = useCallback(
    (e) => {
      if (!containerRef.current || viewMode !== 'default') return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const totalWidth = rect.width;
      if (totalWidth <= 0) return;

      const rightWidthPx = rect.right - e.clientX;
      const newRight = Math.max(18, Math.min(45, (rightWidthPx / totalWidth) * 100));
      const remaining = 100 - newRight;
      const currentLeftRatio = widths.left / (widths.left + widths.center || 1);
      const newLeft = Math.max(18, Math.min(50, remaining * currentLeftRatio));
      const newCenter = Math.max(25, 100 - newLeft - newRight);

      saveWidths({ left: newLeft, center: newCenter, right: newRight });
    },
    [widths, saveWidths, viewMode]
  );

  // Calculate actual rendered column percentages based on viewMode
  const getRenderWidths = () => {
    if (viewMode === 'fullscreen3d') {
      return { left: 0, center: 100, right: 0 };
    }
    if (viewMode === 'focusCode') {
      return { left: 62, center: 38, right: 0 };
    }
    if (viewMode === 'focusExplanation') {
      return { left: 0, center: 50, right: 50 };
    }
    return widths;
  };

  const renderWidths = getRenderWidths();

  // Mobile View
  if (isMobile) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden w-full relative">
        {/* Mobile Tab Switcher */}
        <div
          className={`h-10 px-2 border-b flex items-center justify-around shrink-0 select-none ${
            isBright ? 'bg-stone-100 border-stone-200' : 'bg-stone-900 border-stone-800'
          }`}
        >
          <button
            type="button"
            onClick={() => setMobileTab('3d')}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-medium cursor-pointer transition ${
              mobileTab === '3d'
                ? isBright
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'bg-stone-800 text-amber-400 shadow-xs'
                : isBright
                  ? 'text-stone-600'
                  : 'text-stone-400'
            }`}
          >
            <Box size={14} />
            <span>3D View</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('code')}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-medium cursor-pointer transition ${
              mobileTab === 'code'
                ? isBright
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'bg-stone-800 text-amber-400 shadow-xs'
                : isBright
                  ? 'text-stone-600'
                  : 'text-stone-400'
            }`}
          >
            <Code2 size={14} />
            <span>Editor</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('explanation')}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-medium cursor-pointer transition ${
              mobileTab === 'explanation'
                ? isBright
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'bg-stone-800 text-amber-400 shadow-xs'
                : isBright
                  ? 'text-stone-600'
                  : 'text-stone-400'
            }`}
          >
            <Info size={14} />
            <span>State</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('console')}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-medium cursor-pointer transition ${
              mobileTab === 'console'
                ? isBright
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'bg-stone-800 text-amber-400 shadow-xs'
                : isBright
                  ? 'text-stone-600'
                  : 'text-stone-400'
            }`}
          >
            <Terminal size={14} />
            <span>Output</span>
          </button>
        </div>

        {/* Mobile Viewport Body: Exactly ONE active tab rendered */}
        <div className="flex-1 overflow-hidden relative">
          <div className={`h-full w-full ${mobileTab === '3d' ? 'block' : 'hidden'}`}>
            {scenePanel}
          </div>
          <div className={`h-full w-full ${mobileTab === 'code' ? 'block' : 'hidden'}`}>
            {codePanel}
          </div>
          <div className={`h-full w-full overflow-y-auto ${mobileTab === 'explanation' ? 'block' : 'hidden'}`}>
            {explanationPanel}
          </div>
          <div className={`h-full w-full overflow-y-auto ${mobileTab === 'console' ? 'block' : 'hidden'}`}>
            {consoleDrawer}
          </div>
        </div>
      </div>
    );
  }

  // Desktop 3-Panel Studio
  return (
    <div
      ref={containerRef}
      className={`flex-1 flex flex-col overflow-hidden w-full relative ${
        isBright ? 'bg-[#f7f6f3]' : 'bg-[#0e1013]'
      }`}
    >
      <div className="flex-1 flex overflow-hidden w-full relative">
        {/* Left: Code Panel */}
        {renderWidths.left > 0 && (
          <div
            style={{ width: `${renderWidths.left}%` }}
            className="h-full flex flex-col overflow-hidden shrink-0 border-r border-stone-800/60"
          >
            {codePanel}
          </div>
        )}

        {/* Resizer 1 */}
        {renderWidths.left > 0 && renderWidths.center > 0 && viewMode === 'default' && (
          <ResizableDivider
            orientation="vertical"
            onResize={handleResizeDivider1}
            onReset={handleResetLayout}
          />
        )}

        {/* Center: 3D Visualization Viewport */}
        {renderWidths.center > 0 && (
          <div
            style={{ width: `${renderWidths.center}%` }}
            className="h-full flex flex-col overflow-hidden shrink-0 relative"
          >
            {scenePanel}
          </div>
        )}

        {/* Resizer 2 */}
        {renderWidths.center > 0 && renderWidths.right > 0 && viewMode === 'default' && (
          <ResizableDivider
            orientation="vertical"
            onResize={handleResizeDivider2}
            onReset={handleResetLayout}
          />
        )}

        {/* Right: Explanation & State Inspector */}
        {renderWidths.right > 0 && (
          <div
            style={{ width: `${renderWidths.right}%` }}
            className="h-full flex flex-col overflow-hidden shrink-0 border-l border-stone-800/60"
          >
            {explanationPanel}
          </div>
        )}
      </div>

      {/* Optional Docked Bottom Output Console */}
      {showConsole && consoleDrawer && (
        <div className="h-44 border-t border-stone-800/80 shrink-0 flex flex-col overflow-hidden">
          {consoleDrawer}
        </div>
      )}
    </div>
  );
}
