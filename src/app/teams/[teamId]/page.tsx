'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import { useOKR } from '@/contexts/OKRContext';
import { Header } from '@/components/layout/Header';
import { OKRCard } from '@/components/dashboard/OKRCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { StatusDonutChart } from '@/components/charts/StatusDonutChart';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { progressColor } from '@/lib/utils';

export default function TeamDetailPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = use(params);
  const { data, loading } = useOKR();

  if (loading) return <><div className="h-[73px] border-b border-white/[0.06]" style={{ background: 'rgba(11,15,30,0.85)' }} /><LoadingSkeleton /></>;
  if (!data) return null;

  const team = data.teams.find(t => t.id === teamId);
  if (!team) return notFound();

  const allKRs = team.objectives.flatMap(o => o.keyResults);
  const onTrack = team.objectives.filter(o => o.status === 'on-track' || o.status === 'completed').length;

  return (
    <div className="flex-1 fade-in">
      <Header title={team.name} subtitle={`Led by ${team.lead} · ${team.memberCount} members`} />

      <div className="p-8 space-y-8">
        {/* Back */}
        <Link href="/teams" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft size={14} /> All teams
        </Link>

        {/* Hero */}
        <div className="flex items-start gap-6">
          <div className="rounded-2xl border border-white/[0.06] p-6 flex flex-col items-center gap-3 shrink-0"
            style={{ background: 'rgba(26,34,54,0.5)', minWidth: 180 }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `${team.color}18`, border: `1px solid ${team.color}30` }}>
              <Users size={22} style={{ color: team.color }} />
            </div>
            <ProgressRing progress={team.progress} size={120} strokeWidth={10} color={progressColor(team.progress)} />
          </div>

          <div className="grid grid-cols-3 gap-4 flex-1">
            <div className="rounded-2xl border border-white/[0.06] p-4" style={{ background: 'rgba(26,34,54,0.5)' }}>
              <p className="text-2xl font-bold text-white">{team.objectives.length}</p>
              <p className="text-sm text-slate-400 mt-1">Objectives</p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] p-4" style={{ background: 'rgba(26,34,54,0.5)' }}>
              <p className="text-2xl font-bold text-emerald-400">{onTrack}</p>
              <p className="text-sm text-slate-400 mt-1">On track</p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] p-4" style={{ background: 'rgba(26,34,54,0.5)' }}>
              <p className="text-2xl font-bold text-white">{allKRs.length}</p>
              <p className="text-sm text-slate-400 mt-1">Key results</p>
            </div>

            <div className="col-span-3">
              <StatusDonutChart objectives={team.objectives} />
            </div>
          </div>
        </div>

        {/* Objectives */}
        <section>
          <h2 className="text-base font-semibold text-white mb-4">Team Objectives</h2>
          <div className="space-y-3">
            {team.objectives.map((obj, i) => (
              <OKRCard key={obj.id} objective={obj} defaultOpen={i === 0} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
