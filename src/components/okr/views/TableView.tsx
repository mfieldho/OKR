'use client';

import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
import { Objective } from '@/lib/types';
import { Calendar } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useOKR } from '@/contexts/OKRContext';

type SortKey = 'title' | 'status' | 'progress' | 'team' | 'owner' | 'krs';
type Dir = 'asc' | 'desc';

const STATUS_ORDER = ['not-started', 'behind', 'at-risk', 'on-track', 'completed'];

function sortObjectives(objs: Objective[], key: SortKey, dir: Dir, teams: { id: string; name: string }[]) {
  const sorted = [...objs].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case 'title':    cmp = a.title.localeCompare(b.title); break;
      case 'progress': cmp = a.progress - b.progress; break;
      case 'krs':      cmp = a.keyResults.length - b.keyResults.length; break;
      case 'owner':    cmp = (a.owner ?? '').localeCompare(b.owner ?? ''); break;
      case 'status':   cmp = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status); break;
      case 'team': {
        const ta = teams.find(t => t.id === a.teamId)?.name ?? '';
        const tb = teams.find(t => t.id === b.teamId)?.name ?? '';
        cmp = ta.localeCompare(tb);
        break;
      }
    }
    return dir === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

function SortHeader({ label, sortKey, current, dir, onSort }: {
  label: string; sortKey: SortKey; current: SortKey; dir: Dir; onSort: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <button onClick={() => onSort(sortKey)}
      className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider transition-colors"
      style={{ color: active ? '#2acfc0' : '#475569' }}>
      {label}
      {active
        ? dir === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />
        : <ArrowUpDown size={10} className="opacity-40" />}
    </button>
  );
}

export function TableView({ objectives, onSelect }: { objectives: Objective[]; onSelect: (o: Objective) => void }) {
  const { data } = useOKR();
  const teams = data?.teams ?? [];

  const [sortKey, setSortKey] = useState<SortKey>('progress');
  const [dir, setDir] = useState<Dir>('desc');

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setDir('asc'); }
  };

  const sorted = sortObjectives(objectives, sortKey, dir, teams);

  return (
    <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'var(--surface-bg)' }}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <th className="px-4 py-3 text-left w-36">
              <SortHeader label="Status" sortKey="status" current={sortKey} dir={dir} onSort={handleSort} />
            </th>
            <th className="px-4 py-3 text-left">
              <SortHeader label="Objective" sortKey="title" current={sortKey} dir={dir} onSort={handleSort} />
            </th>
            <th className="px-4 py-3 text-left w-36">
              <SortHeader label="Team" sortKey="team" current={sortKey} dir={dir} onSort={handleSort} />
            </th>
            <th className="px-4 py-3 text-left w-36">
              <SortHeader label="Owner" sortKey="owner" current={sortKey} dir={dir} onSort={handleSort} />
            </th>
            <th className="px-4 py-3 text-left w-32">
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                <Calendar size={10} /> Cadence
              </span>
            </th>
            <th className="px-4 py-3 text-center w-16">
              <SortHeader label="KRs" sortKey="krs" current={sortKey} dir={dir} onSort={handleSort} />
            </th>
            <th className="px-4 py-3 text-right w-36">
              <SortHeader label="Progress" sortKey="progress" current={sortKey} dir={dir} onSort={handleSort} />
            </th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {sorted.map(obj => {
            const team = teams.find(t => t.id === obj.teamId);
            return (
              <tr key={obj.id}
                onClick={() => onSelect(obj)}
                className="border-b border-white/[0.04] hover:bg-white/[0.025] cursor-pointer group transition-colors">
                <td className="px-4 py-3"><StatusBadge status={obj.status} /></td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="text-sm text-slate-200 font-medium truncate group-hover:text-[#2acfc0] transition-colors">
                    {obj.title}
                  </p>
                  {obj.description && (
                    <p className="text-xs text-slate-600 truncate mt-0.5">{obj.description}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  {team ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ background: team.color + '22', color: team.color }}>
                      {team.name.split(' & ')[0]}
                    </span>
                  ) : <span className="text-xs text-slate-600">—</span>}
                </td>
                <td className="px-4 py-3 text-xs text-slate-400 truncate">{obj.owner || '—'}</td>
                <td className="px-4 py-3">
                  {(() => {
                    const qs = obj.quarters ?? [obj.quarter];
                    const span = qs.length > 1 ? `${qs[0]}–${qs[qs.length-1]}` : qs[0];
                    const yearly = obj.cadence === 'yearly';
                    return (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold w-fit"
                          style={yearly
                            ? { background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }
                            : { background: 'rgba(59,130,246,0.10)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                          {yearly ? 'Yearly' : 'Quarterly'}
                        </span>
                        <span className="text-[10px] text-slate-500">{span}</span>
                      </div>
                    );
                  })()}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-xs font-medium text-slate-400">{obj.keyResults.length}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-20"><ProgressBar progress={obj.progress} height={4} /></div>
                    <span className="text-xs text-slate-300 font-medium w-7 text-right">{obj.progress}%</span>
                  </div>
                </td>
                <td className="pr-3 text-center">
                  <ChevronRight size={13} className="text-slate-600 group-hover:text-[#2acfc0] transition-colors" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {objectives.length === 0 && (
        <div className="py-10 text-center text-slate-600 text-sm">No objectives found.</div>
      )}
    </div>
  );
}
