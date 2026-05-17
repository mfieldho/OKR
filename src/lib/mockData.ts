import { Objective, Team, Individual } from './types';

// ─── Q1 2026 (completed) ───────────────────────────────────────────────────

export const q1Objectives: Objective[] = [
  {
    id: 'q1-obj-1',
    title: 'Migrate core payment engine to cloud-native architecture',
    owner: 'Sarah Mitchell',
    teamId: 'platform',
    quarter: 'Q1',
    year: 2026,
    status: 'completed',
    progress: 100,
    tags: ['platform', 'infrastructure'],
    keyResults: [
      { id: 'q1-kr-1-1', title: 'Migrate 100% of services to Kubernetes', owner: 'James Chen', target: 100, current: 100, unit: '%', dueDate: '2026-03-31', status: 'completed', progress: 100, lastUpdated: '2026-03-28' },
      { id: 'q1-kr-1-2', title: 'Achieve zero-downtime migration for all clients', owner: 'Sarah Mitchell', target: 1, current: 1, unit: 'milestone', dueDate: '2026-03-31', status: 'completed', progress: 100, lastUpdated: '2026-03-30' },
      { id: 'q1-kr-1-3', title: 'Reduce infrastructure cost by 20%', owner: 'DevOps Team', target: 20, current: 23, unit: '%', dueDate: '2026-03-31', status: 'completed', progress: 100, lastUpdated: '2026-03-31' },
    ],
  },
  {
    id: 'q1-obj-2',
    title: 'Launch Form3 developer portal v2',
    owner: 'Alex Torres',
    teamId: 'engineering',
    quarter: 'Q1',
    year: 2026,
    status: 'completed',
    progress: 94,
    tags: ['developer-experience'],
    keyResults: [
      { id: 'q1-kr-2-1', title: 'Publish 15 API reference guides', owner: 'Docs Team', target: 15, current: 15, unit: 'guides', dueDate: '2026-03-31', status: 'completed', progress: 100, lastUpdated: '2026-03-25' },
      { id: 'q1-kr-2-2', title: 'Onboard 50 sandbox users', owner: 'DX Team', target: 50, current: 47, unit: 'users', dueDate: '2026-03-31', status: 'completed', progress: 94, lastUpdated: '2026-03-31' },
    ],
  },
  {
    id: 'q1-obj-3',
    title: 'Close £8M in new ARR from enterprise pipeline',
    owner: 'Priya Sharma',
    teamId: 'commercial',
    quarter: 'Q1',
    year: 2026,
    status: 'completed',
    progress: 88,
    tags: ['revenue'],
    keyResults: [
      { id: 'q1-kr-3-1', title: 'Close 3 Tier-1 enterprise deals', owner: 'Priya Sharma', target: 3, current: 3, unit: 'deals', dueDate: '2026-03-31', status: 'completed', progress: 100, lastUpdated: '2026-03-28' },
      { id: 'q1-kr-3-2', title: 'Achieve £8M new ACV', owner: 'Sales Team', target: 8000000, current: 7040000, unit: '£', dueDate: '2026-03-31', status: 'completed', progress: 88, lastUpdated: '2026-03-31' },
    ],
  },
  {
    id: 'q1-obj-4',
    title: 'Obtain PCI DSS Level 1 recertification',
    owner: 'Nina Okonkwo',
    teamId: 'risk',
    quarter: 'Q1',
    year: 2026,
    status: 'completed',
    progress: 100,
    tags: ['compliance'],
    keyResults: [
      { id: 'q1-kr-4-1', title: 'Complete all 12 PCI audit controls', owner: 'Risk Team', target: 12, current: 12, unit: 'controls', dueDate: '2026-03-31', status: 'completed', progress: 100, lastUpdated: '2026-03-20' },
      { id: 'q1-kr-4-2', title: 'Zero critical findings in external audit', owner: 'Nina Okonkwo', target: 0, current: 0, unit: 'findings', dueDate: '2026-03-31', status: 'completed', progress: 100, lastUpdated: '2026-03-22' },
    ],
  },
];

// ─── Q2 2026 (current, in-progress) ───────────────────────────────────────

