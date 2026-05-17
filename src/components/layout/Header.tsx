'use client';

import { usePathname } from 'next/navigation';
import { useOKR } from '@/contexts/OKRContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useOKRView, OKRView } from '@/contexts/OKRViewContext';
import { quarterLabel, yearLabel } from '@/lib/calendarSettings';
import { Quarter } from '@/lib/types';
import { Columns3, LayoutGrid, AlignLeft, Table2, Users2 } from 'lucide-react';

const quarters: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

const VIEW_ICONS: { id: OKRView; Icon: React.ComponentType<{ size: number }>; label: string }[] = [
  { id: 'kanban', Icon: Columns3,    label: 'Kanban'   },
  { id: 'grid',   Icon: LayoutGrid,  label: 'Grid'     },
  { id: 'list',   Icon: AlignLeft,   label: 'List'     },
  { id: 'table',  Icon: Table2,      label: 'Table'    },
  { id: 'team',   Icon: Users2,      label: 'By Team'  },
];

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { selectedQuarter, setSelectedQuarter, data } = useOKR();
  const { settings } = useSettings();
  const { view, setView } = useOKRView();
  const pathname = usePathname();
  const isDashboard = pathname === '/';

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-white/[0.06] sticky top-0 z-10 gap-4"
      style={{ background: 'rgba(13,26,46,0.92)', backdropFilter: 'blur(12px)' }}>

      {/* Title */}
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-white leading-none truncate">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-1 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* View picker — dashboard only */}
        {isDashboard && (
          <div className="flex items-center gap-0.5 p-1 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {VIEW_ICONS.map(({ id, Icon, label }) => (
              <button key={id} onClick={() => setView(id)} title={label}
                className="p-1.5 rounded-lg transition-all duration-150"
                style={view === id
                  ? { background: 'rgba(42,207,192,0.15)', color: '#2acfc0', boxShadow: 'inset 0 0 0 1px rgba(42,207,192,0.3)' }
                  : { color: '#475569' }}>
                <Icon size={14} />
              </button>
            ))}
          </div>
        )}

        {/* Year label */}
        {data && (
          <span className="text-sm font-semibold text-slate-300">
            {yearLabel(data.year, settings)}
          </span>
        )}

        {/* Quarter switcher */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {quarters.map((q, i) => {
            const { q: qLabel, range } = quarterLabel((i + 1) as 1 | 2 | 3 | 4, settings);
            const active = selectedQuarter === q;
            return (
              <button key={q} onClick={() => setSelectedQuarter(q)} title={range}
                className="flex flex-col items-center px-3 py-1 rounded-md transition-all duration-150"
                style={active
                  ? { background: 'rgba(42,207,192,0.15)', boxShadow: 'inset 0 0 0 1px rgba(42,207,192,0.25)' }
                  : {}}>
                <span className="text-xs font-semibold leading-none" style={{ color: active ? '#2acfc0' : '#64748b' }}>
                  {qLabel}
                </span>
                <span className="text-[9px] leading-none mt-0.5" style={{ color: active ? 'rgba(42,207,192,0.7)' : '#374151' }}>
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
