import React, { useState, useEffect, useRef } from 'react';
import { Cpu, ChevronRight, ChevronDown } from 'lucide-react';

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

/**
 * CODE3D-AI - VariablePanel Component
 * Displays Name | Value | Type | Previous in a clean developer inspector table.
 * Highlights variables on change with a brief transition and shows previous values.
 */
export function VariablePanel({
  variables = {},
  scope = 'main',
  changedVariable = null,
  previousValue = null,
}) {
  const [expandedArrays, setExpandedArrays] = useState({});
  const prevVarsRef = useRef({});
  const [historyValues, setHistoryValues] = useState({});

  // Track previous value history per variable
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
    <div className="flex flex-col h-full bg-[#101c2d] select-none text-xs">
      {/* Table Header */}
      <div className="px-3 py-2 bg-[#142338] border-b border-[#26364a] flex items-center justify-between text-xs font-semibold text-[#f8fafc]">
        <div className="flex items-center gap-1.5 text-[#3b82f6]">
          <Cpu size={13} />
          <span>Variables</span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0d1726] text-[#94a3b8] border border-[#26364a]">
          scope: {scope}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="p-4 text-center text-[#64748b] font-mono italic">
          No variables initialized in this step.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px]">
            <thead>
              <tr className="border-b border-[#26364a] text-[#94a3b8] bg-[#0d1726]/60 text-[10px] uppercase tracking-wider">
                <th className="py-1.5 px-3 font-semibold">Name</th>
                <th className="py-1.5 px-3 font-semibold">Value</th>
                <th className="py-1.5 px-3 font-semibold">Type</th>
                <th className="py-1.5 px-3 font-semibold">Previous</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2c3d]">
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
                      className={`transition-colors duration-200 ${
                        isChanged
                          ? 'bg-[#f59e0b]/15 text-[#fbbf24]'
                          : 'hover:bg-[#142338]/50 text-[#f8fafc]'
                      }`}
                    >
                      {/* Name */}
                      <td className="py-1.5 px-3 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isArray ? (
                            <button
                              onClick={() => toggleArray(name)}
                              className="text-[#94a3b8] hover:text-[#f8fafc] cursor-pointer"
                            >
                              {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                            </button>
                          ) : (
                            <span className="w-2.5" />
                          )}
                          <span className={isChanged ? 'text-[#f59e0b]' : 'text-[#38bdf8]'}>
                            {name}
                          </span>
                        </div>
                      </td>

                      {/* Value */}
                      <td className="py-1.5 px-3 font-bold whitespace-nowrap">
                        <span className={isChanged ? 'text-[#facc15]' : 'text-[#f8fafc]'}>
                          {valStr}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-1.5 px-3 text-[#94a3b8] whitespace-nowrap">
                        {typeStr}
                      </td>

                      {/* Previous Value */}
                      <td className="py-1.5 px-3 text-[#64748b] whitespace-nowrap">
                        {prevVal}
                      </td>
                    </tr>

                    {/* Expanded Array Elements */}
                    {isArray && isExpanded && (
                      <tr className="bg-[#0d1726]/40">
                        <td colSpan={4} className="py-1 px-6">
                          <div className="space-y-0.5 text-[10px] text-[#94a3b8] border-l-2 border-[#3b82f6]/40 pl-2">
                            {val.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-[#64748b]">[{idx}]:</span>
                                <span className="text-[#f8fafc] font-medium">{String(item)}</span>
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
