import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Box,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  Zap,
  ShieldCheck,
  HelpCircle,
  Layers,
  Cpu,
} from 'lucide-react';

/**
 * CODE3D-AI — Elevated Login Page
 * 
 * Implements Phase 5 Specifications:
 * - Deep near-black background with subtle isometric grid & glowing cyan accents
 * - Geometric 3D wireframe illustration
 * - Logo / Wordmark: CODE3D AI
 * - Headline: "Turn Code Into 3D Intelligence."
 * - Supporting text: "Visualize, understand and explore your code in an interactive 3D workspace."
 * - Fields: Email/Username, Password (show/hide), Remember Session, Forgot Password
 * - Primary CTA: "Continue to Code3D"
 * - Instant 1-Click Demo Workspace option
 * - Full responsive layout with zero horizontal overflow
 */
export default function LoginPage() {
  const { login, loginAsGuest, isAuthenticated } = useAuth();
  const { isBright } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('dev_user');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // If already authenticated, redirect to originally intended destination or /dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, location, navigate]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError('');
    setSuccess('');

    const cleanIdentifier = (identifier || '').trim();
    const cleanPassword = (password || '').trim();

    if (!cleanIdentifier) {
      setError('Username or email is required');
      return;
    }

    if (!cleanPassword) {
      setError('Password is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login({ identifier: cleanIdentifier, password: cleanPassword });
      if (res && res.success) {
        setSuccess('Authentication verified. Launching 3D Studio...');
        const destination = location.state?.from?.pathname || '/dashboard';
        setTimeout(() => {
          navigate(destination, { replace: true });
        }, 350);
      } else {
        setError(res?.message || 'Invalid credentials. Please check your username and password.');
      }
    } catch (err) {
      setError(err?.message || 'Unable to connect to authentication server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = () => {
    setError('');
    setSuccess('Launching instant demo environment...');
    setTimeout(() => {
      loginAsGuest('Lead Architect');
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    }, 200);
  };

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 md:p-8 relative overflow-x-hidden select-none transition-colors duration-200 ${
      isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'
    }`}>
      {/* Background Subtle Grid & Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${isBright ? '#94a3b8' : '#38bdf8'} 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[140px] bg-cyan-500/15" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-[140px] bg-blue-600/15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[180px] bg-cyan-500/5 pointer-events-none" />
      </div>

      {/* Top Header / Branding */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Box className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-lg tracking-wider font-sans">
            CODE<span className="text-cyan-400">3D</span> <span className="text-[10px] font-mono bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 rounded px-1.5 py-0.5 ml-0.5">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">AST SPATIAL STUDIO</span>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Online" />
        </div>
      </header>

      {/* Main Centered Login Section */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-6 sm:py-8">
        {/* Hero Title & Supporting Text */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[11px] font-mono font-medium tracking-wide mb-1">
            <Sparkles size={12} className="text-cyan-400 animate-pulse" />
            <span>Interactive 3D Code Intelligence</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-100 to-sky-300 bg-clip-text text-transparent">
            Turn Code Into 3D Intelligence.
          </h1>

          <p className={`text-xs sm:text-sm max-w-sm mx-auto leading-relaxed ${
            isBright ? 'text-slate-600' : 'text-slate-400'
          }`}>
            Visualize, understand and explore your code in an interactive 3D workspace.
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className={`p-6 sm:p-8 rounded-2xl border backdrop-blur-xl shadow-2xl relative transition-all duration-200 ${
          isBright
            ? 'bg-white/95 border-slate-200 shadow-slate-300/60'
            : 'bg-[#0d1726]/90 border-slate-800 shadow-cyan-950/40 ring-1 ring-cyan-500/20'
        }`}>
          {/* Subtle Geometric Cube Accent in Corner */}
          <div className="absolute top-3 right-3 text-cyan-500/20 pointer-events-none">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {success && (
            <div role="status" className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
              <span className="leading-snug">{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
                Email or Username
              </label>
              <div className="relative">
                <User size={15} className={`absolute left-3.5 top-3 ${isBright ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="dev_user or dev@code3d.ai"
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-cyan-500 transition ${
                    isBright
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#070b14] border-slate-700/80 text-white placeholder-slate-500'
                  }`}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`block text-xs font-semibold ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <Lock size={15} className={`absolute left-3.5 top-3 ${isBright ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-cyan-500 transition ${
                    isBright
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#070b14] border-slate-700/80 text-white placeholder-slate-500'
                  }`}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-cyan-400 transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-[#070b14] text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className={isBright ? 'text-slate-600' : 'text-slate-400'}>Remember session</span>
              </label>

              <span className="text-[10px] font-mono text-slate-400">
                Demo: <code className="text-cyan-400">admin123</code>
              </span>
            </div>

            {/* Primary CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition duration-150 shadow-lg cursor-pointer ${
                isSubmitting
                  ? 'opacity-60 cursor-not-allowed bg-slate-700 text-slate-300'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/25 active:scale-[0.99]'
              }`}
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Continue to Code3D'}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Quick Demo Access Divider */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isBright ? 'border-slate-200' : 'border-slate-800'}`} />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest">
              <span className={`px-2.5 ${isBright ? 'bg-white text-slate-400' : 'bg-[#0d1726] text-slate-500'}`}>
                OR EXPLORE INSTANTLY
              </span>
            </div>
          </div>

          {/* 1-Click Guest / Demo Mode Button */}
          <button
            type="button"
            onClick={handleQuickDemo}
            className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs border flex items-center justify-center gap-2 transition cursor-pointer group ${
              isBright
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                : 'bg-[#070b14] hover:bg-slate-800/80 border-slate-700/80 text-cyan-300 hover:text-white'
            }`}
          >
            <Zap size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Launch Instant Demo Workspace (1-Click)</span>
          </button>

          {/* Switch to Register */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
            <p className={`text-xs ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-cyan-400 hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-4 text-center flex items-center justify-center gap-2 text-[10px] font-mono text-slate-500">
          <ShieldCheck size={12} className="text-cyan-500" />
          <span>Encrypted token authentication with zero eval execution</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 border-t border-slate-800/40">
        <div className="flex items-center gap-2">
          <span>CODE3D AI Studio</span>
          <span>•</span>
          <span>Spatial AST 3D WebGL</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px]">React 18 • Three.js • Vite</span>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-[#0d1726] border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-cyan-400">
              <HelpCircle size={20} />
              <h3 className="font-bold text-sm text-white">Reset Password</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              In this environment, you can use the default test credentials <strong className="text-cyan-400">dev_user</strong> with password <strong className="text-cyan-400">admin123</strong>, or click <strong className="text-amber-400">Launch Instant Demo Workspace</strong> to access all features immediately.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
