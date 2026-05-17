'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '@/lib/calendarSettings';
import { supabase, SETTINGS_KEY } from '@/lib/supabase';

const STORAGE_KEY = 'form3-okr-settings';

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  /** true while the initial Supabase fetch is in flight */
  settingsLoading: boolean;
  /** 'supabase' | 'localStorage' | 'default' */
  dataSource: 'supabase' | 'localStorage' | 'default';
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function readLocalStorage(): AppSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

function writeLocalStorage(s: AppSettings) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'supabase' | 'localStorage' | 'default'>('default');
  // Prevent save from firing before initial load is complete
  const initialised = useRef(false);

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      // 1. Show localStorage data immediately so the UI is never blank
      const cached = readLocalStorage();
      if (cached) {
        setSettings(cached);
        setDataSource('localStorage');
      }

      // 2. Fetch from Supabase if configured
      if (supabase) {
        const { data, error } = await supabase
          .from('app_settings')
          .select('data')
          .eq('key', SETTINGS_KEY)
          .single();

        if (!cancelled) {
          if (!error && data?.data && Object.keys(data.data).length > 0) {
            const merged = { ...DEFAULT_SETTINGS, ...data.data };
            setSettings(merged);
            writeLocalStorage(merged);
            setDataSource('supabase');
          }
          // If no row yet (first run) or error, keep localStorage/default
        }
      }

      if (!cancelled) {
        initialised.current = true;
        setSettingsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ── CSS variables ─────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', settings.accentColor);
    document.documentElement.style.setProperty('--sidebar-bg', settings.sidebarBg);
  }, [settings.accentColor, settings.sidebarBg]);

  // ── Save ──────────────────────────────────────────────────────────────────────
  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };

      // Always persist to localStorage as a fast cache
      writeLocalStorage(next);

      // Persist to Supabase in the background
      if (supabase) {
        supabase
          .from('app_settings')
          .upsert({ key: SETTINGS_KEY, data: next, updated_at: new Date().toISOString() })
          .then(({ error }) => {
            if (error) console.warn('[SettingsContext] Supabase save failed:', error.message);
          });
      }

      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, settingsLoading, dataSource }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
