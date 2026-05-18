'use client';

import { useState, useMemo } from 'react';
import { Save, Check, Target, Info, Calendar } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { computeDefaultCycleDates, CycleDateRange } from '@/lib/calendarSettings';
import type { OKRCadence } from '@/lib/types';

const CYCLE_KEYS = ['Q1', 'Q2', 'Q3', 'Q4', 'annual'] as const;
type CycleKey = typeof CYCLE_KEYS[number];
const CYCLE_LABELS: Record<CycleKey, string> = {
  Q1: 'Q1', Q2: 'Q2', Q3: 'Q3', Q4: 'Q4', annual: 'Annual',
};

const INPUT = "w-full px-3 py-2 rounded-xl text-sm text-white border border-white/[0.08] focus:border-white/20 focus:outline-none transition-colors";
const INPUT_BG: React.CSSProperties = { background: 'rgba(255,255,255,0.04)' };

export default function OKRsSettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [saved, setSaved] = useState(false);

  const computedDefaults = useMemo(
    () => computeDefaultCycleDates(settings.fyStartMonth, new Date().getFullYear()),
    [settings.fyStartMonth],
  );

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const optionBtn = (active: boolean, onClick: () => void, children: React.ReactNode) => (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 w-full text-left"
      style={active
        ? { background: 'rgba(42,207,192,0.1)', border: '1px solid rgba(42,207,192,0.3)', color: '#2acfc0' }
        : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#94a3b8' }}>
      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
        style={{ borderColor: active ? '#2acfc0' : '#334155' }}>
        {active && <div className="w-1.5 h-1.5 rounded-full bg-[#2acfc0]" />}
      </div>
      {children}
    </button>
  );

  const setCycleDate = (key: CycleKey, field: 'startDate' | 'endDate', value: string) => {
    const existing = settings.cycleDates?.[key] ?? { startDate: '', endDate: '' };
    updateSettings({
      cycleDates: {
        ...settings.cycleDates,
        [key]: { ...existing, [field]: value },
      },
    });
  };

  const getCycleDate = (key: CycleKey, field: 'startDate' | 'endDate'): string =>
    settings.cycleDates?.[key]?.[field] ?? '';

  const gradeGreenPct  = Math.round(settings.gradeGreen  * 100);
  const gradeYellowPct = Math.round(settings.gradeYellow * 100);

  return (
    <div className="p-6 sm:p-8 max-w-2xl space-y-8">

      {/* ── Default cadence ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white">Default Cadence</h2>
          <p className="text-xs text-slate-500 mt-0.5">Sets the default when creating a new OKR — can be overridden per objective</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] p-5 space-y-3" style={{ background: 'var(--card-bg)' }}>
          <div className="grid grid-cols-2 gap-2">
            {optionBtn((settings.defaultCadence ?? 'quarterly') === 'quarterly',
              () => updateSettings({ defaultCadence: 'quarterly' }),
              <div>
                <div className="font-semibold">Quarterly</div>
                <p className="text-xs text-slate-500 font-normal mt-0.5">OKRs scoped to a single quarter. Best for fast-moving teams.</p>
              </div>
            )}
            {optionBtn((settings.defaultCadence ?? 'quarterly') === 'yearly',
              () => updateSettings({ defaultCadence: 'yearly' }),
              <div>
                <div className="font-semibold">Yearly</div>
                <p className="text-xs text-slate-500 font-normal mt-0.5">OKRs span the full financial year. Best for strategic objectives.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="border-t border-white/[0.06]" />

      {/* ── Cycle date ranges ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white">Cycle Date Ranges</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Exact start and end dates for each quarter and the annual cycle.
            These are used as defaults when creating OKRs and are shown in reports.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'var(--card-bg)' }}>
          {/* Header */}
          <div className="grid px-4 py-2.5 border-b border-white/[0.06] text-[10px] font-semibold uppercase tracking-wider text-slate-500"
            style={{ gridTemplateColumns: '80px 1fr 1fr 72px' }}>
            <span>Period</span>
            <span>Start date</span>
            <span>End date</span>
            <span>Duration</span>
          </div>

          {CYCLE_KEYS.map((key, i) => {
            const placeholder = computedDefaults[key];
            const startVal = getCycleDate(key, 'startDate');
            const endVal   = getCycleDate(key, 'endDate');
            const effectiveStart = startVal || placeholder.startDate;
            const effectiveEnd   = endVal   || placeholder.endDate;
            const days = effectiveStart && effectiveEnd
              ? Math.round((new Date(effectiveEnd).getTime() - new Date(effectiveStart).getTime()) / 86400000) + 1
              : null;

            return (
              <div
                key={key}
                className={`grid items-center px-4 py-3 gap-3 ${i < CYCLE_KEYS.length - 1 ? 'border-b border-white/[0.04]' : ''}`}
                style={{ gridTemplateColumns: '80px 1fr 1fr 72px', background: key === 'annual' ? 'rgba(42,207,192,0.04)' : undefined }}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={12} style={{ color: key === 'annual' ? '#2acfc0' : '#64748b' }} />
                  <span className="text-sm font-semibold" style={{ color: key === 'annual' ? '#2acfc0' : '#e2e8f0' }}>
                    {CYCLE_LABELS[key]}
                  </span>
                </div>

                <input
                  type="date"
                  value={startVal}
                  placeholder={placeholder.startDate}
                  onChange={e => setCycleDate(key, 'startDate', e.target.value)}
                  className={INPUT}
                  style={INPUT_BG}
                />

                <input
                  type="date"
                  value={endVal}
                  placeholder={placeholder.endDate}
                  onChange={e => setCycleDate(key, 'endDate', e.target.value)}
                  className={INPUT}
                  style={INPUT_BG}
                />

                <span className="text-xs text-slate-500 text-right">
                  {days != null ? `${days}d` : '—'}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-600 flex items-start gap-1.5">
          <Info size={11} className="mt-0.5 shrink-0" />
          Leave blank to use dates computed automatically from your fiscal year settings (Settings → Calendar).
          Computed defaults are shown as placeholders.
        </p>
      </section>

      <div className="border-t border-white/[0.06]" />

      {/* ── Scoring method ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white">Scoring Method</h2>
          <p className="text-xs text-slate-500 mt-0.5">How key result progress is measured</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] p-5 space-y-3" style={{ background: 'var(--card-bg)' }}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scoring type</p>
          <div className="space-y-2">
            {optionBtn(settings.okrScoring === 'percentage', () => updateSettings({ okrScoring: 'percentage' }),
              <div>
                <div className="font-semibold">Percentage (0–100%)</div>
                <p className="text-xs text-slate-500 font-normal mt-0.5">Track progress as a continuous percentage. Best for quantitative goals.</p>
              </div>
            )}
            {optionBtn(settings.okrScoring === 'binary', () => updateSettings({ okrScoring: 'binary' }),
              <div>
                <div className="font-semibold">Binary (0% or 100%)</div>
                <p className="text-xs text-slate-500 font-normal mt-0.5">Done or not done. Best for clear milestones and deliverables.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="border-t border-white/[0.06]" />

      {/* ── Grade thresholds ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white">Grade Thresholds</h2>
          <p className="text-xs text-slate-500 mt-0.5">Define when an OKR is considered on track, at risk, or behind</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] p-5 space-y-5" style={{ background: 'var(--card-bg)' }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Green threshold (on track)</label>
              <div className="flex items-center gap-2">
                <input type="number" value={gradeGreenPct}
                  onChange={e => updateSettings({ gradeGreen: Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)) / 100 })}
                  min={0} max={100}
                  className="w-20 px-3 py-2 rounded-xl text-sm text-white border border-white/[0.08] focus:border-white/20 focus:outline-none text-center"
                  style={{ background: 'rgba(255,255,255,0.04)' }} />
                <span className="text-sm text-slate-400">%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Yellow threshold (at risk)</label>
              <div className="flex items-center gap-2">
                <input type="number" value={gradeYellowPct}
                  onChange={e => updateSettings({ gradeYellow: Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)) / 100 })}
                  min={0} max={100}
                  className="w-20 px-3 py-2 rounded-xl text-sm text-white border border-white/[0.08] focus:border-white/20 focus:outline-none text-center"
                  style={{ background: 'rgba(255,255,255,0.04)' }} />
                <span className="text-sm text-slate-400">%</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-2">Preview</p>
            <div className="flex rounded-lg overflow-hidden h-6 text-xs font-medium">
              <div className="flex items-center justify-center"
                style={{ width: `${gradeYellowPct}%`, background: 'rgba(239,68,68,0.4)', color: '#fca5a5', minWidth: 32 }}>
                {gradeYellowPct}%
              </div>
              <div className="flex items-center justify-center"
                style={{ width: `${gradeGreenPct - gradeYellowPct}%`, background: 'rgba(234,179,8,0.4)', color: '#fde68a', minWidth: 32 }}>
                {gradeGreenPct - gradeYellowPct}%
              </div>
              <div className="flex items-center justify-center flex-1"
                style={{ background: 'rgba(16,185,129,0.4)', color: '#6ee7b7' }}>
                {100 - gradeGreenPct}%
              </div>
            </div>
            <div className="flex text-[10px] text-slate-500 mt-1 gap-4">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#ef4444' }} />Behind (&lt;{gradeYellowPct}%)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#eab308' }} />At risk ({gradeYellowPct}–{gradeGreenPct}%)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#10b981' }} />On track (&ge;{gradeGreenPct}%)</span>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-white/[0.06]" />

      {/* ── Check-in frequency ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white">Check-in Frequency</h2>
          <p className="text-xs text-slate-500 mt-0.5">How often teams should update their OKR progress</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] p-5 space-y-3" style={{ background: 'var(--card-bg)' }}>
          <div className="grid grid-cols-3 gap-2">
            {optionBtn(settings.checkInFrequency === 'weekly', () => updateSettings({ checkInFrequency: 'weekly' }),
              <div><div className="font-semibold">Weekly</div><p className="text-xs text-slate-500 font-normal mt-0.5">Every week</p></div>
            )}
            {optionBtn(settings.checkInFrequency === 'biweekly', () => updateSettings({ checkInFrequency: 'biweekly' }),
              <div><div className="font-semibold">Bi-weekly</div><p className="text-xs text-slate-500 font-normal mt-0.5">Every two weeks</p></div>
            )}
            {optionBtn(settings.checkInFrequency === 'monthly', () => updateSettings({ checkInFrequency: 'monthly' }),
              <div><div className="font-semibold">Monthly</div><p className="text-xs text-slate-500 font-normal mt-0.5">Once a month</p></div>
            )}
          </div>
        </div>
      </section>

      <div className="border-t border-white/[0.06]" />

      {/* ── Confidence scoring ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white">Confidence Scoring</h2>
          <p className="text-xs text-slate-500 mt-0.5">Allow teams to self-report confidence level on each key result</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: 'var(--card-bg)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Show confidence indicator</p>
              <p className="text-xs text-slate-500 mt-0.5">Display a confidence score on each key result card</p>
            </div>
            <button
              onClick={() => updateSettings({ showConfidence: !settings.showConfidence })}
              className="relative w-11 h-6 rounded-full transition-all duration-200 shrink-0"
              style={{ background: settings.showConfidence ? '#2acfc0' : 'rgba(255,255,255,0.12)' }}>
              <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200"
                style={{ left: settings.showConfidence ? '1.375rem' : '0.125rem' }} />
            </button>
          </div>
        </div>
      </section>

      <div className="border-t border-white/[0.06]" />

      {/* ── Methodology card ── */}
      <section>
        <div className="rounded-2xl border border-blue-500/20 p-5 space-y-3" style={{ background: 'rgba(59,130,246,0.06)' }}>
          <div className="flex items-center gap-2">
            <Target size={16} className="text-blue-400 shrink-0" />
            <p className="text-sm font-semibold text-blue-300">Form3 OKR Methodology</p>
          </div>
          <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
            <p>Form3 uses a quarterly OKR cadence aligned to the financial year (April–March). Each team sets 3–5 ambitious objectives with 2–4 measurable key results each.</p>
            <p>Key results should be stretching but achievable — a score of 70–100% is considered success. Scores below 40% indicate the objective needs immediate attention.</p>
          </div>
        </div>
      </section>

      <button onClick={handleSave}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
        style={saved
          ? { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }
          : { background: 'rgba(42,207,192,0.12)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.25)' }}>
        {saved ? <Check size={15} /> : <Save size={15} />}
        {saved ? 'Saved!' : 'Save OKR settings'}
      </button>
    </div>
  );
}
