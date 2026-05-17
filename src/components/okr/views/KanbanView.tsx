'use client';

import { Objective, OKRStatus } from '@/lib/types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useOKR } from '@/contexts/OKRContext';
import { MessageSquare, Activity } from 'lucide-react';

const COLUMNS: { status: OKRStatus; label: string; accent: string; glow: string }[] = [
  { status: 'not-started', label: 'Not Started', accent: '#64748b', glow: 'rgba(100,116,139,0.12)' },
  { status: 'on-track',    label: 'On Track',    accent: '#10b981', glow: 'rgba(16,185,129,0.12)'  },
  { status: 'at-risk',     label: 'At Risk',     accent: '#f59e0b', glow: 'rgba(245,158,11,0.12)'  },
  { status: 'behind',      label: 'Behind',      accent: '#ef4444', glow: 'rgba(239,68,68,0.12)'   },
  { status: 'completed',   label: 'Completed',   accent: '#2acfc0', glow: 'rgba(42,207,192,0.12)'  },
];

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

function KanbanCard({ objective, onSelect }: { objective: Objective; onSelect: () => void }) {
  const { data } = useOKR();
  const team = data?.teams.find(t => t.id === objective.teamId);
  const commentCount = objective.comments?.length ?? 0;
  const checkInCount = objective.keyResults.reduce((s, kr) => s + (kr.checkIns?.length ?? 0), 0);
  const col = COLUMNS.find(c => c.status === objective.status);
  const accentColor = col?.accent ?? '#64748b';

  return (
    <button onClick={onSelect} className="w-full text-left group focus:outline-none">
      <div
        className="relative rounded-xl border overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
        style={{
          background: 'linear-gradient(145deg, rgba(22,38,64,0.95) 0%, rgba(15,27,50,0.95) 100%)',
          borderColor: 'rgba(255,255,255,0.07)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = `${accentColor}40`;
          (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px ${accentColor}20`;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        }}
      >
        {/* Team color left border */}
        {team && (
          <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
            style={{ background: `linear-gradient(to bottom, ${team.color}, ${team.color}44)` }} />
        )}

        <div className="p-3.5 pl-4">
          {/* Team + status dot */}
          <div className="flex items-center justify-between mb-2.5">
            {team ? (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: team.color + '1a', color: team.color }}>
                {team.name.split(' ')[0]}
              </span>
            ) : <span />}
            <div className="w-2 h-2 rounded-full" style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}` }} />
          </div>

          {/* Title */}
          <p className="text-xs font-semibold text-slate-100 leading-snug mb-3 line-clamp-3 group-hover:text-[#2acfc0] transition-colors">
            {objective.title}
          </p>

          {/* Progress */}
          <ProgressBar progress={objective.progress} height={3} />

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.05]">
            {/* Avatar */}
            <div className="flex items-center gap-1.5">
              {objective.owner && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                  style={{ background: accentColor + '30', color: accentColor, border: `1px solid ${accentColor}40` }}>
                  {initials(objective.owner)}
                </div>
              )}
              <span className="text-[10px] text-slate-500 truncate max-w-[72px]">{objective.owner}</span>
            </div>

            {/* Indicators */}
            <div className="flex items-center gap-2 text-slate-600">
              <span className="text-[10px]">{objective.keyResults.length} KRs</span>
              {commentCount > 0 && (
                <span className="flex items-center gap-0.5 text-[10px]">
                  <MessageSquare size={9} /> {commentCount}
                </span>
              )}
              {checkInCount > 0 && (
                <span className="flex items-center gap-0.5 text-[10px]" style={{ color: '#2acfc0' }}>
                  <Activity size={9} /> {checkInCount}
                </span>
              )}
            </div>
          </div>
        </div>
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
          <div key={col.status} className="shrink-0 flex flex-col" style={{ width: 248 }}>
            {/* Column header */}
            <div className="flex items-center gap-2.5 px-1 mb-3">
              <div className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: col.accent, boxShadow: `0 0 8px ${col.accent}88` }} />
              <span className="text-xs font-semibold text-slate-300">{col.label}</span>
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: col.accent + '18', color: col.accent }}>
                {colObjs.length}
              </span>
            </div>

            {/* Column body */}
            <div className="flex-1 rounded-2xl p-2 space-y-2 min-h-48 border border-white/[0.04]"
              style={{ background: col.glow }}>
              {colObjs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <div className="w-6 h-6 rounded-full border border-dashed border-white/[0.12]" />
                  <p className="text-[10px] text-slate-700">No objectives</p>
                </div>
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
