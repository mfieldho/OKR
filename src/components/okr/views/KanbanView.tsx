'use client';

import { useMemo } from 'react';
import { Objective, KeyResult, OKRStatus } from '@/lib/types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useOKR } from '@/contexts/OKRContext';
import { Zap, TrendingDown, CheckCircle2 } from 'lucide-react';

// ─── Group-by types (exported for shared use) ─────────────────────────────────

export type GroupBy = 'okr' | 'status' | 'team' | 'owner' | 'quarter';

export const GROUP_OPTIONS: { id: GroupBy; label: string }[] = [
  { id: 'okr',     label: 'By OKR'  },
  { id: 'team',    label: 'Team'    },
  { id: 'status',  label: 'Status'  },
  { id: 'owner',   label: 'Owner'   },
  { id: 'quarter', label: 'Quarter' },
];

// ─── Status column definitions ────────────────────────────────────────────────

const STATUS_COLS: { status: OKRStatus; label: string; accent: string; glow: string }[] = [
  { status: 'not-started', label: 'Not Started', accent: '#64748b', glow: 'rgba(100,116,139,0.08)' },
  { status: 'on-track',    label: 'On Track',    accent: '#10b981', glow: 'rgba(16,185,129,0.08)'  },
  { status: 'at-risk',     label: 'At Risk',     accent: '#f59e0b', glow: 'rgba(245,158,11,0.08)'  },
  { status: 'behind',      label: 'Behind',      accent: '#ef4444', glow: 'rgba(239,68,68,0.08)'   },
  { status: 'completed',   label: 'Completed',   accent: '#2acfc0', glow: 'rgba(42,207,192,0.08)'  },
];

const PALETTE = ['#2acfc0','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#10b981','#ec4899','#6366f1'];

const QUARTER_COLS = [
  { id: 'Q1', label: 'Q1', accent: '#3b82f6', glow: 'rgba(59,130,246,0.08)' },
  { id: 'Q2', label: 'Q2', accent: '#2acfc0', glow: 'rgba(42,207,192,0.08)' },
  { id: 'Q3', label: 'Q3', accent: '#8b5cf6', glow: 'rgba(139,92,246,0.08)' },
  { id: 'Q4', label: 'Q4', accent: '#f59e0b', glow: 'rgba(245,158,11,0.08)' },
];

// ─── Column builder ───────────────────────────────────────────────────────────

interface Column {
  id: string;
  label: string;
  accent: string;
  glow: string;
  objectives: Objective[];
}

