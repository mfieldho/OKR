'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Team } from '@/lib/types';
import { useTheme } from '@/contexts/SettingsContext';

interface ChartRow { name: string; fullName: string; progress: number; color: string }

export function TeamComparisonChart({ teams }: { teams: Team[] }) {
  const { isDark } = useTheme();
  const gridStroke  = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.07)';
  const tickColor   = isDark ? '#475569' : '#64748b';
  const cursorFill  = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';
  const tooltipBg  = isDark ? 'rgba(17,24,39,0.97)' : '#ffffff';
  const tooltipBdr = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)';

  const data: ChartRow[] = teams.map(t => ({
    name: t.name.split(' ')[0],
    fullName: t.name,
    progress: t.progress,
    color: t.color,
  }));

  if (!data.length) return null;

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number; payload: ChartRow }[] }) => {
    if (!active || !payload?.length) return null;
    const { fullName, color } = payload[0].payload;
    return (
      <div className="rounded-xl px-3 py-2 text-xs" style={{ background: tooltipBg, border: `1px solid ${tooltipBdr}`, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
        <p className="text-slate-500 mb-1">{fullName}</p>
        <p className="font-semibold" style={{ color }}>{payload[0].value}% progress</p>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: 'var(--card-bg)' }}>
      <p className="text-sm font-semibold text-white mb-1">Team Progress</p>
      <p className="text-xs text-slate-500 mb-5">OKR completion by team this quarter</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }} />
          <Bar dataKey="progress" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
