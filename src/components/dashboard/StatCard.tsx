'use client';

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  color: string;
  trend?: { value: number; label: string };
}

export function StatCard({ label, value, sub, icon: Icon, color, trend }: StatCardProps) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4 border border-white/[0.06] hover:border-white/10 transition-colors"
      style={{ background: 'var(--card-bg)' }}>
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon size={18} style={{ color }} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
            style={{ background: trend.value >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        <p className="text-sm text-slate-400 mt-2">{label}</p>
      </div>
    </div>
  );
}
