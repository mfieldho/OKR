'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CompanyOKR, Quarter } from '@/lib/types';
import { companyOKR as mockData } from '@/lib/mockData';

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
  const [data, setData] = useState<CompanyOKR | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>('Q2');
  const [isUsingLiveData] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // When SharePoint env vars are set, switch to live data via sharepoint.ts
      // For now, use mock data
      await new Promise(r => setTimeout(r, 600)); // simulate network
      setData(mockData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load OKR data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

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
