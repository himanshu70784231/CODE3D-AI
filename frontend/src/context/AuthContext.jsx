import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  loginGuest,
  getCurrentUser,
  getStoredUser,
} from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize from safe local session to avoid screen flicker on refresh
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  // Validate session on mount
  useEffect(() => {
    let isMounted = true;
    getCurrentUser()
      .then((res) => {
        if (!isMounted) return;
        if (res && res.success && res.user) {
          setUser(res.user);
        } else if (!getStoredUser()) {
          setUser(null);
        }
      })
      .catch(() => {
        if (isMounted && !getStoredUser()) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials) => {
    try {
      const res = await apiLogin(credentials);
      if (res && res.success) {
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, message: res?.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await apiRegister(userData);
      if (res && res.success) {
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, message: res?.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  const loginAsGuest = (customName) => {
    const res = loginGuest(customName);
    if (res && res.success) {
      setUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  };

  const openLoginModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsLoginModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalMode('register');
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        loginAsGuest,
        logout,
        isLoginModalOpen,
        authModalMode,
        setAuthModalMode,
        openLoginModal,
        openRegisterModal,
        closeLoginModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
