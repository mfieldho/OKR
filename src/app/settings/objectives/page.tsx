'use client';

import { useState, useCallback } from 'react';
import { Plus, ChevronDown, ChevronUp, Pencil, Trash2, Check, X, AlertTriangle } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { allObjectives } from '@/lib/mockData';
import { Objective, KeyResult, OKRStatus, Quarter } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

// ─── Constants ────────────────────────────────────────────────────────────────

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];
const YEAR = 2026;

const STATUSES: OKRStatus[] = ['not-started', 'on-track', 'at-risk', 'behind', 'completed'];
const STATUS_LABELS: Record<OKRStatus, string> = {
  'not-started': 'Not Started', 'on-track': 'On Track',
  'at-risk': 'At Risk', 'behind': 'Behind', 'completed': 'Completed',
};

const COMMON_UNITS = ['%', '£', '$', '€', 'count', 'days', 'hours', 'NPS', 'score', 'milestone'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeKRProgress(current: number, target: number) {
  if (target === 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

function computeObjProgress(krs: KeyResult[]) {
  if (!krs.length) return 0;
  return Math.round(krs.reduce((a, k) => a + k.progress, 0) / krs.length);
}

function blankKR(objId: string): KeyResult {
  return {
    id: crypto.randomUUID(),
    title: '',
    owner: '',
    target: 100,
    current: 0,
    unit: '%',
    dueDate: `${YEAR}-12-31`,
    status: 'not-started',
    progress: 0,
    lastUpdated: new Date().toISOString().split('T')[0],
  };
}

function blankObjective(quarter: Quarter, teamId: string): Objective {
  return {
    id: crypto.randomUUID(),
    title: '',
    description: '',
    owner: '',
    teamId,
    quarter,
    year: YEAR,
    status: 'not-started',
    progress: 0,
    keyResults: [],
    tags: [],
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InputField({ label, value, onChange, placeholder, type = 'text', hint }: {
  label: string; value: string | number; onChange: (v: string) => void;
  placeholder?: string; type?: string; hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder-slate-600 border border-white/[0.08] focus:border-white/20 focus:outline-none transition-colors"
        style={{ background: 'rgba(255,255,255,0.04)' }} />
      {hint && <p className="text-xs text-slate-600 mt-1">{hint}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl text-sm text-white border border-white/[0.08] focus:border-white/20 focus:outline-none transition-colors"
        style={{ background: 'rgba(30,45,76,0.9)' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── KR Form ─────────────────────────────────────────────────────────────────

function KRForm({ kr, onSave, onCancel }: {
  kr: KeyResult; onSave: (kr: KeyResult) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...kr });
  const set = (patch: Partial<KeyResult>) => setForm(f => ({ ...f, ...patch }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    const progress = computeKRProgress(Number(form.current), Number(form.target));
    onSave({ ...form, target: Number(form.target), current: Number(form.current), progress,
      lastUpdated: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="rounded-xl border border-white/10 p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <InputField label="Key Result title *" value={form.title} onChange={v => set({ title: v })} placeholder="What will be achieved?" />
        </div>
        <InputField label="Owner" value={form.owner} onChange={v => set({ owner: v })} placeholder="Name or team" />
        <InputField label="Due date" value={form.dueDate} onChange={v => set({ dueDate: v })} type="date" />
        <InputField label="Target" value={form.target} onChange={v => set({ target: Number(v) })} type="number" placeholder="100" />
        <InputField label="Current value" value={form.current} onChange={v => set({ current: Number(v) })} type="number" placeholder="0" />
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Unit</label>
          <div className="flex gap-1.5 flex-wrap mb-1.5">
            {COMMON_UNITS.map(u => (
              <button key={u} onClick={() => set({ unit: u })}
                className="px-2 py-0.5 rounded-lg text-xs transition-all"
                style={form.unit === u
                  ? { background: 'rgba(42,207,192,0.15)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.3)' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }}>
                {u}
              </button>
            ))}
          </div>
          <input value={form.unit} onChange={e => set({ unit: e.target.value })}
            placeholder="custom unit"
            className="w-full px-3 py-1.5 rounded-lg text-xs text-white placeholder-slate-600 border border-white/[0.08] focus:border-white/20 focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.04)' }} />
        </div>
        <SelectField label="Status" value={form.status} onChange={v => set({ status: v as OKRStatus })}
          options={STATUSES.map(s => ({ value: s, label: STATUS_LABELS[s] }))} />
      </div>
      {/* Progress preview */}
      <div>
        <p className="text-xs text-slate-500 mb-1">
          Progress preview: <span className="text-slate-300">{computeKRProgress(Number(form.current), Number(form.target))}%</span>
        </p>
        <ProgressBar progress={computeKRProgress(Number(form.current), Number(form.target))} height={4} />
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={handleSave} disabled={!form.title.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40 transition-all"
          style={{ background: 'rgba(42,207,192,0.15)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.25)' }}>
          <Check size={12} /> Save KR
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }}>
          <X size={12} /> Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Objective Form ───────────────────────────────────────────────────────────

function ObjectiveForm({ objective, teams, onSave, onCancel }: {
  objective: Objective;
  teams: { id: string; name: string }[];
  onSave: (obj: Objective) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...objective, tagsStr: objective.tags?.join(', ') ?? '' });
  const set = (patch: Partial<typeof form>) => setForm(f => ({ ...f, ...patch }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    const tags = form.tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    const progress = computeObjProgress(form.keyResults);
    onSave({ ...form, tags, progress });
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] p-5 space-y-4" style={{ background: 'rgba(30,45,76,0.6)' }}>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {objective.id ? 'Edit Objective' : 'New Objective'}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <InputField label="Objective title *" value={form.title} onChange={v => set({ title: v })} placeholder="What do you want to achieve?" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
          <textarea value={form.description ?? ''} onChange={e => set({ description: e.target.value })}
            placeholder="Why does this matter?" rows={2}
            className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder-slate-600 border border-white/[0.08] focus:border-white/20 focus:outline-none resize-none transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)' }} />
        </div>
        <InputField label="Owner" value={form.owner} onChange={v => set({ owner: v })} placeholder="Name" />
        <SelectField label="Team" value={form.teamId}
          onChange={v => set({ teamId: v })}
          options={teams.map(t => ({ value: t.id, label: t.name }))} />
        <SelectField label="Status" value={form.status}
          onChange={v => set({ status: v as OKRStatus })}
          options={STATUSES.map(s => ({ value: s, label: STATUS_LABELS[s] }))} />
        <InputField label="Tags (comma-separated)" value={form.tagsStr}
          onChange={v => set({ tagsStr: v })} placeholder="reliability, platform" />
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={handleSave} disabled={!form.title.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40 transition-all"
          style={{ background: 'rgba(42,207,192,0.15)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.25)' }}>
          <Check size={13} /> Save Objective
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }}>
          <X size={13} /> Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ObjectivesSettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [activeQ, setActiveQ] = useState<Quarter>('Q2');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingObjId, setEditingObjId] = useState<string | null>(null);
  const [addingObj, setAddingObj] = useState(false);
  const [editingKR, setEditingKR] = useState<{ objId: string; krId: string | null } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Resolve objectives for the active quarter
  const getQuarterObjs = useCallback((q: Quarter): Objective[] => {
    if (settings.customObjectives) return settings.customObjectives[q] ?? [];
    return allObjectives[q] ?? [];
  }, [settings.customObjectives]);

  const objectives = getQuarterObjs(activeQ);
  const isUsingDemo = !settings.customObjectives;

  // Persist a full update to all quarters
  const persistAll = useCallback((q: Quarter, newObjs: Objective[]) => {
    const base: Record<string, Objective[]> = settings.customObjectives
      ? { ...settings.customObjectives }
      : { Q1: [...(allObjectives.Q1 ?? [])], Q2: [...(allObjectives.Q2 ?? [])], Q3: [...(allObjectives.Q3 ?? [])], Q4: [...(allObjectives.Q4 ?? [])] };
    updateSettings({ customObjectives: { ...base, [q]: newObjs } });
  }, [settings.customObjectives, updateSettings]);

  // ── Objective handlers ────────────────────────────────────────────────────

  const saveObjective = (obj: Objective) => {
    const updated = editingObjId
      ? objectives.map(o => o.id === editingObjId ? obj : o)
      : [...objectives, obj];
    persistAll(activeQ, updated);
    setEditingObjId(null);
    setAddingObj(false);
    setExpandedIds(prev => new Set([...prev, obj.id]));
  };

  const deleteObjective = (id: string) => {
    persistAll(activeQ, objectives.filter(o => o.id !== id));
    setDeletingId(null);
    expandedIds.delete(id);
  };

  // ── KR handlers ──────────────────────────────────────────────────────────

  const saveKR = (objId: string, kr: KeyResult) => {
    const obj = objectives.find(o => o.id === objId);
    if (!obj) return;
    const newKRs = editingKR?.krId
      ? obj.keyResults.map(k => k.id === editingKR.krId ? kr : k)
      : [...obj.keyResults, kr];
    const newObj = { ...obj, keyResults: newKRs, progress: computeObjProgress(newKRs) };
    persistAll(activeQ, objectives.map(o => o.id === objId ? newObj : o));
    setEditingKR(null);
  };

  const deleteKR = (objId: string, krId: string) => {
    const obj = objectives.find(o => o.id === objId);
    if (!obj) return;
    const newKRs = obj.keyResults.filter(k => k.id !== krId);
    const newObj = { ...obj, keyResults: newKRs, progress: computeObjProgress(newKRs) };
    persistAll(activeQ, objectives.map(o => o.id === objId ? newObj : o));
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const teamOptions = settings.teams.map(t => ({ id: t.id, name: t.name }));

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Objectives & Key Results</h2>
          <p className="text-xs text-slate-500 mt-0.5">Add, edit, and manage OKRs for each quarter</p>
        </div>
        {!addingObj && editingObjId === null && (
          <button onClick={() => { setAddingObj(true); setEditingObjId(null); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(42,207,192,0.12)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.25)' }}>
            <Plus size={15} /> Add Objective
          </button>
        )}
      </div>

      {/* Demo data notice */}
      {isUsingDemo && (
        <div className="rounded-xl border border-amber-500/20 px-4 py-3 flex items-start gap-3"
          style={{ background: 'rgba(245,158,11,0.06)' }}>
          <AlertTriangle size={15} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-300">
            You&apos;re viewing demo data. Add or edit an objective to switch to your own data — demo data will be copied as your starting point.
          </p>
        </div>
      )}

      {/* Quarter tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl self-start" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {QUARTERS.map(q => (
          <button key={q} onClick={() => { setActiveQ(q); setAddingObj(false); setEditingObjId(null); setEditingKR(null); }}
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={activeQ === q
              ? { background: 'rgba(42,207,192,0.15)', color: '#2acfc0', boxShadow: 'inset 0 0 0 1px rgba(42,207,192,0.25)' }
              : { color: '#64748b' }}>
            {q}
            <span className="ml-1.5 opacity-60">{getQuarterObjs(q).length}</span>
          </button>
        ))}
      </div>

      {/* Add new objective form */}
      {addingObj && (
        <ObjectiveForm
          objective={blankObjective(activeQ, settings.teams[0]?.id ?? 'platform')}
          teams={teamOptions}
          onSave={saveObjective}
          onCancel={() => setAddingObj(false)}
        />
      )}

      {/* Objectives list */}
      <div className="space-y-3">
        {objectives.length === 0 && !addingObj && (
          <div className="rounded-2xl border border-white/[0.06] p-8 text-center"
            style={{ background: 'rgba(30,45,76,0.3)' }}>
            <p className="text-slate-500 text-sm">No objectives for {activeQ}.</p>
            <button onClick={() => setAddingObj(true)} className="mt-3 text-xs text-[#2acfc0] hover:underline">
              + Add the first objective
            </button>
          </div>
        )}

        {objectives.map(obj => {
          const expanded = expandedIds.has(obj.id);
          const isEditing = editingObjId === obj.id;
          const team = settings.teams.find(t => t.id === obj.teamId);

          return (
            <div key={obj.id} className="rounded-2xl border border-white/[0.06] overflow-hidden transition-all"
              style={{ background: 'rgba(30,45,76,0.5)' }}>

              {isEditing ? (
                <div className="p-4">
                  <ObjectiveForm objective={obj} teams={teamOptions}
                    onSave={saveObjective} onCancel={() => setEditingObjId(null)} />
                </div>
              ) : (
                <>
                  {/* Objective header row */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    {/* Expand toggle */}
                    <button onClick={() => toggleExpand(obj.id)} className="text-slate-500 hover:text-slate-300 transition-colors shrink-0">
                      {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={obj.status} />
                        {team && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: `${team.color}15`, color: team.color, border: `1px solid ${team.color}25` }}>
                            {team.name}
                          </span>
                        )}
                        {obj.tags?.map(tag => (
                          <span key={tag} className="text-xs text-slate-500 border border-white/[0.06] px-1.5 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                      <p className="text-sm font-medium text-white leading-snug truncate">{obj.title || <span className="italic text-slate-500">Untitled objective</span>}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{obj.owner} · {obj.keyResults.length} key results</p>
                    </div>

                    {/* Progress */}
                    <div className="w-28 shrink-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Progress</span>
                        <span className="text-slate-300 font-medium">{obj.progress}%</span>
                      </div>
                      <ProgressBar progress={obj.progress} height={4} />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => { setEditingObjId(obj.id); setAddingObj(false); setExpandedIds(prev => { const n = new Set(prev); n.delete(obj.id); return n; }); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-all">
                        <Pencil size={13} />
                      </button>
                      {deletingId === obj.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-red-400">Delete?</span>
                          <button onClick={() => deleteObjective(obj.id)}
                            className="px-2 py-0.5 rounded-lg text-xs font-medium"
                            style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>Yes</button>
                          <button onClick={() => setDeletingId(null)}
                            className="px-2 py-0.5 rounded-lg text-xs text-slate-500 hover:text-slate-300">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeletingId(obj.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded: Key Results */}
                  {expanded && (
                    <div className="border-t border-white/[0.06] px-4 py-3 space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key Results</p>
                        {editingKR?.objId !== obj.id && (
                          <button onClick={() => setEditingKR({ objId: obj.id, krId: null })}
                            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all"
                            style={{ background: 'rgba(42,207,192,0.08)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.18)' }}>
                            <Plus size={11} /> Add KR
                          </button>
                        )}
                      </div>

                      {/* KR list */}
                      {obj.keyResults.map(kr => (
                        <div key={kr.id}>
                          {editingKR?.objId === obj.id && editingKR.krId === kr.id ? (
                            <KRForm kr={kr}
                              onSave={saved => saveKR(obj.id, saved)}
                              onCancel={() => setEditingKR(null)} />
                          ) : (
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/[0.04] hover:border-white/[0.08] group transition-all"
                              style={{ background: 'rgba(255,255,255,0.02)' }}>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-200 leading-snug">{kr.title}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  {kr.current} / {kr.target} {kr.unit} · {kr.owner} · Due {kr.dueDate}
                                </p>
                              </div>
                              <div className="w-20 shrink-0">
                                <ProgressBar progress={kr.progress} height={3} />
                              </div>
                              <span className="text-xs text-slate-400 w-8 text-right shrink-0">{kr.progress}%</span>
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingKR({ objId: obj.id, krId: kr.id })}
                                  className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-white/[0.06]">
                                  <Pencil size={11} />
                                </button>
                                <button onClick={() => deleteKR(obj.id, kr.id)}
                                  className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/[0.08]">
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add KR form */}
                      {editingKR?.objId === obj.id && editingKR.krId === null && (
                        <KRForm kr={blankKR(obj.id)}
                          onSave={saved => saveKR(obj.id, saved)}
                          onCancel={() => setEditingKR(null)} />
                      )}

                      {obj.keyResults.length === 0 && editingKR?.objId !== obj.id && (
                        <p className="text-xs text-slate-600 py-2 text-center">No key results yet — add one above.</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Reset to demo data */}
      {!isUsingDemo && (
        <div className="pt-4 border-t border-white/[0.06]">
          <button onClick={() => updateSettings({ customObjectives: null })}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Reset to demo data
          </button>
        </div>
      )}
    </div>
  );
}
