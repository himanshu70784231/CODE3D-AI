import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Reusable Icon-only button with built-in accessibility and tooltips
 */
export default function IconButton({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  active = false,
  disabled = false,
  title,
  ariaLabel,
  onClick,
  className = '',
  ...props
}) {
  const { isBright } = useTheme();

  const sizeClasses = {
    xs: 'w-6 h-6 rounded-md',
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-8 h-8 rounded-lg',
    lg: 'w-9 h-9 rounded-xl',
  }[size] || 'w-8 h-8 rounded-lg';

  const iconSizes = {
    xs: 12,
    sm: 14,
    md: 15,
    lg: 18,
  }[size] || 15;

  const getVariantClasses = () => {
    if (active) {
      return isBright
        ? 'bg-amber-100 text-amber-800 border border-amber-300'
        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    }

    switch (variant) {
      case 'primary':
        return isBright
          ? 'bg-amber-600 hover:bg-amber-700 text-white'
          : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold';
      case 'secondary':
        return isBright
          ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200'
          : 'bg-stone-800/80 hover:bg-stone-800 text-stone-200 border border-stone-700/60';
      case 'outline':
        return isBright
          ? 'border border-stone-300 hover:bg-stone-100 text-stone-700'
          : 'border border-stone-800 hover:bg-stone-800/80 text-stone-300';
      case 'ghost':
      default:
        return isBright
          ? 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
          : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/70';
    }
  };

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel || title}
      className={`inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 shrink-0 ${sizeClasses} ${getVariantClasses()} ${className}`}
      {...props}
    >
      {Icon && <Icon size={iconSizes} />}
    </button>
  );
}
