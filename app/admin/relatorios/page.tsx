import { createClient } from '@/lib/supabase/server';
import { getFrequencyReport, getRecordsByDayChart, getRecordsByLocationChart } from '@/lib/queries/reports';
import { ReportFiltersBar } from '@/components/relatorios/ReportFiltersBar';
import { ExportButtons } from '@/components/relatorios/ExportButtons';
import { SimpleBarChart } from '@/components/relatorios/SimpleBarChart';

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ internshipId?: string; startDate?: string; endDate?: string }>;
}) {
  const params = await searchParams;
  const filters = { internshipId: params.internshipId, startDate: params.startDate, endDate: params.endDate };

  const supabase = await createClient();
  const { data: internships } = await supabase.from('internships').select('id, name').is('deleted_at', null).order('name');

  const [report, recordsByDay, recordsByLocation] = await Promise.all([
    getFrequencyReport(filters),
    getRecordsByDayChart(filters),
    getRecordsByLocationChart(filters),
  ]);

  const totalRequired = report.reduce((sum, r) => sum + r.requiredHours, 0);
  const totalCompleted = report.reduce((sum, r) => sum + r.completedHours, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Relatórios</h1>
        <ExportButtons data={report} />
      </div>

      <ReportFiltersBar internships={internships ?? []} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Frequência por período (registros aprovados)</h2>
          <SimpleBarChart data={recordsByDay} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Registros por local</h2>
          <SimpleBarChart data={recordsByLocation} color="#B08D57" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 p-4">
          <h2 className="text-sm font-semibold text-slate-700">Frequência por aluno</h2>
          <p className="text-xs text-slate-400">
            Total: {totalCompleted}h de {totalRequired}h previstas
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="p-3 font-medium">Aluno</th>
                <th className="p-3 font-medium">Curso</th>
                <th className="p-3 font-medium">Estágio</th>
                <th className="p-3 font-medium">Cumpridas</th>
                <th className="p-3 font-medium">Previstas</th>
                <th className="p-3 font-medium">Frequência</th>
                <th className="p-3 font-medium">Fora do perímetro</th>
              </tr>
            </thead>
            <tbody>
              {report.map((row) => (
                <tr key={row.studentId} className="border-b border-slate-50 last:border-0">
                  <td className="p-3">
                    <p className="font-medium text-slate-900">{row.studentName}</p>
                    <p className="text-xs text-slate-400">{row.registrationNumber}</p>
                  </td>
                  <td className="p-3 text-slate-600">{row.courseName}</td>
                  <td className="p-3 text-slate-600">{row.internshipName}</td>
                  <td className="p-3 text-slate-600">{row.completedHours}h</td>
                  <td className="p-3 text-slate-600">{row.requiredHours}h</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        row.frequencyPct >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {row.frequencyPct}%
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{row.lateCount}</td>
                </tr>
              ))}
              {report.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-sm text-slate-400">
                    Nenhum dado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
