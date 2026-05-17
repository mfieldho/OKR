'use client';

import { useState } from 'react';
import { Objective, KeyResult, OKRStatus } from '@/lib/types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/Badge';
import { progressColor } from '@/lib/utils';
import { useOKR } from '@/contexts/OKRContext';
import { MessageSquare, Activity } from 'lucide-react';

// ─── Group-by types ───────────────────────────────────────────────────────────

type GroupBy = 'status' | 'team' | 'owner' | 'quarter' | 'okr';

const GROUP_OPTIONS: { id: GroupBy; label: string }[] = [
  { id: 'status',  label: 'Status'  },
  { id: 'team',    label: 'Team'    },
  { id: 'owner',   label: 'Owner'   },
  { id: 'quarter', label: 'Quarter' },
  { id: 'okr',     label: 'By OKR'  },
];

// ─── Status column definitions ────────────────────────────────────────────────

const STATUS_COLS: { status: OKRStatus; label: string; accent: string; glow: string }[] = [
  { status: 'not-started', label: 'Not Started', accent: '#64748b', glow: 'rgba(100,116,139,0.12)' },
  { status: 'on-track',    label: 'On Track',    accent: '#10b981', glow: 'rgba(16,185,129,0.12)'  },
  { status: 'at-risk',     label: 'At Risk',     accent: '#f59e0b', glow: 'rgba(245,158,11,0.12)'  },
  { status: 'behind',      label: 'Behind',      accent: '#ef4444', glow: 'rgba(239,68,68,0.12)'   },
  { status: 'completed',   label: 'Completed',   accent: '#2acfc0', glow: 'rgba(42,207,192,0.12)'  },
];

const PALETTE = ['#2acfc0','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#10b981','#ec4899','#6366f1'];
const QUARTER_COLS = [
  { id: 'Q1', label: 'Q1', accent: '#3b82f6', glow: 'rgba(59,130,246,0.12)' },
  { id: 'Q2', label: 'Q2', accent: '#2acfc0', glow: 'rgba(42,207,192,0.12)' },
  { id: 'Q3', label: 'Q3', accent: '#8b5cf6', glow: 'rgba(139,92,246,0.12)' },
  { id: 'Q4', label: 'Q4', accent: '#f59e0b', glow: 'rgba(245,158,11,0.12)' },
];

// ─── Column builder ───────────────────────────────────────────────────────────

interface Column {
  id: string;
  label: string;
  accent: string;
  glow: string;
  objectives: Objective[];
}

