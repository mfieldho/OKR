'use client';

import { useState } from 'react';
import {
  X, Pencil, Trash2, Plus, Save, XCircle, User, Calendar, TrendingUp, Tag,
  MessageSquare, Activity, Link2, ChevronDown, ChevronUp, Send,
} from 'lucide-react';
import { Objective, KeyResult, OKRStatus, Quarter, OKRCadence, CheckIn, Comment, Confidence } from '@/lib/types';
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
const CONFIDENCE_LABELS: Record<Confidence, string> = {
  'on-track': 'On Track', 'at-risk': 'At Risk', 'off-track': 'Off Track',
};
const CONFIDENCE_COLORS: Record<Confidence, string> = {
  'on-track': '#10b981', 'at-risk': '#f59e0b', 'off-track': '#ef4444',
};
const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

const INPUT = "w-full px-3 py-2 rounded-xl text-sm text-white placeholder-slate-600 border border-white/[0.08] focus:border-white/20 focus:outline-none transition-colors";
const INPUT_BG: React.CSSProperties = { background: 'var(--input-bg)' };
const SELECT_BG: React.CSSProperties = { background: 'var(--select-bg)' };

function daysAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return 'today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
}

function computeProgress(krs: KeyResult[]): number {
  if (!krs.length) return 0;
  return Math.round(krs.reduce((s, k) => s + k.progress, 0) / krs.length);
}

// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'checkins' | 'comments';

// ─── Check-in form ────────────────────────────────────────────────────────────

