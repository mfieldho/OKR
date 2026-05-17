'use client';

import { useState } from 'react';
import {
  X, Pencil, Trash2, Plus, Save, XCircle, User, Calendar, TrendingUp, Tag,
} from 'lucide-react';
import { Objective, KeyResult, OKRStatus, Quarter } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { progressColor, formatValue } from '@/lib/utils';
import { useOKR } from '@/contexts/OKRContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useObjectiveCRUD } from '@/hooks/useObjectiveCRUD';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUSES: OKRStatus[] = ['not-started', 'on-track', 'at-risk', 'behind', 'completed'];
const STATUS_LABELS: Record<OKRStatus, string> = {
  'not-started': 'Not Started', 'on-track': 'On Track',
  'at-risk': 'At Risk', 'behind': 'Behind', 'completed': 'Completed',
};
const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

const INPUT = "w-full px-3 py-2 rounded-xl text-sm text-white placeholder-slate-600 border border-white/[0.08] focus:border-white/20 focus:outline-none transition-colors";
const INPUT_BG: React.CSSProperties = { background: 'rgba(255,255,255,0.04)' };
const SELECT_BG: React.CSSProperties = { background: 'rgba(20,35,60,0.95)' };

function computeProgress(krs: KeyResult[]): number {
  if (!krs.length) return 0;
  return Math.round(krs.reduce((s, k) => s + k.progress, 0) / krs.length);
}

// ─── KR read-only card ────────────────────────────────────────────────────────

function KRViewCard({ kr }: { kr: KeyResult }) {
  const color = kr.progress >= 70 ? '#10b981' : kr.progress >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="p-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.1] transition-all"
      style={{ background: 'rgba(255,255,255,0.025)' }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-sm text-white leading-snug flex-1 font-medium">{kr.title}</p>
        <StatusBadge status={kr.status} />
      </div>
      <ProgressBar progress={kr.progress} showLabel height={5} />
      <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs text-slate-500">
        <div className="flex items-center gap-1.5"><User size={10} /><span className="truncate">{kr.owner}</span></div>
        <div className="flex items-center gap-1.5 justify-end"><Calendar size={10} /><span>Due {kr.dueDate}</span></div>
        <div className="col-span-2 flex items-center gap-1.5 mt-0.5">
          <TrendingUp size={10} style={{ color }} />
          <span style={{ color }} className="font-medium">{formatValue(kr.current, kr.unit)}</span>
          <span className="text-slate-600">of {formatValue(kr.target, kr.unit)} target</span>
        </div>
      </div>
    </div>
  );
}

// ─── KR edit row ──────────────────────────────────────────────────────────────

