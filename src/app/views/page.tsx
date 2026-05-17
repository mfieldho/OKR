'use client';

import { useOKR } from '@/contexts/OKRContext';
import { Header } from '@/components/layout/Header';
import { OKRViewSwitcher } from '@/components/okr/OKRViewSwitcher';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export default function ViewsPage() {
  const { data, loading, error } = useOKR();

  if (loading) return (
    <div className="flex-1">
      <div className="h-[57px] border-b border-white/[0.06]" style={{ background: 'rgba(13,26,46,0.90)' }} />
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
      <div className="p-4 sm:p-6 lg:p-8">
        <OKRViewSwitcher objectives={data.objectives} />
      </div>
    </div>
  );
}
