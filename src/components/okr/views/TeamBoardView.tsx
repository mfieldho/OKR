'use client';

import { Objective } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { progressColor } from '@/lib/utils';
import { useOKR } from '@/contexts/OKRContext';

function TeamCard({ objective, onSelect }: { objective: Objective; onSelect: () => void }) {
  return (
    <button onClick={onSelect}
      className="w-full text-left group p-3.5 rounded-xl border border-white/[0.05] hover:border-white/[0.16] transition-all"
      style={{ background: 'var(--card-bg)' }}>
      <div className="flex items-start gap-2.5 mb-2.5">
        <ProgressRing progress={objective.progress} size={36} strokeWidth={4}
          color={progressColor(objective.progress)} label="" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-200 leading-snug group-hover:text-[#2acfc0] transition-colors line-clamp-2">
            {objective.title}
          </p>
          <p className="text-[10px] text-slate-600 mt-0.5">{objective.owner}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <StatusBadge status={objective.status} />
        <span className="text-[10px] text-slate-600">{objective.keyResults.length} KRs · {objective.progress}%</span>
      </div>
    </button>
  );
}

export function TeamBoardView({ objectives, onSelect }: { objectives: Objective[]; onSelect: (o: Objective) => void }) {
  const { data } = useOKR();
  const teams = data?.teams ?? [];

  const teamsWithObjs = teams.map(team => ({
    team,
    objs: objectives.filter(o => o.teamId === team.id),
  })).filter(({ objs }) => objs.length > 0);

  const unassigned = objectives.filter(o => !teams.find(t => t.id === o.teamId));

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
      {teamsWithObjs.map(({ team, objs }) => {
        const avgProgress = Math.round(objs.reduce((s, o) => s + o.progress, 0) / objs.length);
        return (
          <div key={team.id} className="shrink-0 flex flex-col" style={{ width: 256 }}>
            {/* Team header */}
            <div className="rounded-t-2xl border border-b-0 border-white/[0.08] p-3.5"
              style={{ background: `linear-gradient(135deg, ${team.color}18, ${team.color}08)` }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: team.color }} />
                <span className="text-xs font-bold text-white truncate">{team.name}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>{team.lead}</span>
                <span style={{ color: team.color }} className="font-semibold">{avgProgress}% avg</span>
              </div>
              <div className="mt-2"><ProgressBar progress={avgProgress} height={3} color={team.color} /></div>
            </div>

            {/* Objectives */}
            <div className="flex-1 rounded-b-2xl border border-t-0 border-white/[0.06] p-2 space-y-2 min-h-40"
              style={{ background: `${team.color}08` }}>
              <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-1 pt-1">
                {objs.length} objective{objs.length !== 1 ? 's' : ''}
              </div>
              {objs.map(obj => (
                <TeamCard key={obj.id} objective={obj} onSelect={() => onSelect(obj)} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Unassigned column */}
      {unassigned.length > 0 && (
        <div className="shrink-0 flex flex-col" style={{ width: 256 }}>
          <div className="rounded-t-2xl border border-b-0 border-white/[0.06] p-3.5"
            style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs font-bold text-slate-400">Unassigned</p>
          </div>
          <div className="flex-1 rounded-b-2xl border border-t-0 border-white/[0.04] p-2 space-y-2"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            {unassigned.map(obj => (
              <TeamCard key={obj.id} objective={obj} onSelect={() => onSelect(obj)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