function buildColumns(groupBy: GroupBy, objectives: Objective[], teams: { id: string; name: string; color: string }[]): Column[] {
  switch (groupBy) {
    case 'status':
      return STATUS_COLS.map(c => ({
        ...c,
        id: c.status,
        objectives: objectives.filter(o => o.status === c.status),
      }));

    case 'team': {
      const cols: Column[] = teams.map((t, i) => ({
        id: t.id,
        label: t.name,
        accent: t.color,
        glow: t.color + '1a',
        objectives: objectives.filter(o => o.teamId === t.id),
      }));
      const unassigned = objectives.filter(o => !o.teamId || !teams.find(t => t.id === o.teamId));
      if (unassigned.length) {
        cols.push({ id: '__none', label: 'No Team', accent: '#64748b', glow: 'rgba(100,116,139,0.1)', objectives: unassigned });
      }
      return cols.filter(c => c.objectives.length > 0);
    }

    case 'owner': {
      const owners = [...new Set(objectives.map(o => o.owner || 'Unassigned'))].sort();
      return owners.map((owner, i) => ({
        id: owner,
        label: owner,
        accent: PALETTE[i % PALETTE.length],
        glow: PALETTE[i % PALETTE.length] + '1a',
        objectives: objectives.filter(o => (o.owner || 'Unassigned') === owner),
      }));
    }

    case 'quarter':
      return QUARTER_COLS.map(c => ({
        ...c,
        objectives: objectives.filter(o => o.quarter === c.id),
      })).filter(c => c.objectives.length > 0);

    default:
      return [];
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function KanbanCard({ objective, accentColor, onSelect }: {
  objective: Objective;
  accentColor: string;
  onSelect: () => void;
}) {
  const { data } = useOKR();
  const team = data?.teams.find(t => t.id === objective.teamId);
  const commentCount = objective.comments?.length ?? 0;
  const checkInCount = objective.keyResults.reduce((s, kr) => s + (kr.checkIns?.length ?? 0), 0);

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
            <div className="flex items-center gap-1.5">
              {objective.owner && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                  style={{ background: accentColor + '30', color: accentColor, border: `1px solid ${accentColor}40` }}>
                  {initials(objective.owner)}
                </div>
              )}
              <span className="text-[10px] text-slate-500 truncate max-w-[72px]">{objective.owner}</span>
            </div>
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

// ─── KR card (used in By OKR mode) ───────────────────────────────────────────

function KRCard({ kr, accentColor, onSelect }: {
  kr: KeyResult;
  accentColor: string;
  onSelect: () => void;
}) {
  const color = progressColor(kr.progress);
  return (
    <button onClick={onSelect} className="w-full text-left group focus:outline-none">
      <div
        className="rounded-xl border overflow-hidden transition-all duration-200 hover:-translate-y-0.5 p-3"
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
        <p className="text-[11px] font-semibold text-slate-100 leading-snug mb-2.5 line-clamp-2 group-hover:text-[#2acfc0] transition-colors">
          {kr.title}
        </p>
        <ProgressBar progress={kr.progress} height={3} />
        <div className="flex items-center justify-between mt-2.5">
          <StatusBadge status={kr.status} />
          <span className="text-[10px] font-bold" style={{ color }}>
            {kr.current}{kr.unit} / {kr.target}{kr.unit}
          </span>
        </div>
        {kr.owner && (
          <p className="text-[10px] text-slate-600 mt-1.5 truncate">{kr.owner}</p>
        )}
      </div>
    </button>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function KanbanView({ objectives, onSelect }: { objectives: Objective[]; onSelect: (o: Objective) => void }) {
  const { data } = useOKR();
  const teams = data?.teams ?? [];
  const [groupBy, setGroupBy] = useState<GroupBy>('status');

  const columns = groupBy !== 'okr' ? buildColumns(groupBy, objectives, teams) : [];

  const groupBySelector = (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      <span className="text-xs text-slate-500 font-medium">Group by:</span>
      {GROUP_OPTIONS.map(opt => (
        <button
          key={opt.id}
          onClick={() => setGroupBy(opt.id)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
          style={groupBy === opt.id
            ? { background: 'rgba(42,207,192,0.15)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.3)' }
            : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  // ── By OKR: columns = objectives, cards = key results ──
  if (groupBy === 'okr') {
    return (
      <div>
        {groupBySelector}
        <div
          className="flex gap-4 pb-4 -mx-1 px-1"
          style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          {objectives.map(obj => {
            const team = teams.find(t => t.id === obj.teamId);
            const accent = team?.color ?? '#2acfc0';
            return (
              <div key={obj.id} className="shrink-0 flex flex-col" style={{ width: 252 }}>
                {/* Column header = objective */}
                <div className="flex items-start gap-2 px-1 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5"
                    style={{ background: accent, boxShadow: `0 0 8px ${accent}88` }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 leading-snug line-clamp-2">{obj.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{obj.progress}% · {obj.keyResults.length} KRs</p>
                  </div>
                </div>

                {/* Column body = key results */}
                <div
                  className="flex-1 rounded-2xl p-2 space-y-2 min-h-48 border border-white/[0.04]"
                  style={{ background: accent + '0d' }}
                >
                  {obj.keyResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                      <div className="w-6 h-6 rounded-full border border-dashed border-white/[0.12]" />
                      <p className="text-[10px] text-slate-700">No key results</p>
                    </div>
                  ) : (
                    obj.keyResults.map(kr => (
                      <KRCard
                        key={kr.id}
                        kr={kr}
                        accentColor={accent}
                        onSelect={() => onSelect(obj)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
          {objectives.length === 0 && (
            <div className="flex-1 flex items-center justify-center py-16">
              <p className="text-slate-600 text-sm">No objectives to display.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Standard board ──
  return (
    <div>
      {groupBySelector}
      <div
        className="flex gap-4 pb-4 -mx-1 px-1"
        style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {columns.map(col => (
          <div key={col.id} className="shrink-0 flex flex-col" style={{ width: 252 }}>
            <div className="flex items-center gap-2.5 px-1 mb-3">
              <div className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: col.accent, boxShadow: `0 0 8px ${col.accent}88` }} />
              <span className="text-xs font-semibold text-slate-300 truncate">{col.label}</span>
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                style={{ background: col.accent + '18', color: col.accent }}>
                {col.objectives.length}
              </span>
            </div>
            <div
              className="flex-1 rounded-2xl p-2 space-y-2 min-h-48 border border-white/[0.04]"
              style={{ background: col.glow }}
            >
              {col.objectives.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <div className="w-6 h-6 rounded-full border border-dashed border-white/[0.12]" />
                  <p className="text-[10px] text-slate-700">No objectives</p>
                </div>
              ) : (
                col.objectives.map(obj => (
                  <KanbanCard
                    key={obj.id}
                    objective={obj}
                    accentColor={col.accent}
                    onSelect={() => onSelect(obj)}
                  />
                ))
              )}
            </div>
          </div>
        ))}
        {columns.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-16">
            <p className="text-slate-600 text-sm">No objectives to display.</p>
          </div>
        )}
      </div>
    </div>
  );
}