export const q2Objectives: Objective[] = [
  {
    id: 'obj-1',
    title: 'Achieve 99.99% platform uptime across all payment rails',
    description: 'Ensure Form3 infrastructure delivers enterprise-grade reliability',
    owner: 'Sarah Mitchell',
    teamId: 'platform',
    quarter: 'Q2',
    year: 2026,
    status: 'on-track',
    progress: 78,
    tags: ['reliability', 'platform'],
    keyResults: [
      { id: 'kr-1-1', title: 'Reduce P1 incidents to fewer than 3 per quarter', owner: 'James Chen', target: 3, current: 1, unit: 'incidents', dueDate: '2026-06-30', status: 'on-track', progress: 85, lastUpdated: '2026-05-14' },
      { id: 'kr-1-2', title: 'Achieve 99.99% SLA across all payment schemes', owner: 'Sarah Mitchell', target: 99.99, current: 99.97, unit: '%', dueDate: '2026-06-30', status: 'at-risk', progress: 65, lastUpdated: '2026-05-15' },
      { id: 'kr-1-3', title: 'Complete chaos engineering test suite coverage', owner: 'DevOps Team', target: 100, current: 82, unit: '%', dueDate: '2026-06-30', status: 'on-track', progress: 82, lastUpdated: '2026-05-13' },
    ],
  },
  {
    id: 'obj-2',
    title: 'Expand into 3 new European payment schemes',
    owner: 'Marcus Webb',
    teamId: 'product',
    quarter: 'Q2',
    year: 2026,
    status: 'on-track',
    progress: 62,
    tags: ['expansion', 'product'],
    keyResults: [
      { id: 'kr-2-1', title: 'Launch SEPA Instant for 5 pilot clients', owner: 'Product Team', target: 5, current: 4, unit: 'clients', dueDate: '2026-05-31', status: 'on-track', progress: 80, lastUpdated: '2026-05-15' },
      { id: 'kr-2-2', title: 'Complete BLIK regulatory approval', owner: 'Marcus Webb', target: 1, current: 0, unit: 'approval', dueDate: '2026-06-30', status: 'at-risk', progress: 40, lastUpdated: '2026-05-10' },
      { id: 'kr-2-3', title: 'Onboard 2 Bankgirot integration partners', owner: 'Partnerships Team', target: 2, current: 1, unit: 'partners', dueDate: '2026-06-30', status: 'on-track', progress: 50, lastUpdated: '2026-05-12' },
    ],
  },
  {
    id: 'obj-3',
    title: 'Grow ARR by 35% through enterprise deals',
    owner: 'Priya Sharma',
    teamId: 'commercial',
    quarter: 'Q2',
    year: 2026,
    status: 'on-track',
    progress: 71,
    tags: ['revenue', 'commercial'],
    keyResults: [
      { id: 'kr-3-1', title: 'Close 4 Tier-1 enterprise deals', owner: 'Priya Sharma', target: 4, current: 3, unit: 'deals', dueDate: '2026-06-30', status: 'on-track', progress: 75, lastUpdated: '2026-05-15' },
      { id: 'kr-3-2', title: 'Achieve £12M in new ACV from Q2 pipeline', owner: 'Sales Team', target: 12000000, current: 8400000, unit: '£', dueDate: '2026-06-30', status: 'on-track', progress: 70, lastUpdated: '2026-05-14' },
      { id: 'kr-3-3', title: 'Reduce sales cycle to 45 days for mid-market', owner: 'Sales Ops', target: 45, current: 52, unit: 'days', dueDate: '2026-06-30', status: 'at-risk', progress: 62, lastUpdated: '2026-05-13' },
    ],
  },
  {
    id: 'obj-4',
    title: 'Deliver world-class developer experience',
    owner: 'Alex Torres',
    teamId: 'engineering',
    quarter: 'Q2',
    year: 2026,
    status: 'on-track',
    progress: 84,
    tags: ['developer-experience'],
    keyResults: [
      { id: 'kr-4-1', title: 'Achieve NPS score of 75+ from developer survey', owner: 'Alex Torres', target: 75, current: 71, unit: 'NPS', dueDate: '2026-06-30', status: 'on-track', progress: 80, lastUpdated: '2026-05-15' },
      { id: 'kr-4-2', title: 'Reduce time-to-first-API-call to under 15 minutes', owner: 'DX Team', target: 15, current: 18, unit: 'minutes', dueDate: '2026-06-30', status: 'at-risk', progress: 70, lastUpdated: '2026-05-12' },
      { id: 'kr-4-3', title: 'Publish 20 SDK quickstart guides', owner: 'Docs Team', target: 20, current: 18, unit: 'guides', dueDate: '2026-06-30', status: 'on-track', progress: 90, lastUpdated: '2026-05-15' },
    ],
  },
  {
    id: 'obj-5',
    title: 'Build industry-leading compliance & fraud prevention',
    owner: 'Nina Okonkwo',
    teamId: 'risk',
    quarter: 'Q2',
    year: 2026,
    status: 'behind',
    progress: 48,
    tags: ['compliance', 'fraud', 'risk'],
    keyResults: [
      { id: 'kr-5-1', title: 'Reduce fraud rate to below 0.001%', owner: 'Risk Team', target: 0.001, current: 0.0018, unit: '%', dueDate: '2026-06-30', status: 'behind', progress: 44, lastUpdated: '2026-05-14' },
      { id: 'kr-5-2', title: 'Complete ISO 27001 recertification', owner: 'Nina Okonkwo', target: 1, current: 0, unit: 'cert', dueDate: '2026-06-30', status: 'at-risk', progress: 60, lastUpdated: '2026-05-13' },
      { id: 'kr-5-3', title: 'Deploy real-time ML fraud detection v2', owner: 'ML Team', target: 1, current: 0, unit: 'deployment', dueDate: '2026-06-30', status: 'behind', progress: 35, lastUpdated: '2026-05-10' },
    ],
  },
];

