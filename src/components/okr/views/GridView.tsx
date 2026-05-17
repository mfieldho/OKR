'use client';

import { Objective } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { progressColor } from '@/lib/utils';
import { useOKR } from '@/contexts/OKRContext';
import { MessageSquare, Activity, Tag } from 'lucide-react';

function GridCard({ objective, onSelect }: { objective: Objective; onSelect: () => void }) {
  const { data } = useOKR();
  const team = data?.teams.find(t => t.id === objective.teamId);
  const commentCount = objective.comments?.length ?? 0;
  const checkInCount = objective.keyResults.reduce((s, kr) => s + (kr.checkIns?.length ?? 0), 0);
  const color = progressColor(objective.progress);

  return (
    <button onClick={onSelect}
      className="text-left group w-full rounded-2xl overflow-hidden border border-white/[0.06] transition-all duration-200 hover:-translate-y-1 focus:outline-none flex flex-col"
      style={{
        background: 'rgba(14,26,50,0.9)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px ${team?.color ?? color}30`;
        (e.currentTarget as HTMLElement).style.borderColor = `${team?.color ?? color}30`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
      }}>

      {/* Team colour banner */}
      {team && (
        <div className="h-1.5 w-full shrink-0"
          style={{ background: `linear-gradient(90deg, ${team.color}, ${team.color}44)` }} />
      )}

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Top row: ring + status */}
        <div className="flex items-start justify-between gap-3">
          <ProgressRing progress={objective.progress} size={68} strokeWidth={6} color={color} label="" />
          <div className="flex flex-col items-end gap-2 min-w-0">
            <StatusBadge status={objective.status} />
            {team && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap"
                style={{ background: team.color + '1a', color: team.color }}>
                {team.name.split(' & ')[0]}
              </span>
            )}
            <span className="text-lg font-bold leading-none" style={{ color }}>{objective.progress}%</span>
          </div>
        </div>

        {/* Title */}
        <div className="flex-1">
          <p className="text-sm font-semibold text-white leading-snug group-hover:text-[#2acfc0] transition-colors line-clamp-3">
            {objective.title}
          </p>
          {objective.description && (
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">{objective.description}</p>
          )}
          {objective.tags && objective.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {objective.tags.slice(0, 3).map(t => (
                <span key={t} className="text-[9px] px-1.5 py-0.5 rounded text-slate-500 border border-white/[0.06]">{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.05] text-xs text-slate-500">
          <span>{objective.keyResults.length} key results</span>
          <div className="flex items-center gap-3">
            {commentCount > 0 && (
              <span className="flex items-center gap-1"><MessageSquare size={10} />{commentCount}</span>
            )}
            {checkInCount > 0 && (
              <span className="flex items-center gap-1" style={{ color: '#2acfc0' }}><Activity size={10} />{checkInCount}</span>
            )}
            <span className="truncate max-w-[80px]">{objective.owner}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export function GridView({ objectives, onSelect }: { objectives: Objective[]; onSelect: (o: Objective) => void }) {
  return (
    <div className="grid gap-4 stagger" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))' }}>
      {objectives.map(obj => (
        <GridCard key={obj.id} objective={obj} onSelect={() => onSelect(obj)} />
      ))}
    </div>
  );
}
