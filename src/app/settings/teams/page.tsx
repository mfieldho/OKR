'use client';

import { useState } from 'react';
import { Save, Plus, Pencil, Trash2, X, ChevronDown, ChevronUp, ArrowRight, Target } from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '@/contexts/SettingsContext';
import { useOKR } from '@/contexts/OKRContext';
import { TeamDef } from '@/lib/calendarSettings';
import { Objective, OKRStatus, Quarter } from '@/lib/types';
import { allObjectives } from '@/lib/mockData';
import { StatusBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

// ─── Constants ────────────────────────────────────────────────────────────────

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];
const STATUSES: OKRStatus[] = ['not-started', 'on-track', 'at-risk', 'behind', 'completed'];
const STATUS_LABELS: Record<OKRStatus, string> = {
  'not-started': 'Not Started', 'on-track': 'On Track',
  'at-risk': 'At Risk', 'behind': 'Behind', 'completed': 'Completed',
};
const TEAM_COLOR_PRESETS = [
  '#6366f1', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#8b5cf6', '#2acfc0',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function blankObjective(quarter: Quarter, teamId: string, year = 2026): Objective {
  return {
    id: crypto.randomUUID(), title: '', description: '', owner: '',
    teamId, quarter, year, status: 'not-started', progress: 0, keyResults: [], tags: [],
  };
}

function inputStyle(bg = 'rgba(255,255,255,0.04)') {
  return { background: bg };
}

// ─── Team colour picker ───────────────────────────────────────────────────────

function TeamColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TEAM_COLOR_PRESETS.map(p => (
        <button key={p} type="button" onClick={() => onChange(p)}
          className="w-7 h-7 rounded-lg border-2 transition-all"
          style={{ background: p, borderColor: value.toLowerCase() === p ? '#fff' : 'transparent' }} />
      ))}
      <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-white/[0.12] shrink-0">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full cursor-pointer opacity-0" />
        <div className="w-full h-full" style={{ background: value }} />
      </div>
    </div>
  );
}

// ─── Quick-add Objective form (inline, minimal) ───────────────────────────────

function QuickAddObjective({ teamId, onSave, onCancel }: {
  teamId: string; onSave: (obj: Objective) => void; onCancel: () => void;
}) {
  const [quarter, setQuarter] = useState<Quarter>('Q2');
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('');
  const [status, setStatus] = useState<OKRStatus>('not-started');

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ ...blankObjective(quarter, teamId), title, owner, status });
  };

  const cls = "px-3 py-2 rounded-xl text-sm text-white placeholder-slate-600 border border-white/[0.08] focus:border-white/20 focus:outline-none transition-colors";

  return (
    <div className="rounded-xl border border-white/[0.08] p-4 space-y-3 mt-3"
      style={{ background: 'rgba(30,45,76,0.7)' }}>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New Objective</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs text-slate-400 mb-1">Title *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What do you want to achieve?"
            className={`w-full ${cls}`} style={inputStyle()} />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Owner</label>
          <input value={owner} onChange={e => setOwner(e.target.value)} placeholder="Name or team"
            className={`w-full ${cls}`} style={inputStyle()} />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Quarter</label>
          <select value={quarter} onChange={e => setQuarter(e.target.value as Quarter)}
            className={`w-full ${cls}`} style={{ background: 'rgba(30,45,76,0.9)' }}>
            {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as OKRStatus)}
            className={`w-full ${cls}`} style={{ background: 'rgba(30,45,76,0.9)' }}>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={!title.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-40 transition-all"
          style={{ background: 'rgba(42,207,192,0.15)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.25)' }}>
          <Save size={12} /> Add Objective
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }}>
          <X size={12} /> Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Team form fields (top-level to avoid remount on parent re-render) ─────────

const TEAM_INPUT_CLS = "w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 border border-white/[0.08] focus:border-white/20 focus:outline-none transition-colors";

interface TeamFormFieldsProps {
  form: { name: string; lead: string; memberCount: string; description: string; color: string };
  onChange: (f: { name: string; lead: string; memberCount: string; description: string; color: string }) => void;
  onSave: () => void;
  onCancel: () => void;
  saveLabel: string;
}

