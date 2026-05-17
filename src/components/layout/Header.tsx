'use client';

import { useOKR } from '@/contexts/OKRContext';
import { useSettings } from '@/contexts/SettingsContext';
import { quarterLabel, yearLabel } from '@/lib/calendarSettings';
import { Quarter } from '@/lib/types';

const quarters: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { selectedQuarter, setSelectedQuarter, data } = useOKR();
  const { settings } = useSettings();

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06] sticky top-0 z-10"
      style={{ background: 'rgba(13,26,46,0.90)', backdropFilter: 'blur(12px)' }}>
      <div>
        <h1 className="text-lg font-semibold text-white leading-none">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Year label */}
        {data && (
          <span className="text-sm font-semibold text-slate-300">
            {yearLabel(data.year, settings)}
          </span>
        )}

        {/* Quarter switcher with month ranges */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {quarters.map((q, i) => {
            const { q: qLabel, range } = quarterLabel((i + 1) as 1 | 2 | 3 | 4, settings);
            const active = selectedQuarter === q;
            return (
              <button
                key={q}
                onClick={() => setSelectedQuarter(q)}
                title={range}
                className="flex flex-col items-center px-3 py-1 rounded-md transition-all duration-150"
                style={active
                  ? { background: 'rgba(42,207,192,0.15)', boxShadow: 'inset 0 0 0 1px rgba(42,207,192,0.25)' }
                  : {}}>
                <span className="text-xs font-semibold leading-none"
                  style={{ color: active ? '#2acfc0' : '#64748b' }}>
                  {qLabel}
                </span>
                <span className="text-[9px] leading-none mt-0.5"
                  style={{ color: active ? 'rgba(42,207,192,0.7)' : '#374151' }}>
                  {range}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
