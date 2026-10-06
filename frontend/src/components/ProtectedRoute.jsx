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
          isBright ? 'bg-[#f7f6f3] text-stone-900' : 'bg-[#0e1013] text-stone-100'
        }`}
      >
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-xl border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
          <div className="absolute w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-stone-950 font-mono font-bold text-xs shadow-sm">
            3D
          </div>
        </div>
        <p className="text-xs font-mono text-amber-500 font-medium tracking-wider animate-pulse">
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
