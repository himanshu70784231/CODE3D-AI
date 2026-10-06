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
} from 'lucide-react';

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
        setSuccess('Authentication verified. Launching Code3D AI...');
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
      navigate('/dashboard', { replace: true });
    }, 200);
  };

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 select-none transition-colors duration-200 relative overflow-hidden ${
      isBright ? 'bg-[#f7f6f3] text-stone-900' : 'bg-[#0e1013] text-stone-100'
    }`}>
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${isBright ? '#000000' : '#ffffff'} 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Top Header / Branding */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-md shadow-amber-500/20">
            <Box className="w-4 h-4 text-stone-950 stroke-[2.5]" />
          </div>
          <span className="font-bold text-base tracking-tight font-sans">
            CODE3D <span className="text-amber-500 font-mono text-xs">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-stone-500 hidden sm:inline">TECHNICAL WORKSPACE</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="System Ready" />
        </div>
      </header>

      {/* Main Centered Login Section */}
      <main className="relative z-10 w-full max-w-sm mx-auto my-auto py-6">
        {/* Title */}
        <div className="text-center mb-6 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-mono font-bold tracking-wide">
            <Sparkles size={11} className="text-amber-500" />
            <span>Interactive Execution Engine</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Sign In to Code3D AI
          </h1>

          <p className={`text-xs max-w-xs mx-auto leading-relaxed ${
            isBright ? 'text-stone-600' : 'text-stone-400'
          }`}>
            Visualize program flow, trace execution states, and learn algorithms spatially.
          </p>
        </div>

        {/* Auth Box */}
        <div className={`p-6 rounded-xl border shadow-sm transition-all duration-200 ${
          isBright
            ? 'bg-white border-[#e2dfd8]'
            : 'bg-[#13161b] border-[#252932]'
        }`}>
          {/* Feedback Alerts */}
          {error && (
            <div role="alert" className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0 text-rose-400" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {success && (
            <div role="status" className="mb-4 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
              <span className="leading-snug">{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isBright ? 'text-stone-700' : 'text-stone-300'}`}>
                Email or Username
              </label>
              <div className="relative">
                <User size={14} className={`absolute left-3 top-2.5 ${isBright ? 'text-stone-400' : 'text-stone-500'}`} />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="dev_user or dev@code3d.ai"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs border focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition ${
                    isBright
                      ? 'bg-[#f7f6f3] border-[#e2dfd8] text-stone-900 placeholder-stone-400'
                      : 'bg-[#0e1013] border-[#252932] text-stone-100 placeholder-stone-500'
                  }`}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`block text-xs font-semibold ${isBright ? 'text-stone-700' : 'text-stone-300'}`}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-amber-500 hover:text-amber-400 transition cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <Lock size={14} className={`absolute left-3 top-2.5 ${isBright ? 'text-stone-400' : 'text-stone-500'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-9 py-2 rounded-lg text-xs border focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition ${
                    isBright
                      ? 'bg-[#f7f6f3] border-[#e2dfd8] text-stone-900 placeholder-stone-400'
                      : 'bg-[#0e1013] border-[#252932] text-stone-100 placeholder-stone-500'
                  }`}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 p-1 text-stone-400 hover:text-amber-500 transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[#252932] accent-amber-500 cursor-pointer"
                />
                <span className={isBright ? 'text-stone-600' : 'text-stone-400'}>Remember session</span>
              </label>

              <span className="text-[10px] font-mono text-stone-500">
                Demo: <code className="text-amber-500">admin123</code>
              </span>
            </div>

            {/* Primary CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-2 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition duration-150 shadow-md cursor-pointer ${
                isSubmitting
                  ? 'opacity-60 cursor-not-allowed bg-stone-700 text-stone-300'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20 active:translate-y-px'
              }`}
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Quick Demo Access Divider */}
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isBright ? 'border-[#e2dfd8]' : 'border-[#252932]'}`} />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
              <span className={`px-2.5 ${isBright ? 'bg-white text-stone-500' : 'bg-[#13161b] text-stone-500'}`}>
                OR EXPLORE DIRECTLY
              </span>
            </div>
          </div>

          {/* 1-Click Guest / Demo Mode Button */}
          <button
            type="button"
            onClick={handleQuickDemo}
            className={`w-full py-2 px-4 rounded-lg font-semibold text-xs border flex items-center justify-center gap-2 transition cursor-pointer group active:translate-y-px ${
              isBright
                ? 'bg-[#f7f6f3] hover:bg-[#edebe5] border-[#e2dfd8] text-stone-800'
                : 'bg-[#0e1013] hover:bg-[#181c23] border-[#252932] text-stone-200 hover:text-white'
            }`}
          >
            <Zap size={13} className="text-amber-500" />
            <span>Launch Instant Demo Workspace</span>
          </button>

          {/* Switch to Register */}
          <div className="mt-4 pt-3 border-t border-inherit text-center">
            <p className={`text-xs ${isBright ? 'text-stone-600' : 'text-stone-400'}`}>
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-amber-500 hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-3 text-center flex items-center justify-center gap-1.5 text-[10px] font-mono text-stone-500">
          <ShieldCheck size={12} className="text-amber-500" />
          <span>Encrypted token authentication with zero eval execution</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-500 border-t border-inherit">
        <div className="flex items-center gap-2">
          <span>Code3D AI</span>
          <span>•</span>
          <span>Interactive Spatial Execution Engine</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px]">React 18 • Three.js • Vite</span>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm p-5 rounded-xl bg-[#13161b] border border-[#252932] shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-amber-500">
              <HelpCircle size={18} />
              <h3 className="font-bold text-sm text-stone-100">Reset Password</h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              In this environment, you can use the default test credentials <strong className="text-amber-400">dev_user</strong> with password <strong className="text-amber-400">admin123</strong>, or click <strong className="text-amber-400">Launch Instant Demo Workspace</strong> to access all features immediately.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
