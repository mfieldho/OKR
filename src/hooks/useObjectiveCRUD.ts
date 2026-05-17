'use client';

import { useCallback } from 'react';
import { Objective, Quarter } from '@/lib/types';
import { useSettings } from '@/contexts/SettingsContext';
import { allObjectives } from '@/lib/mockData';

const ALL_QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

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
    // Determine which quarters this OKR belongs to
    const targetQuarters: Quarter[] = (obj.quarters && obj.quarters.length > 0)
      ? obj.quarters
      : [obj.quarter];

    // Upsert into each target quarter
    for (const q of targetQuarters) {
      const existing = base[q] ?? [];
      const idx = existing.findIndex(o => o.id === obj.id);
      base[q] = idx >= 0
        ? existing.map(o => o.id === obj.id ? obj : o)
        : [...existing, obj];
    }

    // Remove from quarters no longer covered (handles edits that shrink the span)
    for (const q of ALL_QUARTERS) {
      if (!targetQuarters.includes(q)) {
        base[q] = (base[q] ?? []).filter(o => o.id !== obj.id);
      }
    }

    updateSettings({ customObjectives: base });
  }, [settings.customObjectives, updateSettings]);

  const deleteObjective = useCallback((id: string) => {
    const base = getBase(settings.customObjectives);
    // Remove from all quarters — handles multi-quarter OKRs
    for (const q of ALL_QUARTERS) {
      base[q] = (base[q] ?? []).filter(o => o.id !== id);
    }
    updateSettings({ customObjectives: base });
  }, [settings.customObjectives, updateSettings]);

  const importObjectives = useCallback((objectives: Objective[]) => {
    const base = getBase(settings.customObjectives);
    for (const obj of objectives) {
      const targetQuarters: Quarter[] = (obj.quarters && obj.quarters.length > 0)
        ? obj.quarters
        : [obj.quarter];
      for (const q of targetQuarters) {
        const existing = base[q] ?? [];
        const idx = existing.findIndex(o => o.id === obj.id);
        base[q] = idx >= 0
          ? existing.map(o => o.id === obj.id ? obj : o)
          : [...existing, obj];
      }
    }
    updateSettings({ customObjectives: base });
  }, [settings.customObjectives, updateSettings]);

  return { saveObjective, deleteObjective, importObjectives };
}
