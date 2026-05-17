'use client';

import { Moon, Sun, Check } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import type { ColorScheme } from '@/lib/calendarSettings';

const SCHEMES: { id: ColorScheme; label: string; description: string; Icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  {
    id: 'dark',
    label: 'Dark',
    description: 'Deep navy interface — easy on the eyes in low light',
    Icon: Moon,
  },
  {
    id: 'light',
    label: 'Light',
    description: 'Clean white interface — great for bright environments',
    Icon: Sun,
  },
];

function DarkPreview() {
  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.1]" style={{ background: '#0d1a2e' }}>
      {/* mini header */}
      <div className="flex items-center gap-1.5 px-2 py-1.5" style={{ background: 'rgba(13,26,46,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ef4444' }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#f59e0b' }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10b981' }} />
        <div className="flex-1 ml-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
      </div>
      <div className="flex p-2 gap-1.5">
        {/* mini sidebar */}
        <div className="w-10 rounded-lg p-1.5 space-y-1" style={{ background: 'rgba(10,20,38,0.8)' }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="h-1.5 rounded-full" style={{ background: i === 1 ? '#2acfc0' : 'rgba(255,255,255,0.08)', width: i === 1 ? '100%' : '70%' }} />
          ))}
        </div>
        {/* mini content */}
        <div className="flex-1 space-y-1.5">
          <div className="h-8 rounded-lg p-1.5 space-y-1" style={{ background: 'rgba(14,26,50,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="h-1.5 w-3/4 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
            <div className="h-1 w-1/2 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
          </div>
          <div className="h-8 rounded-lg p-1.5 space-y-1" style={{ background: 'rgba(14,26,50,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="h-1.5 w-2/3 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
            <div className="h-1 w-2/5 rounded-full" style={{ background: 'rgba(42,207,192,0.5)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function LightPreview() {
  return (
    <div className="rounded-xl overflow-hidden border" style={{ background: '#f1f5f9', borderColor: 'rgba(0,0,0,0.1)' }}>
      {/* mini header */}
      <div className="flex items-center gap-1.5 px-2 py-1.5" style={{ background: 'rgba(255,255,255,0.95)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ef4444' }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#f59e0b' }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10b981' }} />
        <div className="flex-1 ml-1 h-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.08)' }} />
      </div>
      <div className="flex p-2 gap-1.5">
        {/* mini sidebar */}
        <div className="w-10 rounded-lg p-1.5 space-y-1" style={{ background: '#1e293b' }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="h-1.5 rounded-full" style={{ background: i === 1 ? '#2acfc0' : 'rgba(255,255,255,0.2)', width: i === 1 ? '100%' : '70%' }} />
          ))}
        </div>
        {/* mini content */}
        <div className="flex-1 space-y-1.5">
          <div className="h-8 rounded-lg p-1.5 space-y-1" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)' }}>
            <div className="h-1.5 w-3/4 rounded-full" style={{ background: 'rgba(0,0,0,0.3)' }} />
            <div className="h-1 w-1/2 rounded-full" style={{ background: 'rgba(0,0,0,0.1)' }} />
          </div>
          <div className="h-8 rounded-lg p-1.5 space-y-1" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)' }}>
            <div className="h-1.5 w-2/3 rounded-full" style={{ background: 'rgba(0,0,0,0.3)' }} />
            <div className="h-1 w-2/5 rounded-full" style={{ background: 'rgba(42,207,192,0.6)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppearancePage() {
  const { settings, updateSettings } = useSettings();
  const current = settings.colorScheme ?? 'dark';

  const select = (scheme: ColorScheme) => {
    const sidebarBg = scheme === 'light'
      ? (settings.sidebarBg === '#0d1a2e' ? '#1e293b' : settings.sidebarBg)
      : (settings.sidebarBg === '#1e293b' ? '#0d1a2e' : settings.sidebarBg);
    updateSettings({ colorScheme: scheme, sidebarBg });
  };

  return (
    <div className="p-8 max-w-2xl space-y-8">

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-white">Colour Scheme</h2>
        <p className="text-xs text-slate-500">Choose how the dashboard looks. Changes apply immediately.</p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SCHEMES.map(({ id, label, description, Icon }) => {
          const active = current === id;
          return (
            <button
              key={id}
              onClick={() => select(id)}
              className="text-left rounded-2xl border-2 p-5 transition-all duration-200 space-y-4 focus:outline-none"
              style={active
                ? { borderColor: '#2acfc0', background: 'rgba(42,207,192,0.06)' }
                : { borderColor: 'var(--border-subtle)', background: 'var(--surface-2-bg)' }}
            >
              {/* Preview */}
              {id === 'dark' ? <DarkPreview /> : <LightPreview />}

              {/* Label row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={15} className={active ? 'text-[#2acfc0]' : 'text-slate-400'} />
                  <span className="text-sm font-semibold" style={{ color: active ? '#2acfc0' : 'inherit' }}>
                    {label}
                  </span>
                </div>
                {active && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(42,207,192,0.15)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.3)' }}>
                    <Check size={9} /> Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{description}</p>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/[0.06] p-4" style={{ background: 'var(--surface-2-bg)' }}>
        <p className="text-xs text-slate-400 font-medium mb-1">Note</p>
        <p className="text-xs text-slate-500 leading-relaxed">
          The colour scheme is saved to your settings and persists across sessions. You can combine it with a custom accent colour and sidebar colour in <a href="/settings/branding" className="underline" style={{ color: '#2acfc0' }}>Branding</a>.
        </p>
      </div>
    </div>
  );
}
