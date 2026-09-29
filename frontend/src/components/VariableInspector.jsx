import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Cpu, Sparkles, Hash, Type, Brackets } from 'lucide-react';
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

export default function VariableInspector({ variables = {}, scope = 'main', changedVariable = null }) {
  const { isBright } = useTheme();
  const [expandedArrays, setExpandedArrays] = useState({});

  const toggleArray = (name) => {
    setExpandedArrays((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const entries = Object.entries(variables || {});

  return (
    <div className={`p-3.5 rounded-xl border select-none transition-colors ${
      isBright ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
          <Cpu size={14} />
          <span>Variables Panel</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
          scope: {scope}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="py-4 text-center text-slate-500 text-xs italic font-mono">
          No variables initialized in current frame.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className={`border-b text-[10px] uppercase tracking-wider ${
                isBright ? 'text-slate-500 border-slate-200' : 'text-slate-400 border-slate-800'
              }`}>
                <th className="py-1.5 px-2 font-semibold">Variable</th>
                <th className="py-1.5 px-2 font-semibold">Type</th>
                <th className="py-1.5 px-2 font-semibold">Value</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isBright ? 'divide-slate-100' : 'divide-slate-800/60'}`}>
              {entries.map(([name, val]) => {
                const isChanged = changedVariable === name;
                const isArray = Array.isArray(val);
                const isExpanded = expandedArrays[name];
                const typeStr = inferType(val);
                const valStr = formatValue(val);

                return (
                  <React.Fragment key={name}>
                    <tr
                      className={`transition-colors ${
                        isChanged
                          ? isBright
                            ? 'bg-amber-50 text-amber-900 font-semibold'
                            : 'bg-amber-500/15 text-amber-200 font-semibold'
                          : isBright
                            ? 'hover:bg-slate-50 text-slate-800'
                            : 'hover:bg-slate-800/30 text-slate-200'
                      }`}
                    >
                      {/* Variable Name */}
                      <td className="py-1.5 px-2 font-bold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isArray ? (
                            <button
                              onClick={() => toggleArray(name)}
                              className="text-slate-400 hover:text-white cursor-pointer"
                              title="Toggle array elements"
                            >
                              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            </button>
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                          )}
                          <span className={isChanged ? 'text-amber-400' : 'text-slate-200'}>{name}</span>
                          {isChanged && (
                            <span className="text-[9px] px-1 py-0.2 rounded font-sans font-bold bg-amber-500 text-slate-950 animate-pulse">
                              UPDATED
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-1.5 px-2 whitespace-nowrap">
                        <span className={`text-[11px] px-1.5 py-0.5 rounded font-mono ${
                          isBright ? 'bg-slate-100 text-slate-700' : 'bg-slate-800/80 text-cyan-300'
                        }`}>
                          {typeStr}
                        </span>
                      </td>

                      {/* Value */}
                      <td className="py-1.5 px-2 font-bold">
                        <span className={isChanged ? 'text-amber-300' : 'text-emerald-400'}>
                          {valStr}
                        </span>
                      </td>
                    </tr>

                    {/* Expandable array slots */}
                    {isArray && isExpanded && (
                      <tr>
                        <td colSpan={3} className="py-1.5 px-4 bg-slate-950/40 border-l-2 border-cyan-500">
                          <div className="space-y-1 text-[11px]">
                            {val.map((elem, slotIdx) => (
                              <div key={slotIdx} className="flex items-center justify-between text-slate-400">
                                <span>[{slotIdx}]:</span>
                                <span className="font-bold text-slate-200">{formatValue(elem)}</span>
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
