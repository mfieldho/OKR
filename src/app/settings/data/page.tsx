'use client';

import { useState } from 'react';
import { Save, Check, ExternalLink } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

export default function DataConnectionPage() {
  const { settings, updateSettings } = useSettings();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({ ...settings.sharePoint });

  const handleSave = () => {
    updateSettings({ sharePoint: { ...form } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const spField = (label: string, key: keyof typeof form, placeholder: string, hint?: string) => (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      <input
        type="text"
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 border border-white/[0.08] focus:border-white/20 focus:outline-none transition-colors"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      />
      {hint && <p className="text-xs text-slate-600 mt-1">{hint}</p>}
    </div>
  );

  return (
    <div className="p-8 max-w-2xl space-y-8">
      <section className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-white">Data Connection</h2>
          <p className="text-xs text-slate-500 mt-0.5">Connect to your OKR spreadsheet on SharePoint / OneDrive</p>
        </div>

        {/* Info card */}
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

        {/* Azure AD */}
        <div className="rounded-2xl border border-white/[0.06] p-5 space-y-4" style={{ background: 'var(--card-bg)' }}>
          <p className="text-sm font-semibold text-white">Azure AD / Microsoft 365</p>
          {spField('Tenant ID', 'tenantId', 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')}
          {spField('Client ID (Application ID)', 'clientId', 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')}
        </div>

        {/* SharePoint file */}
        <div className="rounded-2xl border border-white/[0.06] p-5 space-y-4" style={{ background: 'var(--card-bg)' }}>
          <p className="text-sm font-semibold text-white">SharePoint / OneDrive File</p>
          {spField('SharePoint Site URL', 'siteUrl', 'https://form3.sharepoint.com/sites/okr', 'The site where your Excel file lives')}
          {spField('Table name in Excel', 'listName', 'OKRTable')}
          {spField('Drive ID (optional)', 'driveId', '', 'Leave blank to auto-discover')}
          {spField('File ID (optional)', 'fileId', '', 'Leave blank to auto-discover')}
        </div>

        {/* Generated env */}
        <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: 'var(--card-bg)' }}>
          <p className="text-sm font-semibold text-white mb-3">Generated .env.local</p>
          <pre className="text-xs text-teal-400 leading-relaxed overflow-x-auto p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
{`NEXT_PUBLIC_AZURE_TENANT_ID=${form.tenantId || '<your-tenant-id>'}
NEXT_PUBLIC_AZURE_CLIENT_ID=${form.clientId || '<your-client-id>'}
NEXT_PUBLIC_SHAREPOINT_SITE_URL=${form.siteUrl || '<your-site-url>'}
NEXT_PUBLIC_SHAREPOINT_LIST_NAME=${form.listName}
NEXT_PUBLIC_SHAREPOINT_DRIVE_ID=${form.driveId || ''}
NEXT_PUBLIC_SHAREPOINT_FILE_ID=${form.fileId || ''}`}
          </pre>
        </div>

        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={saved
            ? { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }
            : { background: 'rgba(42,207,192,0.12)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.25)' }}>
          {saved ? <Check size={15} /> : <Save size={15} />}
          {saved ? 'Saved!' : 'Save data settings'}
        </button>
      </section>
    </div>
  );
}
