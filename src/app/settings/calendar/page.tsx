'use client';

import { useState } from 'react';
import { Save, Check, Calendar, TrendingUp } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { YearType, YearDisplayFormat, MONTH_FULL, yearLabel, quarterLabel } from '@/lib/calendarSettings';

const CURRENT_YEAR = new Date().getFullYear();

export default function CalendarSettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [saved, setSaved] = useState(false);

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

  const previewQuarters = ([1, 2, 3, 4] as const).map(q => quarterLabel(q, settings));
  const previewYear = yearLabel(CURRENT_YEAR, settings);

  return (
    <div className="p-8 max-w-2xl space-y-8">
      <section className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-white">Year &amp; Calendar Design</h2>
          <p className="text-xs text-slate-500 mt-0.5">Controls how quarters and years are labelled across the dashboard</p>
        </div>

        {/* Year type */}
        <div className="rounded-2xl border border-white/[0.06] p-5 space-y-4" style={{ background: 'rgba(30,45,76,0.5)' }}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Year type</p>
          <div className="grid grid-cols-2 gap-3">
            {optionBtn(settings.yearType === 'calendar', () => updateSettings({ yearType: 'calendar' as YearType }),
              <div>
                <div className="flex items-center gap-1.5"><Calendar size={13} />Calendar Year</div>
                <p className="text-xs text-slate-500 font-normal mt-0.5">Jan – Dec · Q1 starts January</p>
              </div>
            )}
            {optionBtn(settings.yearType === 'financial', () => updateSettings({ yearType: 'financial' as YearType }),
              <div>
                <div className="flex items-center gap-1.5"><TrendingUp size={13} />Financial Year</div>
                <p className="text-xs text-slate-500 font-normal mt-0.5">Custom start month · FY labelling</p>
              </div>
            )}
          </div>
        </div>

        {/* FY start month */}
        {settings.yearType === 'financial' && (
          <div className="rounded-2xl border border-white/[0.06] p-5 space-y-4" style={{ background: 'rgba(30,45,76,0.5)' }}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Financial year start month</p>
            <div className="grid grid-cols-4 gap-2">
              {MONTH_FULL.map((month, idx) => {
                const m = idx + 1;
                const active = settings.fyStartMonth === m;
                return (
                  <button key={m} onClick={() => updateSettings({ fyStartMonth: m })}
                    className="py-2 px-3 rounded-xl text-xs font-medium transition-all duration-150 border"
                    style={active
                      ? { background: 'rgba(42,207,192,0.12)', border: '1px solid rgba(42,207,192,0.3)', color: '#2acfc0' }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#64748b' }}>
                    {active && <Check size={10} className="inline mr-1 -mt-0.5" />}
                    {month.slice(0, 3)}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500">
              Q1 will start in <span className="text-slate-300">{MONTH_FULL[settings.fyStartMonth - 1]}</span>.
              Common: Apr (UK), Jan (US/Global), Jul (Australia), Oct (US Federal).
            </p>
          </div>
        )}

        {/* Year display format */}
        {settings.yearType === 'financial' && (
          <div className="rounded-2xl border border-white/[0.06] p-5 space-y-4" style={{ background: 'rgba(30,45,76,0.5)' }}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Year label format</p>
            <div className="grid grid-cols-3 gap-3">
              {([
                ['full',  `FY${CURRENT_YEAR}`,                               'Full year with FY prefix'],
                ['short', `FY${String(CURRENT_YEAR).slice(-2)}`,              'Short year with FY prefix'],
                ['range', `${CURRENT_YEAR - 1}/${String(CURRENT_YEAR).slice(-2)}`, 'Year range (e.g. 2025/26)'],
              ] as [YearDisplayFormat, string, string][]).map(([fmt, example, hint]) => (
                optionBtn(settings.yearDisplayFormat === fmt, () => updateSettings({ yearDisplayFormat: fmt }),
                  <div>
                    <span className="font-semibold">{example}</span>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">{hint}</p>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Live preview */}
        <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: 'rgba(30,45,76,0.5)' }}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Live preview</p>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-300">{previewYear}</span>
            <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {previewQuarters.map(({ q, range }, i) => (
                <div key={i}
                  className="flex flex-col items-center px-3 py-1 rounded-md"
                  style={i === 1
                    ? { background: 'rgba(42,207,192,0.15)', boxShadow: 'inset 0 0 0 1px rgba(42,207,192,0.25)' }
                    : {}}>
                  <span className="text-xs font-semibold leading-none"
                    style={{ color: i === 1 ? '#2acfc0' : '#64748b' }}>{q}</span>
                  <span className="text-[9px] leading-none mt-0.5"
                    style={{ color: i === 1 ? 'rgba(42,207,192,0.7)' : '#374151' }}>{range}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-3">This is exactly how the header quarter switcher will look.</p>
        </div>

        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={saved
            ? { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }
            : { background: 'rgba(42,207,192,0.12)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.25)' }}>
          {saved ? <Check size={15} /> : <Save size={15} />}
          {saved ? 'Saved!' : 'Save calendar settings'}
        </button>
      </section>
    </div>
  );
}
