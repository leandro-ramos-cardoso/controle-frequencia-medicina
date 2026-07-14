'use client';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FrequencyReportRow } from '@/lib/queries/reports';

const HEADERS = [
  'Aluno',
  'Matrícula',
  'Curso',
  'Estágio',
  'Horas cumpridas',
  'Horas previstas',
  'Frequência (%)',
  'Fora do perímetro',
  'Ausências aprovadas',
];

function toRows(data: FrequencyReportRow[]): (string | number)[][] {
  return data.map((r) => [
    r.studentName,
    r.registrationNumber,
    r.courseName,
    r.internshipName,
    r.completedHours,
    r.requiredHours,
    r.frequencyPct,
    r.lateCount,
    r.absenceCount,
  ]);
}

export function exportFrequencyToCsv(data: FrequencyReportRow[], filename = 'relatorio-frequencia.csv') {
  const rows = [HEADERS, ...toRows(data)];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }); // BOM p/ Excel abrir acentos corretamente
  downloadBlob(blob, filename);
}

export function exportFrequencyToXlsx(data: FrequencyReportRow[], filename = 'relatorio-frequencia.xlsx') {
  const worksheet = XLSX.utils.aoa_to_sheet([HEADERS, ...toRows(data)]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Frequência');
  XLSX.writeFile(workbook, filename);
}

export function exportFrequencyToPdf(
  data: FrequencyReportRow[],
  meta: { title: string; generatedAt: string },
  filename = 'relatorio-frequencia.pdf'
) {
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(14);
  doc.text(meta.title, 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Gerado em ${meta.generatedAt}`, 14, 21);

  autoTable(doc, {
    startY: 26,
    head: [HEADERS],
    body: toRows(data),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [36, 90, 61] },
  });

  doc.save(filename);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
