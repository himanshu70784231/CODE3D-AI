import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Lock, LogIn, UserPlus, ArrowLeft, Shield } from 'lucide-react';

export default function ProtectedRoute({ children, title = 'Authentication Required', message = 'Please sign in to view your saved execution history.' }) {
  const { isAuthenticated, loading, openLoginModal, openRegisterModal } = useAuth();
  const { isBright } = useTheme();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center min-h-[60vh] transition-colors ${
        isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'
      }`}>
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className={`text-xs font-mono ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
          Checking session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`flex-1 flex items-center justify-center p-6 md:p-12 transition-colors select-none ${
        isBright ? 'bg-slate-100 text-slate-900' : 'bg-[#070b14] text-slate-100'
      }`}>
        <div className={`w-full max-w-md p-8 rounded-2xl border shadow-2xl text-center relative overflow-hidden transition-all ${
          isBright
            ? 'bg-white border-slate-200 shadow-slate-300'
            : 'bg-[#090d16] border-slate-800 shadow-cyan-950/20'
        }`}>
          {/* Top Lock Badge */}
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10 mb-4">
            <Lock size={28} className="stroke-[2.2]" />
          </div>

          <h2 className={`text-xl font-extrabold tracking-tight mb-2 ${isBright ? 'text-slate-900' : 'text-white'}`}>
            {title}
          </h2>

          <p className={`text-xs leading-relaxed max-w-sm mx-auto mb-6 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
            {message}
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => openLoginModal('login')}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition duration-150 shadow-md cursor-pointer ${
                isBright
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => openRegisterModal()}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs border flex items-center justify-center gap-2 transition duration-150 cursor-pointer ${
                isBright
                  ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                  : 'border-slate-800 hover:bg-slate-900 text-slate-200'
              }`}
            >
              <UserPlus size={14} />
              <span>Create Free Account</span>
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800/40">
            <button
              onClick={() => navigate('/visualizer')}
              className={`inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer transition ${
                isBright ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowLeft size={13} />
              <span>Continue in Public 3D Visualizer</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
