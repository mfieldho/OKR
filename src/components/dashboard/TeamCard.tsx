'use client';

import Link from 'next/link';
import { ArrowRight, Users } from 'lucide-react';
import { Team } from '@/lib/types';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function TeamCard({ team }: { team: Team }) {
  const onTrack = team.objectives.filter(o => o.status === 'on-track' || o.status === 'completed').length;

  return (
    <Link href={`/teams/${team.id}`}
      className="group rounded-2xl border border-white/[0.06] hover:border-white/12 p-5 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: 'rgba(26,34,54,0.5)' }}>

      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${team.color}18`, border: `1px solid ${team.color}30` }}>
          <Users size={18} style={{ color: team.color }} />
        </div>
        <ArrowRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors group-hover:translate-x-0.5 translate-x-0 duration-200" />
      </div>

      <div>
        <p className="font-semibold text-white text-sm leading-none">{team.name}</p>
        <p className="text-xs text-slate-500 mt-1">{team.lead}</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500">{team.memberCount} members</span>
          <span className="text-xs font-semibold" style={{ color: team.color }}>{team.progress}%</span>
        </div>
        <ProgressBar progress={team.progress} color={team.color} height={5} />
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span>{team.objectives.length} objectives</span>
        <span>·</span>
        <span>{onTrack} on track</span>
      </div>
    </Link>
  );
}
