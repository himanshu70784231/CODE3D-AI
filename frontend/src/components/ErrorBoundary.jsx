import React from 'react';
import { AlertTriangle, RefreshCw, RotateCcw, Home, Sparkles } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CODE3D AI Caught Rendering / Execution Error:', error, errorInfo);
    this.setState({ errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      try {
        this.props.onReset();
      } catch (e) {
        console.warn('Error during ErrorBoundary reset handler:', e);
      }
    }
  };

  handleResetToHome = () => {
    try {
      localStorage.removeItem('code3d_auth_user');
      localStorage.removeItem('code3d_auth_token');
    } catch {}
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.hash = '#/';
  };

  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || String(this.state.error || 'Unknown error');
      const isWebGL = /webgl|context|three|shader|canvas|gl/i.test(errorMsg);
      const isTrace = /trace|step|undefined|null|length|bounds/i.test(errorMsg);

      // Inline / Component-level fallback
      if (this.props.isInline || this.props.compact) {
        return (
          <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center p-6 bg-slate-950/95 text-slate-100 border border-rose-500/30 rounded-2xl text-center select-none">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-3">
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              {isWebGL ? 'WebGL Visualization Glitch' : isTrace ? 'Malformed Execution Trace' : 'Component Error'}
            </h3>
            <p className="text-xs text-slate-400 mb-3 max-w-sm font-mono">
              {errorMsg}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-cyan-500/20"
              >
                <RotateCcw size={12} />
                <span>Reset View</span>
              </button>
            </div>
          </div>
        );
      }

      // Full Viewport fallback
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#070b14] text-slate-100 font-sans select-none relative">
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] rounded-full blur-[140px] bg-cyan-500/10" />
            <div className="absolute bottom-[20%] right-[30%] w-[400px] h-[400px] rounded-full blur-[140px] bg-rose-500/10" />
          </div>

          <div className="relative z-10 max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-cyan-950/40 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                {isWebGL ? 'WebGL Display Interrupted' : isTrace ? 'Execution Trace Issue' : 'Something unexpected occurred'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {isWebGL
                  ? 'Your browser WebGL context experienced an issue. Your workspace and code state are preserved.'
                  : 'An error occurred during trace rendering. Your code and session data remain safe.'}
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-left overflow-x-auto text-[11px] font-mono text-rose-300 max-h-28 custom-scrollbar">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <RotateCcw size={13} />
                <span>Recover & Reset</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-slate-700"
              >
                <RefreshCw size={13} />
                <span>Reload App</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-500 font-mono pt-1">
              CODE3D AI • Spatial AST Execution Platform
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
