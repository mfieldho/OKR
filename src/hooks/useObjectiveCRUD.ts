'use client';

import { useCallback } from 'react';
import { Objective, Quarter } from '@/lib/types';
import { useSettings } from '@/contexts/SettingsContext';
import { allObjectives } from '@/lib/mockData';

function getBase(customObjectives: Record<string, Objective[]> | null): Record<string, Objective[]> {
  if (customObjectives) return { ...customObjectives };
  return {
    Q1: [...(allObjectives.Q1 ?? [])],
    Q2: [...(allObjectives.Q2 ?? [])],
    Q3: [...(allObjectives.Q3 ?? [])],
    Q4: [...(allObjectives.Q4 ?? [])],
  };
}

export function useObjectiveCRUD() {
  const { settings, updateSettings } = useSettings();

  const saveObjective = useCallback((obj: Objective) => {
    const base = getBase(settings.customObjectives);
    const q = obj.quarter;
    const existing = base[q] ?? [];
    const idx = existing.findIndex(o => o.id === obj.id);
    base[q] = idx >= 0
      ? existing.map(o => o.id === obj.id ? obj : o)
      : [...existing, obj];
    updateSettings({ customObjectives: base });
  }, [settings.customObjectives, updateSettings]);

  const deleteObjective = useCallback((id: string, quarter: Quarter) => {
    const base = getBase(settings.customObjectives);
    base[quarter] = (base[quarter] ?? []).filter(o => o.id !== id);
    updateSettings({ customObjectives: base });
  }, [settings.customObjectives, updateSettings]);

  const importObjectives = useCallback((objectives: Objective[]) => {
    const base = getBase(settings.customObjectives);
    for (const obj of objectives) {
      const q = obj.quarter;
      const existing = base[q] ?? [];
      const idx = existing.findIndex(o => o.id === obj.id);
      base[q] = idx >= 0
        ? existing.map(o => o.id === obj.id ? obj : o)
        : [...existing, obj];
    }
    updateSettings({ customObjectives: base });
  }, [settings.customObjectives, updateSettings]);

  return { saveObjective, deleteObjective, importObjectives };
}
