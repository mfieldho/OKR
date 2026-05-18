'use client';

import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, MessageSquare, GitBranch, Zap, BarChart2, TrendingUp, Table } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { AppSettings } from '@/lib/calendarSettings';

// ── Types ──────────────────────────────────────────────────────────────────

type IntegrationKey = 'slack' | 'jira' | 'github' | 'linear' | 'salesforce';

interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
  type?: string;
}

interface IntegrationDef {
  key: IntegrationKey | 'googleSheets';
  icon: React.ElementType;
  name: string;
  description: string;
  fields: FieldDef[];
}

const INTEGRATIONS: IntegrationDef[] = [
  {
    key: 'slack',
    icon: MessageSquare,
    name: 'Slack',
    description: 'Send OKR check-in reminders and status alerts to your Slack workspace.',
    fields: [
      { key: 'webhookUrl', label: 'Webhook URL', placeholder: 'https://hooks.slack.com/services/...' },
    ],
  },
  {
    key: 'jira',
    icon: Zap,
    name: 'Jira',
    description: 'Link key results to Jira epics and issues for seamless tracking.',
    fields: [
      { key: 'baseUrl',    label: 'Base URL',    placeholder: 'https://yourorg.atlassian.net' },
      { key: 'projectKey', label: 'Project Key', placeholder: 'OKR' },
      { key: 'apiKey',     label: 'API Key',     placeholder: 'ATATT3x...',  type: 'password' },
    ],
  },
  {
    key: 'github',
    icon: GitBranch,
    name: 'GitHub',
    description: 'Track engineering KRs from GitHub milestones and project boards.',
    fields: [
      { key: 'org',   label: 'Organisation', placeholder: 'form3tech' },
      { key: 'token', label: 'Personal access token', placeholder: 'ghp_...', type: 'password' },
    ],
  },
  {
    key: 'linear',
    icon: BarChart2,
    name: 'Linear',
    description: 'Sync engineering team objectives with Linear cycles and projects.',
    fields: [
      { key: 'apiKey', label: 'API Key',  placeholder: 'lin_api_...', type: 'password' },
      { key: 'teamId', label: 'Team ID',  placeholder: 'TEAM-ID' },
    ],
  },
  {
    key: 'salesforce',
    icon: TrendingUp,
    name: 'Salesforce',
    description: 'Pull commercial metrics and pipeline data directly from Salesforce.',
    fields: [
      { key: 'instanceUrl', label: 'Instance URL', placeholder: 'https://yourorg.my.salesforce.com' },
      { key: 'apiKey',      label: 'API Key',       placeholder: 'Bearer ...',  type: 'password' },
    ],
  },
  {
    key: 'googleSheets',
    icon: Table,
    name: 'Google Sheets',
    description: 'Alternative to SharePoint — sync OKR data from a Google Sheet.',
    fields: [
      { key: 'sheetId',       label: 'Sheet ID',              placeholder: '1BxiMVs0XRA...' },
      { key: 'serviceAccount', label: 'Service Account JSON', placeholder: '{"type":"service_account",...}' },
    ],
  },
];

// ── Toggle component ────────────────────────────────────────────────────────

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative w-11 h-6 rounded-full transition-all duration-200 shrink-0"
      style={{ background: enabled ? '#2acfc0' : 'rgba(255,255,255,0.12)' }}>
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200"
        style={{ left: enabled ? '1.375rem' : '0.125rem' }}
      />
    </button>
  );
}

// ── Local state for Google Sheets (not in AppSettings) ─────────────────────

interface GSState { enabled: boolean; sheetId: string; serviceAccount: string }

// ── Integration card ────────────────────────────────────────────────────────

function IntegrationCard({
  def,
  enabled,
  fieldValues,
  onToggle,
  onFieldChange,
}: {
  def: IntegrationDef;
  enabled: boolean;
  fieldValues: Record<string, string>;
  onToggle: () => void;
  onFieldChange: (key: string, value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = def.icon;

  const isConfigured = def.fields.every(f => fieldValues[f.key]?.trim());

  return (
    <div className="rounded-2xl border border-white/[0.06]" style={{ background: 'var(--card-bg)' }}>
      <div className="flex items-start gap-4 p-5">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Icon size={18} className="text-slate-300" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{def.name}</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={enabled && isConfigured
                ? { background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }
                : { background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }}>
              {enabled && isConfigured ? 'Connected' : 'Not configured'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{def.description}</p>
        </div>

        {/* Right side: toggle + expand */}
        <div className="flex items-center gap-2 shrink-0">
          <Toggle enabled={enabled} onToggle={onToggle} />
          <button
            onClick={() => setExpanded(x => !x)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#64748b' }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Config fields */}
      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-white/[0.06] pt-4">
          {def.fields.map(field => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{field.label}</label>
              <input
                type={field.type ?? 'text'}
                value={fieldValues[field.key] ?? ''}
                onChange={e => onFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 border border-white/[0.08] focus:border-white/20 focus:outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const { settings, updateSettings } = useSettings();
  const [saved, setSaved] = useState(false);
  const [gsState, setGsState] = useState<GSState>({ enabled: false, sheetId: '', serviceAccount: '' });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleIntegration = (key: IntegrationKey) => {
    updateSettings({ [key]: { ...settings[key], enabled: !settings[key].enabled } } as Partial<AppSettings>);
  };

  const updateField = (key: IntegrationKey, fieldKey: string, value: string) => {
    updateSettings({ [key]: { ...settings[key], [fieldKey]: value } } as Partial<AppSettings>);
  };

  const getFieldValues = (key: IntegrationKey): Record<string, string> => {
    const obj = settings[key] as Record<string, string | boolean>;
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'string') result[k] = v;
    }
    return result;
  };

  return (
    <div className="p-8 max-w-2xl space-y-8">
      <section className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-white">Integrations</h2>
          <p className="text-xs text-slate-500 mt-0.5">Connect your OKR platform to the tools your teams already use</p>
        </div>

        <div className="space-y-3">
          {INTEGRATIONS.map(def => {
            if (def.key === 'googleSheets') {
              return (
                <IntegrationCard
                  key="googleSheets"
                  def={def}
                  enabled={gsState.enabled}
                  fieldValues={{ sheetId: gsState.sheetId, serviceAccount: gsState.serviceAccount }}
                  onToggle={() => setGsState(s => ({ ...s, enabled: !s.enabled }))}
                  onFieldChange={(k, v) => setGsState(s => ({ ...s, [k]: v }))}
                />
              );
            }
            const intKey = def.key as IntegrationKey;
            return (
              <IntegrationCard
                key={intKey}
                def={def}
                enabled={settings[intKey].enabled}
                fieldValues={getFieldValues(intKey)}
                onToggle={() => toggleIntegration(intKey)}
                onFieldChange={(k, v) => updateField(intKey, k, v)}
              />
            );
          })}
        </div>

        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={saved
            ? { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }
            : { background: 'rgba(42,207,192,0.12)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.25)' }}>
          {saved ? <Check size={15} /> : null}
          {saved ? 'Saved!' : 'Save integration settings'}
        </button>
      </section>
    </div>
  );
}
