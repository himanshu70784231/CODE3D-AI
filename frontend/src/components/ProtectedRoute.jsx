import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

/**
 * ProtectedRoute Component
 * Enforces authentication-first policy across all protected workspace routes.
 * If user is unauthenticated, redirects to /login preserving the requested target location.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const { isBright } = useTheme();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className={`min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors ${
          isBright ? 'bg-slate-100 text-slate-900' : 'bg-[#070b14] text-slate-100'
        }`}
      >
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <div className="absolute w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-[11px] shadow-lg shadow-cyan-500/30">
            3D
          </div>
        </div>
        <p className="text-xs font-mono text-cyan-400 font-semibold tracking-wider animate-pulse">
          VERIFYING SESSION...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
