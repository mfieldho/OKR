'use client';

import { useOKR } from '@/contexts/OKRContext';
import { Quarter } from '@/lib/types';

const quarters: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { selectedQuarter, setSelectedQuarter, data } = useOKR();

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06] sticky top-0 z-10"
      style={{ background: 'rgba(13,26,46,0.90)', backdropFilter: 'blur(12px)' }}>
      <div>
        <h1 className="text-lg font-semibold text-white leading-none">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Quarter switcher */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {quarters.map(q => (
            <button key={q} onClick={() => setSelectedQuarter(q)}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all duration-150"
              style={selectedQuarter === q
                ? { background: 'rgba(42,207,192,0.15)', color: '#2acfc0', boxShadow: 'inset 0 0 0 1px rgba(42,207,192,0.25)' }
                : { color: '#64748b' }}>
              {q}
            </button>
          ))}
        </div>

        {/* Year */}
        {data && (
          <span className="text-sm font-medium text-slate-400">{data.year}</span>
        )}
      </div>
    </header>
  );
}
