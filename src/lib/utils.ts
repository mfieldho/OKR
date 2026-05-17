import { clsx, type ClassValue } from 'clsx';
import { OKRStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function statusColor(status: OKRStatus): string {
  switch (status) {
    case 'on-track': return 'text-emerald-400';
    case 'at-risk': return 'text-amber-400';
    case 'behind': return 'text-red-400';
    case 'completed': return 'text-indigo-400';
    default: return 'text-slate-400';
  }
}

export function statusBg(status: OKRStatus): string {
  switch (status) {
    case 'on-track': return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    case 'at-risk': return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    case 'behind': return 'bg-red-500/15 text-red-400 border border-red-500/30';
    case 'completed': return 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30';
    default: return 'bg-slate-500/15 text-slate-400 border border-slate-500/30';
  }
}

export function statusLabel(status: OKRStatus): string {
  switch (status) {
    case 'on-track': return 'On Track';
    case 'at-risk': return 'At Risk';
    case 'behind': return 'Behind';
    case 'completed': return 'Completed';
    default: return 'Not Started';
  }
}

export function progressColor(progress: number): string {
  if (progress >= 75) return '#10b981';
  if (progress >= 50) return '#f59e0b';
  return '#ef4444';
}

export function formatValue(value: number, unit: string): string {
  if (unit === '£' || unit === '$' || unit === '€') {
    if (value >= 1_000_000) return `${unit}${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${unit}${(value / 1_000).toFixed(0)}K`;
    return `${unit}${value}`;
  }
  if (unit === '%') return `${value}%`;
  if (unit === 'days') return `${value}d`;
  return `${value} ${unit}`;
}
