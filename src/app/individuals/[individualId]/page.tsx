'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useOKR } from '@/contexts/OKRContext';
import { Header } from '@/components/layout/Header';
import { OKRCard } from '@/components/dashboard/OKRCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { progressColor } from '@/lib/utils';

export default function IndividualPage({ params }: { params: Promise<{ individualId: string }> }) {
  const { individualId } = use(params);
  const { data, loading } = useOKR();

  if (loading) return <><div className="h-[73px] border-b border-white/[0.06]" style={{ background: 'var(--header-bg)' }} /><LoadingSkeleton /></>;
  if (!data) return null;

  const person = data.individuals.find(p => p.id === individualId);
  if (!person) return notFound();

  const allKRs = person.objectives.flatMap(o => o.keyResults);
  const onTrack = person.objectives.filter(o => o.status === 'on-track' || o.status === 'completed').length;

  return (
    <div className="flex-1 fade-in">
      <Header title={person.name} subtitle={`${person.role} · ${person.teamName}`} />

      <div className="p-8 space-y-8">
        <Link href="/individuals" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft size={14} /> All individuals
        </Link>

        {/* Hero */}
        <div className="flex items-center gap-6">
          <div className="rounded-2xl border border-white/[0.06] p-6 flex flex-col items-center gap-2"
            style={{ background: 'var(--card-bg)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white mb-2"
              style={{ background: `${progressColor(person.progress)}33`, border: `2px solid ${progressColor(person.progress)}55` }}>
              {person.name.split(' ').map(n => n[0]).join('')}
            </div>
            <ProgressRing progress={person.progress} size={110} strokeWidth={9} color={progressColor(person.progress)} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/[0.06] p-4" style={{ background: 'var(--card-bg)' }}>
              <p className="text-2xl font-bold text-white">{person.objectives.length}</p>
              <p className="text-sm text-slate-400 mt-1">Objectives</p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] p-4" style={{ background: 'var(--card-bg)' }}>
              <p className="text-2xl font-bold text-emerald-400">{onTrack}</p>
              <p className="text-sm text-slate-400 mt-1">On track</p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] p-4" style={{ background: 'var(--card-bg)' }}>
              <p className="text-2xl font-bold text-white">{allKRs.length}</p>
              <p className="text-sm text-slate-400 mt-1">Key results</p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-base font-semibold text-white mb-4">Objectives & Key Results</h2>
          <div className="space-y-3">
            {person.objectives.map((obj, i) => (
              <OKRCard key={obj.id} objective={obj} defaultOpen={i === 0} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
