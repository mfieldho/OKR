'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useOKR } from '@/contexts/OKRContext';
import { Header } from '@/components/layout/Header';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/Badge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { progressColor } from '@/lib/utils';

export default function IndividualsPage() {
  const { data, loading } = useOKR();

  if (loading) return <><div className="h-[73px] border-b border-white/[0.06]" style={{ background: 'rgba(13,26,46,0.90)' }} /><LoadingSkeleton /></>;
  if (!data) return null;

  return (
    <div className="flex-1 fade-in">
      <Header title="Individuals" subtitle={`${data.individuals.length} people · ${data.quarter} ${data.year}`} />

      <div className="p-8">
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'rgba(30,45,76,0.5)' }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Name</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Role</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Team</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Objectives</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 w-48">Progress</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.individuals.map(person => {
                const topStatus = person.objectives[0]?.status ?? 'not-started';
                return (
                  <tr key={person.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: `${progressColor(person.progress)}44`, border: `1px solid ${progressColor(person.progress)}55` }}>
                          {person.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium text-white">{person.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">{person.role}</td>
                    <td className="px-5 py-4 text-sm text-slate-400">{person.teamName}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-300">{person.objectives.length}</span>
                        <StatusBadge status={topStatus} />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <ProgressBar progress={person.progress} height={6} showLabel />
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/individuals/${person.id}`}
                        className="text-slate-600 hover:text-slate-300 transition-colors">
                        <ArrowRight size={16} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