function TeamFormFields({ form, onChange, onSave, onCancel, saveLabel }: TeamFormFieldsProps) {
  return (
    <div className="mt-3 p-4 rounded-xl border border-white/[0.08] space-y-3" style={{ background: 'rgba(30,45,76,0.6)' }}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Team name</label>
          <input value={form.name} onChange={e => onChange({ ...form, name: e.target.value })} placeholder="e.g. Platform & Infrastructure" className={TEAM_INPUT_CLS} style={inputStyle()} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Team lead</label>
          <input value={form.lead} onChange={e => onChange({ ...form, lead: e.target.value })} placeholder="e.g. Sarah Mitchell" className={TEAM_INPUT_CLS} style={inputStyle()} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Member count</label>
          <input type="number" min={0} value={form.memberCount} onChange={e => onChange({ ...form, memberCount: e.target.value })} placeholder="0" className={TEAM_INPUT_CLS} style={inputStyle()} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Team colour</label>
          <TeamColorPicker value={form.color} onChange={c => onChange({ ...form, color: c })} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
          <input value={form.description} onChange={e => onChange({ ...form, description: e.target.value })} placeholder="Short description of this team's focus" className={TEAM_INPUT_CLS} style={inputStyle()} />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onSave} disabled={!form.name.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
          style={{ background: 'rgba(42,207,192,0.12)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.25)' }}>
          <Save size={14} />{saveLabel}
        </button>
        <button type="button" onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)' }}>
          <X size={14} />Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TeamsSettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { data } = useOKR();

  // Team CRUD state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState({ name: '', lead: '', memberCount: '', description: '', color: '#6366f1' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // OKR panel state per team
  const [expandedOKRs, setExpandedOKRs] = useState<Set<string>>(new Set());
  const [addingObjFor, setAddingObjFor] = useState<string | null>(null);
  const [deletingObjId, setDeletingObjId] = useState<string | null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getAllObjectivesForTeam = (teamId: string): Objective[] => {
    const source = settings.customObjectives
      ? Object.values(settings.customObjectives).flat()
      : Object.values(allObjectives).flat();
    return source.filter(o => o.teamId === teamId);
  };

  const persistObjective = (obj: Objective) => {
    const q = obj.quarter;
    const existing: Objective[] = settings.customObjectives
      ? (settings.customObjectives[q] ?? [])
      : (allObjectives[q] ?? []);
    const idx = existing.findIndex(o => o.id === obj.id);
    const updated = idx >= 0 ? existing.map(o => o.id === obj.id ? obj : o) : [...existing, obj];
    const base = settings.customObjectives
      ? { ...settings.customObjectives }
      : { Q1: [...(allObjectives.Q1 ?? [])], Q2: [...(allObjectives.Q2 ?? [])], Q3: [...(allObjectives.Q3 ?? [])], Q4: [...(allObjectives.Q4 ?? [])] };
    updateSettings({ customObjectives: { ...base, [q]: updated } });
  };

  const deleteObjective = (obj: Objective) => {
    const allQ = ['Q1', 'Q2', 'Q3', 'Q4'] as const;
    const base = settings.customObjectives
      ? { ...settings.customObjectives }
      : { Q1: [...(allObjectives.Q1 ?? [])], Q2: [...(allObjectives.Q2 ?? [])], Q3: [...(allObjectives.Q3 ?? [])], Q4: [...(allObjectives.Q4 ?? [])] };
    for (const q of allQ) base[q] = (base[q] ?? []).filter(o => o.id !== obj.id);
    updateSettings({ customObjectives: base });
    setDeletingObjId(null);
  };

  // ── Team CRUD ──────────────────────────────────────────────────────────────

  const cancelEdit = () => { setEditingId(null); setAddingNew(false); setForm({ name: '', lead: '', memberCount: '', description: '', color: '#6366f1' }); };

  const saveEdit = () => {
    if (!editingId) return;
    updateSettings({ teams: settings.teams.map(t => t.id === editingId ? { ...t, ...form, memberCount: parseInt(form.memberCount) || 0 } : t) });
    cancelEdit();
  };

  const saveNew = () => {
    if (!form.name.trim()) return;
    updateSettings({ teams: [...settings.teams, { id: crypto.randomUUID(), name: form.name, lead: form.lead, memberCount: parseInt(form.memberCount) || 0, description: form.description, color: form.color }] });
    cancelEdit();
  };

  const deleteTeam = (id: string) => { updateSettings({ teams: settings.teams.filter(t => t.id !== id) }); setDeleteConfirm(null); };

  const startEdit = (team: TeamDef) => { setEditingId(team.id); setAddingNew(false); setForm({ name: team.name, lead: team.lead, memberCount: String(team.memberCount), description: team.description, color: team.color }); };

  // Count objectives per team from live data
  const objCounts: Record<string, number> = {};
  if (data?.objectives) data.objectives.forEach(o => { objCounts[o.teamId] = (objCounts[o.teamId] ?? 0) + 1; });

  return (
    <div className="p-8 max-w-3xl space-y-8">

      {/* ── Team list ───────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Teams</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage teams and their objectives across all quarters</p>
          </div>
          <button onClick={() => { setAddingNew(true); setEditingId(null); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(42,207,192,0.12)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.25)' }}>
            <Plus size={14} />Add team
          </button>
        </div>

        {/* Add new team form */}
        {addingNew && (
          <div className="rounded-2xl border border-white/[0.1] p-5" style={{ background: 'rgba(30,45,76,0.5)' }}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">New team</p>
            <TeamFormFields form={form} onChange={setForm} onSave={saveNew} onCancel={cancelEdit} saveLabel="Add team" />
          </div>
        )}

        {/* Teams */}
        <div className="space-y-3">
          {settings.teams.map(team => {
            const isEditing = editingId === team.id;
            const isConfirmDelete = deleteConfirm === team.id;
            const okrExpanded = expandedOKRs.has(team.id);
            const teamObjs = getAllObjectivesForTeam(team.id);
            const totalObjs = teamObjs.length;

            return (
              <div key={team.id} className="rounded-2xl border border-white/[0.06] overflow-hidden"
                style={{ background: 'rgba(30,45,76,0.5)' }}>

                {/* Team header */}
                <div className="flex items-center gap-3 p-4">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: team.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{team.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: '#64748b' }}>
                        {totalObjs} objective{totalObjs !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span>{team.lead}</span>
                      <span>·</span>
                      <span>{team.memberCount} members</span>
                      {team.description && <><span>·</span><span className="truncate text-slate-600">{team.description}</span></>}
                    </div>
                  </div>

                  {/* Actions */}
                  {!isEditing && !isConfirmDelete && (
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Toggle OKR panel */}
                      <button onClick={() => setExpandedOKRs(prev => { const n = new Set(prev); n.has(team.id) ? n.delete(team.id) : n.add(team.id); return n; })}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
                        style={okrExpanded
                          ? { background: 'rgba(42,207,192,0.1)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.2)' }
                          : { color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <Target size={12} />
                        OKRs
                        {okrExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>
                      <button onClick={() => startEdit(team)} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-all"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteConfirm(team.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"><Trash2 size={14} /></button>
                    </div>
                  )}
                </div>

                {/* Edit team form */}
                {isEditing && (
                  <div className="px-4 pb-4">
                    <TeamFormFields form={form} onChange={setForm} onSave={saveEdit} onCancel={cancelEdit} saveLabel="Save changes" />
                  </div>
                )}

                {/* Delete confirm */}
                {isConfirmDelete && (
                  <div className="px-4 pb-4 flex items-center gap-3">
                    <span className="text-sm text-slate-400 flex-1">Delete <span className="text-white font-medium">{team.name}</span>? This cannot be undone.</span>
                    <button onClick={() => deleteTeam(team.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <Trash2 size={12} />Delete
                    </button>
                    <button onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:text-slate-300 border border-white/[0.07]">Cancel</button>
                  </div>
                )}

                {/* ── OKR panel ──────────────────────────────────────────── */}
                {okrExpanded && (
                  <div className="border-t border-white/[0.06] px-4 py-4 space-y-2"
                    style={{ background: 'rgba(0,0,0,0.15)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Objectives (all quarters)</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setAddingObjFor(addingObjFor === team.id ? null : team.id)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all"
                          style={{ background: 'rgba(42,207,192,0.08)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.18)' }}>
                          <Plus size={11} /> Add objective
                        </button>
                        <Link href="/settings/objectives"
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-300 border border-white/[0.06] transition-all">
                          Full editor <ArrowRight size={11} />
                        </Link>
                      </div>
                    </div>

                    {/* Quick-add form */}
                    {addingObjFor === team.id && (
                      <QuickAddObjective
                        teamId={team.id}
                        onSave={obj => { persistObjective(obj); setAddingObjFor(null); }}
                        onCancel={() => setAddingObjFor(null)}
                      />
                    )}

                    {/* Objective rows */}
                    {teamObjs.length === 0 && addingObjFor !== team.id && (
                      <p className="text-xs text-slate-600 py-2 text-center">No objectives yet — add one above.</p>
                    )}

                    {/* Group by quarter */}
                    {QUARTERS.map(q => {
                      const qObjs = teamObjs.filter(o => o.quarter === q);
                      if (!qObjs.length) return null;
                      return (
                        <div key={q}>
                          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-1 mb-1">{q}</p>
                          {qObjs.map(obj => (
                            <div key={obj.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/[0.04] hover:border-white/[0.08] group mb-1 transition-all"
                              style={{ background: 'rgba(255,255,255,0.02)' }}>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <StatusBadge status={obj.status} />
                                </div>
                                <p className="text-xs text-slate-200 leading-snug truncate">{obj.title}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">{obj.owner} · {obj.keyResults.length} KRs</p>
                              </div>
                              <div className="w-20 shrink-0">
                                <ProgressBar progress={obj.progress} height={3} />
                              </div>
                              <span className="text-xs text-slate-400 w-8 text-right shrink-0">{obj.progress}%</span>
                              {deletingObjId === obj.id ? (
                                <div className="flex items-center gap-1 shrink-0">
                                  <button onClick={() => deleteObjective(obj)}
                                    className="px-2 py-0.5 rounded text-xs font-medium"
                                    style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>Yes</button>
                                  <button onClick={() => setDeletingObjId(null)} className="text-xs text-slate-500 hover:text-slate-300 px-1">No</button>
                                </div>
                              ) : (
                                <button onClick={() => setDeletingObjId(obj.id)}
                                  className="p-1 rounded text-slate-600 hover:text-red-400 hover:bg-red-500/[0.08] opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                  <Trash2 size={11} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {settings.teams.length === 0 && !addingNew && (
          <div className="rounded-2xl border border-white/[0.06] p-8 text-center" style={{ background: 'rgba(30,45,76,0.5)' }}>
            <p className="text-slate-500 text-sm">No teams configured yet.</p>
            <button onClick={() => setAddingNew(true)}
              className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium mx-auto transition-all"
              style={{ background: 'rgba(42,207,192,0.12)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.25)' }}>
              <Plus size={14} />Add your first team
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
