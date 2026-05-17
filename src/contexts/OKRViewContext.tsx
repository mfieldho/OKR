'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type OKRView = 'kanban' | 'grid' | 'list' | 'table' | 'team';
export const ALL_VIEWS: OKRView[] = ['kanban', 'grid', 'list', 'table', 'team'];
const STORAGE_KEY = 'form3-okr-view';

interface OKRViewContextValue {
  view: OKRView;
  setView: (v: OKRView) => void;
}

const OKRViewContext = createContext<OKRViewContextValue | null>(null);

export function OKRViewProvider({ children }: { children: React.ReactNode }) {
  const [view, setViewState] = useState<OKRView>('kanban');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as OKRView | null;
      if (saved && ALL_VIEWS.includes(saved)) setViewState(saved);
    } catch { /* ignore */ }
  }, []);

  const setView = (v: OKRView) => {
    setViewState(v);
    try { localStorage.setItem(STORAGE_KEY, v); } catch { /* ignore */ }
  };

  return (
    <OKRViewContext.Provider value={{ view, setView }}>
      {children}
    </OKRViewContext.Provider>
  );
}

export function useOKRView() {
  const ctx = useContext(OKRViewContext);
  if (!ctx) throw new Error('useOKRView must be used within OKRViewProvider');
  return ctx;
}
