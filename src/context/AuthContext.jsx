import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';
import { setTokens, clearTokens } from '../services/storageService';
import { setLogoutCallback } from '../services/api';

function decodeJwtPayload(token) {
  try {
    // Verificar que el token existe y es un string
    if (!token || typeof token !== 'string') {
      return null;
    }

    // Verificar que tiene la estructura correcta (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decodificar el payload
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    );

    // Opcional: Verificar expiración
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Registrar callback de logout PRIMERO (para que esté listo si restoreSession falla)
  useEffect(() => {
    setLogoutCallback(() => {
      localStorage.removeItem('has_session');
      clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    });
  }, []);

  // Restaurar sesión silenciosamente al montar
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const hasSession = localStorage.getItem('has_session');

      // Si no hay sesión previa, evitar llamada al backend
      if (!hasSession) {
        setLoading(false);
        return;
      }

      try {
        const data = await authService.refresh();

        // Verificar si el componente sigue montado
        if (cancelled) return;

        setTokens({ accessToken: data.accessToken });

        const payload = decodeJwtPayload(data.accessToken);
        const userId = payload?.sub;

        // Si no hay userId válido, lanzar error para forzar logout
        if (!userId) {
          throw new Error('Invalid token: missing user ID');
        }

        const profile = await userService.getUserProfile(userId);

        // Verificar de nuevo antes de actualizar estado
        if (!cancelled) {
          setUser(profile);
          setIsAuthenticated(true);
        }
      } catch {
        // Si falla el refresh o la obtención del perfil, limpiar sesión
        if (!cancelled) {
          localStorage.removeItem('has_session');
          clearTokens();
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    // Cleanup: marcar como cancelado cuando el componente se desmonte
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);

    localStorage.setItem('has_session', 'true');
    setTokens({ accessToken: data.accessToken });

    const payload = decodeJwtPayload(data.accessToken);
    const userId = payload?.sub;

    // Validar que el token tenga userId
    if (!userId) {
      throw new Error('Invalid token: missing user ID');
    }

    const profile = await userService.getUserProfile(userId);

    // Validar que se obtuvo el perfil
    if (!profile) {
      throw new Error('Failed to fetch user profile');
    }

    setUser(profile);
    setIsAuthenticated(true);

    return data;
  }, []);

  const loginWithGoogle = useCallback(async (accessToken) => {
    localStorage.setItem('has_session', 'true');
    setTokens({ accessToken }); // igual que setTokens del login normal

    const payload = decodeJwtPayload(accessToken);
    const userId = payload?.sub;

    if (!userId) throw new Error('Invalid token: missing user ID');

    const profile = await userService.getUserProfile(userId);

    if (!profile) throw new Error('Failed to fetch user profile');

    setUser(profile);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignorar errores de logout en el backend
      // Siempre limpiar el estado local
    } finally {
      localStorage.removeItem('has_session');
      clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, loginWithGoogle, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export default AuthContext;