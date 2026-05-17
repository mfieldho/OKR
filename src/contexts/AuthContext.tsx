'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const CREDENTIALS = [{ username: 'admin', password: 'password' }];
const STORAGE_KEY = 'okr-auth';

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem(STORAGE_KEY) === 'true');
    setLoaded(true);
  }, []);

  const login = (username: string, password: string): boolean => {
    const ok = CREDENTIALS.some(c => c.username === username && c.password === password);
    if (ok) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsAuthenticated(true);
    }
    return ok;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
  };

  // Don't render children until localStorage has been read (avoids flash)
  if (!loaded) return null;

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
