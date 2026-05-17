'use client';

import { progressColor } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({ progress, color, height = 6, showLabel = false }: ProgressBarProps) {
  const fill = color ?? progressColor(progress);
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 rounded-full overflow-hidden" style={{ height, background: 'rgba(255,255,255,0.07)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${progress}%`,
            background: fill,
            boxShadow: `0 0 8px ${fill}66`,
          }}
        />
      </div>
      {showLabel && <span className="text-xs font-medium text-slate-300 w-9 text-right">{progress}%</span>}
    </div>
  );
}
