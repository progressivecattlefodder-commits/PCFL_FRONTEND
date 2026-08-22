'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('auth_token');
    if (token) {
      api
        .getMe()
        .then((res) => {
          if (res.success && res.data) {
            setUser(res.data);
          } else {
            Cookies.remove('auth_token');
            setUser(null);
          }
        })
        .catch(() => {
          Cookies.remove('auth_token');
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    if (res.success && res.data) {
      // Secure cookies in production environments
      Cookies.set('auth_token', res.data.token, {
        expires: 1,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
      setUser(res.data.user);
    } else {
      throw new Error(res.error || res.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Silently handle backend logout call failure
    } finally {
      Cookies.remove('auth_token');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.data) {
        setUser(res.data);
      }
    } catch {
      Cookies.remove('auth_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}