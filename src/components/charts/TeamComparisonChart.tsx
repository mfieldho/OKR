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
import { teamProgressData } from '@/lib/mockData';

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number; payload: { fullName: string; color: string } }[] }) => {
  if (!active || !payload?.length) return null;
  const { fullName, color } = payload[0].payload;
  return (
    <div className="rounded-xl px-3 py-2 text-xs border border-white/10" style={{ background: 'rgba(17,24,39,0.95)' }}>
      <p className="text-slate-400 mb-1">{fullName}</p>
      <p className="font-semibold" style={{ color }}>{payload[0].value}% progress</p>
    </div>
  );
};

export function TeamComparisonChart() {
  return (
    <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: 'rgba(26,34,54,0.5)' }}>
      <p className="text-sm font-semibold text-white mb-1">Team Progress</p>
      <p className="text-xs text-slate-500 mb-5">OKR completion by team this quarter</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={teamProgressData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="progress" radius={[6, 6, 0, 0]}>
            {teamProgressData.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
