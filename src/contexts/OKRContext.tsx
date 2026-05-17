'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CompanyOKR, Quarter } from '@/lib/types';
import { buildCompanyOKR } from '@/lib/mockData';
import { useSettings } from '@/contexts/SettingsContext';

interface OKRContextValue {
  data: CompanyOKR | null;
  loading: boolean;
  error: string | null;
  selectedQuarter: Quarter;
  setSelectedQuarter: (q: Quarter) => void;
  isUsingLiveData: boolean;
  refresh: () => void;
}

const OKRContext = createContext<OKRContextValue | null>(null);

export function OKRProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>('Q2');
  const [isUsingLiveData] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 400));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load OKR data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Recompute derived data whenever the selected quarter or teams settings change
  const data = useMemo<CompanyOKR | null>(() => {
    if (loading) return null;
    const customObjs = settings.customObjectives?.[selectedQuarter];
    return buildCompanyOKR(selectedQuarter, 2026, settings.teams, customObjs);
  }, [selectedQuarter, loading, settings.teams, settings.customObjectives]);

  return (
    <OKRContext.Provider value={{ data, loading, error, selectedQuarter, setSelectedQuarter, isUsingLiveData, refresh: loadData }}>
      {children}
    </OKRContext.Provider>
  );
}

export function useOKR() {
  const ctx = useContext(OKRContext);
  if (!ctx) throw new Error('useOKR must be used within OKRProvider');
  return ctx;
}
