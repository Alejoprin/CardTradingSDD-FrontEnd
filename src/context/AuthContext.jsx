import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';
import { setTokens, clearTokens } from '../services/storageService';
import { setLogoutCallback } from '../services/api';

function decodeJwtPayload(token) {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Silent session restore on mount
  useEffect(() => {
    async function restoreSession() {
      // <--- NUEVO: Verificamos si hay indicios de sesión previa
      const hasSession = localStorage.getItem('has_session');

      // Si no hay sesión, cortamos la ejecución, quitamos el loading y evitamos el refresh
      if (!hasSession) {
        setLoading(false);
        return;
      }

      try {
        const data = await authService.refresh();
        setTokens({ accessToken: data.accessToken });
        const payload = decodeJwtPayload(data.accessToken);
        const userId = payload?.sub;
        const profile = userId ? await userService.getUserProfile(userId) : null;
        setUser(profile);
        setIsAuthenticated(true);
      } catch {
        // No valid refresh token — user must log in
        localStorage.removeItem('has_session'); // <--- NUEVO: Limpiamos la bandera si falla
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

    localStorage.setItem('has_session', 'true'); // <--- NUEVO: Guardamos la bandera de éxito

    setTokens({ accessToken: data.accessToken });
    const payload = decodeJwtPayload(data.accessToken);
    const userId = payload?.sub;
    const profile = userId ? await userService.getUserProfile(userId) : null;
    setUser(profile);
    setIsAuthenticated(true);
    return data;
  }, []);

  // Register logout callback with api interceptor so it can force logout on failed refresh
  useEffect(() => {
    setLogoutCallback(() => {
      localStorage.removeItem('has_session'); // <--- NUEVO: Limpiamos la bandera
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
      localStorage.removeItem('has_session'); // <--- NUEVO: Limpiamos la bandera al salir
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