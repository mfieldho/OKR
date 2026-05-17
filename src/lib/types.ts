export type OKRStatus = 'on-track' | 'at-risk' | 'behind' | 'completed' | 'not-started';
export type Confidence = 'on-track' | 'at-risk' | 'off-track';

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface CheckIn {
  id: string;
  date: string;           // ISO date string
  previousValue: number;
  newValue: number;
  notes?: string;
  confidence: Confidence;
  author: string;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;      // ISO date string
}

export interface KeyResult {
  id: string;
  title: string;
  description?: string;
  owner: string;
  target: number;
  current: number;
  unit: string; // e.g. '%', '$', 'count', 'score'
  dueDate: string;
  status: OKRStatus;
  progress: number; // 0-100
  lastUpdated: string;
  checkIns?: CheckIn[];
}

export interface Objective {
  id: string;
  title: string;
  description?: string;
  owner: string;
  teamId: string;
  quarter: Quarter;
  year: number;
  status: OKRStatus;
  progress: number; // 0-100, computed from key results
  keyResults: KeyResult[];
  tags?: string[];
  parentId?: string;      // alignment — links to a parent objective id
  comments?: Comment[];
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  lead: string;
  memberCount: number;
  color: string;
  objectives: Objective[];
  progress: number; // average across objectives
}

export interface Individual {
  id: string;
  name: string;
  role: string;
  teamId: string;
  teamName: string;
  avatar?: string;
  objectives: Objective[];
  progress: number;
}

export interface CompanyOKR {
  quarter: Quarter;
  year: number;
  objectives: Objective[];
  teams: Team[];
  individuals: Individual[];
  overallProgress: number;
}

export interface SharePointConfig {
  tenantId: string;
  clientId: string;
  siteUrl: string;
  listName: string;
}

export interface SpreadsheetRow {
  Objective: string;
  KeyResult: string;
  Owner: string;
  Team: string;
  Target: number;
  CurrentValue: number;
  DueDate: string;
  Status: string;
  Quarter: string;
  Year: number;
  Unit?: string;
  Description?: string;
}

export type ViewMode = 'company' | 'team' | 'individual';
