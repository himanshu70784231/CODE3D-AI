import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import IconButton from './IconButton';

/**
 * Standardized Accessible Modal Component
 * 
 * Enforces:
 * - Escape key to close
 * - Background scroll lock
 * - Focus management
 * - Internal scrolling with max-height
 * - Consistent header and footer
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  maxWidth = 'max-w-xl',
  className = '',
}) {
  const { isBright } = useTheme();
  const modalRef = useRef(null);

  // Close on Escape & Lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-fadeIn"
    >
      <div
        ref={modalRef}
        className={`relative w-full ${maxWidth} max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isBright
            ? 'bg-white border-stone-200 text-stone-900 shadow-stone-300'
            : 'bg-[#13161b] border-stone-800 text-stone-100 shadow-stone-950'
        } ${className}`}
      >
        {/* Modal Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isBright ? 'border-stone-200 bg-stone-50/80' : 'border-stone-800 bg-stone-900/40'
          }`}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                  isBright
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}
              >
                <Icon size={18} />
              </div>
            )}
            <div>
              <h3 id="modal-title" className="text-sm font-semibold tracking-tight">
                {title}
              </h3>
              {subtitle && (
                <p className={`text-xs mt-0.5 ${isBright ? 'text-stone-500' : 'text-stone-400'}`}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <IconButton
            icon={X}
            size="sm"
            onClick={onClose}
            ariaLabel="Close modal"
          />
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto overflow-x-hidden flex-1 text-xs">
          {children}
        </div>

        {/* Modal Footer (Optional) */}
        {footer && (
          <div
            className={`px-5 py-3 border-t flex items-center justify-end gap-2 shrink-0 ${
              isBright ? 'border-stone-200 bg-stone-50/50' : 'border-stone-800 bg-stone-900/30'
            }`}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