function buildColumns(
  groupBy: GroupBy,
  objectives: Objective[],
  teams: { id: string; name: string; color: string }[],
): Column[] {
  switch (groupBy) {
    case 'status':
      return STATUS_COLS.map(c => ({
        ...c, id: c.status,
        objectives: objectives.filter(o => o.status === c.status),
      }));

    case 'team': {
      const cols: Column[] = teams.map(t => ({
        id: t.id, label: t.name, accent: t.color, glow: t.color + '14',
        objectives: objectives.filter(o => o.teamId === t.id),
      }));
      const unassigned = objectives.filter(o => !o.teamId || !teams.find(t => t.id === o.teamId));
      if (unassigned.length) cols.push({ id: '__none', label: 'No Team', accent: '#64748b', glow: 'rgba(100,116,139,0.08)', objectives: unassigned });
      return cols.filter(c => c.objectives.length > 0);
    }

    case 'owner': {
      const owners = [...new Set(objectives.map(o => o.owner || 'Unassigned'))].sort();
      return owners.map((owner, i) => ({
        id: owner, label: owner,
        accent: PALETTE[i % PALETTE.length],
        glow: PALETTE[i % PALETTE.length] + '14',
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

function krStatusColor(status: OKRStatus): string {
  const map: Record<OKRStatus, string> = {
    'completed': '#2acfc0', 'on-track': '#10b981',
    'at-risk': '#f59e0b',   'behind': '#ef4444', 'not-started': '#64748b',
  };
  return map[status] ?? '#64748b';
}

// ─── Risk badge ───────────────────────────────────────────────────────────────

function RiskBadge({ status }: { status: OKRStatus }) {
  if (status === 'behind') return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
      style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.35)' }}>
      <TrendingDown size={9} /> Behind
    </span>
  );
  if (status === 'at-risk') return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
      style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.35)' }}>
      <Zap size={9} /> At Risk
    </span>
  );
  if (status === 'completed') return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
      style={{ background: 'rgba(42,207,192,0.12)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.3)' }}>
      <CheckCircle2 size={9} /> Done
    </span>
  );
  return null;
}

// ─── KR mini-row ─────────────────────────────────────────────────────────────

function KRRow({ kr }: { kr: KeyResult }) {
  const color = krStatusColor(kr.status);
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 5px ${color}88` }} />
        <span className="text-[10px] text-slate-400 flex-1 truncate leading-none">{kr.title}</span>
        <span className="text-[10px] font-bold shrink-0 tabular-nums" style={{ color }}>{kr.progress}%</span>
      </div>
      <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full" style={{ width: `${kr.progress}%`, background: `linear-gradient(90deg, ${color}bb, ${color})` }} />
      </div>
    </div>
  );
}

// ─── Main Kanban card ─────────────────────────────────────────────────────────

function KanbanCard({ objective, accentColor, onSelect }: {
  objective: Objective;
  accentColor: string;
  onSelect: () => void;
}) {
  const { data } = useOKR();
  const team       = data?.teams.find(t => t.id === objective.teamId);
  const isBehind   = objective.status === 'behind';
  const isAtRisk   = objective.status === 'at-risk';
  const isComplete = objective.status === 'completed';

  const borderColor = isBehind ? '#ef4444' : isAtRisk ? '#f59e0b' : isComplete ? 'rgba(42,207,192,0.3)' : 'rgba(255,255,255,0.07)';
  const boxShadow   = isBehind
    ? '0 0 0 1px rgba(239,68,68,0.5), 0 8px 32px rgba(239,68,68,0.2)'
    : isAtRisk
      ? '0 0 0 1px rgba(245,158,11,0.45), 0 8px 32px rgba(245,158,11,0.15)'
      : isComplete
        ? '0 4px 16px rgba(42,207,192,0.08)'
        : '0 2px 12px rgba(0,0,0,0.25)';

  const displayKRs = objective.keyResults.slice(0, 3);

  return (
    <button onClick={onSelect} className="w-full text-left group focus:outline-none">
      <div
        className="rounded-xl overflow-hidden border transition-all duration-200 group-hover:-translate-y-1"
        style={{
          background: 'linear-gradient(145deg, rgba(14,28,54,0.97), rgba(18,34,66,0.93))',
          borderColor,
          boxShadow,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${accentColor}70`; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = borderColor; }}
      >
        {/* Coloured top bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}44)` }} />

        <div className="p-4">
          {/* Team badge + risk badge */}
          <div className="flex items-center justify-between mb-3 gap-2 min-h-[22px]">
            {team ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide truncate max-w-[110px]"
                style={{ background: team.color + '20', color: team.color, border: `1px solid ${team.color}35` }}>
                {team.name}
              </span>
            ) : <span />}
            <RiskBadge status={objective.status} />
          </div>

          {/* Title + description */}
          <div className="mb-3">
            <p className="text-[13px] font-bold text-white leading-snug group-hover:text-[#2acfc0] transition-colors">
              {objective.title}
            </p>
            {objective.description && (
              <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
                {objective.description}
              </p>
            )}
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex-1">
              <ProgressBar progress={objective.progress} color={accentColor} height={5} />
            </div>
            <span className="text-sm font-black shrink-0 tabular-nums" style={{ color: accentColor }}>
              {objective.progress}%
            </span>
          </div>

          {/* KRIs */}
          {displayKRs.length > 0 && (
            <div className="space-y-2.5 pt-3 border-t border-white/[0.06]">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Key Results</p>
              {displayKRs.map(kr => <KRRow key={kr.id} kr={kr} />)}
              {objective.keyResults.length > 3 && (
                <p className="text-[10px] text-slate-600 pl-3.5">+{objective.keyResults.length - 3} more</p>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.05]">
            <div className="flex items-center gap-1.5">
              {objective.owner && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                  style={{ background: accentColor + '25', color: accentColor, border: `1px solid ${accentColor}35` }}>
                  {initials(objective.owner)}
                </div>
              )}
              <span className="text-[10px] text-slate-500 truncate max-w-[90px]">{objective.owner}</span>
            </div>
            <span className="text-[10px] text-slate-600">{objective.keyResults.length} KRs</span>
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── KR card (By OKR mode) ────────────────────────────────────────────────────

function KRCard({ kr, accentColor, onSelect }: {
  kr: KeyResult;
  accentColor: string;
  onSelect: () => void;
}) {
  const color = krStatusColor(kr.status);
  return (
    <button onClick={onSelect} className="w-full text-left group focus:outline-none">
      <div
        className="rounded-xl border overflow-hidden transition-all duration-200 group-hover:-translate-y-0.5"
        style={{
          background: 'linear-gradient(145deg, rgba(14,28,54,0.97), rgba(18,34,66,0.93))',
          borderColor: kr.status === 'behind' ? '#ef4444' : kr.status === 'at-risk' ? '#f59e0b' : 'rgba(255,255,255,0.07)',
          boxShadow: kr.status === 'behind'
            ? '0 0 0 1px rgba(239,68,68,0.4), 0 4px 16px rgba(239,68,68,0.15)'
            : kr.status === 'at-risk'
              ? '0 0 0 1px rgba(245,158,11,0.35), 0 4px 16px rgba(245,158,11,0.12)'
              : '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ height: 2, background: `linear-gradient(90deg, ${color}, ${color}44)` }} />
        <div className="p-3">
          <p className="text-[11px] font-semibold text-slate-100 leading-snug mb-2.5 line-clamp-2 group-hover:text-[#2acfc0] transition-colors">
            {kr.title}
          </p>
          <div className="space-y-1.5 mb-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold" style={{ color }}>
                {kr.current}{kr.unit} / {kr.target}{kr.unit}
              </span>
              <RiskBadge status={kr.status} />
            </div>
            <ProgressBar progress={kr.progress} color={color} height={4} />
          </div>
          {kr.owner && (
            <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.05]">
              <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0"
                style={{ background: accentColor + '25', color: accentColor }}>
                {initials(kr.owner)}
              </div>
              <p className="text-[10px] text-slate-600 truncate">{kr.owner}</p>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Column header ────────────────────────────────────────────────────────────

function ColumnHeader({ col }: { col: Column }) {
  const riskCount   = col.objectives.filter(o => o.status === 'at-risk').length;
  const behindCount = col.objectives.filter(o => o.status === 'behind').length;
  return (
    <div className="px-3 py-3"
      style={{
        background: `linear-gradient(180deg, ${col.accent}20 0%, ${col.accent}08 100%)`,
        borderBottom: `1px solid ${col.accent}28`,
      }}>
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ background: col.accent, boxShadow: `0 0 8px ${col.accent}` }} />
        <span className="text-sm font-black text-white truncate">{col.label}</span>
        <span className="ml-auto text-xs font-black px-2 py-0.5 rounded-full shrink-0"
          style={{ background: col.accent + '22', color: col.accent, border: `1px solid ${col.accent}35` }}>
          {col.objectives.length}
        </span>
      </div>
      {(riskCount > 0 || behindCount > 0) && (
        <div className="flex items-center gap-3 mt-1.5 pl-0.5">
          {behindCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#f87171' }}>
              <TrendingDown size={9} /> {behindCount} behind
            </span>
          )}
          {riskCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#fbbf24' }}>
              <Zap size={9} /> {riskCount} at risk
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function KanbanView({
  objectives, onSelect, groupBy,
}: {
  objectives: Objective[];
  onSelect: (o: Objective) => void;
  groupBy: GroupBy;
}) {
  const { data } = useOKR();
  const teams = data?.teams ?? [];

  const columns = useMemo(
    () => groupBy !== 'okr' ? buildColumns(groupBy, objectives, teams) : [],
    [groupBy, objectives, teams],
  );

  const BODY_HEIGHT = 'calc(100vh - 280px)';

  // ── By OKR: each objective is a column, KRs are the cards ──
  if (groupBy === 'okr') {
    return (
      <div
        className="flex gap-4 pb-4 -mx-1 px-1"
        style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {objectives.map(obj => {
          const team   = teams.find(t => t.id === obj.teamId);
          const accent = team?.color ?? '#2acfc0';
          const atRiskKRs  = obj.keyResults.filter(k => k.status === 'at-risk').length;
          const behindKRs  = obj.keyResults.filter(k => k.status === 'behind').length;

          return (
            <div key={obj.id} className="shrink-0 flex flex-col rounded-2xl overflow-hidden border border-white/[0.05]"
              style={{ width: 280 }}>
              {/* Top accent strip */}
              <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}44)` }} />

              {/* Column header */}
              <div className="p-3 border-b border-white/[0.06]"
                style={{ background: `linear-gradient(180deg, ${accent}18 0%, transparent 100%)` }}>
                <div className="flex items-start gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5"
                    style={{ background: accent, boxShadow: `0 0 8px ${accent}99` }} />
                  <p className="text-xs font-bold text-slate-200 leading-snug">{obj.title}</p>
                </div>
                {obj.description && (
                  <p className="text-[10px] text-slate-500 ml-[18px] leading-snug line-clamp-2 mb-1.5">
                    {obj.description}
                  </p>
                )}
                <div className="flex items-center gap-2 ml-[18px] flex-wrap">
                  <span className="text-[10px] text-slate-600">{obj.progress}% · {obj.keyResults.length} KRs</span>
                  {behindKRs > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold" style={{ color: '#f87171' }}>
                      <TrendingDown size={9} /> {behindKRs}
                    </span>
                  )}
                  {atRiskKRs > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold" style={{ color: '#fbbf24' }}>
                      <Zap size={9} /> {atRiskKRs}
                    </span>
                  )}
                </div>
              </div>

              {/* KR cards */}
              <div className="p-2 space-y-2 overflow-y-auto" style={{ background: accent + '08', maxHeight: BODY_HEIGHT }}>
                {obj.keyResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <div className="w-7 h-7 rounded-full border border-dashed border-white/[0.12]" />
                    <p className="text-[10px] text-slate-700">No key results</p>
                  </div>
                ) : (
                  obj.keyResults.map(kr => (
                    <KRCard key={kr.id} kr={kr} accentColor={accent} onSelect={() => onSelect(obj)} />
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
    );
  }

  // ── Standard board ──
  return (
    <div
      className="flex gap-4 pb-4 -mx-1 px-1"
      style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
    >
      {columns.map(col => (
        <div key={col.id} className="shrink-0 flex flex-col rounded-2xl overflow-hidden border border-white/[0.05]"
          style={{ width: 300 }}>
          <ColumnHeader col={col} />
          <div className="p-2 space-y-2 overflow-y-auto" style={{ background: col.glow, maxHeight: BODY_HEIGHT }}>
            {col.objectives.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="w-7 h-7 rounded-full border border-dashed border-white/[0.1]" />
                <p className="text-[10px] text-slate-700">No objectives</p>
              </div>
            ) : (
              col.objectives.map(obj => (
                <KanbanCard key={obj.id} objective={obj} accentColor={col.accent} onSelect={() => onSelect(obj)} />
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
  );
}
