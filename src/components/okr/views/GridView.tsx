'use client';

import { Objective } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { progressColor } from '@/lib/utils';
import { useOKR } from '@/contexts/OKRContext';

function GridCard({ objective, onSelect }: { objective: Objective; onSelect: () => void }) {
  const { data } = useOKR();
  const team = data?.teams.find(t => t.id === objective.teamId);

  return (
    <button onClick={onSelect}
      className="text-left group w-full rounded-2xl border border-white/[0.06] hover:border-white/[0.16] hover:shadow-xl transition-all duration-200 p-5 flex flex-col gap-4"
      style={{ background: 'rgba(22,38,64,0.8)' }}>

      <div className="flex items-start justify-between gap-3">
        <ProgressRing
          progress={objective.progress}
          size={64}
          strokeWidth={6}
          color={progressColor(objective.progress)}
          label={`${objective.progress}%`}
        />
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={objective.status} />
          {team && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: team.color + '22', color: team.color }}>
              {team.name.split(' & ')[0].split(' ')[0]}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1">
        <p className="text-sm font-semibold text-white leading-snug group-hover:text-[#2acfc0] transition-colors line-clamp-3">
          {objective.title}
        </p>
        {objective.description && (
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">{objective.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 border-t border-white/[0.05] pt-3">
        <span>{objective.keyResults.length} key results</span>
        <span>{objective.owner}</span>
      </div>
    </button>
  );
}

export function GridView({ objectives, onSelect }: { objectives: Objective[]; onSelect: (o: Objective) => void }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
      {objectives.map(obj => (
        <GridCard key={obj.id} objective={obj} onSelect={() => onSelect(obj)} />
      ))}
    </div>
  );
}
