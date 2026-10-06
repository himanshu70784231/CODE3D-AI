import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, ChevronDown, Sun, Moon, User, UserPlus, Palette, Code2, BookOpen, Sparkles, Trophy } from 'lucide-react';
import { checkBackendHealth } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AccountMenu from './AccountMenu';
import TemplateCustomizerModal from './TemplateCustomizerModal';

export default function Navbar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [backendOnline, setBackendOnline] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const { user, isAuthenticated, logout, loginAsGuest, openLoginModal, openRegisterModal } = useAuth();
  const { theme, toggleTheme, isBright, currentAccent, currentTemplate } = useTheme();

  const currentPath = location.pathname;

  const navLinks = [
    { id: 'home', path: '/app', label: 'Home', icon: '🏠' },
    { id: 'editor', path: '/editor', label: 'Code Editor', icon: '⚡' },
    { id: 'visualizer', path: '/visualizer', label: '3D Studio', icon: '🧊' },
    { id: 'dsa', path: '/dsa', label: 'DSA Hub', icon: '📚' },
    { id: 'ai', path: '/ai', label: 'AI Tutor', icon: '🤖' },
    { id: 'quiz', path: '/quiz', label: 'Quiz', icon: '🎯' },
  ];

  const isNavActive = (item) => {
    if (item.path === '/app') {
      return currentPath === '/' || currentPath === '/app' || currentPath === '/dashboard';
    }
    if (item.path === '/editor') {
      return currentPath === '/editor';
    }
    if (item.path === '/visualizer') {
      return currentPath === '/visualizer' || currentPath === '/workspace' || currentPath === '/visualize';
    }
    return currentPath === item.path || currentPath.startsWith(item.path + '/');
  };

  const handleNavClick = (path) => {
    navigate(path);
    if (setActiveTab) {
      if (path === '/app' || path === '/') setActiveTab('dashboard');
      else setActiveTab(path.replace('/', ''));
    }
  };

  useEffect(() => {
    checkBackendHealth().then((online) => setBackendOnline(online));
    const interval = setInterval(() => {
      checkBackendHealth().then((online) => setBackendOnline(online));
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`h-14 backdrop-blur-xl border-b px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0 select-none transition-all duration-200 ${
        isBright
          ? 'bg-white/95 border-slate-200 shadow-xs'
          : 'bg-[#090b10]/95 border-slate-800/80 shadow-md shadow-black/20'
      }`}
    >
      {/* Brand Logo: CODE3D AI */}
      <div
        className="flex items-center gap-2.5 cursor-pointer transition hover:opacity-95 shrink-0 group"
        onClick={() => navigate('/app')}
        title="CODE3D AI Workspace"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-md shadow-orange-500/25 text-white font-bold group-hover:scale-105 transition-transform duration-150 relative">
          <Box className="w-4.5 h-4.5 text-white stroke-[2.5]" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`font-black text-base tracking-tight ${isBright ? 'text-slate-900' : 'text-slate-100'}`}>
            CODE<span className="text-orange-500">3D</span>
          </span>
          <span className="text-[10px] font-black tracking-widest px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
            AI
          </span>
        </div>
      </div>

      {/* Navigation Links: Home | Code Editor | 3D Studio | DSA Hub | AI Tutor | Quiz */}
      <nav
        className={`hidden md:flex items-center gap-1 p-1 rounded-xl border transition-colors ${
          isBright ? 'bg-slate-100/80 border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}
      >
        {navLinks.map((item) => {
          const isActive = isNavActive(item);

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={`h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? isBright
                    ? 'bg-white text-slate-900 font-bold border border-slate-200 shadow-xs'
                    : 'bg-slate-800 text-white font-bold border border-slate-700 shadow-xs'
                  : isBright
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              style={{
                borderColor: isActive ? (isBright ? currentAccent.bright : currentAccent.dark) : undefined,
                boxShadow: isActive ? `0 2px 10px ${currentAccent.glow}` : undefined,
              }}
            >
              <span className="text-xs">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Side: System Status, Theme Toggle, Palette Studio & Account Controls */}
      <div className="flex items-center gap-2">
        {/* Live System Status Pill */}
        <div
          className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wider uppercase transition-colors ${
            backendOnline
              ? isBright
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
              : isBright
              ? 'bg-stone-100 text-stone-600 border-stone-200'
              : 'bg-stone-900 text-stone-400 border-stone-800'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              backendOnline ? 'bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500' : 'bg-amber-500'
            }`}
          />
          <span>{backendOnline ? 'Systems online' : 'Local mode'}</span>
        </div>

        {/* Style & Palette Studio Trigger */}
        <button
          onClick={() => setIsStyleModalOpen(true)}
          className={`h-8 flex items-center gap-1.5 px-2.5 rounded-lg border text-xs font-semibold transition-all duration-150 shadow-2xs cursor-pointer active:scale-95 ${
            isBright
              ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
          }`}
          title="Customize Color Palette & Theme Template"
        >
          <span
            className="w-2.5 h-2.5 rounded-full shadow-2xs"
            style={{ backgroundColor: isBright ? currentAccent.bright : currentAccent.dark }}
          />
          <span className="hidden sm:inline font-medium">
            {currentTemplate?.name?.split(' ')?.[0] || 'Template'}
          </span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label={isBright ? 'Switch to Dark Mode' : 'Switch to Bright Mode'}
          title={isBright ? 'Switch to Dark Mode (🌙)' : 'Switch to Bright Mode (☀️)'}
          className={`h-8 w-8 flex items-center justify-center rounded-lg border text-xs font-semibold transition-all duration-150 shadow-2xs cursor-pointer active:scale-95 ${
            isBright
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
          }`}
        >
          {isBright ? (
            <Sun size={14} className="text-amber-600 fill-amber-500" />
          ) : (
            <Moon size={14} className="text-slate-300" />
          )}
        </button>

        {/* Auth / Account Controls */}
        {!isAuthenticated ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openLoginModal('login')}
              className="h-8 flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs bg-orange-500 hover:bg-orange-400 text-white"
            >
              <User size={13} />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => openRegisterModal()}
              className={`h-8 hidden sm:flex items-center gap-1.5 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                isBright
                  ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                  : 'border-slate-700 hover:bg-slate-800 text-slate-200'
              }`}
            >
              <UserPlus size={13} />
              <span>Register</span>
            </button>
          </div>
        ) : (
          <div className="relative" ref={accountMenuRef}>
            <button
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className={`h-8 flex items-center gap-1.5 px-2.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                isBright
                  ? 'bg-slate-100 border-slate-200 hover:bg-slate-200/80 text-slate-800'
                  : 'bg-slate-900 border-slate-700 hover:border-slate-600 text-slate-200'
              }`}
            >
              <img
                src={
                  user?.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={user?.fullName || user?.username || 'User'}
                className="w-5 h-5 rounded-full object-cover border border-orange-500/40"
              />
              <span className="hidden sm:inline font-bold">
                {user?.fullName ? user.fullName.split(' ')[0] : user?.username || 'Account'}
              </span>
              <ChevronDown size={12} className={isBright ? 'text-slate-500' : 'text-slate-400'} />
            </button>

            {/* Account Dropdown Menu */}
            {isAccountMenuOpen && (
              <div className="absolute right-0 mt-2 z-50">
                <AccountMenu onClose={() => setIsAccountMenuOpen(false)} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Template & Palette Studio Modal */}
      <TemplateCustomizerModal isOpen={isStyleModalOpen} onClose={() => setIsStyleModalOpen(false)} />
    </header>
  );
}
