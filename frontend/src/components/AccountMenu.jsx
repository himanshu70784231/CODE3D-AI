import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bookmark, History, Settings, LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

/**
 * AccountMenu Component (Section 9)
 * Renders the clean account dropdown with exact specification:
 * Logged out: Sign In, Create Account
 * Logged in: Profile, Save, History, Settings, Sign Out
 */
export default function AccountMenu({ onClose }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, openLoginModal, openRegisterModal } = useAuth();
  const { isBright } = useTheme();

  const handleAction = (callback) => {
    if (onClose) onClose();
    callback();
  };

  return (
    <div
      className={`w-56 border rounded-xl shadow-2xl p-2 z-50 text-xs animate-fadeIn ${
        isBright ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
      }`}
    >
      {/* Header inside Account menu */}
      {isAuthenticated && user ? (
        <div className={`p-2 border-b mb-1 ${isBright ? 'border-slate-100' : 'border-slate-800'}`}>
          <p className={`font-bold text-xs ${isBright ? 'text-slate-900' : 'text-white'}`}>
            {user?.fullName || user?.username}
          </p>
          <p className={`text-[10px] font-mono ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
            {user?.email || 'Signed In'}
          </p>
          <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
            {user?.role || 'Student Developer'}
          </span>
        </div>
      ) : (
        <div className={`p-2 border-b mb-1 space-y-1.5 ${isBright ? 'border-slate-100' : 'border-slate-800'}`}>
          <button
            onClick={() => handleAction(() => openLoginModal('login'))}
            className="w-full py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <User size={13} />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => handleAction(() => openRegisterModal())}
            className={`w-full py-1.5 px-3 rounded-lg border font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
              isBright
                ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                : 'border-slate-700 hover:bg-slate-800 text-slate-200'
            }`}
          >
            <UserPlus size={13} />
            <span>Create Account</span>
          </button>
          <p className={`text-[10px] text-center pt-0.5 ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
            Sign in to sync your saved traces and history.
          </p>
        </div>
      )}

      {/* Menu items: Profile, Save, History, Settings, Sign Out */}
      <div className="py-1 space-y-0.5">
        {isAuthenticated && (
          <button
            onClick={() => handleAction(() => navigate('/settings'))}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer transition ${
              isBright ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <User size={13} className="text-cyan-400" />
            <span>Profile</span>
          </button>
        )}

        <button
          onClick={() =>
            handleAction(() => {
              if (!isAuthenticated) openLoginModal('login');
              else navigate('/saved');
            })
          }
          className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer transition ${
            isBright ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Bookmark size={13} className="text-cyan-500" />
          <div className="flex-1 flex items-center justify-between">
            <span>Save</span>
            {!isAuthenticated && <span className="text-[9px] font-mono text-amber-500 font-bold">Sign-in</span>}
          </div>
        </button>

        <button
          onClick={() =>
            handleAction(() => {
              if (!isAuthenticated) openLoginModal('login');
              else navigate('/history');
            })
          }
          className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer transition ${
            isBright ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <History size={13} className="text-amber-500" />
          <div className="flex-1 flex items-center justify-between">
            <span>History</span>
            {!isAuthenticated && <span className="text-[9px] font-mono text-amber-500 font-bold">Sign-in</span>}
          </div>
        </button>

        <button
          onClick={() => handleAction(() => navigate('/settings'))}
          className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer transition ${
            isBright ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Settings size={13} className="text-purple-400" />
          <span>Settings</span>
        </button>

        {isAuthenticated && (
          <button
            onClick={() => handleAction(() => logout())}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 flex items-center gap-2 cursor-pointer transition"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );
}
