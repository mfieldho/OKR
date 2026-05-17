'use client';

import { useState, useEffect } from 'react';
import { Columns3, LayoutGrid, AlignLeft, Table2, Users2 } from 'lucide-react';
import { Objective } from '@/lib/types';
import { KanbanView } from './views/KanbanView';
import { GridView } from './views/GridView';
import { ListView } from './views/ListView';
import { TableView } from './views/TableView';
import { TeamBoardView } from './views/TeamBoardView';
import { OKRDetailPanel } from './OKRDetailPanel';

type View = 'kanban' | 'grid' | 'list' | 'table' | 'team';
const STORAGE_KEY = 'form3-okr-view';

const VIEWS: { id: View; label: string; icon: React.ComponentType<{ size: number }> }[] = [
  { id: 'kanban', label: 'Kanban',   icon: Columns3   },
  { id: 'grid',   label: 'Grid',     icon: LayoutGrid },
  { id: 'list',   label: 'List',     icon: AlignLeft  },
  { id: 'table',  label: 'Table',    icon: Table2     },
  { id: 'team',   label: 'By Team',  icon: Users2     },
];

interface OKRViewSwitcherProps {
  objectives: Objective[];
}

export function OKRViewSwitcher({ objectives }: OKRViewSwitcherProps) {
  const [view, setView]         = useState<View>('kanban');
  const [selected, setSelected] = useState<Objective | null>(null);

  // Persist view preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as View | null;
      if (saved && VIEWS.find(v => v.id === saved)) setView(saved);
    } catch { /* ignore */ }
  }, []);

  const changeView = (v: View) => {
    setView(v);
    try { localStorage.setItem(STORAGE_KEY, v); } catch { /* ignore */ }
  };

  return (
    <div>
      {/* View toggle bar */}
      <div className="flex items-center gap-1 mb-5 p-1 rounded-xl w-fit"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {VIEWS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => changeView(id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
            style={view === id
              ? { background: 'rgba(42,207,192,0.15)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.3)' }
              : { color: '#64748b' }}>
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Active view */}
      {view === 'kanban' && <KanbanView    objectives={objectives} onSelect={setSelected} />}
      {view === 'grid'   && <GridView      objectives={objectives} onSelect={setSelected} />}
      {view === 'list'   && <ListView      objectives={objectives} onSelect={setSelected} />}
      {view === 'table'  && <TableView     objectives={objectives} onSelect={setSelected} />}
      {view === 'team'   && <TeamBoardView objectives={objectives} onSelect={setSelected} />}

      {/* KRI detail slide-over */}
      {selected && (
        <OKRDetailPanel objective={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
