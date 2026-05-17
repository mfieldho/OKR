'use client';

import { ChevronRight } from 'lucide-react';
import { Objective } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useOKR } from '@/contexts/OKRContext';

export function ListView({ objectives, onSelect }: { objectives: Objective[]; onSelect: (o: Objective) => void }) {
  const { data } = useOKR();

  return (
    <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'rgba(22,38,64,0.5)' }}>
      {/* Header row */}
      <div className="grid items-center px-4 py-2.5 border-b border-white/[0.06] text-[10px] font-semibold uppercase tracking-wider text-slate-600"
        style={{ gridTemplateColumns: '140px 1fr 130px 140px 90px 32px' }}>
        <span>Status</span>
        <span>Objective</span>
        <span>Team</span>
        <span>Owner</span>
        <span className="text-right">Progress</span>
        <span />
      </div>

      {objectives.map((obj, i) => {
        const team = data?.teams.find(t => t.id === obj.teamId);
        return (
          <button key={obj.id} onClick={() => onSelect(obj)}
            className="w-full text-left grid items-center px-4 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors group"
            style={{ gridTemplateColumns: '140px 1fr 130px 140px 90px 32px' }}>
            <div><StatusBadge status={obj.status} /></div>

            <p className="text-sm text-slate-200 font-medium group-hover:text-[#2acfc0] transition-colors truncate pr-4">
              {obj.title}
            </p>

            <div className="pr-3">
              {team ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: team.color + '22', color: team.color }}>
                  {team.name.split(' & ')[0]}
                </span>
              ) : <span className="text-xs text-slate-600">—</span>}
            </div>

            <p className="text-xs text-slate-500 truncate pr-4">{obj.owner || '—'}</p>

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
    </div>
  );
}
