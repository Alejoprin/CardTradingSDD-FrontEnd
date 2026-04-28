import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { setTokens, clearTokens } from '../services/storageService';
import { setLogoutCallback } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Silent session restore on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const data = await authService.refresh();
        setTokens({ accessToken: data.accessToken });
        setUser(data.user);
        setIsAuthenticated(true);
      } catch {
        // No valid refresh token — user must log in
        clearTokens();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    setTokens({ accessToken: data.accessToken });
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  }, []);

  // Register logout callback with api interceptor so it can force logout on failed refresh
  useEffect(() => {
    setLogoutCallback(() => {
      clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Swallow logout errors — always clear local state
    } finally {
      clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
