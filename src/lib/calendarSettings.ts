export type YearType = 'calendar' | 'financial';
export type YearDisplayFormat = 'full' | 'short' | 'range';

export interface TeamDef {
  id: string;
  name: string;
  lead: string;
  color: string;
  memberCount: number;
  description: string;
}

export interface AppSettings {
  // Calendar
  yearType: YearType;
  fyStartMonth: number; // 1–12; default 4 (April) for UK
  yearDisplayFormat: YearDisplayFormat;

  // Branding
  companyName: string;
  accentColor: string;   // hex, default '#2acfc0'
  sidebarBg: string;     // hex, default '#0d1a2e'

  // OKR config
  okrScoring: 'percentage' | 'binary';
  checkInFrequency: 'weekly' | 'biweekly' | 'monthly';
  gradeGreen: number;    // 0–1, default 0.7
  gradeYellow: number;   // 0–1, default 0.4
  showConfidence: boolean;

  // Teams (replaces hardcoded teamDefs in mockData)
  teams: TeamDef[];

  // Integrations
  slack: { enabled: boolean; webhookUrl: string };
  jira: { enabled: boolean; baseUrl: string; projectKey: string; apiKey: string };
  github: { enabled: boolean; org: string; token: string };
  linear: { enabled: boolean; apiKey: string; teamId: string };
  salesforce: { enabled: boolean; instanceUrl: string; apiKey: string };

  // SharePoint / data
  sharePoint: {
    tenantId: string;
    clientId: string;
    siteUrl: string;
    listName: string;
    driveId: string;
    fileId: string;
  };

  // Custom OKR data — null means use built-in demo data
  customObjectives: Record<string, import('./types').Objective[]> | null;
}

export const DEFAULT_SETTINGS: AppSettings = {
  yearType: 'financial',
  fyStartMonth: 4, // April — standard UK fiscal year
  yearDisplayFormat: 'short', // FY26

  companyName: 'Form3',
  accentColor: '#2acfc0',
  sidebarBg: '#0d1a2e',

  okrScoring: 'percentage',
  checkInFrequency: 'biweekly',
  gradeGreen: 0.7,
  gradeYellow: 0.4,
  showConfidence: true,

  teams: [
    { id: 'platform',    name: 'Platform & Infrastructure', lead: 'Sarah Mitchell', color: '#6366f1', memberCount: 18, description: 'Core infrastructure, reliability, and platform engineering' },
    { id: 'product',     name: 'Product',                   lead: 'Marcus Webb',    color: '#06b6d4', memberCount: 12, description: 'Product strategy, roadmap, and payment scheme expansion' },
    { id: 'commercial',  name: 'Commercial',                lead: 'Priya Sharma',   color: '#10b981', memberCount: 22, description: 'Sales, partnerships, and revenue growth' },
    { id: 'engineering', name: 'Engineering',               lead: 'Alex Torres',    color: '#f59e0b', memberCount: 35, description: 'Developer experience, SDK, and technical delivery' },
    { id: 'risk',        name: 'Risk & Compliance',         lead: 'Nina Okonkwo',   color: '#ef4444', memberCount: 9,  description: 'Regulatory compliance, risk management, and fraud prevention' },
  ],

  slack:       { enabled: false, webhookUrl: '' },
  jira:        { enabled: false, baseUrl: '', projectKey: '', apiKey: '' },
  github:      { enabled: false, org: '', token: '' },
  linear:      { enabled: false, apiKey: '', teamId: '' },
  salesforce:  { enabled: false, instanceUrl: '', apiKey: '' },

  sharePoint: {
    tenantId: process.env.NEXT_PUBLIC_AZURE_TENANT_ID ?? '',
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID ?? '',
    siteUrl:  process.env.NEXT_PUBLIC_SHAREPOINT_SITE_URL ?? '',
    listName: process.env.NEXT_PUBLIC_SHAREPOINT_LIST_NAME ?? 'OKRTable',
    driveId:  process.env.NEXT_PUBLIC_SHAREPOINT_DRIVE_ID ?? '',
    fileId:   process.env.NEXT_PUBLIC_SHAREPOINT_FILE_ID ?? '',
  },

  customObjectives: null,
};

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Calendar months (1-based) covered by a given quarter under these settings */
export function quarterMonths(quarter: 1 | 2 | 3 | 4, settings: AppSettings): [number, number, number] {
  const start = settings.yearType === 'financial' ? settings.fyStartMonth : 1;
  return [1, 2, 3].map(offset => ((start - 1 + (quarter - 1) * 3 + (offset - 1)) % 12) + 1) as [number, number, number];
}

/** Short label for a quarter pill, e.g. "Q1  Apr–Jun" */
export function quarterLabel(quarter: 1 | 2 | 3 | 4, settings: AppSettings): { q: string; range: string } {
  const months = quarterMonths(quarter, settings);
  return {
    q: `Q${quarter}`,
    range: `${MONTH_SHORT[months[0] - 1]}–${MONTH_SHORT[months[2] - 1]}`,
  };
}

/** Display label for the year, e.g. "FY26", "FY2026", "2025/26", "2026" */
export function yearLabel(year: number, settings: AppSettings): string {
  if (settings.yearType === 'calendar') return String(year);
  const short2 = String(year).slice(-2);
  switch (settings.yearDisplayFormat) {
    case 'full': return `FY${year}`;
    case 'short': return `FY${short2}`;
    case 'range': return `${year - 1}/${short2}`;
    default: return `FY${short2}`;
  }
}

/** Returns the current Quarter based on today's date and calendar settings */
export function currentQuarter(settings: AppSettings): import('./types').Quarter {
  const month = new Date().getMonth() + 1; // 1-based
  for (const q of [1, 2, 3, 4] as const) {
    if (quarterMonths(q, settings).includes(month as 1|2|3|4|5|6|7|8|9|10|11|12)) {
      return `Q${q}` as import('./types').Quarter;
    }
  }
  return 'Q1';
}

export const MONTH_NAMES = MONTH_SHORT;

export const MONTH_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
