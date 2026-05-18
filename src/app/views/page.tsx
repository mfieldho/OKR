'use client';

import { useOKR } from '@/contexts/OKRContext';
import { useOKRView, OKRView } from '@/contexts/OKRViewContext';
import { Header } from '@/components/layout/Header';
import { OKRViewSwitcher } from '@/components/okr/OKRViewSwitcher';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Columns3, LayoutGrid, AlignLeft, Table2, Users2, GitBranch } from 'lucide-react';

const VIEW_TABS: { id: OKRView; Icon: React.ComponentType<{ size: number }>; label: string }[] = [
  { id: 'kanban', Icon: Columns3,   label: 'Kanban'    },
  { id: 'grid',   Icon: LayoutGrid, label: 'Grid'      },
  { id: 'list',   Icon: AlignLeft,  label: 'List'      },
  { id: 'table',  Icon: Table2,     label: 'Table'     },
  { id: 'team',   Icon: Users2,     label: 'By Team'   },
  { id: 'tree',   Icon: GitBranch,  label: 'Alignment' },
];

export default function ViewsPage() {
  const { data, loading, error } = useOKR();
  const { view, setView } = useOKRView();

  if (loading) return (
    <div className="flex-1">
      <div className="h-[57px] border-b border-white/[0.06]" style={{ background: 'var(--header-bg)' }} />
      <LoadingSkeleton />
    </div>
  );

  if (error) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  );

  if (!data) return null;

  return (
    <div className="flex-1 fade-in">
      <Header
        title="OKR Views"
        subtitle={`${data.quarter} ${data.year} · ${data.objectives.length} objectives across ${data.teams.length} teams`}
      />

      {/* View type selector — horizontal tab bar */}
      <div
        className="flex items-center gap-1 px-4 sm:px-6 py-3 border-b border-white/[0.06] overflow-x-auto"
        style={{ background: 'var(--nav-bg)', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {VIEW_TABS.map(({ id, Icon, label }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150 shrink-0"
            style={view === id
              ? { background: 'rgba(42,207,192,0.15)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.3)' }
              : { color: '#64748b', border: '1px solid transparent' }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        <OKRViewSwitcher objectives={data.objectives} />
      </div>
    </div>
  );
}
