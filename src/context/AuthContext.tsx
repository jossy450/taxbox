import { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole, AuthState } from '../types/auth';
import {
  getToken, getStoredUser, setSession, clearSession,
  apiLogin, apiRegister, apiGoogleLogin, apiGetMe,
  apiForgotPassword, apiResetPassword,
} from '../api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; password: string; role: UserRole; company?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  hasRole: (roles: UserRole[]) => boolean;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string; token?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      apiGetMe(token)
        .then(data => {
          setUser(data.user);
          setSession(data.user, token);
        })
        .catch(() => {
          clearSession();
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await apiLogin(email, password);
      setSession(data.user, data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string; role: UserRole; company?: string }) => {
    try {
      const result = await apiRegister(data);
      setSession(result.user, result.token);
      setUser(result.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
    const token = getToken();
    if (token) {
      const stored = JSON.parse(localStorage.getItem('taxbox_api_session') || '{}');
      stored.user = { ...stored.user, ...data };
      localStorage.setItem('taxbox_api_session', JSON.stringify(stored));
    }
  }, []);

  const hasRole = useCallback((roles: UserRole[]) => {
    return user !== null && roles.includes(user.role);
  }, [user]);

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      const data = await apiForgotPassword(email);
      return { success: true, token: data.token };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      await apiResetPassword(token, newPassword);
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, []);

  const googleLogin = useCallback(async () => {
    try {
      const emails = ['google.user@gmail.com', 'profile@gmail.com', 'work@gmail.com'];
      const names = ['Google User', 'Profile User', 'Work User'];
      const pick = Math.floor(Math.random() * emails.length);
      const data = await apiGoogleLogin({
        email: emails[pick],
        name: names[pick],
        googleId: `google_${Date.now()}`,
      });
      setSession(data.user, data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: user !== null, isLoading,
      login, register, logout, updateUser, hasRole,
      requestPasswordReset, resetPassword, googleLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
