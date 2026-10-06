import React, { useState, useEffect, useRef } from 'react';
import { Cpu, ChevronRight, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

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
  if (typeof val === 'object') return 'Object';
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

export function VariablePanel({
  variables = {},
  scope = 'main',
  changedVariable = null,
  previousValue = null,
  onSelectVariable = null,
}) {
  const { isBright } = useTheme();
  const [expandedArrays, setExpandedArrays] = useState({});
  const prevVarsRef = useRef({});
  const [historyValues, setHistoryValues] = useState({});

  useEffect(() => {
    if (variables && typeof variables === 'object') {
      setHistoryValues((prevHistory) => {
        const nextHistory = { ...prevHistory };
        Object.entries(variables).forEach(([key, val]) => {
          if (prevVarsRef.current[key] !== undefined && prevVarsRef.current[key] !== val) {
            nextHistory[key] = prevVarsRef.current[key];
          }
        });
        return nextHistory;
      });
      prevVarsRef.current = { ...variables };
    }
  }, [variables]);

  const toggleArray = (name) => {
    setExpandedArrays((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const entries = Object.entries(variables || {});

  return (
    <div className={`flex flex-col h-full select-none text-xs transition-colors duration-200 ${
      isBright ? 'bg-[#fcfbf9] text-stone-800' : 'bg-[#13161b] text-stone-100'
    }`}>
      {/* Table Header */}
      <div className={`px-3 py-2 border-b flex items-center justify-between text-xs font-semibold transition-colors ${
        isBright ? 'bg-[#f7f6f3] border-[#e2dfd8] text-stone-800' : 'bg-[#181c23] border-[#252932] text-stone-100'
      }`}>
        <div className="flex items-center gap-1.5 text-amber-500">
          <Cpu size={13} />
          <span className="font-bold">Variables &amp; Registers</span>
        </div>
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
          isBright ? 'bg-white text-stone-600 border-[#e2dfd8]' : 'bg-[#0e1013] text-stone-400 border-[#252932]'
        }`}>
          scope: {scope}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="p-4 text-center font-mono italic text-stone-500">
          No variables initialized in this step.
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left font-mono text-[11px]">
            <thead>
              <tr className={`border-b text-[10px] uppercase tracking-wider ${
                isBright ? 'bg-stone-50 text-stone-500 border-[#e2dfd8]' : 'bg-[#0e1013]/60 text-stone-400 border-[#252932]'
              }`}>
                <th className="py-1.5 px-3 font-semibold">Name</th>
                <th className="py-1.5 px-3 font-semibold">Value</th>
                <th className="py-1.5 px-3 font-semibold">Type</th>
                <th className="py-1.5 px-3 font-semibold">Previous</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isBright ? 'divide-stone-100' : 'divide-[#252932]/50'}`}>
              {entries.map(([name, val]) => {
                const isChanged = changedVariable === name;
                const isArray = Array.isArray(val);
                const isExpanded = expandedArrays[name];
                const typeStr = inferType(val);
                const valStr = formatValue(val);
                const prevVal = isChanged && previousValue !== null && previousValue !== undefined
                  ? formatValue(previousValue)
                  : historyValues[name] !== undefined
                  ? formatValue(historyValues[name])
                  : '—';

                return (
                  <React.Fragment key={name}>
                    <tr
                      onClick={() => onSelectVariable && onSelectVariable(name, val)}
                      className={`transition-colors duration-200 cursor-pointer ${
                        isChanged
                          ? isBright
                            ? 'bg-amber-100/70 text-amber-950 font-semibold'
                            : 'bg-amber-500/15 text-amber-300 font-semibold'
                          : isBright
                            ? 'hover:bg-stone-50 text-stone-800'
                            : 'hover:bg-[#181c23]/60 text-stone-100'
                      }`}
                      title="Click to highlight in 3D scene"
                    >
                      {/* Name */}
                      <td className="py-1.5 px-3 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isArray ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleArray(name);
                              }}
                              className="cursor-pointer text-stone-400 hover:text-stone-700"
                            >
                              {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                            </button>
                          ) : (
                            <span className="w-2.5" />
                          )}
                          <span className={isChanged ? 'text-amber-500' : ''}>
                            {name}
                          </span>
                        </div>
                      </td>

                      {/* Value */}
                      <td className="py-1.5 px-3 font-bold whitespace-nowrap">
                        <span className={isChanged ? 'text-amber-400' : ''}>
                          {valStr}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-1.5 px-3 whitespace-nowrap text-stone-500">
                        {typeStr}
                      </td>

                      {/* Previous Value */}
                      <td className="py-1.5 px-3 whitespace-nowrap text-stone-400">
                        {prevVal}
                      </td>
                    </tr>

                    {/* Expanded Array Elements */}
                    {isArray && isExpanded && (
                      <tr className={isBright ? 'bg-stone-50/70' : 'bg-[#0e1013]/40'}>
                        <td colSpan={4} className="py-1 px-6">
                          <div className="space-y-0.5 text-[10px] border-l-2 border-amber-500/50 pl-2 text-stone-500">
                            {val.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-stone-400">[{idx}]:</span>
                                <span className={`font-medium ${isBright ? 'text-stone-900' : 'text-stone-100'}`}>
                                  {String(item)}
                                </span>
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

export default VariablePanel;
