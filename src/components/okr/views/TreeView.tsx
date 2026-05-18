'use client';

import { Objective } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { progressColor } from '@/lib/utils';
import { useOKR } from '@/contexts/OKRContext';
import { useTheme } from '@/contexts/SettingsContext';
import { Link2, ChevronRight } from 'lucide-react';

// Build adjacency list
function buildTree(objectives: Objective[]): { roots: Objective[]; childMap: Map<string, Objective[]> } {
  const ids = new Set(objectives.map(o => o.id));
  const childMap = new Map<string, Objective[]>();

  for (const obj of objectives) {
    const parentId = obj.parentId && ids.has(obj.parentId) ? obj.parentId : null;
    if (parentId) {
      if (!childMap.has(parentId)) childMap.set(parentId, []);
      childMap.get(parentId)!.push(obj);
    }
  }

  const roots = objectives.filter(o => !o.parentId || !ids.has(o.parentId));
  return { roots, childMap };
}

interface TreeNodeProps {
  objective: Objective;
  depth: number;
  isLast: boolean;
  parentLines: boolean[]; // which depth levels have a continuing sibling
  childMap: Map<string, Objective[]>;
  onSelect: (o: Objective) => void;
}

function TreeNode({ objective, depth, isLast, parentLines, childMap, onSelect }: TreeNodeProps) {
  const { data } = useOKR();
  const { isDark } = useTheme();
  const team = data?.teams.find(t => t.id === objective.teamId);
  const children = childMap.get(objective.id) ?? [];
  const color = progressColor(objective.progress);
  const accentColor = team?.color ?? color;
  const lineColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.12)';

  return (
    <div>
      {/* Node row */}
      <button
        onClick={() => onSelect(objective)}
        className="w-full text-left group flex items-center gap-0 hover:bg-white/[0.025] rounded-xl transition-colors py-1.5 px-2 focus:outline-none"
      >
        {/* Tree lines + indentation */}
        <div className="flex items-center shrink-0" style={{ width: depth * 24 }}>
          {parentLines.map((hasLine, i) => (
            <div key={i} className="shrink-0 flex justify-center" style={{ width: 24 }}>
              {hasLine && i < depth - 1 && (
                <div className="w-px h-full" style={{ background: lineColor, minHeight: 40 }} />
              )}
            </div>
          ))}
        </div>

        {/* Connector for this node */}
        {depth > 0 && (
          <div className="flex items-center shrink-0" style={{ width: 24, marginLeft: -24 + (depth - 1) * 24 }}>
            <div className="flex flex-col items-center" style={{ height: 40 }}>
              <div className="w-px flex-1" style={{ background: isLast ? 'transparent' : lineColor }} />
              <div className="w-px flex-1" style={{ background: lineColor }} />
            </div>
            <div className="h-px w-3" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.14)' }} />
          </div>
        )}

        {/* Status dot */}
        <div className="w-3 h-3 rounded-full shrink-0 mr-3"
          style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}66` }} />

        {/* Content */}
        <div className="flex-1 min-w-0 grid items-center gap-3"
          style={{ gridTemplateColumns: '1fr 180px 90px 80px 24px' }}>

          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate group-hover:text-[#2acfc0] transition-colors">
              {objective.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {team && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: team.color + '18', color: team.color }}>
                  {team.name.split(' ')[0]}
                </span>
              )}
              {objective.parentId && (
                <span className="flex items-center gap-0.5 text-[10px] text-slate-600">
                  <Link2 size={8} /> aligned
                </span>
              )}
              <span className="text-[10px] text-slate-600">{objective.owner}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ProgressBar progress={objective.progress} height={4} />
          </div>

          <div><StatusBadge status={objective.status} /></div>

          <span className="text-sm font-bold text-right" style={{ color }}>{objective.progress}%</span>

          <ChevronRight size={13} className="text-slate-700 group-hover:text-[#2acfc0] transition-colors justify-self-end" />
        </div>
      </button>

      {/* Children */}
      {children.map((child, i) => (
        <TreeNode
          key={child.id}
          objective={child}
          depth={depth + 1}
          isLast={i === children.length - 1}
          parentLines={[...parentLines, !isLast]}
          childMap={childMap}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export function TreeView({ objectives, onSelect }: { objectives: Objective[]; onSelect: (o: Objective) => void }) {
  const { roots, childMap } = buildTree(objectives);

  const totalAligned = objectives.filter(o => o.parentId && objectives.find(p => p.id === o.parentId)).length;

  return (
    <div className="space-y-2">
      {/* Legend */}
      <div className="flex items-center gap-4 px-2 mb-4 text-xs text-slate-600">
        <span>{objectives.length} objectives</span>
        <span>·</span>
        <span className="flex items-center gap-1"><Link2 size={10} /> {totalAligned} aligned</span>
        <span>·</span>
        <span>{roots.length} top-level</span>
      </div>

      {/* Scrollable area */}
      <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        <div style={{ minWidth: 560 }}>
          {/* Column headers */}
          <div className="grid items-center px-2 pb-2 border-b border-white/[0.05] text-[10px] font-semibold uppercase tracking-wider text-slate-600"
            style={{ gridTemplateColumns: '1fr 180px 90px 80px 24px' }}>
            <span className="pl-7">Objective</span>
            <span>Progress</span>
            <span>Status</span>
            <span className="text-right">Score</span>
            <span />
          </div>

          {/* Tree */}
          <div className="rounded-2xl border border-white/[0.05] overflow-hidden"
            style={{ background: 'var(--surface-bg)' }}>
            {roots.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-slate-600 text-sm">No objectives yet.</p>
              </div>
            ) : (
              roots.map((root, i) => (
                <TreeNode
                  key={root.id}
                  objective={root}
                  depth={0}
                  isLast={i === roots.length - 1}
                  parentLines={[]}
                  childMap={childMap}
                  onSelect={onSelect}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
