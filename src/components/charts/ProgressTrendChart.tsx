'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { historicalProgress } from '@/lib/mockData';
import { useTheme } from '@/contexts/SettingsContext';

export function ProgressTrendChart() {
  const { isDark } = useTheme();
  const gridStroke   = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.07)';
  const refStroke    = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)';
  const tickColor    = isDark ? '#475569' : '#64748b';
  const targetStroke = isDark ? '#475569' : '#94a3b8';
  const tooltipBg   = isDark ? 'rgba(17,24,39,0.97)' : '#ffffff';
  const tooltipBdr  = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)';

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl px-3 py-2 text-xs" style={{ background: tooltipBg, border: `1px solid ${tooltipBdr}`, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
        <p className="text-slate-500 mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} className="font-semibold" style={{ color: p.name === 'progress' ? '#2acfc0' : '#64748b' }}>
            {p.name === 'progress' ? 'Actual' : 'Target'}: {p.value ?? '–'}%
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: 'var(--card-bg)' }}>
      <p className="text-sm font-semibold text-white mb-1">Progress vs Target</p>
      <p className="text-xs text-slate-500 mb-5">Overall company OKR progress this quarter</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={historicalProgress} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2acfc0" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#2acfc0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="month" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={100} stroke={refStroke} strokeDasharray="4 4" />
          <Area type="monotone" dataKey="target" stroke={targetStroke} strokeWidth={1.5} fill="none" strokeDasharray="5 3" dot={false} />
          <Area type="monotone" dataKey="progress" stroke="#2acfc0" strokeWidth={2.5} fill="url(#tealGrad)" dot={{ fill: '#2acfc0', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#2acfc0' }} connectNulls={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
