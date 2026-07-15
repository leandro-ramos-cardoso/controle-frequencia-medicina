import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAttendanceRecordDetail } from '@/lib/queries/attendance-detail';
import { formatDate, formatTime, formatDateTime } from '@/lib/format';

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

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  recusado: 'Recusado',
  em_analise: 'Em análise',
  ajustado: 'Ajustado',
  fora_do_perimetro: 'Fora do perímetro',
  incompleto: 'Incompleto',
  cancelado: 'Cancelado',
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-2 text-sm last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="text-right text-slate-700">{value ?? '—'}</span>
    </div>
  );
}

export default async function DetalheRegistroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getAttendanceRecordDetail(id);

  if (!record) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Registro não encontrado (ou você não tem acesso a ele).
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/aluno/historico" className="inline-flex items-center gap-1.5 text-sm text-slate-500">
        <ArrowLeft size={16} /> Voltar ao histórico
      </Link>

      <div>
        <h1 className="text-lg font-semibold text-slate-900">{TYPE_LABEL[record.record_type]}</h1>
        <p className="text-sm text-slate-500">Código {record.id.slice(0, 8).toUpperCase()}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <Row label="Aluno" value={record.students?.profiles?.full_name} />
        <Row label="Matrícula" value={record.students?.registration_number} />
        <Row label="Instituição" value={record.students?.institutions?.name} />
        <Row label="Curso" value={record.students?.courses?.name} />
        <Row label="Estágio" value={record.internships?.name} />
        <Row label="Local" value={record.internship_locations?.name} />
        <Row
          label="Preceptor"
          value={
            record.preceptors
              ? `${record.preceptors.full_name} (CRM ${record.preceptors.crm_number}/${record.preceptors.crm_state})`
              : null
          }
        />
        <Row label="Data" value={formatDate(record.server_recorded_at)} />
        <Row label="Horário" value={formatTime(record.server_recorded_at)} />
        <Row label="Coordenadas" value={record.latitude && record.longitude ? `${record.latitude}, ${record.longitude}` : null} />
        <Row label="Precisão" value={record.accuracy_meters ? `${record.accuracy_meters} m` : null} />
        <Row label="Distância do local" value={record.distance_meters !== null ? `${record.distance_meters} m` : null} />
        <Row label="Endereço aproximado" value={record.address} />
        <Row label="Status" value={STATUS_LABEL[record.validation_status]} />
        <Row label="Observações" value={record.notes} />
        <Row label="Aprovado por" value={record.approver?.full_name} />
        <Row
          label="Data da aprovação"
          value={record.approved_at ? formatDateTime(record.approved_at) : null}
        />
        {record.rejection_reason && <Row label="Motivo da recusa" value={record.rejection_reason} />}
      </div>
    </div>
  );
}
