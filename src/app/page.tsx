'use client';

import { Target, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useOKR } from '@/contexts/OKRContext';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { TeamCard } from '@/components/dashboard/TeamCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ProgressTrendChart } from '@/components/charts/ProgressTrendChart';
import { TeamComparisonChart } from '@/components/charts/TeamComparisonChart';
import { StatusDonutChart } from '@/components/charts/StatusDonutChart';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export default function CompanyDashboard() {
  const { data, loading, error } = useOKR();

  if (loading) return (
    <div className="flex-1">
      <div className="h-[73px] border-b border-white/[0.06]" style={{ background: 'rgba(13,26,46,0.90)' }} />
      <LoadingSkeleton />
    </div>
  );

  if (error) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 font-medium">{error}</p>
        <p className="text-slate-500 text-sm mt-1">Check your SharePoint configuration in Settings.</p>
      </div>
    </div>
  );

  if (!data) return null;

  const onTrackCount = data.objectives.filter(o => o.status === 'on-track' || o.status === 'completed').length;
  const atRiskCount = data.objectives.filter(o => o.status === 'at-risk').length;
  const behindCount = data.objectives.filter(o => o.status === 'behind').length;

  return (
    <div className="flex-1 fade-in">
      <Header
        title="Company OKRs"
        subtitle={`${data.quarter} ${data.year} · ${data.objectives.length} objectives across ${data.teams.length} teams`}
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">

        {/* Hero: overall progress + stats */}
        <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8">
          {/* Progress ring */}
          <div className="rounded-2xl border border-white/[0.06] p-6 flex flex-col items-center justify-center gap-2 shrink-0 w-full sm:w-auto"
            style={{ background: 'rgba(30,45,76,0.5)', minWidth: 180 }}>
            <ProgressRing progress={data.overallProgress} size={140} strokeWidth={12} label="Overall" sublabel="Q2 2026" />
            <p className="text-xs text-slate-500 mt-1">Company progress</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-1 w-full">
            <StatCard
              label="Objectives total"
              value={data.objectives.length}
              sub={`across ${data.teams.length} teams`}
              icon={Target}
              color="#2acfc0"
              trend={{ value: 12, label: 'vs Q1' }}
            />
            <StatCard
              label="On track"
              value={onTrackCount}
              sub={`${Math.round((onTrackCount / data.objectives.length) * 100)}% of objectives`}
              icon={CheckCircle2}
              color="#10b981"
            />
            <StatCard
              label="At risk"
              value={atRiskCount}
              sub="Need attention"
              icon={AlertTriangle}
              color="#f59e0b"
            />
            <StatCard
              label="Behind"
              value={behindCount}
              sub="Require escalation"
              icon={TrendingUp}
              color="#ef4444"
            />
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <ProgressTrendChart />
          </div>
          <StatusDonutChart objectives={data.objectives} />
        </div>

        {/* Teams overview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Teams</h2>
              <p className="text-xs text-slate-500 mt-0.5">Click a team to drill into their objectives</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
            {data.teams.map(team => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        </section>

        {/* Team comparison chart */}
        <TeamComparisonChart teams={data.teams} />

      </div>
    </div>
  );
}
