'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Objective } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { KeyResultRow } from './KeyResultRow';
import { progressColor } from '@/lib/utils';

interface OKRCardProps {
  objective: Objective;
  defaultOpen?: boolean;
}

export function OKRCard({ objective, defaultOpen = false }: OKRCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-white/[0.06] hover:border-white/10 transition-all duration-200 overflow-hidden"
      style={{ background: 'rgba(26,34,54,0.5)' }}>
      {/* Header */}
      <button className="w-full text-left px-5 py-4 flex items-center gap-4" onClick={() => setOpen(!open)}>
        <ProgressRing progress={objective.progress} size={64} strokeWidth={6} color={progressColor(objective.progress)} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1.5">
            <StatusBadge status={objective.status} />
            {objective.tags?.map(t => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full text-slate-500 border border-white/[0.06]">{t}</span>
            ))}
          </div>
          <p className="text-sm font-medium text-white leading-snug">{objective.title}</p>
          <p className="text-xs text-slate-500 mt-1">
            {objective.keyResults.length} key results · Owner: {objective.owner}
          </p>
        </div>

        <div className="text-slate-600 shrink-0">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Key Results */}
      {open && (
        <div className="px-5 pb-4 space-y-2 border-t border-white/[0.06] pt-4">
          {objective.keyResults.map(kr => (
            <KeyResultRow key={kr.id} kr={kr} />
          ))}
        </div>
      )}
    </div>
  );
}
