'use client';

import { useState, useRef, DragEvent } from 'react';
import { X, Upload, Download, Check, AlertTriangle, FileText } from 'lucide-react';
import { Objective, KeyResult, OKRStatus, Quarter } from '@/lib/types';
import { useSettings } from '@/contexts/SettingsContext';
import { useObjectiveCRUD } from '@/hooks/useObjectiveCRUD';

// ─── CSV helpers ──────────────────────────────────────────────────────────────

const HEADERS = [
  'Objective Title', 'Description', 'Owner', 'Team', 'Quarter', 'Year', 'Tags',
  'KR Title', 'KR Owner', 'KR Target', 'KR Current', 'KR Unit', 'KR Due Date', 'KR Status',
];

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const cells: string[] = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuote = !inQuote;
      } else if (ch === ',' && !inQuote) {
        cells.push(cur.trim()); cur = '';
      } else {
        cur += ch;
      }
    }
    cells.push(cur.trim());
    rows.push(cells);
  }
  return rows;
}

function csvToObjectives(rows: string[][], teams: { id: string; name: string }[]): Objective[] {
  // Skip header row
  const dataRows = rows.slice(1).filter(r => r.some(c => c.trim()));
  const map = new Map<string, Objective>();

  for (const row of dataRows) {
    const [
      objTitle = '', desc = '', owner = '', teamName = '', quarter = 'Q2', year = '2026', tags = '',
      krTitle = '', krOwner = '', krTarget = '100', krCurrent = '0', krUnit = '%', krDue = '', krStatus = 'not-started',
    ] = row;

    if (!objTitle.trim()) continue;

    const teamId = teams.find(t => t.name.toLowerCase().includes(teamName.toLowerCase()))?.id
      ?? teams[0]?.id ?? '';

    if (!map.has(objTitle)) {
      map.set(objTitle, {
        id: crypto.randomUUID(),
        title: objTitle.trim(),
        description: desc.trim() || undefined,
        owner: owner.trim(),
        teamId,
        quarter: (['Q1', 'Q2', 'Q3', 'Q4'].includes(quarter.toUpperCase()) ? quarter.toUpperCase() : 'Q2') as Quarter,
        year: parseInt(year) || 2026,
        status: 'not-started',
        progress: 0,
        keyResults: [],
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });
    }

    if (krTitle.trim()) {
      const target = parseFloat(krTarget) || 0;
      const current = parseFloat(krCurrent) || 0;
      const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
      const kr: KeyResult = {
        id: crypto.randomUUID(),
        title: krTitle.trim(),
        owner: krOwner.trim(),
        target, current, unit: krUnit.trim() || '%',
        dueDate: krDue.trim(),
        status: (krStatus.trim().toLowerCase().replace(/ /g, '-') as OKRStatus) || 'not-started',
        progress,
        lastUpdated: new Date().toISOString().slice(0, 10),
      };
      map.get(objTitle)!.keyResults.push(kr);
    }
  }

  return Array.from(map.values()).map(obj => ({
    ...obj,
    progress: obj.keyResults.length
      ? Math.round(obj.keyResults.reduce((s, k) => s + k.progress, 0) / obj.keyResults.length)
      : 0,
  }));
}

function generateTemplate(teams: { name: string }[]): string {
  const teamName = teams[0]?.name ?? 'Platform & Infrastructure';
  const rows = [
    HEADERS.join(','),
    `"Achieve 99.99% platform uptime","Ensure high reliability","Sarah Mitchell","${teamName}",Q2,2026,"infrastructure,reliability","Reduce P1 incidents to zero","James Chen",0,2,count,2026-06-30,on-track`,
    `"Achieve 99.99% platform uptime","","","","","","","Deploy automated runbooks","James Chen",10,7,count,2026-06-30,on-track`,
    `"Grow enterprise ARR by 40%","Drive new revenue","Priya Sharma","Commercial",Q2,2026,revenue,"Close 5 Tier-1 deals","Priya Sharma",5,3,deals,2026-06-30,at-risk`,
  ];
  return rows.join('\n');
}

function downloadTemplate(teams: { name: string }[]) {
  const csv = generateTemplate(teams);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'okr-import-template.csv';
  a.click(); URL.revokeObjectURL(url);
}

// ─── Main panel ───────────────────────────────────────────────────────────────

interface ImportPanelProps { onClose: () => void }

