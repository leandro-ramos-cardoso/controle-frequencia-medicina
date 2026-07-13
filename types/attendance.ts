export type RecordType =
  | 'entrada'
  | 'saida'
  | 'inicio_intervalo'
  | 'retorno_intervalo'
  | 'entrada_extraordinaria'
  | 'saida_extraordinaria'
  | 'atividade_externa'
  | 'manual_autorizado';

export type ValidationStatus =
  | 'pendente'
  | 'aprovado'
  | 'recusado'
  | 'em_analise'
  | 'ajustado'
  | 'fora_do_perimetro'
  | 'incompleto'
  | 'cancelado';

export type LocationStatus = 'dentro_do_raio' | 'atencao' | 'fora_do_raio';

export type AttendanceRecord = {
  id: string;
  student_id: string;
  internship_id: string;
  location_id: string | null;
  preceptor_id: string | null;
  record_type: RecordType;
  recorded_at: string;
  server_recorded_at: string;
  distance_meters: number | null;
  accuracy_meters: number | null;
  location_status: LocationStatus | null;
  validation_status: ValidationStatus;
  notes: string | null;
};
