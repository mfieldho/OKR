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

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs border border-white/10" style={{ background: 'rgba(17,24,39,0.95)' }}>
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="font-semibold" style={{ color: p.name === 'progress' ? '#00c8b4' : '#475569' }}>
          {p.name === 'progress' ? 'Actual' : 'Target'}: {p.value ?? '–'}%
        </p>
      ))}
    </div>
  );
};

export function ProgressTrendChart() {
  return (
    <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: 'rgba(26,34,54,0.5)' }}>
      <p className="text-sm font-semibold text-white mb-1">Progress vs Target</p>
      <p className="text-xs text-slate-500 mb-5">Overall company OKR progress this quarter</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={historicalProgress} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00c8b4" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#00c8b4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={100} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
          <Area type="monotone" dataKey="target" stroke="#334155" strokeWidth={1.5} fill="none" strokeDasharray="5 3" dot={false} />
          <Area type="monotone" dataKey="progress" stroke="#00c8b4" strokeWidth={2.5} fill="url(#tealGrad)" dot={{ fill: '#00c8b4', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#00c8b4' }} connectNulls={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
