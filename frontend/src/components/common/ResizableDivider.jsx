import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Reusable Draggable Resizer Handle for Multi-Panel Layouts
 */
export default function ResizableDivider({
  orientation = 'vertical', // 'vertical' | 'horizontal'
  onResize,
  onReset,
  className = '',
}) {
  const { isBright } = useTheme();
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      onResize(e);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = orientation === 'vertical' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, onResize, orientation]);

  const isVertical = orientation === 'vertical';

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation={orientation}
      onMouseDown={handleMouseDown}
      onDoubleClick={onReset}
      className={`relative group shrink-0 transition-colors select-none ${
        isVertical
          ? 'w-1.5 hover:w-1.5 cursor-col-resize h-full'
          : 'h-1.5 hover:h-1.5 cursor-row-resize w-full'
      } ${
        isDragging
          ? 'bg-amber-500'
          : isBright
            ? 'bg-stone-200 hover:bg-amber-400'
            : 'bg-stone-800/80 hover:bg-amber-500/70'
      } ${className}`}
      title="Drag to resize, double-click to reset"
    >
      {/* Central Grip Indicator */}
      <div
        className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
          isDragging ? 'opacity-100' : ''
        }`}
      >
        <div
          className={`${
            isVertical ? 'w-0.5 h-6' : 'h-0.5 w-6'
          } rounded-full bg-amber-400`}
        />
      </div>
    </div>
  );
}
