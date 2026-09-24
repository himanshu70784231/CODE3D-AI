import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/apiService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('code3d_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('code3d_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('code3d_user');
    }
  }, [user]);

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    if (res && res.success) {
      setUser(res);
      return { success: true };
    }
    return { success: false, message: res?.message || 'Login failed' };
  };

  const register = async (userData) => {
    const res = await registerUser(userData);
    if (res && res.success) {
      setUser(res);
      return { success: true };
    }
    return { success: false, message: res?.message || 'Registration failed' };
  };

  const logout = () => {
    try {
      localStorage.removeItem('code3d_user');
    } catch {}
    setUser(null);
  };

  const loginDemo = (role = 'Lead Architect') => {
    const demoUser = {
      success: true,
      userId: 101,
      username: 'himanshu',
      fullName: 'Himanshu (Lead Architect)',
      email: 'himanshu@code3d.edu',
      role: role,
      token: 'demo-token-himanshu'
    };
    setUser(demoUser);
    return { success: true, user: demoUser };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loginDemo,
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
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
