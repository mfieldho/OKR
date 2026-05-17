'use client';

import { X, User, Calendar, Tag, TrendingUp } from 'lucide-react';
import { Objective, KeyResult } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { progressColor, formatValue } from '@/lib/utils';
import { useOKR } from '@/contexts/OKRContext';

function KRCard({ kr }: { kr: KeyResult }) {
  const pct = kr.progress;
  const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="p-4 rounded-2xl border border-white/[0.06] transition-all hover:border-white/[0.12]"
      style={{ background: 'rgba(255,255,255,0.025)' }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-sm text-white leading-snug flex-1 font-medium">{kr.title}</p>
        <StatusBadge status={kr.status} />
      </div>

      <ProgressBar progress={kr.progress} showLabel height={6} />

      <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <User size={10} className="shrink-0" />
          <span className="truncate">{kr.owner}</span>
        </div>
        <div className="flex items-center gap-1.5 justify-end">
          <Calendar size={10} className="shrink-0" />
          <span>Due {kr.dueDate}</span>
        </div>
        <div className="col-span-2 flex items-center gap-1.5 mt-0.5">
          <TrendingUp size={10} style={{ color }} className="shrink-0" />
          <span style={{ color }} className="font-medium">{formatValue(kr.current, kr.unit)}</span>
          <span className="text-slate-600">of {formatValue(kr.target, kr.unit)} target</span>
        </div>
      </div>
    </div>
  );
}

interface OKRDetailPanelProps {
  objective: Objective;
  onClose: () => void;
}

export function OKRDetailPanel({ objective, onClose }: OKRDetailPanelProps) {
  const { data } = useOKR();
  const team = data?.teams.find(t => t.id === objective.teamId);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose} />

      {/* Slide-over panel */}
      <div className="fixed right-0 top-0 h-full z-50 flex flex-col border-l border-white/[0.08] shadow-2xl"
        style={{ width: 'min(520px, 100vw)', background: 'rgba(11,22,40,0.98)', backdropFilter: 'blur(20px)' }}>

        {/* Header */}
        <div className="p-6 border-b border-white/[0.06] flex items-start gap-4 shrink-0">
          <ProgressRing
            progress={objective.progress}
            size={76}
            strokeWidth={7}
            color={progressColor(objective.progress)}
            label={`${objective.progress}%`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <StatusBadge status={objective.status} />
              {team && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: team.color + '22', color: team.color, border: `1px solid ${team.color}44` }}>
                  {team.name}
                </span>
              )}
              <span className="text-xs text-slate-600">{objective.quarter} {objective.year}</span>
            </div>
            <h2 className="text-[15px] font-semibold text-white leading-snug">{objective.title}</h2>
            <p className="text-xs text-slate-500 mt-1.5">Owner: {objective.owner}</p>
            {objective.description && (
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{objective.description}</p>
            )}
            {objective.tags && objective.tags.length > 0 && (
              <div className="flex items-center gap-1 mt-2.5 flex-wrap">
                <Tag size={10} className="text-slate-600 shrink-0" />
                {objective.tags.map(t => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded text-slate-500 border border-white/[0.06]">{t}</span>
                ))}
              </div>
            )}
          </div>
          <button onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all">
            <X size={16} />
          </button>
        </div>

        {/* KR list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Key Results · {objective.keyResults.length}
          </p>
          {objective.keyResults.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-600 text-sm">No key results defined yet.</p>
            </div>
          ) : (
            objective.keyResults.map(kr => <KRCard key={kr.id} kr={kr} />)
          )}
        </div>
      </div>
    </>
  );
}
