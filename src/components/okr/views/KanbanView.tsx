'use client';

import { Objective, OKRStatus } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useOKR } from '@/contexts/OKRContext';

const COLUMNS: { status: OKRStatus; label: string; accent: string; bg: string }[] = [
  { status: 'not-started', label: 'Not Started', accent: '#64748b', bg: 'rgba(100,116,139,0.07)' },
  { status: 'on-track',    label: 'On Track',    accent: '#10b981', bg: 'rgba(16,185,129,0.07)'  },
  { status: 'at-risk',     label: 'At Risk',     accent: '#f59e0b', bg: 'rgba(245,158,11,0.07)'  },
  { status: 'behind',      label: 'Behind',      accent: '#ef4444', bg: 'rgba(239,68,68,0.07)'   },
  { status: 'completed',   label: 'Completed',   accent: '#2acfc0', bg: 'rgba(42,207,192,0.07)'  },
];

function KanbanCard({ objective, onSelect }: { objective: Objective; onSelect: () => void }) {
  const { data } = useOKR();
  const team = data?.teams.find(t => t.id === objective.teamId);

  return (
    <button onClick={onSelect} className="w-full text-left group"
      style={{ outline: 'none' }}>
      <div className="p-3.5 rounded-xl border border-white/[0.06] hover:border-white/[0.18] hover:shadow-lg transition-all"
        style={{ background: 'rgba(22,38,64,0.9)' }}>
        <p className="text-xs font-medium text-slate-200 leading-snug mb-2.5 group-hover:text-[#2acfc0] transition-colors line-clamp-2">
          {objective.title}
        </p>
        <ProgressBar progress={objective.progress} height={3} />
        <div className="flex items-center justify-between mt-2.5 gap-1">
          {team ? (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full truncate max-w-[100px]"
              style={{ background: team.color + '22', color: team.color }}>
              {team.name.split(' ')[0]}
            </span>
          ) : <span />}
          <span className="text-[10px] text-slate-600 shrink-0">{objective.keyResults.length} KRs · {objective.progress}%</span>
        </div>
        {objective.owner && (
          <p className="text-[10px] text-slate-600 mt-1.5 truncate">{objective.owner}</p>
        )}
      </div>
    </button>
  );
}

export function KanbanView({ objectives, onSelect }: { objectives: Objective[]; onSelect: (o: Objective) => void }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
      {COLUMNS.map(col => {
        const colObjs = objectives.filter(o => o.status === col.status);
        return (
          <div key={col.status} className="shrink-0 flex flex-col" style={{ width: 240 }}>
            {/* Column header */}
            <div className="flex items-center gap-2 px-1 mb-3">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: col.accent }} />
              <span className="text-xs font-semibold text-slate-300">{col.label}</span>
              <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                style={{ background: col.accent + '20', color: col.accent }}>
                {colObjs.length}
              </span>
            </div>

            {/* Column body */}
            <div className="flex-1 rounded-2xl p-2 space-y-2 min-h-40 border border-white/[0.04]"
              style={{ background: col.bg }}>
              {colObjs.length === 0 && (
                <p className="text-[10px] text-slate-700 text-center py-6 italic">Empty</p>
              )}
              {colObjs.map(obj => (
                <KanbanCard key={obj.id} objective={obj} onSelect={() => onSelect(obj)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
