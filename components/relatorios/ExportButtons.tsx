'use client';

import { FileText, FileSpreadsheet, FileDown } from 'lucide-react';
import type { FrequencyReportRow } from '@/lib/queries/reports';
import { exportFrequencyToCsv, exportFrequencyToXlsx, exportFrequencyToPdf } from '@/lib/reports/export';
import { formatDateTime } from '@/lib/format';

export function ExportButtons({ data }: { data: FrequencyReportRow[] }) {
  const generatedAt = formatDateTime(new Date());

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => exportFrequencyToPdf(data, { title: 'Relatório de Frequência', generatedAt })}
        disabled={data.length === 0}
        className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-40"
      >
        <FileText size={14} /> PDF
      </button>
      <button
        onClick={() => exportFrequencyToCsv(data)}
        disabled={data.length === 0}
        className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-40"
      >
        <FileDown size={14} /> CSV
      </button>
      <button
        onClick={() => exportFrequencyToXlsx(data)}
        disabled={data.length === 0}
        className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-40"
      >
        <FileSpreadsheet size={14} /> XLSX
      </button>
    </div>
  );
}
