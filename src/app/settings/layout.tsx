'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Palette, Calendar, Users, Target, Plug, Database, ListTodo } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/settings/branding',     label: 'Branding',        icon: Palette   },
  { href: '/settings/calendar',     label: 'Calendar',        icon: Calendar  },
  { href: '/settings/teams',        label: 'Teams',           icon: Users     },
  { href: '/settings/objectives',   label: 'Objectives',      icon: ListTodo  },
  { href: '/settings/okrs',         label: 'OKR Config',      icon: Target    },
  { href: '/settings/integrations', label: 'Integrations',    icon: Plug      },
  { href: '/settings/data',         label: 'Data Connection', icon: Database  },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex-1 flex flex-col min-h-0 fade-in">
      <Header title="Settings" subtitle="Manage branding, calendar, teams & integrations" />

      <div className="flex flex-1 overflow-hidden">
        {/* Secondary left nav */}
        <nav className="w-52 shrink-0 border-r border-white/[0.06] overflow-y-auto py-4 px-2"
          style={{ background: 'rgba(13,26,46,0.6)' }}>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Settings</p>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
                    style={active
                      ? { background: 'rgba(42,207,192,0.12)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.3)' }
                      : { color: '#94a3b8' }}>
                    <Icon size={15} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
