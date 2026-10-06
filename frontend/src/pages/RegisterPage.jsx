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
} from 'lucide-react';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
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
        setSuccess('Account created successfully! Launching studio...');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 400);
      } else {
        setError(res?.message || 'Could not complete registration. Please try another username.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to connect to authentication service.');
    } finally {
      setIsSubmitting(false);
    }
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

      {/* Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-md shadow-amber-500/20">
            <Box className="w-4 h-4 text-stone-950 stroke-[2.5]" />
          </div>
          <span className="font-bold text-base tracking-tight font-sans">
            CODE3D <span className="text-amber-500 font-mono text-xs">AI</span>
          </span>
        </div>

        <Link
          to="/login"
          className="text-xs text-amber-500 hover:text-amber-400 font-semibold transition"
        >
          ← Back to Sign In
        </Link>
      </header>

      {/* Main Centered Section */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-6">
        <div className="text-center mb-6 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-mono font-bold tracking-wide">
            <Sparkles size={11} className="text-amber-500" />
            <span>Developer Account Onboarding</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Create Developer Account
          </h1>

          <p className={`text-xs max-w-xs mx-auto leading-relaxed ${
            isBright ? 'text-stone-600' : 'text-stone-400'
          }`}>
            Save algorithm simulations, customize datasets, and master DSA in interactive 3D.
          </p>
        </div>

        {/* Card */}
        <div className={`p-6 rounded-xl border shadow-sm transition-all duration-200 ${
          isBright
            ? 'bg-white border-[#e2dfd8]'
            : 'bg-[#13161b] border-[#252932]'
        }`}>
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

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isBright ? 'text-stone-700' : 'text-stone-300'}`}>
                  Username <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <User size={14} className={`absolute left-3 top-2.5 ${isBright ? 'text-stone-400' : 'text-stone-500'}`} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="alex_dev"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs border focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition ${
                      isBright
                        ? 'bg-[#f7f6f3] border-[#e2dfd8] text-stone-900 placeholder-stone-400'
                        : 'bg-[#0e1013] border-[#252932] text-stone-100 placeholder-stone-500'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isBright ? 'text-stone-700' : 'text-stone-300'}`}>
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Mercer"
                  className={`w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition ${
                    isBright
                      ? 'bg-[#f7f6f3] border-[#e2dfd8] text-stone-900 placeholder-stone-400'
                      : 'bg-[#0e1013] border-[#252932] text-stone-100 placeholder-stone-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isBright ? 'text-stone-700' : 'text-stone-300'}`}>
                Email Address <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <Mail size={14} className={`absolute left-3 top-2.5 ${isBright ? 'text-stone-400' : 'text-stone-500'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@developer.io"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs border focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition ${
                    isBright
                      ? 'bg-[#f7f6f3] border-[#e2dfd8] text-stone-900 placeholder-stone-400'
                      : 'bg-[#0e1013] border-[#252932] text-stone-100 placeholder-stone-500'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isBright ? 'text-stone-700' : 'text-stone-300'}`}>
                Engineering Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition cursor-pointer ${
                  isBright
                    ? 'bg-[#f7f6f3] border-[#e2dfd8] text-stone-900'
                    : 'bg-[#0e1013] border-[#252932] text-stone-100'
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
                <label className={`block text-xs font-semibold mb-1 ${isBright ? 'text-stone-700' : 'text-stone-300'}`}>
                  Password <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={14} className={`absolute left-3 top-2.5 ${isBright ? 'text-stone-400' : 'text-stone-500'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className={`w-full pl-9 pr-8 py-2 rounded-lg text-xs border focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition ${
                      isBright
                        ? 'bg-[#f7f6f3] border-[#e2dfd8] text-stone-900 placeholder-stone-400'
                        : 'bg-[#0e1013] border-[#252932] text-stone-100 placeholder-stone-500'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 p-1 text-stone-400 hover:text-amber-500 transition"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isBright ? 'text-stone-700' : 'text-stone-300'}`}>
                  Confirm Password <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={14} className={`absolute left-3 top-2.5 ${isBright ? 'text-stone-400' : 'text-stone-500'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs border focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition ${
                      isBright
                        ? 'bg-[#f7f6f3] border-[#e2dfd8] text-stone-900 placeholder-stone-400'
                        : 'bg-[#0e1013] border-[#252932] text-stone-100 placeholder-stone-500'
                    }`}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-3 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition duration-150 shadow-md cursor-pointer ${
                isSubmitting
                  ? 'opacity-60 cursor-not-allowed bg-stone-700 text-stone-300'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20 active:translate-y-px'
              }`}
            >
              <span>{isSubmitting ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-4 pt-3 border-t border-inherit flex items-center justify-between text-xs">
            <span className={isBright ? 'text-stone-600' : 'text-stone-400'}>Already registered?</span>
            <Link to="/login" className="font-semibold text-amber-500 hover:underline">
              Sign In to Code3D
            </Link>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-3 text-center flex items-center justify-center gap-1.5 text-[10px] font-mono text-stone-500">
          <ShieldCheck size={12} className="text-amber-500" />
          <span>bcrypt hashed passwords with secure token persistence</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-500 border-t border-inherit">
        <span>Code3D AI • Spatial Execution Engine</span>
        <span className="font-mono text-[10px]">React 18 • Three.js • Vite</span>
      </footer>
    </div>
  );
}