export function ImportPanel({ onClose }: ImportPanelProps) {
  const { settings } = useSettings();
  const { importObjectives } = useObjectiveCRUD();

  const [dragging, setDragging] = useState(false);
  const [preview, setPreview]   = useState<Objective[] | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [imported, setImported] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setError('Please upload a .csv file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const rows = parseCSV(e.target?.result as string);
        if (rows.length < 2) { setError('File appears empty.'); return; }
        const objs = csvToObjectives(rows, settings.teams);
        if (!objs.length) { setError('No objectives could be parsed. Check the file matches the template.'); return; }
        setPreview(objs);
      } catch {
        setError('Could not parse file. Download the template for the correct format.');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleConfirmImport = () => {
    if (!preview) return;
    importObjectives(preview);
    setImported(true);
  };

  const totalKRs = preview?.reduce((s, o) => s + o.keyResults.length, 0) ?? 0;

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={onClose} />

      <div className="fixed right-0 top-0 h-full z-50 flex flex-col border-l border-white/[0.08] shadow-2xl"
        style={{ width: 'min(560px, 100vw)', background: 'var(--panel-bg)', backdropFilter: 'blur(20px)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-white">Import OKRs</h2>
            <p className="text-xs text-slate-500 mt-0.5">Upload a CSV file to bulk-import objectives and key results</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {imported ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(42,207,192,0.15)', border: '1px solid rgba(42,207,192,0.3)' }}>
                <Check size={28} style={{ color: '#2acfc0' }} />
              </div>
              <div>
                <p className="text-white font-semibold">Import complete</p>
                <p className="text-sm text-slate-400 mt-1">
                  {preview?.length} objective{preview?.length !== 1 ? 's' : ''} and {totalKRs} key results added.
                </p>
              </div>
              <button onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'rgba(42,207,192,0.12)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.25)' }}>
                Done
              </button>
            </div>
          ) : preview ? (
            /* Preview */
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Check size={14} className="text-emerald-400" />
                <span className="text-slate-300">
                  Parsed <span className="text-white font-medium">{preview.length} objectives</span> with{' '}
                  <span className="text-white font-medium">{totalKRs} key results</span>
                </span>
              </div>

              <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                {preview.map((obj, i) => (
                  <div key={obj.id} className="px-4 py-3 border-b border-white/[0.04] last:border-b-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-white">{obj.title}</p>
                      <span className="text-[10px] text-slate-500 shrink-0">{obj.quarter} · {obj.teamId}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{obj.owner} · {obj.keyResults.length} KRs</p>
                    {obj.keyResults.map(kr => (
                      <div key={kr.id} className="flex items-center gap-2 mt-1.5 pl-3 border-l border-white/[0.06]">
                        <span className="text-[10px] text-slate-400 truncate flex-1">{kr.title}</span>
                        <span className="text-[10px] text-slate-600 shrink-0">{kr.current}/{kr.target} {kr.unit}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={handleConfirmImport}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{ background: 'rgba(42,207,192,0.12)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.25)' }}>
                  <Check size={14} /> Confirm import
                </button>
                <button onClick={() => setPreview(null)}
                  className="px-4 py-2 rounded-xl text-sm text-slate-500 border border-white/[0.07] hover:text-slate-300 transition-colors">
                  Back
                </button>
              </div>
            </div>
          ) : (
            /* Upload */
            <>
              {/* Template download */}
              <div className="rounded-xl border border-white/[0.07] p-4 flex items-center gap-3"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <FileText size={18} className="text-slate-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-300">CSV template</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Download and fill in this template, then upload it below</p>
                </div>
                <button onClick={() => downloadTemplate(settings.teams)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all"
                  style={{ background: 'rgba(42,207,192,0.08)', color: '#2acfc0', border: '1px solid rgba(42,207,192,0.18)' }}>
                  <Download size={11} /> Download
                </button>
              </div>

              {/* Drop zone */}
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className="rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-3 py-12 transition-all"
                style={{
                  borderColor: dragging ? '#2acfc0' : 'rgba(255,255,255,0.1)',
                  background: dragging ? 'rgba(42,207,192,0.05)' : 'rgba(255,255,255,0.02)',
                }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(42,207,192,0.1)', border: '1px solid rgba(42,207,192,0.2)' }}>
                  <Upload size={20} style={{ color: '#2acfc0' }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-300">Drop your CSV here</p>
                  <p className="text-xs text-slate-500 mt-1">or click to browse</p>
                </div>
                <input ref={inputRef} type="file" accept=".csv,.txt" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
              </div>

              {error && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}

              {/* Column reference */}
              <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                <div className="px-4 py-2.5 border-b border-white/[0.04]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Required CSV columns</p>
                </div>
                <div className="p-3 grid grid-cols-2 gap-1">
                  {HEADERS.map(h => (
                    <div key={h} className="text-[10px] text-slate-500 px-2 py-1 rounded"
                      style={{ background: 'rgba(255,255,255,0.02)' }}>{h}</div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
