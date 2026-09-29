import React, { useState, useCallback } from 'react';

/**
 * CODE3D-AI - Drag-to-Resize Handle
 * 
 * Provides smooth, physical drag-to-resize behavior using PointerEvents.
 * Dispatches window resize events on requestAnimationFrame to ensure Monaco Editor
 * and Three.js WebGL canvas adapt fluidly without geometry distortion or mouse release loss.
 */
export function ResizeHandle({
  orientation = 'horizontal', // 'horizontal' (divides left/right, drags X) or 'vertical' (divides top/bottom, drags Y)
  onResize,
  onResizeStart,
  onResizeEnd,
  className = '',
  title = 'Drag to resize panel',
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    setIsDragging(true);
    if (onResizeStart) onResizeStart();

    document.body.style.userSelect = 'none';
    document.body.style.cursor = orientation === 'horizontal' ? 'col-resize' : 'row-resize';

    let rafId = null;

    const handlePointerMove = (moveEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (onResize) {
          onResize(moveEvent);
          window.dispatchEvent(new Event('resize'));
        }
      });
    };

    const handlePointerUp = (upEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';

      try {
        target.releasePointerCapture(upEvent.pointerId);
      } catch {}

      target.removeEventListener('pointermove', handlePointerMove);
      target.removeEventListener('pointerup', handlePointerUp);
      target.removeEventListener('pointercancel', handlePointerUp);

      if (onResizeEnd) onResizeEnd();
      window.dispatchEvent(new Event('resize'));
    };

    target.addEventListener('pointermove', handlePointerMove);
    target.addEventListener('pointerup', handlePointerUp);
    target.addEventListener('pointercancel', handlePointerUp);
  }, [orientation, onResize, onResizeStart, onResizeEnd]);

  if (orientation === 'horizontal') {
    return (
      <div
        onPointerDown={handlePointerDown}
        className={`resize-handle-h group relative flex items-center justify-center ${isDragging ? 'active' : ''} ${className}`}
        title={title}
        role="separator"
        aria-orientation="vertical"
      >
        {/* Subtle grip line */}
        <div className="w-[2px] h-6 rounded-full bg-slate-500/50 group-hover:bg-blue-400 group-hover:scale-y-125 transition-all" />
      </div>
    );
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      className={`resize-handle-v group relative flex items-center justify-center ${isDragging ? 'active' : ''} ${className}`}
      title={title}
      role="separator"
      aria-orientation="horizontal"
    >
      {/* Subtle grip line */}
      <div className="h-[2px] w-8 rounded-full bg-slate-500/50 group-hover:bg-blue-400 group-hover:scale-x-125 transition-all" />
    </div>
  );
}

export default ResizeHandle;
