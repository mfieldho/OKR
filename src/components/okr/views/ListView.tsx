'use client';

import { ChevronRight, Calendar } from 'lucide-react';
import { Objective } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useOKR } from '@/contexts/OKRContext';

function CadencePill({ obj }: { obj: Objective }) {
  const qs = obj.quarters ?? [obj.quarter];
  const span = qs.length > 1 ? `${qs[0]}–${qs[qs.length - 1]}` : qs[0];
  const yearly = obj.cadence === 'yearly';
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold w-fit"
        style={yearly
          ? { background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }
          : { background: 'rgba(59,130,246,0.10)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
        {yearly ? 'Yearly' : 'Quarterly'}
      </span>
      <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
        <Calendar size={8} /> {span}
      </span>
    </div>
  );
}

export function ListView({ objectives, onSelect }: { objectives: Objective[]; onSelect: (o: Objective) => void }) {
  const { data } = useOKR();

  return (
    <div className="rounded-2xl border border-white/[0.06] overflow-x-auto" style={{ background: 'var(--surface-bg)', WebkitOverflowScrolling: 'touch' }}><div style={{ minWidth: 700 }}>
      {/* Header row */}
      <div className="grid items-center px-4 py-2.5 border-b border-white/[0.06] text-[10px] font-semibold uppercase tracking-wider text-slate-600"
        style={{ gridTemplateColumns: '130px 1fr 110px 120px 110px 90px 32px' }}>
        <span>Status</span>
        <span>Objective</span>
        <span>Team</span>
        <span>Owner</span>
        <span>Cadence</span>
        <span className="text-right">Progress</span>
        <span />
      </div>

      {objectives.map((obj) => {
        const team = data?.teams.find(t => t.id === obj.teamId);
        return (
          <button key={obj.id} onClick={() => onSelect(obj)}
            className="w-full text-left grid items-center px-4 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors group"
            style={{ gridTemplateColumns: '130px 1fr 110px 120px 110px 90px 32px' }}>
            <div><StatusBadge status={obj.status} /></div>

            <div className="pr-4 min-w-0">
              <p className="text-sm text-slate-200 font-medium group-hover:text-[#2acfc0] transition-colors truncate">
                {obj.title}
              </p>
              {obj.description && (
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{obj.description}</p>
              )}
            </div>

            <div className="pr-3">
              {team ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: team.color + '22', color: team.color }}>
                  {team.name.split(' & ')[0]}
                </span>
              ) : <span className="text-xs text-slate-600">—</span>}
            </div>

            <p className="text-xs text-slate-500 truncate pr-4">{obj.owner || '—'}</p>

            <CadencePill obj={obj} />

            <div className="flex items-center gap-2">
              <div className="flex-1"><ProgressBar progress={obj.progress} height={3} /></div>
              <span className="text-xs text-slate-400 w-7 text-right shrink-0">{obj.progress}%</span>
            </div>

            <ChevronRight size={13} className="text-slate-600 group-hover:text-[#2acfc0] transition-colors justify-self-center" />
          </button>
        );
      })}

      {objectives.length === 0 && (
        <div className="py-10 text-center text-slate-600 text-sm">No objectives found.</div>
      )}
    </div></div>
  );
}
