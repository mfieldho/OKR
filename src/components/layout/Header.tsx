'use client';

import { usePathname } from 'next/navigation';
import { useOKR } from '@/contexts/OKRContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { quarterLabel, yearLabel } from '@/lib/calendarSettings';
import { Quarter } from '@/lib/types';
import { Menu } from 'lucide-react';

const quarters: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { selectedQuarter, setSelectedQuarter, data } = useOKR();
  const { settings } = useSettings();
  const { toggle: toggleSidebar } = useSidebar();
  const pathname = usePathname();

  return (
    <header
      className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.06] sticky top-0 z-10 gap-3"
      style={{ background: 'var(--header-bg)', backdropFilter: 'blur(12px)' }}
    >
      {/* Left: hamburger (mobile) + title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-white leading-none truncate">{title}</h1>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5 truncate hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Year label — hidden on xs */}
        {data && (
          <span className="text-sm font-semibold text-slate-300 hidden md:block">
            {yearLabel(data.year, settings)}
          </span>
        )}

        {/* Quarter switcher */}
        <div className="flex items-center gap-0.5 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {quarters.map((q, i) => {
            const { q: qLabel, range } = quarterLabel((i + 1) as 1 | 2 | 3 | 4, settings);
            const active = selectedQuarter === q;
            return (
              <button
                key={q}
                onClick={() => setSelectedQuarter(q)}
                title={range}
                className="flex flex-col items-center px-2 sm:px-3 py-1 rounded-md transition-all duration-150"
                style={active
                  ? { background: 'rgba(42,207,192,0.15)', boxShadow: 'inset 0 0 0 1px rgba(42,207,192,0.25)' }
                  : {}}
              >
                <span className="text-xs font-semibold leading-none" style={{ color: active ? '#2acfc0' : '#64748b' }}>
                  {qLabel}
                </span>
                <span
                  className="text-[9px] leading-none mt-0.5 hidden sm:block"
                  style={{ color: active ? 'rgba(42,207,192,0.7)' : '#374151' }}
                >
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
