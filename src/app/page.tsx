'use client';

import { Target, TrendingUp, AlertTriangle, CheckCircle2, Flame, Users, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { useOKR } from '@/contexts/OKRContext';
import { Header } from '@/components/layout/Header';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ProgressTrendChart } from '@/components/charts/ProgressTrendChart';
import { TeamComparisonChart } from '@/components/charts/TeamComparisonChart';
import { StatusDonutChart } from '@/components/charts/StatusDonutChart';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import type { Objective, Team } from '@/lib/types';

// ─── Vibrant stat card ────────────────────────────────────────────────────────

function VibrantStat({
  label, value, sub, color, gradient, icon: Icon, trend, href,
}: {
  label: string; value: number | string; sub: string;
  color: string; gradient: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  trend?: { value: number; label: string };
  href?: string;
}) {
  const inner = (
    <div className="relative rounded-2xl overflow-hidden p-5 flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: gradient, boxShadow: `0 4px 24px ${color}28, inset 0 1px 0 rgba(255,255,255,0.08)`, border: `1px solid ${color}35`, cursor: href ? 'pointer' : 'default' }}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}22, transparent 70%)`, transform: 'translate(30%, -30%)' }} />
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}25`, border: `1px solid ${color}40` }}>
          <span style={{ color }}><Icon size={18} /></span>
        </div>
        {trend && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full"
            style={{ background: 'rgba(0,0,0,0.2)', color }}>
            +{trend.value}% {trend.label}
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-black text-white tabular-nums leading-none">{value}</p>
        <p className="text-xs font-semibold mt-1" style={{ color }}>{label}</p>
        <p className="text-[11px] text-white/50 mt-0.5">{sub}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

// ─── Risk register row ────────────────────────────────────────────────────────

function RiskRow({ obj, teamColor, teamName }: { obj: Objective; teamColor: string; teamName: string }) {
  const isBehind = obj.status === 'behind';
  const accent   = isBehind ? '#ef4444' : '#f59e0b';
  return (
    <Link href="/views"
      className="flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-150 hover:-translate-y-0.5"
      style={{
        background: `linear-gradient(135deg, ${accent}0a, rgba(14,26,50,0.6))`,
        borderColor: `${accent}30`,
        boxShadow: `0 0 0 1px ${accent}15`,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${accent}55`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${accent}30`; }}
    >
      <span className="flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 uppercase tracking-wide"
        style={{ background: accent + '20', color: accent, border: `1px solid ${accent}40` }}>
        {isBehind ? <TrendingUp size={9} /> : <Zap size={9} />}
        {isBehind ? 'Behind' : 'At Risk'}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{obj.title}</p>
        {obj.description && <p className="text-[11px] text-slate-500 truncate">{obj.description}</p>}
      </div>
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 hidden sm:block"
        style={{ background: teamColor + '20', color: teamColor, border: `1px solid ${teamColor}35` }}>
        {teamName}
      </span>
      <div className="w-28 shrink-0 hidden md:block">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-slate-500">Progress</span>
          <span className="text-[11px] font-bold" style={{ color: accent }}>{obj.progress}%</span>
        </div>
        <ProgressBar progress={obj.progress} color={accent} height={4} />
      </div>
    </Link>
  );
}

// ─── Vivid team card ──────────────────────────────────────────────────────────

function VividTeamCard({ team }: { team: Team }) {
  const onTrack = team.objectives.filter(o => o.status === 'on-track' || o.status === 'completed').length;
  const atRisk  = team.objectives.filter(o => o.status === 'at-risk' || o.status === 'behind').length;
  return (
    <Link href={`/teams/${team.id}`}
      className="group relative rounded-2xl overflow-hidden border transition-all duration-200 hover:-translate-y-1 flex flex-col"
      style={{
        background: `linear-gradient(145deg, ${team.color}12, ${team.color}06, rgba(10,20,40,0.8))`,
        borderColor: `${team.color}28`,
        boxShadow: `0 4px 20px ${team.color}10`,
      }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${team.color}, ${team.color}55)` }} />
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
        style={{ background: `radial-gradient(circle at 80% 20%, ${team.color}16, transparent 65%)` }} />
      <div className="p-5 flex flex-col gap-3 relative">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${team.color}20`, border: `1px solid ${team.color}35` }}>
            <span style={{ color: team.color }}><Users size={18} /></span>
          </div>
          <ArrowRight size={15} className="text-slate-600 group-hover:text-slate-300 transition-colors group-hover:translate-x-0.5 duration-200" />
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-tight">{team.name}</p>
          <p className="text-xs mt-0.5" style={{ color: team.color + 'bb' }}>{team.lead}</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500">{team.memberCount} members</span>
            <span className="text-sm font-black" style={{ color: team.color }}>{team.progress}%</span>
          </div>
          <ProgressBar progress={team.progress} color={team.color} height={5} />
        </div>
        <div className="flex items-center gap-2 text-[11px] flex-wrap">
          <span className="text-slate-500">{team.objectives.length} OKRs</span>
          <span className="text-slate-700">·</span>
          <span style={{ color: '#10b981' }}>{onTrack} on track</span>
          {atRisk > 0 && (
            <>
              <span className="text-slate-700">·</span>
              <span style={{ color: '#f59e0b' }}>{atRisk} at risk</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CompanyDashboard() {
  const { data, loading, error } = useOKR();

  if (loading) return (
    <div className="flex-1">
      <div className="h-[73px] border-b border-white/[0.06]" style={{ background: 'rgba(13,26,46,0.90)' }} />
      <LoadingSkeleton />
    </div>
  );

  if (error) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 font-medium">{error}</p>
        <p className="text-slate-500 text-sm mt-1">Check your SharePoint configuration in Settings.</p>
      </div>
    </div>
  );

  if (!data) return null;

  const onTrackCount = data.objectives.filter(o => o.status === 'on-track' || o.status === 'completed').length;
  const atRiskCount  = data.objectives.filter(o => o.status === 'at-risk').length;
  const behindCount  = data.objectives.filter(o => o.status === 'behind').length;
  const riskItems    = data.objectives.filter(o => o.status === 'at-risk' || o.status === 'behind');
  const teamById     = Object.fromEntries(data.teams.map(t => [t.id, t]));

  return (
    <div className="flex-1 fade-in">
      <Header
        title="Company OKRs"
        subtitle={`${data.quarter} ${data.year} · ${data.objectives.length} objectives across ${data.teams.length} teams`}
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-8">

        {/* ── Hero ── */}
        <div className="flex flex-col sm:flex-row items-stretch gap-5">
          <Link href="/views"
            className="rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shrink-0 w-full sm:w-auto transition-all duration-200 hover:-translate-y-0.5 group"
            style={{
              background: 'linear-gradient(145deg, rgba(42,207,192,0.1), rgba(14,28,54,0.95))',
              border: '1px solid rgba(42,207,192,0.2)',
              boxShadow: '0 8px 32px rgba(42,207,192,0.1)',
              minWidth: 190,
            }}>
            <ProgressRing progress={data.overallProgress} size={148} strokeWidth={12} label="Overall" sublabel={`${data.quarter} ${data.year}`} />
            <p className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">View all OKRs →</p>
          </Link>

          <div className="grid grid-cols-2 gap-3 flex-1">
            <VibrantStat label="Total Objectives" value={data.objectives.length}
              sub={`Across ${data.teams.length} teams`} color="#2acfc0"
              gradient="linear-gradient(135deg, rgba(42,207,192,0.14), rgba(14,28,54,0.9))"
              icon={Target} trend={{ value: 12, label: 'vs Q1' }} href="/views" />
            <VibrantStat label="On Track" value={onTrackCount}
              sub={`${Math.round((onTrackCount / Math.max(data.objectives.length, 1)) * 100)}% of objectives`}
              color="#10b981"
              gradient="linear-gradient(135deg, rgba(16,185,129,0.14), rgba(14,28,54,0.9))"
              icon={CheckCircle2} href="/views" />
            <VibrantStat label="At Risk" value={atRiskCount} sub="Need attention now"
              color="#f59e0b"
              gradient="linear-gradient(135deg, rgba(245,158,11,0.14), rgba(14,28,54,0.9))"
              icon={AlertTriangle} href="/views" />
            <VibrantStat label="Behind" value={behindCount} sub="Require escalation"
              color="#ef4444"
              gradient="linear-gradient(135deg, rgba(239,68,68,0.14), rgba(14,28,54,0.9))"
              icon={TrendingUp} href="/views" />
          </div>
        </div>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2"><ProgressTrendChart /></div>
          <StatusDonutChart objectives={data.objectives} />
        </div>

        {/* ── Risk register ── */}
        {riskItems.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.15))', border: '1px solid rgba(245,158,11,0.3)' }}>
                <Flame size={15} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Risk Register</h2>
                <p className="text-xs text-slate-500">Objectives needing immediate attention</p>
              </div>
              <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                {riskItems.length} items
              </span>
            </div>
            <div className="space-y-2">
              {riskItems.map(obj => {
                const team = teamById[obj.teamId];
                return <RiskRow key={obj.id} obj={obj} teamColor={team?.color ?? '#64748b'} teamName={team?.name ?? 'Unknown'} />;
              })}
            </div>
          </section>
        )}

        {/* ── Teams ── */}
        <section>
          <div className="mb-4">
            <h2 className="text-base font-bold text-white">Teams</h2>
            <p className="text-xs text-slate-500 mt-0.5">Click a team to drill into their objectives</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
            {data.teams.map(team => <VividTeamCard key={team.id} team={team} />)}
          </div>
        </section>

        {/* ── Team comparison ── */}
        <TeamComparisonChart teams={data.teams} />

      </div>
    </div>
  );
}
