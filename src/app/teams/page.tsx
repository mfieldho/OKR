'use client';

import { useOKR } from '@/contexts/OKRContext';
import { Header } from '@/components/layout/Header';
import { TeamCard } from '@/components/dashboard/TeamCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export default function TeamsPage() {
  const { data, loading } = useOKR();

  if (loading) return <><div className="h-[73px] border-b border-white/[0.06]" style={{ background: 'rgba(11,15,30,0.85)' }} /><LoadingSkeleton /></>;
  if (!data) return null;

  const sorted = [...data.teams].sort((a, b) => b.progress - a.progress);

  return (
    <div className="flex-1 fade-in">
      <Header title="Teams" subtitle={`${data.teams.length} teams · ${data.quarter} ${data.year}`} />

      <div className="p-8 space-y-8">
        {/* Summary bar */}
        <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: 'rgba(26,34,54,0.5)' }}>
          <p className="text-sm font-semibold text-white mb-4">Progress Leaderboard</p>
          <div className="space-y-4">
            {sorted.map(team => (
              <div key={team.id} className="flex items-center gap-4">
                <span className="text-sm text-slate-300 w-44 truncate">{team.name}</span>
                <div className="flex-1">
                  <ProgressBar progress={team.progress} color={team.color} height={8} showLabel />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team cards */}
        <div className="grid grid-cols-3 gap-4">
          {sorted.map(team => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      </div>
    </div>
  );
}
