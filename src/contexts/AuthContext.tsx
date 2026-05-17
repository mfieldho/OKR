'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'okr-auth';
const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'password';

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { authenticated: boolean };
        if (parsed.authenticated === true) {
          setIsAuthenticated(true);
        }
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  function login(username: string, password: string): boolean {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      setIsAuthenticated(true);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ authenticated: true }));
      } catch { /* ignore */ }
      return true;
    }
    return false;
  }

  function logout(): void {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
