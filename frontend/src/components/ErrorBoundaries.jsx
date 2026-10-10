/**
 * CODE3D-AI - Granular Error Boundaries
 * 
 * Provides recovery mechanisms for UI components:
 * - AppErrorBoundary
 * - VisualizerErrorBoundary
 * - EditorErrorBoundary
 * - ExecutionErrorBoundary
 */

import React, { Component } from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('AppErrorBoundary caught an unhandled error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen flex flex-col items-center justify-center p-6 bg-[#070b14] text-white">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4">
            <AlertTriangle size={30} />
          </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-xs text-slate-400 mb-4 max-w-md text-center font-mono">
            {this.state.error?.message || 'An unexpected runtime error occurred.'}
          </p>
          <button
            onClick={this.handleReload}
            className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 hover:bg-cyan-400 transition"
          >
            <RefreshCw size={14} />
            <span>Reload Application</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export class VisualizerErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('VisualizerErrorBoundary caught 3D/scene error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950 text-white border border-rose-900/40 rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-3">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-sm font-bold mb-1">Visualizer Render Error</h3>
          <p className="text-xs text-slate-400 mb-3 max-w-sm text-center font-mono">
            {this.state.error?.message || 'Failed to render 3D scene elements.'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-cyan-400 transition"
          >
            <RotateCcw size={13} />
            <span>Reset Visualizer</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export class EditorErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('EditorErrorBoundary caught editor error:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const isBright = this.props.isBright;
      return (
        <div className={`w-full h-full flex flex-col font-mono overflow-hidden ${
          isBright ? 'bg-white text-stone-900 border-stone-200' : 'bg-[#13161b] text-stone-100 border-stone-800'
        }`}>
          {/* Recovery Notification Header */}
          <div className={`px-3 py-2 border-b flex items-center justify-between shrink-0 text-xs ${
            isBright ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            <div className="flex items-center gap-2 truncate">
              <AlertTriangle size={13} className="text-amber-500 shrink-0" />
              <span className="truncate">Editor fallback active ({this.state.error?.message || 'Monaco initialization error'})</span>
            </div>
            <button
              type="button"
              onClick={this.handleRetry}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-[11px] shrink-0 ml-2 transition cursor-pointer"
            >
              Retry Editor
            </button>
          </div>

          {/* Interactive Fallback Code Textarea */}
          <div className="flex-1 p-3 flex flex-col min-h-0">
            <textarea
              value={this.props.code || ''}
              onChange={(e) => this.props.onChangeCode && this.props.onChangeCode(e.target.value)}
              placeholder="// Write your code here..."
              spellCheck="false"
              className={`flex-1 w-full p-3 font-mono text-xs rounded border focus:outline-none resize-none leading-relaxed ${
                isBright
                  ? 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-500'
                  : 'bg-[#0d1015] border-stone-800 text-stone-200 focus:border-amber-500 placeholder-stone-600'
              }`}
            />
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
