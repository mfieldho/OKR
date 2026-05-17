'use client';

import { OKRStatus } from '@/lib/types';
import { statusBg, statusLabel } from '@/lib/utils';

export function StatusBadge({ status }: { status: OKRStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBg(status)}`}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabel(status)}
    </span>
  );
}
