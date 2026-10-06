import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Reusable Accessible Tabs Component
 */
export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pills', // 'pills' | 'underline'
  size = 'sm',
  className = '',
}) {
  const { isBright } = useTheme();

  return (
    <div
      role="tablist"
      className={`flex items-center gap-1 select-none ${
        variant === 'underline'
          ? `border-b ${isBright ? 'border-stone-200' : 'border-stone-800'}`
          : ''
      } ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        if (variant === 'underline') {
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`pb-2 px-3 text-xs font-medium border-b-2 -mb-px transition-colors cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? isBright
                    ? 'border-amber-600 text-stone-900 font-semibold'
                    : 'border-amber-500 text-amber-400 font-semibold'
                  : isBright
                    ? 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
                    : 'border-transparent text-stone-400 hover:text-stone-200 hover:border-stone-700'
              }`}
            >
              {Icon && <Icon size={13} />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-800 text-stone-400'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        }

        // Pills variant
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              isActive
                ? isBright
                  ? 'bg-stone-200/80 text-stone-900 font-semibold'
                  : 'bg-stone-800 text-stone-100 font-semibold'
                : isBright
                  ? 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
            }`}
          >
            {Icon && <Icon size={13} />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-800 text-stone-400'}`}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
