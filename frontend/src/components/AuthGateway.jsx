import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Box,
  Lock,
  User,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  Zap,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

export default function AuthGateway() {
  const { login, register, loginAsGuest } = useAuth();
  const { isBright } = useTheme();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Student Developer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError('');
    setSuccess('');

    if (mode === 'login') {
      const cleanId = identifier.trim();
      const cleanPass = password.trim();

      if (!cleanId) {
        setError('Please enter your username or email');
        return;
      }
      if (!cleanPass) {
        setError('Please enter your password');
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await login({ identifier: cleanId, password: cleanPass });
        if (res && res.success) {
          setSuccess('Access granted. Initializing 3D Studio...');
        } else {
          setError(res?.message || 'Invalid credentials. Please verify your login details.');
        }
      } catch (err) {
        setError(err.message || 'Unable to connect to authentication service.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const cleanUser = identifier.trim();
      const cleanEmail = email.trim();
      const cleanPass = password.trim();

      if (!cleanUser) {
        setError('Please choose a username');
        return;
      }
      if (!cleanEmail) {
        setError('Please enter your email address');
        return;
      }
      if (!cleanPass || cleanPass.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await register({
          username: cleanUser,
          email: cleanEmail,
          password: cleanPass,
          fullName: fullName.trim() || cleanUser,
          role,
        });
        if (res && res.success) {
          setSuccess('Account created successfully! Loading your workspace...');
        } else {
          setError(res?.message || 'Registration failed. Try a different username or email.');
        }
      } catch (err) {
        setError(err.message || 'Unable to complete registration.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleQuickDemo = () => {
    setError('');
    setSuccess('Launching instant demo environment...');
    setTimeout(() => {
      loginAsGuest('Lead Architect');
    }, 250);
  };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden select-none transition-colors duration-200 ${
      isBright ? 'bg-slate-100 text-slate-900' : 'bg-[#070b14] text-slate-100'
    }`}>
      {/* Dynamic Cyberpunk / Spatial Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[140px] bg-cyan-500/15" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[140px] bg-purple-500/15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[180px] bg-blue-600/10 pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-xl shadow-cyan-500/25 ring-1 ring-cyan-400/40 animate-pulse">
            <Box size={28} className="stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
            CODE3D-AI
          </h1>
          <p className={`text-xs font-medium tracking-wide ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
            Spatial AST Execution Platform & 3D WebGL Studio
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className={`p-6 sm:p-8 rounded-2xl border backdrop-blur-xl shadow-2xl relative transition-all ${
          isBright
            ? 'bg-white/95 border-slate-200/90 shadow-slate-300/60'
            : 'bg-slate-900/90 border-slate-800 shadow-cyan-950/40 ring-1 ring-cyan-500/20'
        }`}>
          {/* Mode Tabs */}
          <div className="flex rounded-xl p-1 mb-6 border bg-slate-950/40 border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/25'
                  : isBright ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock size={13} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/25'
                  : isBright ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles size={13} />
              <span>Create Account</span>
            </button>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div role="alert" className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {success && (
            <div role="status" className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
              <span className="leading-snug">{success}</span>
            </div>
          )}

          {/* Interactive Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
                {mode === 'login' ? 'Username or Email' : 'Username'}
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
                  placeholder={mode === 'login' ? 'dev_user or dev@code3d.ai' : 'dev_architect'}
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-cyan-500 transition ${
                    isBright
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950/80 border-slate-800 text-white placeholder-slate-500'
                  }`}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className={`absolute left-3.5 top-3 ${isBright ? 'text-slate-400' : 'text-slate-500'}`} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@developer.edu"
                      className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-cyan-500 transition ${
                        isBright
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-slate-950/80 border-slate-800 text-white placeholder-slate-500'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Mercer"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-cyan-500 transition ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-950/80 border-slate-800 text-white placeholder-slate-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
                    Primary Developer Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-cyan-500 transition ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-950/80 border-slate-800 text-white'
                    }`}
                  >
                    <option value="Student Developer">Student Developer</option>
                    <option value="Competitive Programmer">Competitive Programmer</option>
                    <option value="Frontend Architect">Frontend Architect</option>
                    <option value="Full-Stack Engineer">Full-Stack Engineer</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
                Password
              </label>
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
                      : 'bg-slate-950/80 border-slate-800 text-white placeholder-slate-500'
                  }`}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-cyan-400 transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition duration-150 shadow-lg cursor-pointer ${
                isSubmitting
                  ? 'opacity-60 cursor-not-allowed bg-slate-700 text-slate-300'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/25 active:scale-[0.99]'
              }`}
            >
              <span>
                {isSubmitting
                  ? (mode === 'login' ? 'Authenticating...' : 'Creating Account...')
                  : (mode === 'login' ? 'Authenticate & Enter Studio' : 'Complete Registration')}
              </span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Quick Demo Access Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isBright ? 'border-slate-200' : 'border-slate-800'}`} />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest">
              <span className={`px-2 ${isBright ? 'bg-white text-slate-400' : 'bg-slate-900 text-slate-500'}`}>
                OR QUICK ACCESS
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
                : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-700/80 text-cyan-300 hover:text-white'
            }`}
          >
            <Zap size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Launch Instant Demo Workspace (1-Click)</span>
          </button>
        </div>

        {/* Security badge footer */}
        <div className="mt-5 text-center flex items-center justify-center gap-2 text-[10px] font-mono text-slate-500">
          <ShieldCheck size={12} className="text-cyan-500" />
          <span>Session securely persisted with React Context & JWT</span>
        </div>
      </div>
    </div>
  );
}
