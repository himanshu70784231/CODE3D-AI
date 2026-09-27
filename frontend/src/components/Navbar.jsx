import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Box, Layers, History, Settings, Code2, User, LogOut, Sparkles, ChevronDown, Sun, Moon, Bookmark, Bot, Check, Shield, UserPlus } from 'lucide-react';
import { checkBackendHealth } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AccountMenu from './AccountMenu';

export default function Navbar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [backendOnline, setBackendOnline] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const { user, isAuthenticated, logout, openLoginModal, openRegisterModal } = useAuth();
  const { theme, toggleTheme, isBright } = useTheme();

  const currentPath = location.pathname;
  const currentTab = currentPath === '/' ? 'visualizer' : currentPath.replace('/', '');

  const handleNavClick = (id) => {
    const targetPath = id === 'dashboard' ? '/' : `/${id}`;
    navigate(targetPath);
    if (setActiveTab) setActiveTab(id);
  };

  useEffect(() => {
    checkBackendHealth().then((online) => setBackendOnline(online));
    const interval = setInterval(() => {
      checkBackendHealth().then((online) => setBackendOnline(online));
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Section 6: Clean Header Navigation Hierarchy
  // CODE3D-AI | Visualizer | DSA Hub | AI Tutor | Quiz | Account ▼
  const navLinks = [
    { id: 'visualizer', path: '/visualizer', label: 'Visualizer', icon: Code2 },
    { id: 'dsa', path: '/dsa', label: 'DSA Hub', icon: Layers },
    { id: 'ai', path: '/ai', label: 'AI Tutor', icon: Bot },
    { id: 'quiz', path: '/quiz', label: 'Quiz', icon: Sparkles },
  ];

  return (
    <header className={`h-14 backdrop-blur-md border-b px-4 flex items-center justify-between z-30 sticky top-0 select-none transition-colors duration-200 ${
      isBright
        ? 'bg-white/95 border-slate-200 shadow-xs'
        : 'bg-[#090d16]/95 border-slate-800/80 shadow-md shadow-black/20'
    }`}>
      {/* Dedicated Home Button & Brand Logo (Section 10) */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => navigate('/')}
          className={`h-9 w-9 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
            location.pathname === '/'
              ? isBright
                ? 'bg-cyan-100 text-cyan-800 border-cyan-300 shadow-xs'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs'
              : isBright
                ? 'bg-slate-100 text-slate-700 hover:text-cyan-700 hover:bg-cyan-50 border-slate-200'
                : 'bg-slate-900 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 border-slate-800'
          }`}
          title="Home - Return to CODE3D-AI Dashboard"
          aria-label="Home"
        >
          <Home size={18} />
        </button>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
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
              Interactive 3D Code & Algorithm Execution
            </span>
          </div>
        </div>
      </div>

      {/* Center Navigation Links: Visualizer | DSA Hub | AI Tutor | Quiz */}
      <nav className="hidden md:flex items-center gap-1 sm:gap-2">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = (activeTab ? activeTab === item.id : currentTab === item.id) || currentPath === item.path;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? isBright
                    ? 'bg-cyan-50 text-cyan-700 border border-cyan-300 shadow-xs font-semibold'
                    : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-xs shadow-cyan-900/40 font-semibold'
                  : isBright
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon size={14} className={isActive ? (isBright ? 'text-cyan-600' : 'text-cyan-400') : ''} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Side: Theme Toggle & Unified Account Dropdown */}
      <div className="flex items-center gap-2">
        {/* Dynamic Dark / Bright Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label={isBright ? 'Switch to Dark Mode' : 'Switch to Bright Mode'}
          title={isBright ? 'Switch to Dark Mode (🌙)' : 'Switch to Bright Mode (☀️)'}
          className={`h-8 flex items-center gap-1.5 px-2.5 rounded-lg border text-xs font-semibold transition-all duration-200 shadow-2xs cursor-pointer ${
            isBright
              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
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

        {/* Section 4 & 6: Unified Account Dropdown (Save, History, Settings inside Account) */}
        <div className="relative" ref={accountMenuRef}>
          <button
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            className={`h-8 flex items-center gap-1.5 px-2.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
              isAuthenticated && user
                ? isBright
                  ? 'bg-slate-100 border-slate-200 hover:bg-slate-200/80 text-slate-800'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-400 shadow-xs'
            }`}
          >
            {isAuthenticated && user ? (
              <>
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={user?.fullName || user?.username || 'User'}
                  className="w-5 h-5 rounded-full object-cover border border-cyan-500/40"
                />
                <span className="hidden sm:inline font-bold">
                  {user?.fullName ? user.fullName.split(' ')[0] : (user?.username || 'Account')}
                </span>
                <ChevronDown size={12} className={isBright ? 'text-slate-500' : 'text-slate-400'} />
              </>
            ) : (
              <>
                <User size={13} />
                <span>Account</span>
                <ChevronDown size={12} />
              </>
            )}
          </button>

          {/* Account Dropdown Menu (Section 9) */}
          {isAccountMenuOpen && (
            <div className="absolute right-0 mt-2 z-50">
              <AccountMenu onClose={() => setIsAccountMenuOpen(false)} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
