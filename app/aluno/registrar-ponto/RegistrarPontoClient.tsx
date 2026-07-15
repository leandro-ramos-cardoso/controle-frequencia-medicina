'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, CloudOff } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { reverseGeocode } from '@/lib/geolocation/reverse-geocode';
import { registerAttendance } from '@/lib/attendance/actions';
import { queueAttendance } from '@/lib/offline/queue';
import { formatTime } from '@/lib/format';
import { LocationStatusCard } from '@/components/ponto/LocationStatusCard';
import { ConfirmPointModal } from '@/components/ponto/ConfirmPointModal';
import type { PointRegistrationContext } from '@/lib/queries/point-registration';
import type { NextAction } from '@/lib/attendance/next-action';

export function RegistrarPontoClient({
  context,
  nextAction,
}: {
  context: PointRegistrationContext;
  nextAction: NextAction;
}) {
  const router = useRouter();
  const geo = useGeolocation();
  const isOnline = useOnlineStatus();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ protocol: string; time: string } | null>(null);
  const [queued, setQueued] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  // Gerada uma única vez por tentativa; reaproveitada em reenvios após falha de rede.
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  useEffect(() => {
    if (geo.status === 'granted' && geo.latitude !== null && geo.longitude !== null) {
      reverseGeocode(geo.latitude, geo.longitude).then(setAddress);
    }
  }, [geo.status, geo.latitude, geo.longitude]);

  async function handleConfirm() {
    if (geo.status !== 'granted' || geo.latitude === null || geo.longitude === null || geo.accuracyMeters === null) {
      setSubmitError('Localização indisponível. Atualize e tente novamente.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const input = {
      recordType: nextAction.recordType,
      latitude: geo.latitude,
      longitude: geo.longitude,
      accuracyMeters: geo.accuracyMeters,
      address: address ?? undefined,
      idempotencyKey,
      deviceInfo: { userAgent: navigator.userAgent, platform: navigator.platform },
    };

    // Sem conexão: nunca finge confirmação — guarda localmente para sincronizar depois.
    if (!isOnline) {
      await queueAttendance(input);
      setSubmitting(false);
      setModalOpen(false);
      setQueued(true);
      return;
    }

    try {
      const result = await registerAttendance(input);
      setSubmitting(false);

      if (!result.success) {
        setSubmitError(result.error);
        return;
      }

      setModalOpen(false);
      setSuccess({ protocol: result.protocol, time: formatTime(new Date()) });
    } catch {
      // Falha de rede no meio do envio (não um erro de validação) — enfileira em vez de perder o registro.
      await queueAttendance(input);
      setSubmitting(false);
      setModalOpen(false);
      setQueued(true);
    }
  }

  if (queued) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <CloudOff size={40} className="text-amber-600" />
        <p className="text-base font-semibold text-amber-800">Aguardando sincronização</p>
        <p className="max-w-xs text-sm text-amber-700">
          Seu registro foi salvo neste aparelho e será enviado automaticamente assim que a
          internet voltar. O horário oficial será confirmado pelo servidor no momento do envio.
        </p>
        <button
          onClick={() => { router.push('/aluno/dashboard'); router.refresh(); }}
          className="mt-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white"
        >
          Voltar ao painel
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 size={40} className="text-emerald-600" />
        <p className="text-base font-semibold text-emerald-800">Ponto registrado com sucesso</p>
        <p className="text-sm text-emerald-700">Horário: {success.time}</p>
        <p className="text-xs text-emerald-600">Protocolo {success.protocol}</p>
        <button
          onClick={() => { router.push('/aluno/dashboard'); router.refresh(); }}
          className="mt-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
        >
          Voltar ao painel
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Registro de ponto</h1>
        <p className="text-sm text-slate-500">{context.internshipName}</p>
      </div>

      <LocationStatusCard geo={geo} address={address} />

      {!isOnline && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Sem conexão — seu registro será salvo neste aparelho e sincronizado depois.
        </p>
      )}

      {submitError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <button
        onClick={() => setModalOpen(true)}
        disabled={nextAction.disabled || geo.status !== 'granted'}
        className="w-full rounded-2xl bg-brand-600 py-3.5 text-base font-semibold text-white shadow-card disabled:opacity-50"
      >
        {nextAction.label}
      </button>

      <ConfirmPointModal
        open={modalOpen}
        recordType={nextAction.recordType}
        internshipName={context.internshipName}
        preceptorName={context.preceptorName}
        accuracyMeters={geo.accuracyMeters}
        submitting={submitting}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
