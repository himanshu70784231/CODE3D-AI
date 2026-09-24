import React, { useState, useEffect } from 'react';
import { Box, Layers, HelpCircle, History, Settings, Play, Home, Code2, User, LogOut, Sparkles, ChevronDown, Sun, Moon, BookOpen } from 'lucide-react';
import { checkBackendHealth } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ activeTab, setActiveTab, onOpenCodeDoctor, onOpenPersonalProblem }) {
  const [backendOnline, setBackendOnline] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();
  const { theme, toggleTheme, isBright } = useTheme();

  useEffect(() => {
    checkBackendHealth().then((online) => setBackendOnline(online));
    const interval = setInterval(() => {
      checkBackendHealth().then((online) => setBackendOnline(online));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, enabled: true },
    { id: 'visualizer', label: 'Visualizer', icon: Code2, enabled: true },
    { id: 'striver', label: 'Striver Sheet 📜', icon: BookOpen, enabled: true, badge: '182' },
    { id: 'dsa', label: 'DSA Hub', icon: Layers, enabled: true },
    { id: 'quiz', label: 'Quiz Arena', icon: HelpCircle, enabled: true },
    { id: 'history', label: 'History', icon: History, enabled: true },
    { id: 'settings', label: 'Settings', icon: Settings, enabled: true },
  ];

  return (
    <header className={`h-14 backdrop-blur-md border-b px-4 flex items-center justify-between z-30 sticky top-0 select-none transition-colors duration-200 ${
      isBright
        ? 'bg-white/90 border-slate-200 shadow-sm'
        : 'bg-slate-900/90 border-slate-800/80 shadow-md shadow-black/20'
    }`}>
      {/* Brand logo & title */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
          <Box className="w-5 h-5 text-slate-950 stroke-[2.5]" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`font-bold text-base tracking-wider font-sans ${isBright ? 'text-slate-900' : 'text-white'}`}>
              CODE<span className="text-cyan-500 dark:text-cyan-400">3D</span> <span className="text-xs bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 rounded px-1.5 py-0.2 font-mono">AI</span>
            </span>
          </div>
          <span className={`text-[10px] hidden sm:inline tracking-tight -mt-0.5 ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
            Don't just read the code. See the code execute.
          </span>
        </div>
      </div>

      {/* Center Navigation Links */}
      <nav className="hidden md:flex items-center gap-1 sm:gap-1.5">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? isBright
                    ? 'bg-cyan-50 text-cyan-700 border border-cyan-300 shadow-sm font-semibold'
                    : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-900/40'
                  : isBright
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon size={14} className={isActive ? (isBright ? 'text-cyan-600' : 'text-cyan-400') : ''} />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : isBright
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Side: Theme Toggle & User Auth */}
      <div className="flex items-center gap-2">
        {/* Dynamic Dark / Bright Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label={isBright ? 'Switch to Dark Mode' : 'Switch to Bright Mode'}
          title={isBright ? 'Switch to Dark Mode (🌙)' : 'Switch to Bright Mode (☀️)'}
          className={`h-8 flex items-center gap-1.5 px-2.5 rounded-lg border text-xs font-semibold transition-all duration-200 shadow-xs cursor-pointer ${
            isBright
              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 shadow-amber-200/50'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700 shadow-slate-900/60'
          }`}
        >
          {isBright ? (
            <>
              <Sun size={14} className="text-amber-500 fill-amber-400 animate-spin-slow" />
              <span className="hidden sm:inline">Bright</span>
            </>
          ) : (
            <>
              <Moon size={14} className="text-cyan-400 fill-cyan-400/20" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {/* User Profile / Login System */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className={`h-8 flex items-center gap-2 px-2 rounded-lg border transition cursor-pointer ${
                isBright ? 'bg-slate-100 border-slate-200 hover:bg-slate-200/80' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user?.fullName || user?.username || 'User'}
                className="w-6 h-6 rounded-full object-cover border border-cyan-500/40"
              />
              <div className="hidden sm:flex flex-col text-left pr-1">
                <span className={`text-[11px] font-bold leading-tight ${isBright ? 'text-slate-900' : 'text-slate-200'}`}>
                  {user?.fullName ? user.fullName.split(' ')[0] : (user?.username || 'User')}
                </span>
                <span className="text-[9px] font-mono text-cyan-600 dark:text-cyan-400 leading-none">
                  {user?.role || 'Student'}
                </span>
              </div>
              <ChevronDown size={12} className={isBright ? 'text-slate-500' : 'text-slate-400'} />
            </button>

            {/* Profile Dropdown */}
            {isProfileMenuOpen && user && (
              <div className={`absolute right-0 mt-2 w-56 border rounded-xl shadow-2xl p-2 z-50 text-xs animate-fadeIn ${
                isBright ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
              }`}>
                <div className={`p-2 border-b ${isBright ? 'border-slate-100' : 'border-slate-800'}`}>
                  <p className={`font-bold text-xs ${isBright ? 'text-slate-900' : 'text-white'}`}>{user?.fullName || user?.username}</p>
                  <p className={`text-[10px] font-mono ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>{user?.email || `${user?.username || 'student'}@code3d.edu`}</p>
                  <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
                    {user?.role || 'Student Developer'}
                  </span>
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => {
                      toggleTheme();
                      setIsProfileMenuOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer ${
                      isBright ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    {isBright ? <Moon size={12} /> : <Sun size={12} />}
                    <span>Switch to {isBright ? 'Dark' : 'Bright'} Mode</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                      if (setActiveTab) setActiveTab('dashboard');
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-red-500/10 text-red-500 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut size={12} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={openLoginModal}
            className="h-8 flex items-center gap-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition shadow-xs shadow-cyan-500/20 cursor-pointer"
          >
            <User size={13} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}

