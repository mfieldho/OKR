'use client';

import { useState, useMemo } from 'react';
import { Plus, Upload, Download, Search, X, SlidersHorizontal } from 'lucide-react';
import { Objective, OKRStatus } from '@/lib/types';
import { useOKRView } from '@/contexts/OKRViewContext';
import { useOKR } from '@/contexts/OKRContext';
import { KanbanView, GroupBy, GROUP_OPTIONS } from './views/KanbanView';
import { GridView }       from './views/GridView';
import { ListView }       from './views/ListView';
import { TableView }      from './views/TableView';
import { TeamBoardView }  from './views/TeamBoardView';
import { TreeView }       from './views/TreeView';
import { OKRDetailPanel } from './OKRDetailPanel';
import { AddObjectivePanel } from './AddObjectivePanel';
import { ImportPanel }    from './ImportPanel';

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCSV(objectives: Objective[], teams: { id: string; name: string }[]) {
  const header = [
    'Quarter','Year','Title','Description','Owner','Team','Status','Progress','Tags',
    'Parent ID','KR Title','KR Owner','KR Target','KR Current','KR Unit','KR Due Date','KR Status','KR Progress',
  ].join(',');

  const rows: string[] = [];
  for (const obj of objectives) {
    const teamName = teams.find(t => t.id === obj.teamId)?.name ?? '';
    const base = [
      obj.quarter, obj.year,
      `"${obj.title.replace(/"/g, '""')}"`,
      `"${(obj.description ?? '').replace(/"/g, '""')}"`,
      `"${obj.owner}"`, `"${teamName}"`,
      obj.status, obj.progress,
      `"${(obj.tags ?? []).join(', ')}"`,
      obj.parentId ?? '',
    ];
    if (obj.keyResults.length === 0) {
      rows.push([...base, '', '', '', '', '', '', '', ''].join(','));
    } else {
      for (const kr of obj.keyResults) {
        rows.push([
          ...base,
          `"${kr.title.replace(/"/g, '""')}"`,
          `"${kr.owner}"`, kr.target, kr.current,
          kr.unit, kr.dueDate, kr.status, kr.progress,
        ].join(','));
      }
    }
  }

  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `okrs-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: OKRStatus | 'all'; label: string }[] = [
  { value: 'all',          label: 'All statuses'  },
  { value: 'on-track',     label: 'On Track'      },
  { value: 'at-risk',      label: 'At Risk'       },
  { value: 'behind',       label: 'Behind'        },
  { value: 'not-started',  label: 'Not Started'   },
  { value: 'completed',    label: 'Completed'     },
];

const SEL = "px-3 py-2 rounded-xl text-sm text-white border border-white/[0.08] focus:border-white/20 focus:outline-none transition-colors";
const SEL_BG: React.CSSProperties = { background: 'var(--select-bg)' };

// ─── Group-by helpers ─────────────────────────────────────────────────────────

const PALETTE = ['#6366f1','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6','#3b82f6','#ec4899'];

function getGroupSections(
  groupBy: GroupBy,
  objectives: Objective[],
  teams: { id: string; name: string; color: string }[],
): { id: string; label: string; color: string; objectives: Objective[] }[] {
  if (groupBy === 'okr') return [];

  const map = new Map<string, { label: string; color: string; objectives: Objective[] }>();

  for (const obj of objectives) {
    let key = '';
    let label = '';
    let color = '#64748b';

    if (groupBy === 'team') {
      const t = teams.find(t => t.id === obj.teamId);
      key = obj.teamId ?? 'unknown';
      label = t?.name ?? 'Unknown Team';
      color = t?.color ?? '#64748b';
    } else if (groupBy === 'status') {
      key = obj.status;
      const STATUS_MAP: Record<string, { label: string; color: string }> = {
        'not-started': { label: 'Not Started', color: '#64748b' },
        'on-track':    { label: 'On Track',    color: '#10b981' },
        'at-risk':     { label: 'At Risk',      color: '#f59e0b' },
        'behind':      { label: 'Behind',       color: '#ef4444' },
        'completed':   { label: 'Completed',    color: '#2acfc0' },
      };
      label = STATUS_MAP[obj.status]?.label ?? obj.status;
      color = STATUS_MAP[obj.status]?.color ?? '#64748b';
    } else if (groupBy === 'owner') {
      key = obj.owner || 'Unassigned';
      label = key;
      color = PALETTE[Math.abs(key.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % PALETTE.length];
    } else if (groupBy === 'quarter') {
      key = obj.quarter;
      label = obj.quarter;
      color = PALETTE['Q1Q2Q3Q4'.indexOf(key[1]) % PALETTE.length] ?? '#64748b';
    }

    if (!map.has(key)) map.set(key, { label, color, objectives: [] });
    map.get(key)!.objectives.push(obj);
  }

  return Array.from(map.entries()).map(([id, v]) => ({ id, ...v }));
}

interface FilterState {
  search: string;
  team: string;
  status: OKRStatus | 'all';
  owner: string;
}

const DEFAULT_FILTER: FilterState = { search: '', team: 'all', status: 'all', owner: '' };

function isDefaultFilter(f: FilterState) {
  return f.search === '' && f.team === 'all' && f.status === 'all' && f.owner === '';
}

function applyFilters(objectives: Objective[], f: FilterState): Objective[] {
  return objectives.filter(obj => {
    if (f.team   !== 'all' && obj.teamId !== f.team)    return false;
    if (f.status !== 'all' && obj.status !== f.status)  return false;
    if (f.owner  && !obj.owner.toLowerCase().includes(f.owner.toLowerCase())) return false;
    if (f.search) {
      const q = f.search.toLowerCase();
      const hit = obj.title.toLowerCase().includes(q)
        || (obj.description ?? '').toLowerCase().includes(q)
        || obj.owner.toLowerCase().includes(q)
        || (obj.tags ?? []).some(t => t.toLowerCase().includes(q))
        || obj.keyResults.some(kr => kr.title.toLowerCase().includes(q));
      if (!hit) return false;
    }
    return true;
  });
}

// ─── Main component ───────────────────────────────────────────────────────────

interface OKRViewSwitcherProps {
  objectives: Objective[];
}

export function OKRViewSwitcher({ objectives }: OKRViewSwitcherProps) {
  const { view }    = useOKRView();
  const { data }    = useOKR();
  const teams       = data?.teams ?? [];

  const [selected,   setSelected]   = useState<Objective | null>(null);
  const [addingNew,  setAddingNew]  = useState(false);
  const [importing,  setImporting]  = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filter,     setFilter]     = useState<FilterState>(DEFAULT_FILTER);
  const [groupBy,    setGroupBy]    = useState<GroupBy>('okr');

  const filtered = useMemo(() => applyFilters(objectives, filter), [objectives, filter]);
  const dirty = !isDefaultFilter(filter);
  const groupSections = useMemo(() => getGroupSections(groupBy, filtered, teams), [groupBy, filtered, teams]);

  const setF = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
    setFilter(prev => ({ ...prev, [key]: val }));

  return (
    <div>
      {/* ── Action row ── */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button onClick={() => { setAddingNew(true); setImporting(false); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'rgba(42,207,192,0.12)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.25)' }}>
          <Plus size={14} /> Add Objective
        </button>
        <button onClick={() => { setImporting(true); setAddingNew(false); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'var(--btn-ghost-bg)', color: 'var(--btn-ghost-color)', border: '1px solid var(--btn-ghost-border)' }}>
          <Upload size={14} /> Import
        </button>
        <button onClick={() => exportCSV(filtered, teams)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'var(--btn-ghost-bg)', color: 'var(--btn-ghost-color)', border: '1px solid var(--btn-ghost-border)' }}>
          <Download size={14} /> Export
        </button>
        <button onClick={() => setShowFilter(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={showFilter || dirty
            ? { background: 'rgba(42,207,192,0.1)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.25)' }
            : { background: 'var(--btn-ghost-bg)', color: 'var(--btn-ghost-color)', border: '1px solid var(--btn-ghost-border)' }}>
          <SlidersHorizontal size={14} /> Filter{dirty ? ` (${filtered.length})` : ''}
        </button>
        <span className="text-xs text-slate-600 ml-auto">
          {filtered.length !== objectives.length
            ? `${filtered.length} of ${objectives.length} objectives`
            : `${objectives.length} objectives`}
        </span>
      </div>

      {/* ── Filter bar ── */}
      {showFilter && (
        <div className="mb-4 p-4 rounded-2xl border flex flex-wrap gap-3 items-end"
          style={{ background: 'var(--filter-bar-bg)', borderColor: 'var(--border-subtle)' }}>

          {/* Text search */}
          <div className="relative flex-1 min-w-44">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              value={filter.search}
              onChange={e => setF('search', e.target.value)}
              placeholder="Search objectives, KRs, owners…"
              className="w-full pl-8 pr-3 py-2 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-input)' }}
            />
            {filter.search && (
              <button onClick={() => setF('search', '')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Team filter */}
          <select value={filter.team} onChange={e => setF('team', e.target.value)}
            className={SEL} style={{ ...SEL_BG, minWidth: 160 }}>
            <option value="all">All teams</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          {/* Status filter */}
          <select value={filter.status} onChange={e => setF('status', e.target.value as OKRStatus | 'all')}
            className={SEL} style={{ ...SEL_BG, minWidth: 140 }}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Owner filter */}
          <input value={filter.owner} onChange={e => setF('owner', e.target.value)}
            placeholder="Filter by owner…"
            className={`${SEL} min-w-36`}
            style={{ background: 'var(--input-bg)' }} />

          {/* Clear */}
          {dirty && (
            <button onClick={() => setFilter(DEFAULT_FILTER)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 transition-colors"
              style={{ border: '1px solid var(--border-subtle)' }}>
              <X size={11} /> Clear
            </button>
          )}
        </div>
      )}

      {/* ── Group-by selector ── */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs text-slate-500 font-medium shrink-0">Group by:</span>
        {GROUP_OPTIONS.map(opt => (
          <button key={opt.id} onClick={() => setGroupBy(opt.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
            style={groupBy === opt.id
              ? { background: 'rgba(42,207,192,0.15)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.3)' }
              : { background: 'var(--btn-ghost-bg)', color: 'var(--btn-ghost-color)', border: '1px solid var(--btn-ghost-border)' }}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── Active view ── */}
      {view === 'kanban' && (
        <KanbanView objectives={filtered} onSelect={setSelected} groupBy={groupBy} />
      )}

      {/* Non-kanban views: flat when groupBy=okr, sectioned otherwise */}
      {view !== 'kanban' && groupBy === 'okr' && (
        <>
          {view === 'grid'   && <GridView      objectives={filtered} onSelect={setSelected} />}
          {view === 'list'   && <ListView      objectives={filtered} onSelect={setSelected} />}
          {view === 'table'  && <TableView     objectives={filtered} onSelect={setSelected} />}
          {view === 'team'   && <TeamBoardView objectives={filtered} onSelect={setSelected} />}
          {view === 'tree'   && <TreeView      objectives={filtered} onSelect={setSelected} />}
        </>
      )}

      {view !== 'kanban' && groupBy !== 'okr' && (
        <div className="space-y-8">
          {groupSections.map(section => (
            <div key={section.id}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: section.color, boxShadow: `0 0 6px ${section.color}88` }} />
                <span className="text-sm font-semibold text-slate-200">{section.label}</span>
                <span className="text-xs text-slate-600 px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--input-bg)' }}>
                  {section.objectives.length}
                </span>
                <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
              </div>
              {view === 'grid'   && <GridView      objectives={section.objectives} onSelect={setSelected} />}
              {view === 'list'   && <ListView      objectives={section.objectives} onSelect={setSelected} />}
              {view === 'table'  && <TableView     objectives={section.objectives} onSelect={setSelected} />}
              {view === 'team'   && <TeamBoardView objectives={section.objectives} onSelect={setSelected} />}
              {view === 'tree'   && <TreeView      objectives={section.objectives} onSelect={setSelected} />}
            </div>
          ))}
          {groupSections.length === 0 && (
            <div className="py-12 text-center text-slate-600 text-sm">No objectives found.</div>
          )}
        </div>
      )}

      {/* ── Panels ── */}
      {selected  && <OKRDetailPanel   objective={selected}   onClose={() => setSelected(null)} />}
      {addingNew && <AddObjectivePanel                        onClose={() => setAddingNew(false)} />}
      {importing && <ImportPanel                              onClose={() => setImporting(false)} />}
    </div>
  );
}
