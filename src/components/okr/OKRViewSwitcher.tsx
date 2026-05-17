'use client';

import { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Objective } from '@/lib/types';
import { useOKRView } from '@/contexts/OKRViewContext';
import { KanbanView }    from './views/KanbanView';
import { GridView }      from './views/GridView';
import { ListView }      from './views/ListView';
import { TableView }     from './views/TableView';
import { TeamBoardView } from './views/TeamBoardView';
import { OKRDetailPanel } from './OKRDetailPanel';
import { AddObjectivePanel } from './AddObjectivePanel';
import { ImportPanel } from './ImportPanel';

interface OKRViewSwitcherProps {
  objectives: Objective[];
}

export function OKRViewSwitcher({ objectives }: OKRViewSwitcherProps) {
  const { view } = useOKRView();
  const [selected,    setSelected]    = useState<Objective | null>(null);
  const [addingNew,   setAddingNew]   = useState(false);
  const [importing,   setImporting]   = useState(false);

  return (
    <div>
      {/* Action buttons */}
      <div className="flex items-center gap-2 mb-5">
        <button onClick={() => { setAddingNew(true); setImporting(false); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'rgba(42,207,192,0.12)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.25)' }}>
          <Plus size={14} /> Add Objective
        </button>
        <button onClick={() => { setImporting(true); setAddingNew(false); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Upload size={14} /> Import
        </button>
        <span className="text-xs text-slate-600 ml-auto">{objectives.length} objectives</span>
      </div>

      {/* Active view */}
      {view === 'kanban' && <KanbanView    objectives={objectives} onSelect={setSelected} />}
      {view === 'grid'   && <GridView      objectives={objectives} onSelect={setSelected} />}
      {view === 'list'   && <ListView      objectives={objectives} onSelect={setSelected} />}
      {view === 'table'  && <TableView     objectives={objectives} onSelect={setSelected} />}
      {view === 'team'   && <TeamBoardView objectives={objectives} onSelect={setSelected} />}

      {/* Panels */}
      {selected   && <OKRDetailPanel   objective={selected}  onClose={() => setSelected(null)} />}
      {addingNew  && <AddObjectivePanel                       onClose={() => setAddingNew(false)} />}
      {importing  && <ImportPanel                             onClose={() => setImporting(false)} />}
    </div>
  );
}
