'use client';

import { KeyResult } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatValue } from '@/lib/utils';

export function KeyResultRow({ kr }: { kr: KeyResult }) {
  return (
    <div className="py-3 px-4 rounded-xl border border-white/[0.05] hover:border-white/10 transition-colors"
      style={{ background: 'rgba(255,255,255,0.025)' }}>
      <div className="flex items-start justify-between gap-4 mb-2.5">
        <p className="text-sm text-slate-200 leading-snug flex-1">{kr.title}</p>
        <StatusBadge status={kr.status} />
      </div>
      <ProgressBar progress={kr.progress} showLabel height={5} />
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-slate-500">
          {formatValue(kr.current, kr.unit)} / {formatValue(kr.target, kr.unit)}
        </span>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>{kr.owner}</span>
          <span>Due {kr.dueDate}</span>
        </div>
      </div>
    </div>
  );
}
