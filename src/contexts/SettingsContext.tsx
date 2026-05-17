'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '@/lib/calendarSettings';

const STORAGE_KEY = 'form3-okr-settings';

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {
      // ignore parse errors
    }
  }, []);

  // Apply CSS variables whenever accentColor or sidebarBg changes
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', settings.accentColor);
    document.documentElement.style.setProperty('--sidebar-bg', settings.sidebarBg);
  }, [settings.accentColor, settings.sidebarBg]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
