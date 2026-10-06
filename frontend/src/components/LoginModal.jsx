import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { X, LogIn, UserPlus, ShieldCheck, Lock, Mail, User, CheckCircle2 } from 'lucide-react';

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login, register, authModalMode, setAuthModalMode } = useAuth();
  const { isBright } = useTheme();

  // Mode: 'login' or 'register'
  const isRegister = authModalMode === 'register';

  // --- Login Form State (Clean, single source of truth) ---
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // --- Registration Form State (Independent fields) ---
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Student Developer');

  // Shared UI state
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isLoginModalOpen) {
        closeLoginModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoginModalOpen, closeLoginModal]);

  // Reset errors and clear inputs when modal closes or mode toggles
  useEffect(() => {
    setError('');
    setSuccessMsg('');
  }, [isLoginModalOpen, authModalMode]);

  if (!isLoginModalOpen) return null;

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier) {
      setError('Username or email is required');
      return;
    }

    if (cleanIdentifier.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanIdentifier)) {
        setError('Please enter a valid email address (e.g. name@example.com)');
        return;
      }
    } else if (cleanIdentifier.length < 3) {
      setError('Username must be at least 3 characters long');
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

    setLoading(true);
    try {
      const res = await login({ identifier: cleanIdentifier, password: cleanPassword });
      if (res && res.success) {
        setSuccessMsg('Signed in successfully!');
        setTimeout(() => {
          closeLoginModal();
          // Reset fields after close
          setIdentifier('');
          setPassword('');
          setSuccessMsg('');
        }, 350);
      } else {
        setError(res?.message || 'Invalid username or password');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanUsername = regUsername.trim();
    const cleanEmail = regEmail.trim();
    const cleanPassword = regPassword.trim();
    const cleanConfirm = regConfirmPassword.trim();

    if (!cleanUsername) {
      setError('Username is required');
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

    setLoading(true);
    try {
      const res = await register({
        username: cleanUsername,
        email: cleanEmail,
        password: cleanPassword,
        fullName: fullName.trim() || cleanUsername,
        role: role.trim(),
      });

      if (res && res.success) {
        setSuccessMsg('Account created successfully!');
        setTimeout(() => {
          closeLoginModal();
          setRegUsername('');
          setRegEmail('');
          setRegPassword('');
          setRegConfirmPassword('');
          setFullName('');
          setSuccessMsg('');
        }, 400);
      } else {
        setError(res?.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      closeLoginModal();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className={`relative w-full max-w-md border rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
          isBright
            ? 'bg-white border-stone-200 text-stone-900 shadow-stone-300'
            : 'bg-[#13161b] border-stone-800 text-stone-100 shadow-stone-950/80'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-5 border-b flex items-center justify-between transition-colors ${
            isBright
              ? 'bg-stone-50/80 border-stone-200'
              : 'bg-[#171a21] border-stone-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                isBright
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 id="auth-modal-title" className={`text-base font-semibold tracking-wide ${isBright ? 'text-stone-900' : 'text-stone-100'}`}>
                {isRegister ? 'Create CODE3D Account' : 'Sign in to CODE3D AI'}
              </h3>
              <p className={`text-xs ${isBright ? 'text-stone-600' : 'text-stone-400'}`}>
                {isRegister ? 'Save code executions, 3D traces & track progress' : 'Access your saved execution history and account'}
              </p>
            </div>
          </div>
          <button
            onClick={closeLoginModal}
            disabled={loading}
            aria-label="Close modal"
            className={`p-1.5 rounded-lg transition cursor-pointer disabled:opacity-50 ${
              isBright ? 'text-stone-500 hover:text-stone-900 hover:bg-stone-100' : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Error Message Alert */}
          {error && (
            <div
              role="alert"
              className={`p-3 rounded-xl text-xs border flex items-center gap-2 animate-shake ${
                isBright
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                  : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message Alert */}
          {successMsg && (
            <div
              role="status"
              className={`p-3 rounded-xl text-xs border flex items-center gap-2 ${
                isBright
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              }`}
            >
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Switcher */}
          {!isRegister ? (
            /* ================= LOGIN FORM ================= */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isBright ? 'text-stone-700' : 'text-stone-300'}`}>
                  Username or Email
                </label>
                <div className="relative">
                  <User size={15} className={`absolute left-3 top-3 ${isBright ? 'text-stone-400' : 'text-stone-500'}`} />
                  <input
                    id="login-identifier-input"
                    type="text"
                    autoFocus
                    placeholder="e.g. himanshu or himanshu@code3d.edu"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (error) setError('');
                    }}
                    className={`w-full border rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none transition-colors ${
                      isBright
                        ? 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600 focus:ring-1 focus:ring-amber-600'
                        : 'bg-[#0e1013] border-stone-800 text-stone-100 placeholder-stone-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isBright ? 'text-stone-700' : 'text-stone-300'}`}>
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className={`absolute left-3 top-3 ${isBright ? 'text-stone-400' : 'text-stone-500'}`} />
                  <input
                    id="login-password-input"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    className={`w-full border rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none transition-colors ${
                      isBright
                        ? 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600 focus:ring-1 focus:ring-amber-600'
                        : 'bg-[#0e1013] border-stone-800 text-stone-100 placeholder-stone-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition duration-150 bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xs cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn size={14} />
                )}
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              </button>
            </form>
          ) : (
            /* ================= REGISTRATION FORM ================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isBright ? 'text-stone-700' : 'text-stone-300'}`}>
                  Username <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <User size={14} className={`absolute left-3 top-2.5 ${isBright ? 'text-stone-400' : 'text-stone-500'}`} />
                  <input
                    type="text"
                    placeholder="e.g. himanshu"
                    value={regUsername}
                    onChange={(e) => {
                      setRegUsername(e.target.value);
                      if (error) setError('');
                    }}
                    className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none transition-colors ${
                      isBright
                        ? 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                        : 'bg-[#0e1013] border-stone-800 text-stone-100 placeholder-stone-600 focus:border-amber-500'
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
                    placeholder="name@example.com"
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      if (error) setError('');
                    }}
                    className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none transition-colors ${
                      isBright
                        ? 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                        : 'bg-[#0e1013] border-stone-800 text-stone-100 placeholder-stone-600 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isBright ? 'text-stone-700' : 'text-stone-300'}`}>
                    Password <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={14} className={`absolute left-3 top-2.5 ${isBright ? 'text-stone-400' : 'text-stone-500'}`} />
                    <input
                      type="password"
                      placeholder="Min 6 chars"
                      value={regPassword}
                      onChange={(e) => {
                        setRegPassword(e.target.value);
                        if (error) setError('');
                      }}
                      className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none transition-colors ${
                        isBright
                          ? 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                          : 'bg-[#0e1013] border-stone-800 text-stone-100 placeholder-stone-600 focus:border-amber-500'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isBright ? 'text-stone-700' : 'text-stone-300'}`}>
                    Confirm <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={14} className={`absolute left-3 top-2.5 ${isBright ? 'text-stone-400' : 'text-stone-500'}`} />
                    <input
                      type="password"
                      placeholder="Repeat password"
                      value={regConfirmPassword}
                      onChange={(e) => {
                        setRegConfirmPassword(e.target.value);
                        if (error) setError('');
                      }}
                      className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none transition-colors ${
                        isBright
                          ? 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                          : 'bg-[#0e1013] border-stone-800 text-stone-100 placeholder-stone-600 focus:border-amber-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isBright ? 'text-stone-700' : 'text-stone-300'}`}>
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Himanshu Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none transition-colors ${
                    isBright
                      ? 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                      : 'bg-[#0e1013] border-stone-800 text-stone-100 placeholder-stone-600 focus:border-amber-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isBright ? 'text-stone-700' : 'text-stone-300'}`}>
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-medium focus:outline-none transition-colors ${
                    isBright
                      ? 'bg-stone-50 border-stone-300 text-stone-800 focus:border-amber-600'
                      : 'bg-[#0e1013] border-stone-800 text-stone-200 focus:border-amber-500'
                  }`}
                >
                  <option value="Student Developer">Student Developer</option>
                  <option value="Lead Architect">Lead Architect</option>
                  <option value="Exhibition Evaluator">Exhibition Evaluator / Judge</option>
                  <option value="Guest Explorer">Guest Explorer</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition duration-150 bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xs cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UserPlus size={14} />
                )}
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              </button>
            </form>
          )}

          {/* Switcher Footer */}
          <div className="pt-2 border-t border-stone-800/40 text-center">
            <button
              type="button"
              onClick={() => {
                setAuthModalMode(isRegister ? 'login' : 'register');
                setError('');
                setSuccessMsg('');
              }}
              className={`text-xs transition cursor-pointer font-medium ${
                isBright
                  ? 'text-amber-700 hover:text-amber-900 underline underline-offset-2'
                  : 'text-amber-400 hover:text-amber-300 underline underline-offset-2'
              }`}
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Named Exports for compatibility
export function SignInModal() {
  return <LoginModal />;
}

export function SignUpModal() {
  return <LoginModal />;
}
