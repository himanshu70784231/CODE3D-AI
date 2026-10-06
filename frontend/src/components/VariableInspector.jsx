import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Cpu, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function inferType(val) {
  if (val === null) return 'null';
  if (val === undefined) return 'void';
  if (typeof val === 'boolean') return 'boolean';
  if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'double';
  if (typeof val === 'string') return 'String';
  if (Array.isArray(val)) {
    if (val.length === 0) return 'int[]';
    return `${inferType(val[0])}[]`;
  }
  if (typeof val === 'object') {
    if (val.__type) return val.__type;
    return 'Object';
  }
  return typeof val;
}

function formatValue(val) {
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'string') return `"${val}"`;
  if (Array.isArray(val)) return `[${val.join(', ')}]`;
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

export default function VariableInspector({ variables = {}, scope = 'main', changedVariable = null, onSelectVariable = null }) {
  const { isBright } = useTheme();
  const [expandedArrays, setExpandedArrays] = useState({});

  const toggleArray = (name) => {
    setExpandedArrays((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const entries = Object.entries(variables || {});

  return (
    <div className="space-y-2 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-inherit">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 font-mono uppercase tracking-wider">
          <Cpu size={13} />
          <span>Variables</span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-inherit opacity-75">
          scope: {scope}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="py-3 text-center text-stone-500 text-xs italic font-mono">
          No variables initialized in current frame.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-inherit text-[10px] uppercase tracking-wider text-stone-500">
                <th className="py-1 px-1 font-semibold">Identifier</th>
                <th className="py-1 px-1 font-semibold">Type</th>
                <th className="py-1 px-1 font-semibold text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {entries.map(([name, val]) => {
                const isChanged = changedVariable === name;
                const isArray = Array.isArray(val);
                const isExpanded = expandedArrays[name];
                const typeStr = inferType(val);
                const valStr = formatValue(val);

                return (
                  <React.Fragment key={name}>
                    <tr
                      onClick={() => onSelectVariable && onSelectVariable(name, val)}
                      className={`transition-colors cursor-pointer ${
                        isChanged
                          ? isBright
                            ? 'bg-amber-100/60 text-amber-950 font-bold'
                            : 'bg-amber-500/15 text-amber-200 font-bold'
                          : isBright
                            ? 'hover:bg-stone-50 text-stone-800'
                            : 'hover:bg-stone-800/40 text-stone-200'
                      }`}
                      title="Click to highlight variable in 3D"
                    >
                      <td className="py-1.5 px-1 font-bold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isArray ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleArray(name);
                              }}
                              className="text-stone-400 hover:text-amber-500 cursor-pointer"
                            >
                              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            </button>
                          ) : (
                            <span className="w-3" />
                          )}
                          <span className={isChanged ? 'text-amber-500' : ''}>{name}</span>
                          {isChanged && (
                            <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-400 font-normal">
                              mutated
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-1.5 px-1 opacity-70 whitespace-nowrap text-[11px]">
                        {typeStr}
                      </td>
                      <td className="py-1.5 px-1 text-right font-bold whitespace-nowrap">
                        <span className={isChanged ? 'text-amber-400' : ''}>{valStr}</span>
                      </td>
                    </tr>

                    {/* Array Expanded View */}
                    {isArray && isExpanded && (
                      <tr>
                        <td colSpan={3} className="py-1.5 pl-6 pr-2 bg-stone-900/20 dark:bg-stone-950/40">
                          <div className="flex flex-wrap gap-1">
                            {val.map((item, idx) => (
                              <div
                                key={idx}
                                className={`px-1.5 py-0.5 rounded text-[10px] border ${
                                  isBright
                                    ? 'bg-white border-stone-200 text-stone-800'
                                    : 'bg-[#181c22] border-stone-700 text-stone-200'
                                }`}
                              >
                                <span className="opacity-60 font-mono">[{idx}]:</span>{' '}
                                <span className="font-bold">{formatValue(item)}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
