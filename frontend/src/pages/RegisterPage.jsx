import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Box,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';

/**
 * CODE3D-AI — Developer Registration Page
 */
export default function RegisterPage() {
  const { register, loginAsGuest, isAuthenticated } = useAuth();
  const { isBright } = useTheme();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Full-Stack Engineer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError('');
    setSuccess('');

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanUsername) {
      setError('Username is required');
      return;
    }
    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (!cleanEmail) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!cleanPassword) {
      setError('Password is required');
      return;
    }

    if (cleanPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        username: cleanUsername,
        email: cleanEmail,
        password: cleanPassword,
        fullName: fullName.trim() || cleanUsername,
        role,
      });

      if (res && res.success) {
        setSuccess('Account created successfully! Launching your workspace...');
        setTimeout(() => navigate('/dashboard', { replace: true }), 350);
      } else {
        setError(res?.message || 'Registration failed. Please check your information.');
      }
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = () => {
    loginAsGuest('Lead Architect');
    navigate('/dashboard', { replace: true });
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
            backgroundImage: `radial-gradient(circle at 1px 1px, ${isBright ? '#94a3b8' : '#a855f7'} 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[140px] bg-purple-500/15" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-[140px] bg-cyan-500/15" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Box className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-lg tracking-wider font-sans">
            CODE<span className="text-purple-400">3D</span> <span className="text-[10px] font-mono bg-purple-500/15 text-purple-400 border border-purple-500/30 rounded px-1.5 py-0.5 ml-0.5">REGISTER</span>
          </span>
        </div>

        <Link
          to="/login"
          className="text-xs text-purple-400 hover:text-purple-300 font-semibold transition"
        >
          ← Back to Sign In
        </Link>
      </header>

      {/* Main Centered Section */}
      <main className="relative z-10 w-full max-w-lg mx-auto my-auto py-6 sm:py-8">
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-400 text-[11px] font-mono font-medium tracking-wide mb-1">
            <Sparkles size={12} className="text-purple-400 animate-pulse" />
            <span>Developer Account Onboarding</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-purple-100 to-indigo-300 bg-clip-text text-transparent">
            Join the 3D Code Revolution.
          </h1>

          <p className={`text-xs sm:text-sm max-w-sm mx-auto leading-relaxed ${
            isBright ? 'text-slate-600' : 'text-slate-400'
          }`}>
            Create your account to save algorithm simulations, track execution logs, and master DSA in 3D.
          </p>
        </div>

        {/* Card */}
        <div className={`p-6 sm:p-8 rounded-2xl border backdrop-blur-xl shadow-2xl relative transition-all duration-200 ${
          isBright
            ? 'bg-white/95 border-slate-200 shadow-slate-300/60'
            : 'bg-[#0d1726]/90 border-slate-800 shadow-purple-950/40 ring-1 ring-purple-500/20'
        }`}>
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

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
                  Username <span className="text-purple-400">*</span>
                </label>
                <div className="relative">
                  <User size={15} className={`absolute left-3 top-3 ${isBright ? 'text-slate-400' : 'text-slate-500'}`} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="alex_dev"
                    className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-[#070b14] border-slate-700/80 text-white placeholder-slate-500'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Mercer"
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                    isBright
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#070b14] border-slate-700/80 text-white placeholder-slate-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
                Email Address <span className="text-purple-400">*</span>
              </label>
              <div className="relative">
                <Mail size={15} className={`absolute left-3 top-3 ${isBright ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@developer.io"
                  className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                    isBright
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#070b14] border-slate-700/80 text-white placeholder-slate-500'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
                Primary Engineering Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                  isBright
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-[#070b14] border-slate-700/80 text-white'
                }`}
              >
                <option value="Full-Stack Engineer">Full-Stack Engineer</option>
                <option value="Competitive Programmer">Competitive Programmer</option>
                <option value="Student Developer">Student Developer</option>
                <option value="Frontend Architect">Frontend Architect</option>
                <option value="Software Engineer">Software Engineer</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
                  Password <span className="text-purple-400">*</span>
                </label>
                <div className="relative">
                  <Lock size={15} className={`absolute left-3 top-3 ${isBright ? 'text-slate-400' : 'text-slate-500'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-[#070b14] border-slate-700/80 text-white placeholder-slate-500'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 p-0.5 text-slate-400 hover:text-purple-400 transition"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
                  Confirm Password <span className="text-purple-400">*</span>
                </label>
                <div className="relative">
                  <Lock size={15} className={`absolute left-3 top-3 ${isBright ? 'text-slate-400' : 'text-slate-500'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-[#070b14] border-slate-700/80 text-white placeholder-slate-500'
                    }`}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-3 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition duration-150 shadow-lg cursor-pointer ${
                isSubmitting
                  ? 'opacity-60 cursor-not-allowed bg-slate-700 text-slate-300'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-purple-500/25 active:scale-[0.99]'
              }`}
            >
              <span>{isSubmitting ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Quick Demo Mode */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className={isBright ? 'text-slate-600' : 'text-slate-400'}>Already registered?</span>
            <Link to="/login" className="font-semibold text-purple-400 hover:underline">
              Sign In to Code3D
            </Link>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-4 text-center flex items-center justify-center gap-2 text-[10px] font-mono text-slate-500">
          <ShieldCheck size={12} className="text-purple-400" />
          <span>bcrypt hashed passwords with secure token persistence</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 border-t border-slate-800/40">
        <span>CODE3D AI Studio • Spatial AST 3D WebGL</span>
        <span className="font-mono text-[10px]">React 18 • Three.js • Vite</span>
      </footer>
    </div>
  );
}
