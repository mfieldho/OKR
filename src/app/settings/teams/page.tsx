'use client';

import { useState } from 'react';
import { Save, Check, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useOKR } from '@/contexts/OKRContext';
import { TeamDef } from '@/lib/calendarSettings';

const TEAM_COLOR_PRESETS = [
  '#6366f1', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#8b5cf6', '#2acfc0',
];

interface TeamFormState {
  name: string;
  lead: string;
  memberCount: string;
  description: string;
  color: string;
}

const EMPTY_FORM: TeamFormState = {
  name: '',
  lead: '',
  memberCount: '',
  description: '',
  color: '#6366f1',
};

function TeamColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TEAM_COLOR_PRESETS.map(p => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className="w-7 h-7 rounded-lg border-2 transition-all"
          style={{
            background: p,
            borderColor: value.toLowerCase() === p.toLowerCase() ? '#fff' : 'transparent',
          }}
        />
      ))}
      <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-white/[0.12] shrink-0">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
        />
        <div className="w-full h-full" style={{ background: value }} />
      </div>
    </div>
  );
}

export default function TeamsSettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { data } = useOKR();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState<TeamFormState>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Count objectives per team from current OKR data
  const objectiveCounts: Record<string, number> = {};
  if (data?.objectives) {
    for (const obj of data.objectives) {
      objectiveCounts[obj.teamId] = (objectiveCounts[obj.teamId] ?? 0) + 1;
    }
  }

  const startEdit = (team: TeamDef) => {
    setEditingId(team.id);
    setAddingNew(false);
    setDeleteConfirm(null);
    setForm({
      name: team.name,
      lead: team.lead,
      memberCount: String(team.memberCount),
      description: team.description,
      color: team.color,
    });
  };

  const startAdd = () => {
    setAddingNew(true);
    setEditingId(null);
    setDeleteConfirm(null);
    setForm(EMPTY_FORM);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAddingNew(false);
    setForm(EMPTY_FORM);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const updated = settings.teams.map(t =>
      t.id === editingId
        ? { ...t, ...form, memberCount: parseInt(form.memberCount, 10) || 0 }
        : t
    );
    updateSettings({ teams: updated });
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const saveNew = () => {
    const newTeam: TeamDef = {
      id: crypto.randomUUID(),
      name: form.name,
      lead: form.lead,
      memberCount: parseInt(form.memberCount, 10) || 0,
      description: form.description,
      color: form.color,
    };
    updateSettings({ teams: [...settings.teams, newTeam] });
    setAddingNew(false);
    setForm(EMPTY_FORM);
  };

  const deleteTeam = (id: string) => {
    updateSettings({ teams: settings.teams.filter(t => t.id !== id) });
    setDeleteConfirm(null);
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 border border-white/[0.08] focus:border-white/20 focus:outline-none transition-colors";

  const TeamFormFields = ({ onSave, onCancel, saveLabel }: { onSave: () => void; onCancel: () => void; saveLabel: string }) => (
    <div className="mt-3 p-4 rounded-xl border border-white/[0.08] space-y-3" style={{ background: 'rgba(30,45,76,0.6)' }}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Team name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Platform & Infrastructure"
            className={inputCls}
            style={{ background: 'rgba(255,255,255,0.04)' }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Team lead</label>
          <input
            type="text"
            value={form.lead}
            onChange={e => setForm(f => ({ ...f, lead: e.target.value }))}
            placeholder="e.g. Sarah Mitchell"
            className={inputCls}
            style={{ background: 'rgba(255,255,255,0.04)' }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Member count</label>
          <input
            type="number"
            value={form.memberCount}
            onChange={e => setForm(f => ({ ...f, memberCount: e.target.value }))}
            placeholder="0"
            min={0}
            className={inputCls}
            style={{ background: 'rgba(255,255,255,0.04)' }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Team colour</label>
          <TeamColorPicker value={form.color} onChange={c => setForm(f => ({ ...f, color: c }))} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
        <input
          type="text"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Short description of this team's focus"
          className={inputCls}
          style={{ background: 'rgba(255,255,255,0.04)' }}
        />
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onSave}
          disabled={!form.name.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
          style={{ background: 'rgba(42,207,192,0.12)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.25)' }}>
          <Save size={14} />{saveLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)' }}>
          <X size={14} />Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-2xl space-y-8">
      <section className="space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Teams</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage your organisation's teams and their details</p>
          </div>
          <button
            onClick={startAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(42,207,192,0.12)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.25)' }}>
            <Plus size={14} />Add team
          </button>
        </div>

        {/* Add new form */}
        {addingNew && (
          <div className="rounded-2xl border border-white/[0.1] p-5" style={{ background: 'rgba(30,45,76,0.5)' }}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">New team</p>
            <TeamFormFields onSave={saveNew} onCancel={cancelEdit} saveLabel="Add team" />
          </div>
        )}

        {/* Team list */}
        <div className="space-y-2">
          {settings.teams.map(team => {
            const isEditing = editingId === team.id;
            const isConfirmingDelete = deleteConfirm === team.id;
            const objCount = objectiveCounts[team.id] ?? 0;

            return (
              <div key={team.id} className="rounded-2xl border border-white/[0.06]" style={{ background: 'rgba(30,45,76,0.5)' }}>
                <div className="flex items-center gap-3 p-4">
                  {/* Color dot */}
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: team.color }} />
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">{team.name}</span>
                      {objCount > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.06)', color: '#64748b' }}>
                          {objCount} objective{objCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-500">{team.lead}</span>
                      <span className="text-xs text-slate-600">·</span>
                      <span className="text-xs text-slate-500">{team.memberCount} members</span>
                      {team.description && (
                        <>
                          <span className="text-xs text-slate-600">·</span>
                          <span className="text-xs text-slate-600 truncate">{team.description}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  {!isEditing && !isConfirmingDelete && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(team)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: '#64748b' }}
                        title="Edit team">
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(team.id)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: '#64748b' }}
                        title="Delete team">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Edit form */}
                {isEditing && (
                  <div className="px-4 pb-4">
                    <TeamFormFields onSave={saveEdit} onCancel={cancelEdit} saveLabel="Save changes" />
                  </div>
                )}

                {/* Delete confirm */}
                {isConfirmingDelete && (
                  <div className="px-4 pb-4 flex items-center gap-3">
                    <span className="text-sm text-slate-400 flex-1">
                      Delete <span className="text-white font-medium">{team.name}</span>? This cannot be undone.
                    </span>
                    <button
                      onClick={() => deleteTeam(team.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <Trash2 size={12} />Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                      style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)' }}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {settings.teams.length === 0 && !addingNew && (
          <div className="rounded-2xl border border-white/[0.06] p-8 text-center" style={{ background: 'rgba(30,45,76,0.5)' }}>
            <p className="text-slate-500 text-sm">No teams configured yet.</p>
            <button
              onClick={startAdd}
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
