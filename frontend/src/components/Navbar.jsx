import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, ChevronDown, Sun, Moon, User, UserPlus, Palette } from 'lucide-react';
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
    { id: 'home', path: '/', label: 'Home', icon: '🏠' },
    { id: 'visualizer', path: '/visualizer', label: '3D Studio', icon: '🧊' },
    { id: 'dsa', path: '/dsa', label: 'DSA Hub', icon: '📚' },
    { id: 'ai', path: '/ai', label: 'AI Tutor', icon: '🤖' },
    { id: 'quiz', path: '/quiz', label: 'Quiz', icon: '🎯' },
  ];

  const isNavActive = (item) => {
    if (item.path === '/') {
      return currentPath === '/' || currentPath === '/dashboard';
    }
    return currentPath === item.path || currentPath.startsWith(item.path + '/');
  };

  const handleNavClick = (path) => {
    if (!isAuthenticated && path !== '/') {
      loginAsGuest('3D Explorer');
    }
    navigate(path);
    if (setActiveTab) {
      if (path === '/') setActiveTab('dashboard');
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
    <header className={`h-13 backdrop-blur-xl border-b px-4 flex items-center justify-between z-30 sticky top-0 select-none transition-all duration-200 ${
      isBright
        ? 'bg-[#ffffff]/95 border-[#e2ded5] shadow-xs'
        : 'bg-[#111317]/95 border-[#242831] shadow-md shadow-black/20'
    }`}>
      {/* Brand Logo: CODE3D-AI */}
      <div
        className="flex items-center gap-2.5 cursor-pointer transition hover:opacity-95 shrink-0 group"
        onClick={() => navigate('/')}
        title="CODE3D-AI Spatial Code Studio"
      >
        <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shadow-xs text-stone-950 font-bold group-hover:scale-105 transition-transform duration-150">
          <Box className="w-4 h-4 text-stone-950 stroke-[2.5]" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black text-sm tracking-wider ${isBright ? 'text-stone-900' : 'text-stone-100'}`}>
              CODE<span className="text-amber-500">3D</span>
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
              isBright
                ? 'bg-stone-100 text-stone-700 border-stone-300'
                : 'bg-stone-800 text-amber-400 border-stone-700'
            }`}>
              AI
            </span>
            {backendOnline && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Backend Service Connected" />
            )}
          </div>
        </div>
      </div>

      {/* Navigation: Home | 3D Studio | DSA Hub | AI Tutor | Quiz */}
      <nav className={`flex items-center gap-1 p-0.5 rounded-lg border transition-colors ${
        isBright ? 'bg-[#f4f2ec] border-[#e2ded5]' : 'bg-[#16191f] border-[#242831]'
      }`}>
        {navLinks.map((item) => {
          const isActive = isNavActive(item);

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={`h-7.5 flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? isBright
                    ? 'bg-white text-stone-900 font-bold border shadow-xs'
                    : 'bg-slate-800 text-white font-bold border shadow-xs'
                  : isBright
                    ? 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/60'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
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

      {/* Right Side: Theme Toggle & Authentication Controls */}
      <div className="flex items-center gap-2">
        {/* Style & Palette Studio Trigger */}
        <button
          onClick={() => setIsStyleModalOpen(true)}
          className={`h-7.5 flex items-center gap-1.5 px-2.5 rounded-lg border text-xs font-semibold transition-all duration-150 shadow-2xs cursor-pointer active:scale-95 ${
            isBright
              ? 'bg-white hover:bg-stone-50 text-stone-800 border-stone-300'
              : 'bg-[#181c22] hover:bg-stone-800 text-stone-200 border-stone-700 hover:border-stone-500'
          }`}
          title="Customize Color Palette & Theme Template"
        >
          <span
            className="w-2.5 h-2.5 rounded-full shadow-2xs"
            style={{ backgroundColor: isBright ? currentAccent.bright : currentAccent.dark }}
          />
          <span className="hidden sm:inline font-medium">{currentTemplate?.name?.split(' ')?.[0] || 'Template'}</span>
        </button>

        {/* Dynamic Dark / Bright Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label={isBright ? 'Switch to Dark Mode' : 'Switch to Bright Mode'}
          title={isBright ? 'Switch to Dark Mode (🌙)' : 'Switch to Bright Mode (☀️)'}
          className={`h-7.5 flex items-center gap-1.5 px-2.5 rounded-lg border text-xs font-semibold transition-all duration-150 shadow-2xs cursor-pointer active:scale-95 ${
            isBright
              ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
              : 'bg-[#181c22] hover:bg-stone-800 text-stone-200 border-stone-700 hover:border-amber-500/40'
          }`}
        >
          {isBright ? (
            <>
              <Sun size={13} className="text-amber-600 fill-amber-500" />
              <span className="hidden sm:inline font-medium">Light</span>
            </>
          ) : (
            <>
              <Moon size={13} className="text-stone-300" />
              <span className="hidden sm:inline font-medium">Dark</span>
            </>
          )}
        </button>

        {/* Dynamic Auth Header */}
        {!isAuthenticated ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openLoginModal('login')}
              className={`h-7.5 flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs ${
                isBright
                  ? 'bg-stone-900 hover:bg-stone-800 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold'
              }`}
            >
              <User size={13} />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => openRegisterModal()}
              className={`h-7.5 hidden sm:flex items-center gap-1.5 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                isBright
                  ? 'border-stone-300 hover:bg-stone-100 text-stone-700'
                  : 'border-stone-700 hover:bg-stone-800 text-stone-200'
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
              className={`h-7.5 flex items-center gap-1.5 px-2.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                isBright
                  ? 'bg-stone-100 border-stone-300 hover:bg-stone-200/80 text-stone-800'
                  : 'bg-[#181c22] border-stone-700 hover:border-stone-600 text-stone-200'
              }`}
            >
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user?.fullName || user?.username || 'User'}
                className="w-4.5 h-4.5 rounded-full object-cover border border-amber-500/40"
              />
              <span className="hidden sm:inline font-bold">
                {user?.fullName ? user.fullName.split(' ')[0] : (user?.username || 'Account')}
              </span>
              <ChevronDown size={12} className={isBright ? 'text-stone-500' : 'text-stone-400'} />
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
      <TemplateCustomizerModal
        isOpen={isStyleModalOpen}
        onClose={() => setIsStyleModalOpen(false)}
      />
    </header>
  );
}
