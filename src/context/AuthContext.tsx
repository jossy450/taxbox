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

const DEMO_USERS: { email: string; password: string; user: User }[] = [
  { email: 'admin@taxbox.ng', password: 'demo123', user: { id: 'demo-admin', email: 'admin@taxbox.ng', name: 'Admin User', role: 'admin', company: 'TaxBox NG' } },
  { email: 'hr@company.com', password: 'demo123', user: { id: 'demo-hr', email: 'hr@company.com', name: 'HR Manager', role: 'corporate', company: 'ACME Corp' } },
  { email: 'consultant@taxpro.com', password: 'demo123', user: { id: 'demo-consultant', email: 'consultant@taxpro.com', name: 'Tax Consultant', role: 'consultant', company: 'TaxPro Ltd' } },
  { email: 'user@example.com', password: 'demo123', user: { id: 'demo-user', email: 'user@example.com', name: 'John Doe', role: 'individual' } },
];

const DEMO_TOKEN_PREFIX = 'demo_token_';
const LOCAL_AUTH_KEY = 'taxbox_local_auth';

function generateDemoToken(email: string) {
  return DEMO_TOKEN_PREFIX + btoa(email) + '_' + Date.now();
}

function isDemoToken(token: string) {
  return token.startsWith(DEMO_TOKEN_PREFIX);
}

function findDemoUser(email: string, password: string) {
  return DEMO_USERS.find(u => u.email === email && u.password === password);
}

function isBackendReachable(): Promise<boolean> {
  return fetch('/api/health', { method: 'GET', signal: AbortSignal.timeout(3000) })
    .then(r => r.ok)
    .catch(() => false);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    if (isDemoToken(token)) {
      const stored = localStorage.getItem(LOCAL_AUTH_KEY);
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          clearSession();
          localStorage.removeItem(LOCAL_AUTH_KEY);
        }
      }
      setIsLoading(false);
      return;
    }

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
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await apiLogin(email, password);
      setSession(data.user, data.token);
      setUser(data.user);
      return { success: true };
    } catch {
      const demo = findDemoUser(email, password);
      if (demo) {
        const token = generateDemoToken(email);
        setSession(demo.user, token);
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(demo.user));
        setUser(demo.user);
        return { success: true };
      }
      const reachable = await isBackendReachable();
      if (!reachable) {
        return { success: false, error: 'Backend server is not running. Login is unavailable in demo mode for this account.' };
      }
      return { success: false, error: 'Invalid email or password' };
    }
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string; role: UserRole; company?: string }) => {
    try {
      const result = await apiRegister(data);
      setSession(result.user, result.token);
      setUser(result.user);
      return { success: true };
    } catch {
      const reachable = await isBackendReachable();
      if (!reachable) {
        return { success: false, error: 'Backend server is not running. Registration is unavailable in demo mode.' };
      }
      return { success: false, error: 'Registration failed' };
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    localStorage.removeItem(LOCAL_AUTH_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
    const token = getToken();
    if (token) {
      const stored = JSON.parse(localStorage.getItem('taxbox_api_session') || '{}');
      stored.user = { ...stored.user, ...data };
      localStorage.setItem('taxbox_api_session', JSON.stringify(stored));
      if (isDemoToken(token)) {
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(stored.user));
      }
    }
  }, []);

  const hasRole = useCallback((roles: UserRole[]) => {
    return user !== null && roles.includes(user.role);
  }, [user]);

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      const data = await apiForgotPassword(email);
      return { success: true, token: data.token };
    } catch {
      const reachable = await isBackendReachable();
      if (!reachable) {
        return { success: false, error: 'Backend server is not running. Password reset is unavailable in demo mode.' };
      }
      return { success: false, error: 'Password reset request failed' };
    }
  }, []);

  const resetPassword = useCallback(async (_token: string, _newPassword: string) => {
    try {
      await apiResetPassword(_token, _newPassword);
      return { success: true };
    } catch {
      const reachable = await isBackendReachable();
      if (!reachable) {
        return { success: false, error: 'Backend server is not running. Password reset is unavailable in demo mode.' };
      }
      return { success: false, error: 'Password reset failed' };
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
    } catch {
      const reachable = await isBackendReachable();
      if (!reachable) {
        return { success: false, error: 'Backend server is not running. Google sign-in is unavailable in demo mode.' };
      }
      return { success: false, error: 'Google sign-in failed' };
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
