import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Reusable Panel Header with title, icon, actions, and badge
 */
export default function PanelHeader({
  icon: Icon,
  title,
  subtitle,
  badge,
  actions,
  className = '',
}) {
  const { isBright } = useTheme();

  return (
    <div
      className={`h-9 px-3 border-b flex items-center justify-between select-none shrink-0 ${
        isBright
          ? 'bg-stone-50 border-stone-200 text-stone-800'
          : 'bg-[#13161b] border-stone-800/90 text-stone-200'
      } ${className}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon size={14} className="text-amber-500 shrink-0" />}
        <span className="text-xs font-semibold tracking-wide truncate">{title}</span>
        {subtitle && (
          <span className={`text-[11px] truncate hidden sm:inline ${isBright ? 'text-stone-500' : 'text-stone-400'}`}>
            ({subtitle})
          </span>
        )}
        {badge}
      </div>

      {actions && <div className="flex items-center gap-1 shrink-0">{actions}</div>}
    </div>
  );
}