function CheckInForm({ kr, onSave, onCancel }: {
  kr: KeyResult;
  onSave: (checkIn: CheckIn, newCurrent: number) => void;
  onCancel: () => void;
}) {
  const [newValue,    setNewValue]    = useState(String(kr.current));
  const [notes,       setNotes]       = useState('');
  const [confidence,  setConfidence]  = useState<Confidence>('on-track');
  const [author,      setAuthor]      = useState('');

  const handleSave = () => {
    const curr = parseFloat(newValue) || 0;
    const checkIn: CheckIn = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      previousValue: kr.current,
      newValue: curr,
      notes: notes.trim() || undefined,
      confidence,
      author: author.trim() || 'You',
    };
    onSave(checkIn, curr);
  };

  return (
    <div className="mt-3 p-3 rounded-xl border border-white/[0.1] space-y-2.5"
      style={{ background: 'rgba(42,207,192,0.04)' }}>
      <p className="text-[10px] font-semibold text-[#2acfc0] uppercase tracking-wider">Log check-in</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-slate-500 mb-1">New value ({kr.unit})</label>
          <input type="number" value={newValue} onChange={e => setNewValue(e.target.value)}
            className={INPUT} style={INPUT_BG} />
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 mb-1">Confidence</label>
          <select value={confidence} onChange={e => setConfidence(e.target.value as Confidence)}
            className={INPUT} style={SELECT_BG}>
            {(Object.entries(CONFIDENCE_LABELS) as [Confidence, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 mb-1">Your name</label>
          <input value={author} onChange={e => setAuthor(e.target.value)}
            placeholder="Optional" className={INPUT} style={INPUT_BG} />
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 mb-1">Target: {formatValue(kr.target, kr.unit)}</label>
          <div className="px-3 py-2 rounded-xl text-xs text-slate-500 border border-white/[0.06]"
            style={INPUT_BG}>
            Progress: {kr.target > 0 ? Math.min(100, Math.round(((parseFloat(newValue) || 0) / kr.target) * 100)) : 0}%
          </div>
        </div>
      </div>
      <div>
        <label className="block text-[10px] text-slate-500 mb-1">Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
          placeholder="What's the latest? Any blockers?" className={`w-full resize-none ${INPUT}`} style={INPUT_BG} />
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
          style={{ background: 'rgba(42,207,192,0.12)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.25)' }}>
          <Save size={11} /> Save check-in
        </button>
        <button onClick={onCancel} className="text-xs text-slate-500 hover:text-slate-300 px-2">Cancel</button>
      </div>
    </div>
  );
}

// ─── KR read-only card with check-in ─────────────────────────────────────────

function KRViewCard({ kr, onCheckIn }: { kr: KeyResult; onCheckIn: (checkIn: CheckIn, newCurrent: number) => void }) {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const color = kr.progress >= 70 ? '#10b981' : kr.progress >= 40 ? '#f59e0b' : '#ef4444';
  const history = kr.checkIns ?? [];
  const lastCheckin = history[history.length - 1];
  const staleDays = lastCheckin ? Math.floor((Date.now() - new Date(lastCheckin.date).getTime()) / 86400000) : null;

  return (
    <div className="rounded-2xl border border-white/[0.06] hover:border-white/[0.1] transition-all"
      style={{ background: 'rgba(255,255,255,0.025)' }}>
      <div className="p-4">
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

        {/* Check-in actions */}
        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-white/[0.05]">
          <button onClick={() => { setShowCheckIn(v => !v); setShowHistory(false); }}
            className="flex items-center gap-1 text-[10px] font-medium transition-all px-2 py-1 rounded-lg"
            style={showCheckIn
              ? { background: 'rgba(42,207,192,0.1)', color: '#2acfc0' }
              : { color: '#64748b' }}>
            <Activity size={10} /> Log update
          </button>
          {history.length > 0 && (
            <button onClick={() => { setShowHistory(v => !v); setShowCheckIn(false); }}
              className="flex items-center gap-1 text-[10px] transition-all px-2 py-1 rounded-lg"
              style={{ color: '#64748b' }}>
              {showHistory ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              {history.length} check-in{history.length !== 1 ? 's' : ''}
            </button>
          )}
          {staleDays !== null && staleDays > 7 && (
            <span className="text-[10px] ml-auto px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
              {staleDays}d since update
            </span>
          )}
        </div>
      </div>

      {/* Check-in form */}
      {showCheckIn && (
        <div className="px-4 pb-4">
          <CheckInForm kr={kr}
            onSave={(ci, newCurrent) => { onCheckIn(ci, newCurrent); setShowCheckIn(false); }}
            onCancel={() => setShowCheckIn(false)} />
        </div>
      )}

      {/* Check-in history */}
      {showHistory && history.length > 0 && (
        <div className="px-4 pb-4 space-y-2">
          {[...history].reverse().map(ci => (
            <div key={ci.id} className="flex gap-3 text-xs">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                style={{ background: CONFIDENCE_COLORS[ci.confidence] }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">{ci.author}</span>
                  <span className="text-slate-600">{daysAgo(ci.date)}</span>
                  <span className="ml-auto text-slate-500">
                    {formatValue(ci.previousValue, kr.unit)} → {formatValue(ci.newValue, kr.unit)}
                  </span>
                </div>
                {ci.notes && <p className="text-slate-500 mt-0.5 leading-relaxed">{ci.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── KR edit row ──────────────────────────────────────────────────────────────

function KREditRow({ kr, onChange, onDelete }: {
  kr: KeyResult; onChange: (u: KeyResult) => void; onDelete: () => void;
}) {
  const f = <K extends keyof KeyResult>(key: K, val: KeyResult[K]) => onChange({ ...kr, [key]: val });
  return (
    <div className="rounded-xl border border-white/[0.08] p-3 space-y-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="flex items-center gap-2">
        <input value={kr.title} onChange={e => f('title', e.target.value)}
          placeholder="Key result title" className={`flex-1 ${INPUT}`} style={INPUT_BG} />
        <button onClick={onDelete}
          className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
          <Trash2 size={13} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div><label className="block text-[10px] text-slate-500 mb-1">Owner</label>
          <input value={kr.owner} onChange={e => f('owner', e.target.value)} placeholder="Owner" className={INPUT} style={INPUT_BG} /></div>
        <div><label className="block text-[10px] text-slate-500 mb-1">Target</label>
          <input type="number" value={kr.target} onChange={e => f('target', Number(e.target.value))} className={INPUT} style={INPUT_BG} /></div>
        <div><label className="block text-[10px] text-slate-500 mb-1">Current</label>
          <input type="number" value={kr.current} onChange={e => {
            const current = Number(e.target.value);
            const progress = kr.target > 0 ? Math.min(100, Math.round((current / kr.target) * 100)) : 0;
            onChange({ ...kr, current, progress });
          }} className={INPUT} style={INPUT_BG} /></div>
        <div><label className="block text-[10px] text-slate-500 mb-1">Unit</label>
          <input value={kr.unit} onChange={e => f('unit', e.target.value)} placeholder="%, £, count…" className={INPUT} style={INPUT_BG} /></div>
        <div><label className="block text-[10px] text-slate-500 mb-1">Due date</label>
          <input type="date" value={kr.dueDate} onChange={e => f('dueDate', e.target.value)} className={INPUT} style={INPUT_BG} /></div>
        <div><label className="block text-[10px] text-slate-500 mb-1">Status</label>
          <select value={kr.status} onChange={e => f('status', e.target.value as OKRStatus)} className={INPUT} style={SELECT_BG}>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select></div>
      </div>
    </div>
  );
}

function blankKR(): KeyResult {
  return {
    id: crypto.randomUUID(), title: '', owner: '', target: 100, current: 0,
    unit: '%', dueDate: '', status: 'not-started', progress: 0,
    lastUpdated: new Date().toISOString().slice(0, 10), checkIns: [],
  };
}

// ─── Comments section ─────────────────────────────────────────────────────────

function CommentsSection({ objective, onSave }: { objective: Objective; onSave: (comments: Comment[]) => void }) {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const comments = objective.comments ?? [];

  const submit = () => {
    if (!text.trim()) return;
    const c: Comment = {
      id: crypto.randomUUID(),
      text: text.trim(),
      author: author.trim() || 'You',
      createdAt: new Date().toISOString(),
    };
    onSave([...comments, c]);
    setText('');
  };

  const deleteComment = (id: string) => onSave(comments.filter(c => c.id !== id));

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Comments · {comments.length}
      </p>

      {/* Existing comments */}
      {comments.length === 0 && (
        <p className="text-xs text-slate-600 italic py-2">No comments yet. Start the conversation.</p>
      )}
      {comments.map(c => (
        <div key={c.id} className="flex gap-3 group">
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-semibold text-white"
            style={{ background: 'rgba(42,207,192,0.2)', border: '1px solid rgba(42,207,192,0.3)' }}>
            {c.author.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-300">{c.author}</span>
              <span className="text-[10px] text-slate-600">{daysAgo(c.createdAt.slice(0, 10))}</span>
              <button onClick={() => deleteComment(c.id)}
                className="ml-auto opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all">
                <Trash2 size={11} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{c.text}</p>
          </div>
        </div>
      ))}

      {/* New comment form */}
      <div className="flex gap-2 pt-1">
        <input value={author} onChange={e => setAuthor(e.target.value)}
          placeholder="Your name" className="w-28 px-2 py-2 rounded-xl text-xs text-white placeholder-slate-600 border border-white/[0.07] focus:outline-none shrink-0"
          style={INPUT_BG} />
        <div className="relative flex-1">
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submit()}
            placeholder="Add a comment…"
            className="w-full pr-8 px-3 py-2 rounded-xl text-xs text-white placeholder-slate-600 border border-white/[0.07] focus:border-white/20 focus:outline-none"
            style={INPUT_BG} />
          <button onClick={submit} disabled={!text.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 disabled:opacity-30 transition-opacity"
            style={{ color: '#2acfc0' }}>
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
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

  const [tab,           setTab]           = useState<Tab>('overview');
  const [editing,       setEditing]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draft,         setDraft]         = useState<Objective>(objective);

  const allObjectives = data
    ? [...data.objectives.filter(o => o.id !== objective.id)]
    : [];

  const enterEdit = () => { setDraft({ ...objective }); setEditing(true); };
  const cancelEdit = () => { setEditing(false); setConfirmDelete(false); };

  const handleSave = () => {
    saveObjective({ ...draft, progress: computeProgress(draft.keyResults) });
    setEditing(false);
    onClose();
  };

  const handleDelete = () => { deleteObjective(objective.id); onClose(); };

  const updateKR = (idx: number, kr: KeyResult) =>
    setDraft(d => ({ ...d, keyResults: d.keyResults.map((k, i) => i === idx ? kr : k) }));
  const deleteKR = (idx: number) =>
    setDraft(d => ({ ...d, keyResults: d.keyResults.filter((_, i) => i !== idx) }));

  // Check-in handler — updates KR live in place (no edit mode needed)
  const handleCheckIn = (krId: string, checkIn: CheckIn, newCurrent: number) => {
    const krs = objective.keyResults.map(kr => {
      if (kr.id !== krId) return kr;
      const progress = kr.target > 0 ? Math.min(100, Math.round((newCurrent / kr.target) * 100)) : 0;
      return { ...kr, current: newCurrent, progress, lastUpdated: checkIn.date, checkIns: [...(kr.checkIns ?? []), checkIn] };
    });
    const updated = { ...objective, keyResults: krs, progress: computeProgress(krs) };
    saveObjective(updated);
  };

  // Comments handler
  const handleComments = (comments: Comment[]) => {
    saveObjective({ ...objective, comments });
  };

  const team = data?.teams.find(t => t.id === (editing ? draft.teamId : objective.teamId));
  const allTeams = settings.teams;
  const parentObj = objective.parentId ? data?.objectives.find(o => o.id === objective.parentId) : null;

  const totalCheckIns = objective.keyResults.reduce((s, kr) => s + (kr.checkIns?.length ?? 0), 0);
  const commentCount = (objective.comments ?? []).length;

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={editing ? undefined : onClose} />

      <div className="fixed right-0 top-0 h-full z-50 flex flex-col border-l border-white/[0.08] shadow-2xl"
        style={{ width: 'min(580px, 100vw)', background: 'var(--panel-bg)', backdropFilter: 'blur(20px)' }}>

        {/* ── Header ── */}
        <div className="p-5 border-b border-white/[0.06] flex items-start gap-4 shrink-0">
          {!editing && (
            <ProgressRing progress={objective.progress} size={72} strokeWidth={7}
              color={progressColor(objective.progress)} label={`${objective.progress}%`} />
          )}

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2.5">
                <textarea value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                  rows={2} placeholder="Objective title"
                  className={`w-full resize-none text-sm font-semibold ${INPUT}`} style={INPUT_BG} />
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="block text-[10px] text-slate-500 mb-1">Owner</label>
                    <input value={draft.owner} onChange={e => setDraft(d => ({ ...d, owner: e.target.value }))}
                      placeholder="Owner" className={INPUT} style={INPUT_BG} /></div>
                  <div><label className="block text-[10px] text-slate-500 mb-1">Team</label>
                    <select value={draft.teamId} onChange={e => setDraft(d => ({ ...d, teamId: e.target.value }))}
                      className={INPUT} style={SELECT_BG}>
                      {allTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select></div>
                  <div className="col-span-2"><label className="block text-[10px] text-slate-500 mb-1">Status</label>
                    <select value={draft.status} onChange={e => setDraft(d => ({ ...d, status: e.target.value as OKRStatus }))}
                      className={INPUT} style={SELECT_BG}>
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select></div>
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
                  {objective.cadence === 'yearly' ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                      Yearly
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)' }}>
                      Quarterly
                    </span>
                  )}
                  {/* Quarter span */}
                  {(() => {
                    const qs = objective.quarters ?? [objective.quarter];
                    return qs.length > 1
                      ? <span className="text-xs text-slate-500">{qs[0]}–{qs[qs.length - 1]} {objective.year}</span>
                      : <span className="text-xs text-slate-500">{qs[0]} {objective.year}</span>;
                  })()}
                  {/* Dates */}
                  {(objective.startDate || objective.endDate) && (
                    <span className="text-xs text-slate-600">
                      {objective.startDate ?? '…'} → {objective.endDate ?? '…'}
                    </span>
                  )}
                </div>
                <h2 className="text-[15px] font-semibold text-white leading-snug">{objective.title}</h2>
                <p className="text-xs text-slate-500 mt-1.5">Owner: {objective.owner}</p>
                {parentObj && (
                  <div className="flex items-center gap-1 mt-2">
                    <Link2 size={10} className="text-slate-600" />
                    <span className="text-[10px] text-slate-500">Aligned to: </span>
                    <span className="text-[10px] text-[#2acfc0] truncate">{parentObj.title}</span>
                  </div>
                )}
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
                    <button onClick={() => setConfirmDelete(false)} className="text-[10px] text-slate-500 px-1">No</button>
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

        {/* ── Tabs ── */}
        {!editing && (
          <div className="flex border-b border-white/[0.06] px-5 shrink-0">
            {([
              { id: 'overview' as Tab,  label: 'Key Results', count: objective.keyResults.length },
              { id: 'checkins' as Tab,  label: 'Check-ins',   count: totalCheckIns },
              { id: 'comments' as Tab,  label: 'Comments',    count: commentCount,  Icon: MessageSquare },
            ]).map(({ id, label, count }) => (
              <button key={id} onClick={() => setTab(id)}
                className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-all -mb-px"
                style={tab === id
                  ? { borderColor: '#2acfc0', color: '#2acfc0' }
                  : { borderColor: 'transparent', color: '#475569' }}>
                {label}
                {count > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={tab === id
                      ? { background: 'rgba(42,207,192,0.15)', color: '#2acfc0' }
                      : { background: 'rgba(255,255,255,0.06)', color: '#64748b' }}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── Tab content ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">

          {/* TIMING + metadata section (edit mode only, in scrollable body) */}
          {editing && (
            <>
              {/* Timing card */}
              <div className="rounded-2xl border border-white/[0.07] p-4 space-y-3"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Timing</p>

                {/* Cadence toggle */}
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1.5">Cadence</label>
                  <div className="flex gap-2">
                    {(['quarterly', 'yearly'] as OKRCadence[]).map(c => (
                      <button key={c} type="button"
                        onClick={() => {
                          const newQuarters: Quarter[] = c === 'yearly'
                            ? ['Q1', 'Q2', 'Q3', 'Q4']
                            : [draft.quarter ?? 'Q1'];
                          setDraft(d => ({ ...d, cadence: c, quarters: newQuarters }));
                        }}
                        className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={(draft.cadence ?? 'quarterly') === c
                          ? { background: 'rgba(42,207,192,0.15)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.35)' }
                          : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.07)' }}>
                        {c === 'quarterly' ? 'Quarterly' : 'Yearly'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quarter multi-select */}
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1.5">
                    {(draft.cadence ?? 'quarterly') === 'yearly' ? 'Quarters covered' : 'Quarter'}
                  </label>
                  <div className="flex gap-1.5">
                    {QUARTERS.map(q => {
                      const draftQuarters = draft.quarters ?? [draft.quarter];
                      const active = draftQuarters.includes(q);
                      return (
                        <button key={q} type="button"
                          onClick={() => {
                            const cur = draft.quarters ?? [draft.quarter];
                            const isYearly = (draft.cadence ?? 'quarterly') === 'yearly';
                            let next: Quarter[];
                            if (isYearly) {
                              next = cur.includes(q)
                                ? cur.length > 1 ? cur.filter(x => x !== q) : cur
                                : [...cur, q].sort((a, b) => QUARTERS.indexOf(a) - QUARTERS.indexOf(b));
                            } else {
                              next = [q];
                            }
                            setDraft(d => ({ ...d, quarter: next[0], quarters: next }));
                          }}
                          className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                          style={active
                            ? { background: 'rgba(42,207,192,0.15)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.35)' }
                            : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.07)' }}>
                          {q}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Start / End dates */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Start date</label>
                    <input type="date" value={draft.startDate ?? ''}
                      onChange={e => setDraft(d => ({ ...d, startDate: e.target.value || undefined }))}
                      className={INPUT} style={INPUT_BG} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">End date</label>
                    <input type="date" value={draft.endDate ?? ''}
                      onChange={e => setDraft(d => ({ ...d, endDate: e.target.value || undefined }))}
                      className={INPUT} style={INPUT_BG} />
                  </div>
                </div>
              </div>

              {/* Description, Tags, Parent */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Parent Objective (alignment)</label>
                  <select value={draft.parentId ?? ''} onChange={e => setDraft(d => ({ ...d, parentId: e.target.value || undefined }))}
                    className={INPUT} style={SELECT_BG}>
                    <option value="">— None (top-level) —</option>
                    {allObjectives.map(o => <option key={o.id} value={o.id}>{o.quarter}: {o.title.slice(0, 60)}</option>)}
                  </select>
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
                    placeholder="e.g. profitability, revenue" className={INPUT} style={INPUT_BG} />
                </div>
              </div>
            </>
          )}

          {/* KEY RESULTS tab (also edit mode) */}
          {(tab === 'overview' || editing) && (
            <>
              {editing && (
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key Results</p>
                  <button onClick={() => setDraft(d => ({ ...d, keyResults: [...d.keyResults, blankKR()] }))}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all"
                    style={{ background: 'rgba(42,207,192,0.08)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.18)' }}>
                    <Plus size={11} /> Add KR
                  </button>
                </div>
              )}

              {editing ? (
                draft.keyResults.length === 0
                  ? <p className="text-xs text-slate-600 text-center py-6">No key results — add one above.</p>
                  : draft.keyResults.map((kr, i) => (
                      <KREditRow key={kr.id} kr={kr}
                        onChange={u => updateKR(i, u)} onDelete={() => deleteKR(i)} />
                    ))
              ) : (
                objective.keyResults.length === 0
                  ? (
                    <div className="py-10 text-center">
                      <p className="text-slate-600 text-sm">No key results defined yet.</p>
                      <button onClick={enterEdit} className="mt-3 text-xs text-[#2acfc0] hover:underline">
                        Add key results →
                      </button>
                    </div>
                  )
                  : objective.keyResults.map(kr => (
                      <KRViewCard key={kr.id} kr={kr}
                        onCheckIn={(ci, newCurrent) => handleCheckIn(kr.id, ci, newCurrent)} />
                    ))
              )}
            </>
          )}

          {/* CHECK-INS tab */}
          {tab === 'checkins' && !editing && (
            <div className="space-y-4">
              {objective.keyResults.map(kr => {
                const history = kr.checkIns ?? [];
                return (
                  <div key={kr.id}>
                    <p className="text-xs font-semibold text-slate-400 mb-2 truncate">{kr.title}</p>
                    {history.length === 0
                      ? <p className="text-xs text-slate-600 italic px-1">No check-ins yet.</p>
                      : [...history].reverse().map(ci => (
                          <div key={ci.id} className="flex gap-3 mb-2.5">
                            <div className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                              style={{ background: CONFIDENCE_COLORS[ci.confidence] }} />
                            <div className="flex-1 text-xs">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-slate-300 font-medium">{ci.author}</span>
                                <span className="text-slate-600">{daysAgo(ci.date)}</span>
                                <span className="ml-auto text-slate-500">
                                  {formatValue(ci.previousValue, kr.unit)} → {formatValue(ci.newValue, kr.unit)}
                                </span>
                              </div>
                              {ci.notes && <p className="text-slate-500 leading-relaxed">{ci.notes}</p>}
                            </div>
                          </div>
                        ))
                    }
                  </div>
                );
              })}
              {totalCheckIns === 0 && (
                <div className="py-10 text-center">
                  <p className="text-slate-600 text-sm">No check-ins yet.</p>
                  <button onClick={() => setTab('overview')} className="mt-2 text-xs text-[#2acfc0] hover:underline">
                    Log a check-in on a key result →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* COMMENTS tab */}
          {tab === 'comments' && !editing && (
            <CommentsSection objective={objective} onSave={handleComments} />
          )}
        </div>
      </div>
    </>
  );
}
