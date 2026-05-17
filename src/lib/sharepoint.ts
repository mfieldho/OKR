import { IPublicClientApplication } from '@azure/msal-browser';
import { loginRequest, sharePointConfig } from './msalConfig';
import { SpreadsheetRow, Objective, KeyResult, OKRStatus, Quarter, Team, Individual, CompanyOKR } from './types';

async function getAccessToken(msalInstance: IPublicClientApplication): Promise<string> {
  const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
  if (!account) throw new Error('No active account. Please sign in.');
  const result = await msalInstance.acquireTokenSilent({ ...loginRequest, account });
  return result.accessToken;
}

async function fetchWorkbookData(accessToken: string): Promise<SpreadsheetRow[]> {
  const { siteUrl, driveId, fileId } = sharePointConfig;

  const graphBase = 'https://graph.microsoft.com/v1.0';
  let endpoint: string;

  if (driveId && fileId) {
    endpoint = `${graphBase}/drives/${driveId}/items/${fileId}/workbook/tables/OKRTable/rows`;
  } else {
    // Fallback: find by site URL
    const encodedSite = encodeURIComponent(siteUrl.replace('https://', ''));
    endpoint = `${graphBase}/sites/${encodedSite}/drive/root:/OKR Data.xlsx:/workbook/tables/OKRTable/rows`;
  }

  const res = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`SharePoint fetch failed: ${res.statusText}`);

  const json = await res.json();
  return json.value.map((row: { values: unknown[][] }) => {
    const [obj, kr, owner, team, target, current, due, status, quarter, year, unit, description] = row.values[0];
    return {
      Objective: String(obj),
      KeyResult: String(kr),
      Owner: String(owner),
      Team: String(team),
      Target: Number(target),
      CurrentValue: Number(current),
      DueDate: String(due),
      Status: String(status),
      Quarter: String(quarter),
      Year: Number(year),
      Unit: String(unit || '%'),
      Description: String(description || ''),
    } as SpreadsheetRow;
  });
}

function computeProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

function mapStatus(raw: string): OKRStatus {
  const s = raw.toLowerCase().replace(/\s+/g, '-');
  if (s === 'on-track' || s === 'on_track') return 'on-track';
  if (s === 'at-risk' || s === 'at_risk') return 'at-risk';
  if (s === 'behind') return 'behind';
  if (s === 'completed') return 'completed';
  return 'not-started';
}

export async function loadOKRsFromSharePoint(
  msalInstance: IPublicClientApplication
): Promise<CompanyOKR> {
  const token = await getAccessToken(msalInstance);
  const rows = await fetchWorkbookData(token);

  const objectiveMap = new Map<string, { obj: Omit<Objective, 'keyResults'>; krs: KeyResult[] }>();
  const teamColors: Record<string, string> = {};
  const colorPalette = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  let colorIdx = 0;

  rows.forEach((row, i) => {
    const key = `${row.Objective}__${row.Team}__${row.Quarter}__${row.Year}`;
    const progress = computeProgress(row.CurrentValue, row.Target);

    const kr: KeyResult = {
      id: `kr-sp-${i}`,
      title: row.KeyResult,
      owner: row.Owner,
      target: row.Target,
      current: row.CurrentValue,
      unit: row.Unit || '%',
      dueDate: row.DueDate,
      status: mapStatus(row.Status),
      progress,
      lastUpdated: new Date().toISOString().split('T')[0],
      description: row.Description,
    };

    if (!teamColors[row.Team]) {
      teamColors[row.Team] = colorPalette[colorIdx++ % colorPalette.length];
    }

    if (!objectiveMap.has(key)) {
      objectiveMap.set(key, {
        obj: {
          id: `obj-sp-${objectiveMap.size}`,
          title: row.Objective,
          owner: row.Owner,
          teamId: row.Team.toLowerCase().replace(/\s+/g, '-'),
          quarter: row.Quarter as Quarter,
          year: row.Year,
          status: mapStatus(row.Status),
          progress: 0,
          tags: [],
        },
        krs: [],
      });
    }
    objectiveMap.get(key)!.krs.push(kr);
  });

  const objectives: Objective[] = Array.from(objectiveMap.values()).map(({ obj, krs }) => {
    const avgProgress = Math.round(krs.reduce((a, k) => a + k.progress, 0) / krs.length);
    return { ...obj, keyResults: krs, progress: avgProgress };
  });

  const teamMap = new Map<string, Team>();
  objectives.forEach(obj => {
    const tid = obj.teamId;
    if (!teamMap.has(tid)) {
      teamMap.set(tid, {
        id: tid,
        name: tid.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        lead: obj.owner,
        memberCount: 0,
        color: teamColors[obj.teamId] ?? '#6366f1',
        objectives: [],
        progress: 0,
      });
    }
    teamMap.get(tid)!.objectives.push(obj);
  });

  const teams: Team[] = Array.from(teamMap.values()).map(t => ({
    ...t,
    progress: Math.round(t.objectives.reduce((a, o) => a + o.progress, 0) / (t.objectives.length || 1)),
  }));

  const individuals: Individual[] = teams.map(t => ({
    id: `ind-${t.id}`,
    name: t.lead,
    role: `Lead, ${t.name}`,
    teamId: t.id,
    teamName: t.name,
    progress: t.progress,
    objectives: t.objectives,
  }));

  const overallProgress = Math.round(
    objectives.reduce((a, o) => a + o.progress, 0) / (objectives.length || 1)
  );

  const latestQuarter = objectives[0]?.quarter ?? 'Q2';
  const latestYear = objectives[0]?.year ?? new Date().getFullYear();

  return { quarter: latestQuarter, year: latestYear, objectives, teams, individuals, overallProgress };
}
