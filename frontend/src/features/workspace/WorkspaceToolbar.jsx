import React from 'react';
import {
  Play,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  Code2,
  Info,
  Terminal,
  Bookmark,
  Share2,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button, IconButton, Badge } from '../../components/common';

/**
 * WorkspaceToolbar Component
 * 
 * Provides:
 * - Language selection
 * - Run / Execute button (Ctrl+Enter)
 * - Reset / Restore sample code
 * - Dynamic Status Pill ('Unsaved changes' | 'Analyzing...' | 'Ready' | 'Execution Error')
 * - Layout presets: Reset Layout, Fullscreen 3D, Focus Code, Focus State, Toggle Console
 */
export default function WorkspaceToolbar({
  language = 'java',
  onLanguageChange,
  isCodeDirty = false,
  isExecuting = false,
  executionError = null,
  onRunCode,
  onResetCode,
  onRestoreSample,
  viewMode = 'default',
  onViewModeChange,
  showConsole = false,
  onToggleConsole,
  onSaveProgram,
  saveStatus = null,
  algorithmTitle = 'Algorithm Studio',
}) {
  const { isBright } = useTheme();

  const getStatusBadge = () => {
    if (isExecuting) {
      return (
        <Badge variant="amber" dot size="xs" mono>
          Analyzing...
        </Badge>
      );
    }
    if (executionError) {
      return (
        <Badge variant="rose" dot size="xs" mono title={executionError}>
          Execution Error
        </Badge>
      );
    }
    if (isCodeDirty) {
      return (
        <Badge variant="amber" dot size="xs" mono title="Code modified. Click Run to re-analyze.">
          Unsaved changes
        </Badge>
      );
    }
    return (
      <Badge variant="emerald" dot size="xs" mono>
        Ready
      </Badge>
    );
  };

  return (
    <div
      className={`h-11 px-3 border-b flex items-center justify-between select-none shrink-0 gap-2 ${
        isBright
          ? 'bg-stone-50/95 border-stone-200 text-stone-900'
          : 'bg-[#13161b] border-stone-850 text-stone-100'
      }`}
    >
      {/* Left: Title + Language Switcher + Status Badge */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-xs font-semibold tracking-tight truncate max-w-[160px] sm:max-w-[220px]">
          {algorithmTitle}
        </span>

        {getStatusBadge()}

        {/* Language Select */}
        <div className="relative inline-flex items-center">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            disabled={isExecuting}
            className={`h-7 pl-2.5 pr-6 text-xs font-mono font-medium rounded-md border appearance-none transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500 ${
              isBright
                ? 'bg-white border-stone-300 text-stone-800 hover:border-stone-400'
                : 'bg-stone-900 border-stone-750 text-stone-200 hover:border-stone-600'
            }`}
          >
            <option value="java">Java 21</option>
            <option value="cpp">C++ 20</option>
            <option value="c">C99</option>
            <option value="javascript">JavaScript (ES6)</option>
            <option value="python">Python 3</option>
          </select>
          <ChevronDown size={11} className="absolute right-2 pointer-events-none opacity-50" />
        </div>
      </div>

      {/* Center: Run & Reset Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="primary"
          size="sm"
          icon={Play}
          loading={isExecuting}
          onClick={onRunCode}
          title="Run Execution (Ctrl + Enter)"
          className="shadow-sm"
        >
          <span className="hidden sm:inline">Run</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          icon={RotateCcw}
          onClick={onResetCode}
          disabled={isExecuting}
          title="Reset to Original Starter Code"
        >
          <span className="hidden sm:inline">Reset</span>
        </Button>
      </div>

      {/* Right: Layout Modes & Console Toggle */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Toggle Console */}
        <IconButton
          icon={Terminal}
          size="sm"
          active={showConsole}
          onClick={onToggleConsole}
          title={showConsole ? 'Hide Console Drawer' : 'Show Console Drawer'}
          ariaLabel="Toggle Console"
        />

        <div className={`w-px h-4 mx-1 ${isBright ? 'bg-stone-300' : 'bg-stone-800'}`} />

        {/* Layout Focus Toggles */}
        <IconButton
          icon={Code2}
          size="sm"
          active={viewMode === 'focusCode'}
          onClick={() => onViewModeChange(viewMode === 'focusCode' ? 'default' : 'focusCode')}
          title="Focus Code Editor"
          ariaLabel="Focus Code Editor"
        />

        <IconButton
          icon={Maximize2}
          size="sm"
          active={viewMode === 'fullscreen3d'}
          onClick={() => onViewModeChange(viewMode === 'fullscreen3d' ? 'default' : 'fullscreen3d')}
          title="Fullscreen 3D View"
          ariaLabel="Fullscreen 3D View"
        />

        <IconButton
          icon={Info}
          size="sm"
          active={viewMode === 'focusExplanation'}
          onClick={() => onViewModeChange(viewMode === 'focusExplanation' ? 'default' : 'focusExplanation')}
          title="Focus State Inspector"
          ariaLabel="Focus State Inspector"
        />

        {/* Reset Layout if customized */}
        {viewMode !== 'default' && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onViewModeChange('default')}
            title="Reset to 3-column layout"
          >
            Reset Layout
          </Button>
        )}

        {/* Save Program CTA */}
        {onSaveProgram && (
          <IconButton
            icon={Bookmark}
            size="sm"
            onClick={onSaveProgram}
            title={saveStatus === 'SAVED' ? 'Program Saved' : 'Save Program Trace'}
            active={saveStatus === 'SAVED'}
          />
        )}
      </div>
    </div>
  );
}
