'use client';

import { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const ACCENT_PRESETS = [
  '#2acfc0', '#3b82f6', '#8b5cf6', '#10b981',
  '#f59e0b', '#ec4899', '#ef4444', '#06b6d4',
];

const SIDEBAR_PRESETS = [
  '#0d1a2e', '#0f172a', '#111827', '#1c1917',
  '#1a1a2e', '#0d1117',
];

function ColorPicker({
  value,
  onChange,
  presets,
  label,
}: {
  value: string;
  onChange: (c: string) => void;
  presets: string[];
  label: string;
}) {
  const [hex, setHex] = useState(value);

  const apply = (color: string) => {
    const normalized = color.startsWith('#') ? color : `#${color}`;
    setHex(normalized);
    onChange(normalized);
  };

  const handleHexInput = (raw: string) => {
    setHex(raw);
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
      onChange(raw);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>

      {/* Preset swatches */}
      <div className="flex flex-wrap gap-2">
        {presets.map(p => (
          <button
            key={p}
            title={p}
            onClick={() => apply(p)}
            className="w-8 h-8 rounded-lg border-2 transition-all duration-150"
            style={{
              background: p,
              borderColor: value.toLowerCase() === p.toLowerCase() ? '#fff' : 'transparent',
              boxShadow: value.toLowerCase() === p.toLowerCase() ? '0 0 0 1px rgba(255,255,255,0.3)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Native color + hex text */}
      <div className="flex items-center gap-2">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/[0.12] shrink-0">
          <input
            type="color"
            value={value}
            onChange={e => apply(e.target.value)}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
          />
          <div className="w-full h-full" style={{ background: value }} />
        </div>
        <input
          type="text"
          value={hex}
          onChange={e => handleHexInput(e.target.value)}
          placeholder="#000000"
          maxLength={7}
          className="w-32 px-3 py-2 rounded-xl text-sm text-white placeholder-slate-600 border border-white/[0.08] focus:border-white/20 focus:outline-none transition-colors font-mono"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        />
      </div>
    </div>
  );
}

export default function BrandingPage() {
  const { settings, updateSettings } = useSettings();
  const [saved, setSaved] = useState(false);

  const [draft, setDraft] = useState({
    companyName: settings.companyName,
    accentColor: settings.accentColor,
    sidebarBg: settings.sidebarBg,
  });

  const handleSave = () => {
    updateSettings(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-2xl space-y-8">

      {/* ── Company Identity ── */}
      <section className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-white">Company Identity</h2>
          <p className="text-xs text-slate-500 mt-0.5">Shown in the sidebar and dashboard header</p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] p-5 space-y-4" style={{ background: 'var(--card-bg)' }}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company name</p>
          <input
            type="text"
            value={draft.companyName}
            onChange={e => setDraft(d => ({ ...d, companyName: e.target.value }))}
            placeholder="Your company name"
            className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 border border-white/[0.08] focus:border-white/20 focus:outline-none transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          />

          {/* Live preview */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Preview</p>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(42,207,192,0.1)', border: '1px solid rgba(42,207,192,0.2)', color: '#2acfc0' }}>
              <div className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold"
                style={{ background: draft.accentColor }}>
                {(draft.companyName || 'F').charAt(0).toUpperCase()}
              </div>
              {draft.companyName || 'Your Company'}
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-white/[0.06]" />

      {/* ── Accent Colour ── */}
      <section className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-white">Accent Colour</h2>
          <p className="text-xs text-slate-500 mt-0.5">Used for highlights, active states, and interactive elements</p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] p-5 space-y-5" style={{ background: 'var(--card-bg)' }}>
          <ColorPicker
            value={draft.accentColor}
            onChange={c => setDraft(d => ({ ...d, accentColor: c }))}
            presets={ACCENT_PRESETS}
            label="Choose accent colour"
          />

          {/* Live preview strip */}
          <div>
            <p className="text-xs text-slate-500 mb-3">Preview</p>
            <div className="flex flex-wrap items-center gap-3">
              {/* Button */}
              <button
                className="px-4 py-2 rounded-xl text-sm font-medium border"
                style={{ background: `${draft.accentColor}1a`, color: draft.accentColor, border: `1px solid ${draft.accentColor}40` }}>
                Save changes
              </button>
              {/* Badge */}
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold border"
                style={{ background: `${draft.accentColor}1a`, color: draft.accentColor, border: `1px solid ${draft.accentColor}40` }}>
                On track
              </span>
              {/* Progress bar */}
              <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full w-[72%]" style={{ background: draft.accentColor }} />
                </div>
                <span className="text-xs text-slate-400">72%</span>
              </div>
              {/* Nav item */}
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border"
                style={{ background: `${draft.accentColor}1a`, color: draft.accentColor, border: `1px solid ${draft.accentColor}30` }}>
                <div className="w-3 h-3 rounded-full" style={{ background: draft.accentColor }} />
                Dashboard
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-white/[0.06]" />

      {/* ── Sidebar Background ── */}
      <section className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-white">Sidebar Background</h2>
          <p className="text-xs text-slate-500 mt-0.5">The background colour of the main navigation sidebar</p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] p-5 space-y-5" style={{ background: 'var(--card-bg)' }}>
          <ColorPicker
            value={draft.sidebarBg}
            onChange={c => setDraft(d => ({ ...d, sidebarBg: c }))}
            presets={SIDEBAR_PRESETS}
            label="Choose sidebar colour"
          />

          {/* Live preview */}
          <div>
            <p className="text-xs text-slate-500 mb-3">Preview</p>
            <div className="w-40 rounded-xl p-3 space-y-2" style={{ background: draft.sidebarBg, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-xs font-semibold text-slate-400 px-1 uppercase tracking-wider">Navigation</div>
              {['Dashboard', 'Teams', 'Settings'].map((item, i) => (
                <div key={item}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs"
                  style={i === 0
                    ? { background: `${draft.accentColor}1a`, color: draft.accentColor }
                    : { color: '#64748b' }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: i === 0 ? draft.accentColor : '#334155' }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Save */}
      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
        style={saved
          ? { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }
          : { background: 'rgba(42,207,192,0.12)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.25)' }}>
        {saved ? <Check size={15} /> : <Save size={15} />}
        {saved ? 'Saved!' : 'Save branding settings'}
      </button>
    </div>
  );
}
