import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Reusable Design System Button
 * 
 * Supports:
 * - Variants: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 * - Sizes: 'xs' | 'sm' | 'md' | 'lg'
 * - Accessible focus rings, hover/active states, loading spinner, disabled state.
 */
export default function Button({
  children,
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  title,
  ariaLabel,
  ...props
}) {
  const { isBright } = useTheme();

  const sizeClasses = {
    xs: 'h-6 px-2 text-[11px] gap-1 rounded-md',
    sm: 'h-7 px-2.5 text-xs gap-1.5 rounded-lg',
    md: 'h-8 px-3 text-xs gap-2 rounded-lg font-medium',
    lg: 'h-9 px-4 text-sm gap-2.5 rounded-xl font-medium',
  }[size] || 'h-8 px-3 text-xs gap-2 rounded-lg font-medium';

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return isBright
          ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs font-semibold'
          : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xs font-semibold';
      case 'outline':
        return isBright
          ? 'border border-stone-300 hover:bg-stone-100 text-stone-700'
          : 'border border-stone-800 hover:bg-stone-800/80 text-stone-200';
      case 'ghost':
        return isBright
          ? 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60';
      case 'danger':
        return 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-medium';
      case 'secondary':
      default:
        return isBright
          ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200'
          : 'bg-stone-800/70 hover:bg-stone-800 text-stone-200 border border-stone-700/60';
    }
  };

  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      title={title}
      aria-label={ariaLabel || title}
      className={`inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 ${sizeClasses} ${getVariantClasses()} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        Icon && iconPosition === 'left' && <Icon size={size === 'xs' ? 12 : size === 'lg' ? 16 : 14} className="shrink-0" />
      )}
      {children && <span>{children}</span>}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon size={size === 'xs' ? 12 : size === 'lg' ? 16 : 14} className="shrink-0" />
      )}
    </button>
  );
}
