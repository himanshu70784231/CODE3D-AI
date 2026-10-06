import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Reusable Design System Badge
 */
export default function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  mono = false,
  dot = false,
  className = '',
}) {
  const { isBright } = useTheme();

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
  }[size] || 'px-2 py-0.5 text-xs';

  const getVariantClasses = () => {
    switch (variant) {
      case 'amber':
        return isBright
          ? 'bg-amber-50 text-amber-800 border-amber-200'
          : 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'emerald':
        return isBright
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'rose':
        return isBright
          ? 'bg-rose-50 text-rose-800 border-rose-200'
          : 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'neutral':
      default:
        return isBright
          ? 'bg-stone-100 text-stone-700 border-stone-200'
          : 'bg-stone-800 text-stone-300 border-stone-700/60';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border font-medium select-none ${mono ? 'font-mono' : ''} ${sizeClasses} ${getVariantClasses()} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'amber'
              ? 'bg-amber-500 animate-pulse'
              : variant === 'emerald'
                ? 'bg-emerald-500'
                : variant === 'rose'
                  ? 'bg-rose-500'
                  : 'bg-stone-400'
          }`}
        />
      )}
      <span>{children}</span>
    </span>
  );
}