// ─── Q3 2026 (planned) ────────────────────────────────────────────────────

export const q3Objectives: Objective[] = [
  {
    id: 'q3-obj-1',
    title: 'Launch real-time payment scheme in Singapore and Australia',
    owner: 'Marcus Webb',
    teamId: 'product',
    quarter: 'Q3',
    year: 2026,
    status: 'not-started',
    progress: 0,
    tags: ['expansion', 'apac'],
    keyResults: [
      { id: 'q3-kr-1-1', title: 'Complete PayNow integration and testing', owner: 'Product Team', target: 1, current: 0, unit: 'milestone', dueDate: '2026-09-30', status: 'not-started', progress: 0, lastUpdated: '2026-05-01' },
      { id: 'q3-kr-1-2', title: 'Onboard 3 APAC pilot clients', owner: 'Commercial Team', target: 3, current: 0, unit: 'clients', dueDate: '2026-09-30', status: 'not-started', progress: 0, lastUpdated: '2026-05-01' },
    ],
  },
  {
    id: 'q3-obj-2',
    title: 'Scale engineering team to 120 engineers',
    owner: 'Alex Torres',
    teamId: 'engineering',
    quarter: 'Q3',
    year: 2026,
    status: 'not-started',
    progress: 0,
    tags: ['hiring', 'engineering'],
    keyResults: [
      { id: 'q3-kr-2-1', title: 'Hire 15 senior engineers across platform & product', owner: 'People Team', target: 15, current: 0, unit: 'hires', dueDate: '2026-09-30', status: 'not-started', progress: 0, lastUpdated: '2026-05-01' },
      { id: 'q3-kr-2-2', title: 'Achieve 90%+ engineering satisfaction score', owner: 'Alex Torres', target: 90, current: 0, unit: '%', dueDate: '2026-09-30', status: 'not-started', progress: 0, lastUpdated: '2026-05-01' },
    ],
  },
  {
    id: 'q3-obj-3',
    title: 'Achieve £50M total ARR milestone',
    owner: 'Priya Sharma',
    teamId: 'commercial',
    quarter: 'Q3',
    year: 2026,
    status: 'not-started',
    progress: 0,
    tags: ['revenue'],
    keyResults: [
      { id: 'q3-kr-3-1', title: 'Close £14M in new ACV', owner: 'Sales Team', target: 14000000, current: 0, unit: '£', dueDate: '2026-09-30', status: 'not-started', progress: 0, lastUpdated: '2026-05-01' },
      { id: 'q3-kr-3-2', title: 'Expand 5 existing clients to new schemes', owner: 'CS Team', target: 5, current: 0, unit: 'expansions', dueDate: '2026-09-30', status: 'not-started', progress: 0, lastUpdated: '2026-05-01' },
    ],
  },
];

// ─── Q4 2026 (planned) ────────────────────────────────────────────────────

