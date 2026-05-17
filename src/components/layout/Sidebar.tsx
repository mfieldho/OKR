'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, User, TrendingUp, Settings,
  RefreshCw, Wifi, WifiOff, X, Layers, LogOut,
} from 'lucide-react';
import { useOKR } from '@/contexts/OKRContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Form3Logo } from '@/components/ui/Form3Logo';

const nav = [
  { href: '/',            label: 'Company',     icon: LayoutDashboard },
  { href: '/views',       label: 'Views',       icon: Layers          },
  { href: '/teams',       label: 'Teams',       icon: Users           },
  { href: '/individuals', label: 'Individuals', icon: User            },
  { href: '/trends',      label: 'Trends',      icon: TrendingUp      },
  { href: '/settings',    label: 'Settings',    icon: Settings        },
];


export function Sidebar() {
  const pathname = usePathname();
  const { data, loading, isUsingLiveData, refresh } = useOKR();
  const { dataSource } = useSettings();
  const { open, close } = useSidebar();
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'w-60 shrink-0 flex flex-col h-screen border-r border-white/[0.06]',
          'transition-transform duration-300 ease-in-out',
          'lg:sticky lg:top-0 lg:translate-x-0',
          'fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        style={{ background: 'rgba(13,26,46,0.97)', backdropFilter: 'blur(12px)' }}
      >
        {/* Logo + close button (mobile) */}
        <div className="px-5 pt-6 pb-5 border-b border-white/[0.06] flex items-start justify-between shrink-0">
          <div>
            <Form3Logo height={24} />
            <p className="text-slate-500 text-xs mt-2">OKR Platform</p>
          </div>
          <button
            onClick={close}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors mt-0.5"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Quarter badge */}
        {data && (
          <div className="px-5 py-3 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Current cycle</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(42,207,192,0.12)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.2)' }}
              >
                {data.quarter} {data.year}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">Navigate</p>
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  active ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]',
                )}
                style={active ? { background: 'rgba(42,207,192,0.1)', color: '#2acfc0', boxShadow: 'inset 0 0 0 1px rgba(42,207,192,0.15)' } : {}}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>


        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/[0.06] shrink-0 space-y-3">
          <div className="flex items-center gap-2 px-1">
            {dataSource === 'supabase' ? (
              <Wifi size={12} className="text-emerald-400" />
            ) : (
              <WifiOff size={12} className="text-slate-500" />
            )}
            <span className="text-xs text-slate-500">
              {dataSource === 'supabase'
                ? 'Supabase'
                : isUsingLiveData
                  ? 'Live — SharePoint'
                  : 'Demo data'}
            </span>
            <button
              onClick={refresh}
              disabled={loading}
              className="ml-auto text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-1 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-colors"
          >
            <LogOut size={12} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
