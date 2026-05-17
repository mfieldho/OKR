'use client';

import { useState } from 'react';
import { Save, ExternalLink, Check, Calendar, TrendingUp } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useSettings } from '@/contexts/SettingsContext';
import { YearType, YearDisplayFormat, MONTH_FULL, yearLabel, quarterLabel } from '@/lib/calendarSettings';

const CURRENT_YEAR = new Date().getFullYear();

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [spSaved, setSpSaved] = useState(false);
  const [yearSaved, setYearSaved] = useState(false);

  const [spForm, setSpForm] = useState({
    tenantId: process.env.NEXT_PUBLIC_AZURE_TENANT_ID ?? '',
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID ?? '',
    siteUrl: process.env.NEXT_PUBLIC_SHAREPOINT_SITE_URL ?? '',
    listName: process.env.NEXT_PUBLIC_SHAREPOINT_LIST_NAME ?? 'OKRTable',
    driveId: process.env.NEXT_PUBLIC_SHAREPOINT_DRIVE_ID ?? '',
    fileId: process.env.NEXT_PUBLIC_SHAREPOINT_FILE_ID ?? '',
  });

  const handleYearSave = () => {
    setYearSaved(true);
    setTimeout(() => setYearSaved(false), 2000);
  };

  const spField = (label: string, key: keyof typeof spForm, placeholder: string, hint?: string) => (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      <input
        type="text"
        value={spForm[key]}
        onChange={e => setSpForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 border border-white/[0.08] focus:border-white/20 focus:outline-none transition-colors"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      />
      {hint && <p className="text-xs text-slate-600 mt-1">{hint}</p>}
    </div>
  );

  const optionBtn = (active: boolean, onClick: () => void, children: React.ReactNode) => (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 w-full text-left"
      style={active
        ? { background: 'rgba(42,207,192,0.1)', border: '1px solid rgba(42,207,192,0.3)', color: '#2acfc0' }
        : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#94a3b8' }}>
      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
        style={{ borderColor: active ? '#2acfc0' : '#334155' }}>
        {active && <div className="w-1.5 h-1.5 rounded-full bg-[#2acfc0]" />}
      </div>
      {children}
    </button>
  );

  // Live preview of all 4 quarters
  const previewQuarters = ([1, 2, 3, 4] as const).map(q => quarterLabel(q, settings));
  const previewYear = yearLabel(CURRENT_YEAR, settings);

  return (
    <div className="flex-1 fade-in">
      <Header title="Settings" subtitle="Reporting calendar, branding & data connection" />

      <div className="p-8 max-w-2xl space-y-8">

        {/* ── Year & Calendar Design ── */}
        <section className="space-y-5">
          <div>
            <h2 className="text-base font-semibold text-white">Year & Calendar Design</h2>
            <p className="text-xs text-slate-500 mt-0.5">Controls how quarters and years are labelled across the dashboard</p>
          </div>

          {/* Year type */}
          <div className="rounded-2xl border border-white/[0.06] p-5 space-y-4" style={{ background: 'rgba(30,45,76,0.5)' }}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Year type</p>
            <div className="grid grid-cols-2 gap-3">
              {optionBtn(settings.yearType === 'calendar', () => updateSettings({ yearType: 'calendar' }),
                <div>
                  <div className="flex items-center gap-1.5"><Calendar size={13} />Calendar Year</div>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">Jan – Dec · Q1 starts January</p>
                </div>
              )}
              {optionBtn(settings.yearType === 'financial', () => updateSettings({ yearType: 'financial' }),
                <div>
                  <div className="flex items-center gap-1.5"><TrendingUp size={13} />Financial Year</div>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">Custom start month · FY labelling</p>
                </div>
              )}
            </div>
          </div>

          {/* FY start month — only shown for financial year */}
          {settings.yearType === 'financial' && (
            <div className="rounded-2xl border border-white/[0.06] p-5 space-y-4" style={{ background: 'rgba(30,45,76,0.5)' }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Financial year start month</p>
              <div className="grid grid-cols-4 gap-2">
                {MONTH_FULL.map((month, idx) => {
                  const m = idx + 1;
                  const active = settings.fyStartMonth === m;
                  return (
                    <button key={m} onClick={() => updateSettings({ fyStartMonth: m })}
                      className="py-2 px-3 rounded-xl text-xs font-medium transition-all duration-150 border"
                      style={active
                        ? { background: 'rgba(42,207,192,0.12)', border: '1px solid rgba(42,207,192,0.3)', color: '#2acfc0' }
                        : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#64748b' }}>
                      {active && <Check size={10} className="inline mr-1 -mt-0.5" />}
                      {month.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500">
                Q1 will start in <span className="text-slate-300">{MONTH_FULL[settings.fyStartMonth - 1]}</span>.
                Common: Apr (UK), Jan (US/Global), Jul (Australia), Oct (US Federal).
              </p>
            </div>
          )}

          {/* Year display format — only for FY */}
          {settings.yearType === 'financial' && (
            <div className="rounded-2xl border border-white/[0.06] p-5 space-y-4" style={{ background: 'rgba(30,45,76,0.5)' }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Year label format</p>
              <div className="grid grid-cols-3 gap-3">
                {([
                  ['full', `FY${CURRENT_YEAR}`, 'Full year with FY prefix'],
                  ['short', `FY${String(CURRENT_YEAR).slice(-2)}`, 'Short year with FY prefix'],
                  ['range', `${CURRENT_YEAR - 1}/${String(CURRENT_YEAR).slice(-2)}`, 'Year range (e.g. 2025/26)'],
                ] as [YearDisplayFormat, string, string][]).map(([fmt, example, hint]) => (
                  optionBtn(settings.yearDisplayFormat === fmt, () => updateSettings({ yearDisplayFormat: fmt }),
                    <div>
                      <span className="font-semibold">{example}</span>
                      <p className="text-xs text-slate-500 font-normal mt-0.5">{hint}</p>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Live preview */}
          <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: 'rgba(30,45,76,0.5)' }}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Live preview</p>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-300">{previewYear}</span>
              <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                {previewQuarters.map(({ q, range }, i) => (
                  <div key={i}
                    className="flex flex-col items-center px-3 py-1 rounded-md"
                    style={i === 1
                      ? { background: 'rgba(42,207,192,0.15)', boxShadow: 'inset 0 0 0 1px rgba(42,207,192,0.25)' }
                      : {}}>
                    <span className="text-xs font-semibold leading-none"
                      style={{ color: i === 1 ? '#2acfc0' : '#64748b' }}>{q}</span>
                    <span className="text-[9px] leading-none mt-0.5"
                      style={{ color: i === 1 ? 'rgba(42,207,192,0.7)' : '#374151' }}>{range}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-3">This is exactly how the header quarter switcher will look.</p>
          </div>

          <button onClick={handleYearSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={yearSaved
              ? { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }
              : { background: 'rgba(42,207,192,0.12)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.25)' }}>
            {yearSaved ? <Check size={15} /> : <Save size={15} />}
            {yearSaved ? 'Saved!' : 'Save calendar settings'}
          </button>
        </section>

        {/* Divider */}
        <div className="border-t border-white/[0.06]" />

        {/* ── SharePoint Connection ── */}
        <section className="space-y-5">
          <div>
            <h2 className="text-base font-semibold text-white">Data Connection</h2>
            <p className="text-xs text-slate-500 mt-0.5">Connect to your OKR spreadsheet on SharePoint / OneDrive</p>
          </div>

          <div className="rounded-2xl border border-blue-500/20 p-4 text-sm"
            style={{ background: 'rgba(59,130,246,0.06)' }}>
            <p className="text-blue-400 font-medium mb-1">How to connect your OneDrive spreadsheet</p>
            <ol className="text-slate-400 space-y-1 text-xs list-decimal list-inside">
              <li>Register an Azure AD app with <strong className="text-slate-300">Sites.Read.All</strong> and <strong className="text-slate-300">Files.Read.All</strong> permissions</li>
              <li>Create a named table called <strong className="text-slate-300">OKRTable</strong> in your Excel file</li>
              <li>Columns: Objective, KeyResult, Owner, Team, Target, CurrentValue, DueDate, Status, Quarter, Year, Unit</li>
              <li>Paste the values below into <code className="text-teal-400">.env.local</code> and redeploy</li>
            </ol>
            <a href="https://learn.microsoft.com/en-us/graph/api/table-list-rows"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs mt-2 transition-colors">
              Microsoft Graph Table Rows API <ExternalLink size={11} />
            </a>
          </div>

          <div className="rounded-2xl border border-white/[0.06] p-5 space-y-4" style={{ background: 'rgba(30,45,76,0.5)' }}>
            <p className="text-sm font-semibold text-white">Azure AD / Microsoft 365</p>
            {spField('Tenant ID', 'tenantId', 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')}
            {spField('Client ID (Application ID)', 'clientId', 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')}
          </div>

          <div className="rounded-2xl border border-white/[0.06] p-5 space-y-4" style={{ background: 'rgba(30,45,76,0.5)' }}>
            <p className="text-sm font-semibold text-white">SharePoint / OneDrive File</p>
            {spField('SharePoint Site URL', 'siteUrl', 'https://form3.sharepoint.com/sites/okr', 'The site where your Excel file lives')}
            {spField('Table name in Excel', 'listName', 'OKRTable')}
            {spField('Drive ID (optional)', 'driveId', '', 'Leave blank to auto-discover')}
            {spField('File ID (optional)', 'fileId', '', 'Leave blank to auto-discover')}
          </div>

          <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: 'rgba(30,45,76,0.5)' }}>
            <p className="text-sm font-semibold text-white mb-3">Generated .env.local</p>
            <pre className="text-xs text-teal-400 leading-relaxed overflow-x-auto p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
{`NEXT_PUBLIC_AZURE_TENANT_ID=${spForm.tenantId || '<your-tenant-id>'}
NEXT_PUBLIC_AZURE_CLIENT_ID=${spForm.clientId || '<your-client-id>'}
NEXT_PUBLIC_SHAREPOINT_SITE_URL=${spForm.siteUrl || '<your-site-url>'}
NEXT_PUBLIC_SHAREPOINT_LIST_NAME=${spForm.listName}
NEXT_PUBLIC_SHAREPOINT_DRIVE_ID=${spForm.driveId || ''}
NEXT_PUBLIC_SHAREPOINT_FILE_ID=${spForm.fileId || ''}`}
            </pre>
          </div>

          <button onClick={() => { setSpSaved(true); setTimeout(() => setSpSaved(false), 2000); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={spSaved
              ? { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }
              : { background: 'rgba(42,207,192,0.12)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.25)' }}>
            {spSaved ? <Check size={15} /> : <Save size={15} />}
            {spSaved ? 'Copied!' : 'Copy .env.local values'}
          </button>
        </section>

      </div>
    </div>
  );
}