function KREditRow({ kr, onChange, onDelete }: {
  kr: KeyResult;
  onChange: (updated: KeyResult) => void;
  onDelete: () => void;
}) {
  const f = <K extends keyof KeyResult>(key: K, val: KeyResult[K]) => onChange({ ...kr, [key]: val });

  return (
    <div className="rounded-xl border border-white/[0.08] p-3 space-y-2"
      style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="flex items-center gap-2">
        <input value={kr.title} onChange={e => f('title', e.target.value)}
          placeholder="Key result title" className={`flex-1 ${INPUT}`} style={INPUT_BG} />
        <button onClick={onDelete}
          className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/[0.08] transition-all shrink-0">
          <Trash2 size={13} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] text-slate-500 mb-1">Owner</label>
          <input value={kr.owner} onChange={e => f('owner', e.target.value)}
            placeholder="Owner" className={INPUT} style={INPUT_BG} />
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 mb-1">Target</label>
          <input type="number" value={kr.target} onChange={e => f('target', Number(e.target.value))}
            className={INPUT} style={INPUT_BG} />
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 mb-1">Current</label>
          <input type="number" value={kr.current} onChange={e => {
            const current = Number(e.target.value);
            const progress = kr.target > 0 ? Math.min(100, Math.round((current / kr.target) * 100)) : 0;
            onChange({ ...kr, current, progress });
          }} className={INPUT} style={INPUT_BG} />
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 mb-1">Unit</label>
          <input value={kr.unit} onChange={e => f('unit', e.target.value)}
            placeholder="%, £, count…" className={INPUT} style={INPUT_BG} />
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 mb-1">Due date</label>
          <input type="date" value={kr.dueDate} onChange={e => f('dueDate', e.target.value)}
            className={INPUT} style={INPUT_BG} />
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 mb-1">Status</label>
          <select value={kr.status} onChange={e => f('status', e.target.value as OKRStatus)}
            className={INPUT} style={SELECT_BG}>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

function blankKR(): KeyResult {
  return {
    id: crypto.randomUUID(), title: '', owner: '', target: 100, current: 0,
    unit: '%', dueDate: '', status: 'not-started', progress: 0, lastUpdated: new Date().toISOString().slice(0, 10),
  };
}

// ─── Main panel ───────────────────────────────────────────────────────────────

interface OKRDetailPanelProps {
  objective: Objective;
  onClose: () => void;
}

export function OKRDetailPanel({ objective, onClose }: OKRDetailPanelProps) {
  const { data } = useOKR();
  const { settings } = useSettings();
  const { saveObjective, deleteObjective } = useObjectiveCRUD();

  const [editing, setEditing]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Edit state — initialised when entering edit mode
  const [draft, setDraft] = useState<Objective>(objective);

  const enterEdit = () => { setDraft({ ...objective }); setEditing(true); };
  const cancelEdit = () => { setEditing(false); setConfirmDelete(false); };

  const handleSave = () => {
    const withProgress = { ...draft, progress: computeProgress(draft.keyResults) };
    saveObjective(withProgress);
    setEditing(false);
    onClose();
  };

  const handleDelete = () => {
    deleteObjective(objective.id, objective.quarter);
    onClose();
  };

  const updateKR = (idx: number, kr: KeyResult) =>
    setDraft(d => ({ ...d, keyResults: d.keyResults.map((k, i) => i === idx ? kr : k) }));

  const deleteKR = (idx: number) =>
    setDraft(d => ({ ...d, keyResults: d.keyResults.filter((_, i) => i !== idx) }));

  const addKR = () =>
    setDraft(d => ({ ...d, keyResults: [...d.keyResults, blankKR()] }));

  const team = data?.teams.find(t => t.id === (editing ? draft.teamId : objective.teamId));
  const allTeams = settings.teams;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={editing ? undefined : onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full z-50 flex flex-col border-l border-white/[0.08] shadow-2xl"
        style={{ width: 'min(560px, 100vw)', background: 'rgba(10,20,38,0.99)', backdropFilter: 'blur(20px)' }}>

        {/* ── Header ── */}
        <div className="p-5 border-b border-white/[0.06] flex items-start gap-4 shrink-0"
          style={{ background: 'rgba(255,255,255,0.01)' }}>

          {!editing && (
            <ProgressRing progress={objective.progress} size={72} strokeWidth={7}
              color={progressColor(objective.progress)} label={`${objective.progress}%`} />
          )}

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2.5">
                <textarea
                  value={draft.title}
                  onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                  rows={2}
                  placeholder="Objective title"
                  className={`w-full resize-none text-sm font-semibold ${INPUT}`}
                  style={INPUT_BG}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Owner</label>
                    <input value={draft.owner} onChange={e => setDraft(d => ({ ...d, owner: e.target.value }))}
                      placeholder="Owner" className={INPUT} style={INPUT_BG} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Team</label>
                    <select value={draft.teamId} onChange={e => setDraft(d => ({ ...d, teamId: e.target.value }))}
                      className={INPUT} style={SELECT_BG}>
                      {allTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Quarter</label>
                    <select value={draft.quarter} onChange={e => setDraft(d => ({ ...d, quarter: e.target.value as Quarter }))}
                      className={INPUT} style={SELECT_BG}>
                      {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Status</label>
                    <select value={draft.status} onChange={e => setDraft(d => ({ ...d, status: e.target.value as OKRStatus }))}
                      className={INPUT} style={SELECT_BG}>
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Description</label>
                  <textarea value={draft.description ?? ''} rows={2}
                    onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
                    placeholder="Optional description" className={`w-full resize-none text-sm ${INPUT}`} style={INPUT_BG} />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Tags (comma-separated)</label>
                  <input value={(draft.tags ?? []).join(', ')}
                    onChange={e => setDraft(d => ({ ...d, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                    placeholder="e.g. platform, reliability" className={INPUT} style={INPUT_BG} />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <StatusBadge status={objective.status} />
                  {team && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: team.color + '22', color: team.color, border: `1px solid ${team.color}44` }}>
                      {team.name}
                    </span>
                  )}
                  <span className="text-xs text-slate-600">{objective.quarter} {objective.year}</span>
                </div>
                <h2 className="text-[15px] font-semibold text-white leading-snug">{objective.title}</h2>
                <p className="text-xs text-slate-500 mt-1.5">Owner: {objective.owner}</p>
                {objective.description && (
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{objective.description}</p>
                )}
                {objective.tags && objective.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-2.5 flex-wrap">
                    <Tag size={10} className="text-slate-600 shrink-0" />
                    {objective.tags.map(t => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded text-slate-500 border border-white/[0.06]">{t}</span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {editing ? (
              <>
                <button onClick={handleSave}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={{ background: 'rgba(42,207,192,0.15)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.3)' }}>
                  <Save size={12} /> Save
                </button>
                <button onClick={cancelEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <XCircle size={12} /> Cancel
                </button>
              </>
            ) : (
              <>
                <button onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all">
                  <X size={16} />
                </button>
                <button onClick={enterEdit}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <Pencil size={11} /> Edit
                </button>
                {confirmDelete ? (
                  <div className="flex items-center gap-1">
                    <button onClick={handleDelete}
                      className="px-2 py-1 rounded-lg text-[10px] font-medium"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                      Confirm
                    </button>
                    <button onClick={() => setConfirmDelete(false)} className="text-[10px] text-slate-500 hover:text-slate-300 px-1">
                      No
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(true)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/[0.06] transition-all">
                    <Trash2 size={13} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Key Results ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Key Results · {(editing ? draft : objective).keyResults.length}
            </p>
            {editing && (
              <button onClick={addKR}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all"
                style={{ background: 'rgba(42,207,192,0.08)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.18)' }}>
                <Plus size={11} /> Add KR
              </button>
            )}
          </div>

          {editing ? (
            <>
              {draft.keyResults.length === 0 && (
                <p className="text-xs text-slate-600 text-center py-6">No key results yet — add one above.</p>
              )}
              {draft.keyResults.map((kr, i) => (
                <KREditRow key={kr.id} kr={kr} onChange={updated => updateKR(i, updated)} onDelete={() => deleteKR(i)} />
              ))}
            </>
          ) : (
            <>
              {objective.keyResults.length === 0 && (
                <div className="py-10 text-center">
                  <p className="text-slate-600 text-sm">No key results defined yet.</p>
                  <button onClick={enterEdit}
                    className="mt-3 text-xs text-[#2acfc0] hover:underline">
                    Add key results →
                  </button>
                </div>
              )}
              {objective.keyResults.map(kr => <KRViewCard key={kr.id} kr={kr} />)}
            </>
          )}
        </div>
      </div>
    </>
  );
}
