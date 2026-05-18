'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Objective } from '@/lib/types';
import { statusLabel } from '@/lib/utils';
import { useTheme } from '@/contexts/SettingsContext';

const STATUS_COLORS: Record<string, string> = {
  'on-track': '#10b981',
  'at-risk': '#f59e0b',
  'behind': '#ef4444',
  'completed': '#6366f1',
  'not-started': '#475569',
};

interface StatusDonutChartProps {
  objectives: Objective[];
}

export function StatusDonutChart({ objectives }: StatusDonutChartProps) {
  const { isDark } = useTheme();
  const tooltipBg  = isDark ? 'rgba(17,24,39,0.97)' : '#ffffff';
  const tooltipBdr = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)';

  const counts: Record<string, number> = {};
  objectives.forEach(o => {
    counts[o.status] = (counts[o.status] ?? 0) + 1;
  });

  const data = Object.entries(counts).map(([status, count]) => ({
    name: statusLabel(status as never),
    value: count,
    color: STATUS_COLORS[status] ?? '#475569',
    status,
  }));

  return (
    <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: 'var(--card-bg)' }}>
      <p className="text-sm font-semibold text-white mb-1">Objective Status</p>
      <p className="text-xs text-slate-500 mb-4">Distribution across all company objectives</p>
      <div className="flex items-center gap-6">
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={36} outerRadius={52}
              dataKey="value" strokeWidth={0} paddingAngle={3}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} style={{ filter: `drop-shadow(0 0 4px ${entry.color}60)` }} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-xl px-3 py-2 text-xs" style={{ background: tooltipBg, border: `1px solid ${tooltipBdr}`, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                    <p style={{ color: d.color }} className="font-semibold">{d.name}: {d.value}</p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2 flex-1">
          {data.map(d => (
            <div key={d.status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                <span className="text-xs text-slate-400">{d.name}</span>
              </div>
              <span className="text-xs font-semibold text-white">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
