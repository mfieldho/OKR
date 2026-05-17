export type YearType = 'calendar' | 'financial';
export type YearDisplayFormat = 'full' | 'short' | 'range';

export interface AppSettings {
  yearType: YearType;
  fyStartMonth: number; // 1–12; default 4 (April) for UK
  yearDisplayFormat: YearDisplayFormat;
}

export const DEFAULT_SETTINGS: AppSettings = {
  yearType: 'financial',
  fyStartMonth: 4, // April — standard UK fiscal year
  yearDisplayFormat: 'short', // FY26
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
  const prevShort2 = String(year - 1).slice(-2);
  switch (settings.yearDisplayFormat) {
    case 'full': return `FY${year}`;
    case 'short': return `FY${short2}`;
    case 'range': return `${year - 1}/${short2}`;
    default: return `FY${short2}`;
  }
  return `FY${short2}`;
}

export const MONTH_NAMES = MONTH_SHORT;

export const MONTH_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
