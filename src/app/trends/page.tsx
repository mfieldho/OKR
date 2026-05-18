'use client';

import { useOKR } from '@/contexts/OKRContext';
import { Header } from '@/components/layout/Header';
import { ProgressTrendChart } from '@/components/charts/ProgressTrendChart';
import { TeamComparisonChart } from '@/components/charts/TeamComparisonChart';
import { StatusDonutChart } from '@/components/charts/StatusDonutChart';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export default function TrendsPage() {
  const { data, loading } = useOKR();

  if (loading) return <><div className="h-[73px] border-b border-white/[0.06]" style={{ background: 'var(--header-bg)' }} /><LoadingSkeleton /></>;
  if (!data) return null;

  const allKRs = data.objectives.flatMap(o => o.keyResults);
  const avgKRProgress = allKRs.length
    ? Math.round(allKRs.reduce((a, k) => a + k.progress, 0) / allKRs.length)
    : 0;

  return (
    <div className="flex-1 fade-in">
      <Header title="Trends & Analytics" subtitle="Cross-team performance insights" />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <ProgressTrendChart />
          <StatusDonutChart objectives={data.objectives} />
        </div>

        <TeamComparisonChart teams={data.teams} />

        {/* Key result breakdown */}
        <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: 'var(--card-bg)' }}>
          <p className="text-sm font-semibold text-white mb-1">Key Results Deep Dive</p>
          <p className="text-xs text-slate-500 mb-5">All {allKRs.length} key results · avg {avgKRProgress}% complete</p>
          <div className="space-y-3">
            {allKRs.map(kr => (
              <div key={kr.id} className="flex items-center gap-4">
                <p className="text-xs text-slate-300 w-80 truncate shrink-0">{kr.title}</p>
                <div className="flex-1">
                  <ProgressBar progress={kr.progress} height={6} showLabel />
                </div>
                <span className="text-xs text-slate-500 shrink-0 w-20 text-right">{kr.owner}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
