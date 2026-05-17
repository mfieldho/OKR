'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  User,
  TrendingUp,
  Settings,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useOKR } from '@/contexts/OKRContext';
import { cn } from '@/lib/utils';
import { Form3Logo } from '@/components/ui/Form3Logo';

const nav = [
  { href: '/', label: 'Company', icon: LayoutDashboard },
  { href: '/teams', label: 'Teams', icon: Users },
  { href: '/individuals', label: 'Individuals', icon: User },
  { href: '/trends', label: 'Trends', icon: TrendingUp },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data, loading, isUsingLiveData, refresh } = useOKR();

  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen sticky top-0 border-r border-white/[0.06]"
      style={{ background: 'rgba(13,26,46,0.97)', backdropFilter: 'blur(12px)' }}>

      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-white/[0.06]">
        <Form3Logo height={24} />
        <p className="text-slate-500 text-xs mt-2">OKR Platform</p>
      </div>

      {/* Quarter badge */}
      {data && (
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Current cycle</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(42,207,192,0.12)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.2)' }}>
              {data.quarter} {data.year}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              )}
              style={active ? { background: 'rgba(42,207,192,0.1)', color: '#2acfc0', boxShadow: 'inset 0 0 0 1px rgba(42,207,192,0.15)' } : {}}>
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/[0.06] space-y-2">
        <div className="flex items-center gap-2 px-1">
          {isUsingLiveData ? (
            <Wifi size={12} className="text-emerald-400" />
          ) : (
            <WifiOff size={12} className="text-slate-500" />
          )}
          <span className="text-xs text-slate-500">
            {isUsingLiveData ? 'Live — SharePoint' : 'Demo data'}
          </span>
          <button onClick={refresh} disabled={loading}
            className="ml-auto text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
    </aside>
  );
}
