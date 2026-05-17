'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useOKR } from '@/contexts/OKRContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useOKRView, OKRView } from '@/contexts/OKRViewContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { quarterLabel, yearLabel } from '@/lib/calendarSettings';
import { Quarter } from '@/lib/types';
import {
  Columns3, LayoutGrid, AlignLeft, Table2, Users2, GitBranch,
  ChevronDown, Menu,
} from 'lucide-react';

const quarters: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

const VIEW_OPTIONS: { id: OKRView; Icon: React.ComponentType<{ size: number }>; label: string }[] = [
  { id: 'kanban', Icon: Columns3,   label: 'Kanban'   },
  { id: 'grid',   Icon: LayoutGrid, label: 'Grid'     },
  { id: 'list',   Icon: AlignLeft,  label: 'List'     },
  { id: 'table',  Icon: Table2,     label: 'Table'    },
  { id: 'team',   Icon: Users2,     label: 'By Team'  },
  { id: 'tree',   Icon: GitBranch,  label: 'Alignment'},
];

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { selectedQuarter, setSelectedQuarter, data } = useOKR();
  const { settings } = useSettings();
  const { view, setView } = useOKRView();
  const { toggle: toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const isDashboard = pathname === '/';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const currentView = VIEW_OPTIONS.find(v => v.id === view) ?? VIEW_OPTIONS[0];

  return (
    <header
      className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.06] sticky top-0 z-10 gap-3"
      style={{ background: 'rgba(13,26,46,0.92)', backdropFilter: 'blur(12px)' }}
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
        {/* View picker dropdown — dashboard only */}
        {isDashboard && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(v => !v)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-sm font-medium transition-all"
              style={dropdownOpen
                ? { background: 'rgba(42,207,192,0.15)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.3)' }
                : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <currentView.Icon size={14} />
              <span className="hidden sm:block">{currentView.label}</span>
              <ChevronDown size={12} className={`transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 w-44 rounded-2xl border border-white/[0.1] z-20 overflow-hidden py-1"
                style={{ background: 'rgba(15,27,50,0.98)', backdropFilter: 'blur(16px)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}
              >
                {VIEW_OPTIONS.map(({ id, Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => { setView(id); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                    style={view === id
                      ? { color: '#2acfc0', background: 'rgba(42,207,192,0.1)' }
                      : { color: '#94a3b8' }}
                    onMouseEnter={e => { if (view !== id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { if (view !== id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <Icon size={14} />
                    {label}
                    {view === id && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2acfc0]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

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
