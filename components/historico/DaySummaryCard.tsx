import Link from 'next/link';
import type { DayGroup } from '@/lib/queries/history';
import { formatWeekdayDayMonth, formatTime } from '@/lib/format';

const TYPE_LABEL: Record<string, string> = {
  entrada: 'Entrada',
  saida: 'Saída',
  inicio_intervalo: 'Início do intervalo',
  retorno_intervalo: 'Retorno do intervalo',
  entrada_extraordinaria: 'Entrada extraordinária',
  saida_extraordinaria: 'Saída extraordinária',
  atividade_externa: 'Atividade externa',
  manual_autorizado: 'Registro manual',
};

const STATUS_DOT: Record<string, string> = {
  pendente: 'bg-amber-500',
  aprovado: 'bg-emerald-500',
  recusado: 'bg-red-500',
  em_analise: 'bg-blue-500',
  ajustado: 'bg-violet-500',
  fora_do_perimetro: 'bg-orange-500',
  incompleto: 'bg-slate-400',
  cancelado: 'bg-slate-300',
};

export function DaySummaryCard({ day }: { day: DayGroup }) {
  const hours = Math.floor(day.totalMinutes / 60);
  const minutes = day.totalMinutes % 60;
  const dateLabel = formatWeekdayDayMonth(`${day.date}T12:00:00`);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold capitalize text-slate-900">{dateLabel}</p>
        <p className="text-sm text-slate-500">
          Total: {hours}h{minutes.toString().padStart(2, '0')}
        </p>
      </div>

      <ul className="space-y-1.5">
        {day.records.map((record) => (
          <li key={record.id}>
            <Link
              href={`/aluno/historico/${record.id}`}
              className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50"
            >
              <span className="flex items-center gap-2 text-slate-700">
                <span className={`h-2 w-2 rounded-full ${STATUS_DOT[record.validation_status]}`} />
                {TYPE_LABEL[record.record_type]}
              </span>
              <span className="text-slate-400">{formatTime(record.server_recorded_at)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