export const q4Objectives: Objective[] = [
  {
    id: 'q4-obj-1',
    title: 'Launch Form3 embedded finance product',
    owner: 'Marcus Webb',
    teamId: 'product',
    quarter: 'Q4',
    year: 2026,
    status: 'not-started',
    progress: 0,
    tags: ['product', 'embedded-finance'],
    keyResults: [
      { id: 'q4-kr-1-1', title: 'Ship embedded finance SDK to 3 design partners', owner: 'Product Team', target: 3, current: 0, unit: 'partners', dueDate: '2026-12-31', status: 'not-started', progress: 0, lastUpdated: '2026-05-01' },
      { id: 'q4-kr-1-2', title: 'Process £100M in embedded finance volume', owner: 'Marcus Webb', target: 100000000, current: 0, unit: '£', dueDate: '2026-12-31', status: 'not-started', progress: 0, lastUpdated: '2026-05-01' },
    ],
  },
  {
    id: 'q4-obj-2',
    title: 'Close the year at £64M ARR',
    owner: 'Priya Sharma',
    teamId: 'commercial',
    quarter: 'Q4',
    year: 2026,
    status: 'not-started',
    progress: 0,
    tags: ['revenue'],
    keyResults: [
      { id: 'q4-kr-2-1', title: 'Close £16M in new ACV in Q4', owner: 'Sales Team', target: 16000000, current: 0, unit: '£', dueDate: '2026-12-31', status: 'not-started', progress: 0, lastUpdated: '2026-05-01' },
    ],
  },
  {
    id: 'q4-obj-3',
    title: 'Achieve SOC 2 Type II certification',
    owner: 'Nina Okonkwo',
    teamId: 'risk',
    quarter: 'Q4',
    year: 2026,
    status: 'not-started',
    progress: 0,
    tags: ['compliance'],
    keyResults: [
      { id: 'q4-kr-3-1', title: 'Complete all SOC 2 control implementations', owner: 'Risk Team', target: 40, current: 0, unit: 'controls', dueDate: '2026-12-31', status: 'not-started', progress: 0, lastUpdated: '2026-05-01' },
      { id: 'q4-kr-3-2', title: 'Pass external SOC 2 audit with zero exceptions', owner: 'Nina Okonkwo', target: 1, current: 0, unit: 'audit', dueDate: '2026-12-31', status: 'not-started', progress: 0, lastUpdated: '2026-05-01' },
    ],
  },
];

// ─── All objectives indexed by quarter ────────────────────────────────────

export const allObjectives: Record<string, Objective[]> = {
  Q1: q1Objectives,
  Q2: q2Objectives,
  Q3: q3Objectives,
  Q4: q4Objectives,
};

// ─── Team definitions (static, progress computed per-quarter in context) ──

export const teamDefs = [
  { id: 'platform',   name: 'Platform & Infrastructure', lead: 'Sarah Mitchell', memberCount: 18, color: '#6366f1' },
  { id: 'product',    name: 'Product',                   lead: 'Marcus Webb',    memberCount: 12, color: '#06b6d4' },
  { id: 'commercial', name: 'Commercial',                lead: 'Priya Sharma',   memberCount: 22, color: '#10b981' },
  { id: 'engineering',name: 'Engineering',               lead: 'Alex Torres',    memberCount: 35, color: '#f59e0b' },
  { id: 'risk',       name: 'Risk & Compliance',         lead: 'Nina Okonkwo',   memberCount: 9,  color: '#ef4444' },
];

export const buildCompanyOKR = (quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4', year: number) => {
  const objectives = allObjectives[quarter] ?? [];

  const teams: Team[] = teamDefs.map(def => {
    const teamObjs = objectives.filter(o => o.teamId === def.id);
    const progress = teamObjs.length
      ? Math.round(teamObjs.reduce((a, o) => a + o.progress, 0) / teamObjs.length)
      : 0;
    return { ...def, description: '', objectives: teamObjs, progress };
  }).filter(t => t.objectives.length > 0);

  const individuals: Individual[] = teams.map(t => ({
    id: `ind-${t.id}`,
    name: t.lead,
    role: `Lead, ${t.name}`,
    teamId: t.id,
    teamName: t.name,
    progress: t.progress,
    objectives: t.objectives,
  }));

  const overallProgress = objectives.length
    ? Math.round(objectives.reduce((a, o) => a + o.progress, 0) / objectives.length)
    : 0;

  return { quarter, year, objectives, teams, individuals, overallProgress };
};

// Historical trend — used by the trend chart
export const historicalProgress = [
  { month: 'Jan', progress: 15, target: 25 },
  { month: 'Feb', progress: 28, target: 35 },
  { month: 'Mar', progress: 44, target: 50 },
  { month: 'Apr', progress: 58, target: 60 },
  { month: 'May', progress: 69, target: 70 },
  { month: 'Jun', progress: null, target: 100 },
];
