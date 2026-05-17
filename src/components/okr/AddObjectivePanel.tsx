'use client';

import { useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { Objective, KeyResult, OKRStatus, Quarter, OKRCadence } from '@/lib/types';
import { useSettings } from '@/contexts/SettingsContext';
import { useOKR } from '@/contexts/OKRContext';
import { useObjectiveCRUD } from '@/hooks/useObjectiveCRUD';
import { currentQuarter, computeDefaultCycleDates } from '@/lib/calendarSettings';

const STATUSES: OKRStatus[] = ['not-started', 'on-track', 'at-risk', 'behind', 'completed'];
const STATUS_LABELS: Record<OKRStatus, string> = {
  'not-started': 'Not Started', 'on-track': 'On Track',
  'at-risk': 'At Risk', 'behind': 'Behind', 'completed': 'Completed',
};
const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

const INPUT = "w-full px-3 py-2 rounded-xl text-sm text-white placeholder-slate-600 border border-white/[0.08] focus:border-white/20 focus:outline-none transition-colors";
const INPUT_BG: React.CSSProperties = { background: 'rgba(255,255,255,0.04)' };
const SELECT_BG: React.CSSProperties = { background: 'rgba(20,35,60,0.95)' };

function blankKR(): KeyResult {
  return {
    id: crypto.randomUUID(), title: '', owner: '', target: 100, current: 0,
    unit: '%', dueDate: '', status: 'not-started', progress: 0,
    lastUpdated: new Date().toISOString().slice(0, 10),
  };
}

function computeProgress(krs: KeyResult[]): number {
  if (!krs.length) return 0;
  return Math.round(krs.reduce((s, k) => s + k.progress, 0) / krs.length);
}

interface AddObjectivePanelProps {
  onClose: () => void;
}

export function AddObjectivePanel({ onClose }: AddObjectivePanelProps) {
  const { settings } = useSettings();
  const { data } = useOKR();
  const { saveObjective } = useObjectiveCRUD();

  const defaultTeam = settings.teams[0]?.id ?? '';
  const allObjectives = data?.objectives ?? [];

  const defaultCadence = settings.defaultCadence ?? 'quarterly';
  const defaultQ = currentQuarter(settings);
  const defaultQuarters: Quarter[] = defaultCadence === 'yearly' ? ['Q1', 'Q2', 'Q3', 'Q4'] : [defaultQ];

  function datesForQuarters(qs: Quarter[]): { start: string; end: string } {
    const computed = computeDefaultCycleDates(settings.fyStartMonth, 2026);
    if (qs.length === 4 || qs.includes('Q1') && qs.includes('Q4')) {
      const annual = settings.cycleDates?.annual ?? computed.annual;
      return { start: annual.startDate, end: annual.endDate };
    }
    const first = qs[0] as 'Q1'|'Q2'|'Q3'|'Q4';
    const last = qs[qs.length - 1] as 'Q1'|'Q2'|'Q3'|'Q4';
    const startRange = settings.cycleDates?.[first] ?? computed[first];
    const endRange = settings.cycleDates?.[last] ?? computed[last];
    return { start: startRange.startDate, end: endRange.endDate };
  }

  const initialDates = datesForQuarters(defaultQuarters);

  const [title, setTitle]               = useState('');
  const [description, setDescription]   = useState('');
  const [owner, setOwner]               = useState('');
  const [teamId, setTeamId]             = useState(defaultTeam);
  const [cadence, setCadence]           = useState<OKRCadence>(defaultCadence);
  const [selectedQuarters, setSelectedQuarters] = useState<Quarter[]>(defaultQuarters);
  const [startDate, setStartDate]       = useState(initialDates.start);
  const [endDate, setEndDate]           = useState(initialDates.end);
  const [status, setStatus]             = useState<OKRStatus>('not-started');
  const [tags, setTags]                 = useState('');
  const [parentId, setParentId]         = useState('');
  const [krs, setKrs]                   = useState<KeyResult[]>([]);

  const applyDatesForQuarters = (qs: Quarter[]) => {
    const d = datesForQuarters(qs);
    setStartDate(d.start);
    setEndDate(d.end);
  };

  const toggleQuarter = (q: Quarter) => {
    if (cadence === 'quarterly') {
      setSelectedQuarters([q]);
      applyDatesForQuarters([q]);
    } else {
      setSelectedQuarters(prev => {
        const next = prev.includes(q)
          ? prev.length > 1 ? prev.filter(x => x !== q) : prev
          : [...prev, q].sort((a, b) => QUARTERS.indexOf(a) - QUARTERS.indexOf(b));
        applyDatesForQuarters(next);
        return next;
      });
    }
  };

  const updateKR = (idx: number, kr: KeyResult) =>
    setKrs(prev => prev.map((k, i) => i === idx ? kr : k));

  const deleteKR = (idx: number) =>
    setKrs(prev => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    if (!title.trim()) return;
    const obj: Objective = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim() || undefined,
      owner: owner.trim(),
      teamId,
      quarter: selectedQuarters[0] ?? 'Q1',
      quarters: selectedQuarters,
      year: 2026,
      cadence,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status,
      progress: computeProgress(krs),
      keyResults: krs,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      parentId: parentId || undefined,
    };
    saveObjective(obj);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={onClose} />

      <div className="fixed right-0 top-0 h-full z-50 flex flex-col border-l border-white/[0.08] shadow-2xl"
        style={{ width: 'min(560px, 100vw)', background: 'rgba(10,20,38,0.99)', backdropFilter: 'blur(20px)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-white">New Objective</h2>
            <p className="text-xs text-slate-500 mt-0.5">Add an objective and its key results</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Objective fields */}
          <div className="rounded-2xl border border-white/[0.07] p-4 space-y-3"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Objective</p>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Title *</label>
              <textarea value={title} onChange={e => setTitle(e.target.value)} rows={2}
                placeholder="What do you want to achieve?" className={`w-full resize-none ${INPUT}`} style={INPUT_BG} />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                placeholder="Why does this matter?" className={`w-full resize-none ${INPUT}`} style={INPUT_BG} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Owner</label>
                <input value={owner} onChange={e => setOwner(e.target.value)}
                  placeholder="Name or team" className={INPUT} style={INPUT_BG} />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Team</label>
                <select value={teamId} onChange={e => setTeamId(e.target.value)} className={INPUT} style={SELECT_BG}>
                  {settings.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as OKRStatus)} className={INPUT} style={SELECT_BG}>
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div className="col-span-2 space-y-3 rounded-xl border border-white/[0.07] p-3"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Timing</p>

                {/* Cadence toggle */}
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1.5">Cadence</label>
                  <div className="flex gap-2">
                    {(['quarterly', 'yearly'] as OKRCadence[]).map(c => (
                      <button key={c} type="button"
                        onClick={() => {
                          setCadence(c);
                          const qs: Quarter[] = c === 'yearly' ? ['Q1', 'Q2', 'Q3', 'Q4'] : [selectedQuarters[0] ?? 'Q1'];
                          setSelectedQuarters(qs);
                          applyDatesForQuarters(qs);
                        }}
                        className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={cadence === c
                          ? { background: 'rgba(42,207,192,0.15)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.35)' }
                          : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.07)' }}>
                        {c === 'quarterly' ? 'Quarterly' : 'Yearly'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quarter selector */}
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1.5">
                    {cadence === 'yearly' ? 'Quarters covered' : 'Quarter'}
                  </label>
                  <div className="flex gap-1.5">
                    {QUARTERS.map(q => {
                      const active = selectedQuarters.includes(q);
                      return (
                        <button key={q} type="button" onClick={() => toggleQuarter(q)}
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
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                      className={INPUT} style={INPUT_BG} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">End date</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                      className={INPUT} style={INPUT_BG} />
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] text-slate-500 mb-1">Parent Objective (alignment)</label>
                <select value={parentId} onChange={e => setParentId(e.target.value)}
                  className={INPUT} style={SELECT_BG}>
                  <option value="">— None (top-level) —</option>
                  {allObjectives.map(o => (
                    <option key={o.id} value={o.id}>{o.quarter}: {o.title.slice(0, 60)}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] text-slate-500 mb-1">Tags (comma-separated)</label>
                <input value={tags} onChange={e => setTags(e.target.value)}
                  placeholder="e.g. revenue, growth" className={INPUT} style={INPUT_BG} />
              </div>
            </div>
          </div>

          {/* KRs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key Results · {krs.length}</p>
              <button onClick={() => setKrs(prev => [...prev, blankKR()])}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all"
                style={{ background: 'rgba(42,207,192,0.08)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.18)' }}>
                <Plus size={11} /> Add KR
              </button>
            </div>

            {krs.length === 0 && (
              <p className="text-xs text-slate-600 text-center py-4 italic">No key results yet — add one above.</p>
            )}

            {krs.map((kr, i) => (
              <div key={kr.id} className="rounded-xl border border-white/[0.08] p-3 space-y-2"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="flex items-center gap-2">
                  <input value={kr.title} onChange={e => updateKR(i, { ...kr, title: e.target.value })}
                    placeholder="Key result title" className={`flex-1 ${INPUT}`} style={INPUT_BG} />
                  <button onClick={() => deleteKR(i)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/[0.08] transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Owner</label>
                    <input value={kr.owner} onChange={e => updateKR(i, { ...kr, owner: e.target.value })}
                      placeholder="Owner" className={INPUT} style={INPUT_BG} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Target</label>
                    <input type="number" value={kr.target} onChange={e => updateKR(i, { ...kr, target: Number(e.target.value) })}
                      className={INPUT} style={INPUT_BG} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Current</label>
                    <input type="number" value={kr.current} onChange={e => {
                      const current = Number(e.target.value);
                      const progress = kr.target > 0 ? Math.min(100, Math.round((current / kr.target) * 100)) : 0;
                      updateKR(i, { ...kr, current, progress });
                    }} className={INPUT} style={INPUT_BG} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Unit</label>
                    <input value={kr.unit} onChange={e => updateKR(i, { ...kr, unit: e.target.value })}
                      placeholder="%, £, count…" className={INPUT} style={INPUT_BG} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Due date</label>
                    <input type="date" value={kr.dueDate} onChange={e => updateKR(i, { ...kr, dueDate: e.target.value })}
                      className={INPUT} style={INPUT_BG} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Status</label>
                    <select value={kr.status} onChange={e => updateKR(i, { ...kr, status: e.target.value as OKRStatus })}
                      className={INPUT} style={SELECT_BG}>
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-white/[0.06] shrink-0"
          style={{ background: 'rgba(255,255,255,0.01)' }}>
          <button onClick={handleSave} disabled={!title.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
            style={{ background: 'rgba(42,207,192,0.15)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.3)' }}>
            <Save size={14} /> Save Objective
          </button>
          <button onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.07)' }}>
            <X size={14} /> Cancel
          </button>
        </div>
      </div>
    </>
  );
}
