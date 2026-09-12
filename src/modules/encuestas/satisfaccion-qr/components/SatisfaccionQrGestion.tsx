'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { EncuestasPageFrame } from '@/modules/encuestas/components/EncuestasPageFrame';
import { ENCUESTAS_COPY } from '@/modules/encuestas/constants';
import { InformesPageFrame } from '@/modules/informes/components/InformesPageFrame';
import { INFORMES_COPY } from '@/modules/informes/constants';
import { encuestasKeys } from '@/modules/encuestas/shared/constants/query-keys';
import {
  btnWarningClass,
  inputClass,
} from '@/modules/encuestas/shared/constants/ui';
import { useEncuestasPageGuard } from '@/modules/encuestas/shared/hooks/useEncuestasPageGuard';
import { encuestasService } from '@/modules/encuestas/shared/services/encuestas.service';
import { getErrorMessage } from '@/modules/encuestas/shared/utils/parse-api-error';
import { SATISFACCION_QR_SUBMENU_ID } from '@/utils/constants';

const TALLERES_QR = [
  { value: '1', label: 'GASOLINA GIRON' },
  { value: '11', label: 'DIESEL GIRON' },
  { value: '21', label: 'LAMINA Y PINTURA GIRON' },
  { value: '6', label: 'GASOLINA BARRANCA' },
  { value: '7', label: 'GASOLINA ROSITA' },
  { value: '8', label: 'GASOLINA BOCONO' },
  { value: '16', label: 'DIESEL BOCONO' },
  { value: '14', label: 'LAMINA Y PINTURA BOCONO' },
] as const;

const ESCALA_NPS = [
  { v: '6', label: '0-6', cls: 'border-[var(--color-danger)] text-[var(--color-danger)]' },
  { v: '8', label: '7-8', cls: 'border-[var(--color-warning)] text-[var(--color-warning)]' },
  { v: '10', label: '9-10', cls: 'border-[var(--color-success)] text-[var(--color-success)]' },
] as const;

function ScaleButtons({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
      {ESCALA_NPS.map((opt) => (
        <button
          key={opt.v}
          type="button"
          className={`w-full rounded border-2 px-3 py-2 text-sm sm:w-auto ${opt.cls} ${
            value === opt.v ? 'bg-slate-100 font-bold' : ''
          }`}
          onClick={() => onChange(opt.v)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SiNoButtons({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
      {['NO', 'SI'].map((opt) => (
        <button
          key={opt}
          type="button"
          className={`w-full rounded border px-4 py-2 sm:w-auto ${
            value === opt
              ? 'bg-[var(--color-info)] text-white'
              : 'bg-white'
          }`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function SatisfaccionQrGestion({
  submenuId = SATISFACCION_QR_SUBMENU_ID,
  redirectTo = '/dashboard/encuestas',
  frame = 'encuestas',
}: {
  submenuId?: number;
  redirectTo?: string;
  frame?: 'encuestas' | 'informes';
}) {
  const { user, blocked } = useEncuestasPageGuard(submenuId, { redirectTo });
  const sesionLista = !!user && !blocked;

  const [bodega, setBodega] = useState('0');
  const [placa, setPlaca] = useState('');
  const [placaDebounced, setPlacaDebounced] = useState('');
  const [pregunta2, setPregunta2] = useState('10');
  const [pregunta3, setPregunta3] = useState('10');
  const [pregunta4, setPregunta4] = useState('');
  const [pregunta5, setPregunta5] = useState('');
  const [pregunta7, setPregunta7] = useState('');
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  const placaNormalizada = placa.trim().toUpperCase();

  useEffect(() => {
    const t = setTimeout(() => setPlacaDebounced(placaNormalizada), 300);
    return () => clearTimeout(t);
  }, [placaNormalizada]);

  const placaQuery = useQuery({
    queryKey: encuestasKeys.validarPlacaQr(placaDebounced),
    queryFn: () => encuestasService.validarPlacaQr(placaDebounced),
    enabled: sesionLista && placaDebounced.length > 0,
    ...transactionalQueryOptions,
  });

  const placaOk =
    placaNormalizada.length > 0 &&
    placaDebounced === placaNormalizada &&
    placaQuery.data?.ok === true;
  const placaEstado =
    placaNormalizada.length === 0
      ? null
      : placaQuery.isFetching
        ? 'Validando placa...'
        : placaDebounced === placaNormalizada
          ? (placaQuery.data?.message ?? null)
          : null;

  const submitMutation = useMutation({
    mutationFn: () =>
      encuestasService.responderQrVentanilla({
        bodega,
        placa: placa.trim().toUpperCase(),
        pregunta2,
        pregunta3,
        pregunta4: pregunta4 || undefined,
        pregunta5: pregunta5 || undefined,
        pregunta7,
      }),
    onSuccess: (r) => {
      setFeedback(r);
      if (r.ok) {
        setBodega('0');
        setPlaca('');
        setPlacaDebounced('');
        setPregunta2('10');
        setPregunta3('10');
        setPregunta4('');
        setPregunta5('');
        setPregunta7('');
      }
    },
    onError: (e) => {
      setFeedback({
        ok: false,
        message: getErrorMessage(e, ENCUESTAS_COPY.satisfaccionQr.submitError),
      });
    },
  });

  function enviar() {
    setFeedback(null);
    if (bodega === '' || bodega === '0' || !placa.trim() || !pregunta7.trim()) {
      setFeedback({
        ok: false,
        message: ENCUESTAS_COPY.satisfaccionQr.fieldsRequired,
      });
      return;
    }
    submitMutation.mutate();
  }

  if (blocked) return null;

  const esInformes = frame === 'informes';
  const title = esInformes
    ? INFORMES_COPY.qrTaller.title
    : ENCUESTAS_COPY.satisfaccionQr.title;
  const description = esInformes
    ? INFORMES_COPY.qrTaller.description
    : ENCUESTAS_COPY.satisfaccionQr.description;
  const backHref = esInformes ? '/dashboard/informes' : '/dashboard/encuestas';
  const backLabel = esInformes
    ? INFORMES_COPY.backRoot
    : ENCUESTAS_COPY.satisfaccionQr.backLabel;

  const contenido = (
      <div className="app-section-card w-full min-w-0 space-y-6">
        <h2 className="text-center text-lg font-semibold text-gray-900">
          Encuesta de satisfacción CODIESEL SA
        </h2>
        <p className="text-center text-xs italic text-gray-500">
          Elija el estado que represente su nivel de satisfacción con el servicio del taller
        </p>

        {feedback ? (
          <div
            className={`rounded-md px-3 py-2 text-center text-sm ${
              feedback.ok
                ? 'border border-[color-mix(in_srgb,var(--color-success)_25%,white)] bg-[var(--color-success-soft)] text-[var(--color-success)]'
                : 'border border-[color-mix(in_srgb,var(--color-danger)_20%,white)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]'
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        <div className="app-form-grid-2">
          <label className="w-full min-w-0 text-sm">
            Ingrese el Taller
            <select
              className={`mt-1 ${inputClass}`}
              value={bodega}
              onChange={(e) => setBodega(e.target.value)}
            >
              <option value="0">Seleccione un taller</option>
              {TALLERES_QR.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="w-full min-w-0 text-sm">
            Ingrese La Placa
            <input
              data-testid="satisfaccion-qr-placa"
              className={`mt-1 ${inputClass} uppercase`}
              placeholder="Ingresa Tu Placa"
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
            />
            {placaEstado ? (
              <span
                data-testid="satisfaccion-qr-placa-estado"
                className={`mt-1 block text-xs font-semibold ${
                  placaOk
                    ? 'text-[var(--color-success)]'
                    : 'text-[var(--color-danger)]'
                }`}
              >
                {placaEstado}
              </span>
            ) : null}
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded border border-gray-100 p-3 text-center">
            <p className="mb-2 text-sm font-medium">Satisfacción con el concesionario</p>
            <ScaleButtons value={pregunta2} onChange={setPregunta2} />
          </div>
          <div className="rounded border border-gray-100 p-3 text-center">
            <p className="mb-2 text-sm font-medium">Satisfacción con el trabajo realizado</p>
            <ScaleButtons value={pregunta3} onChange={setPregunta3} />
          </div>
          <div className="rounded border border-gray-100 p-3 text-center">
            <p className="mb-2 text-sm font-medium">Explicación todo el trabajo realizado</p>
            <SiNoButtons value={pregunta4} onChange={setPregunta4} />
          </div>
          <div className="rounded border border-gray-100 p-3 text-center">
            <p className="mb-2 text-sm font-medium">
              Se cumplieron los compromisos pactados (Tiempo Proceso)
            </p>
            <SiNoButtons value={pregunta5} onChange={setPregunta5} />
          </div>
        </div>

        <textarea
          rows={4}
          className={inputClass}
          placeholder="Opinión acerca del servicio prestado"
          value={pregunta7}
          onChange={(e) => setPregunta7(e.target.value)}
        />

        <div className="flex justify-center">
          <button
            type="button"
            className={btnWarningClass}
            disabled={!placaOk || submitMutation.isPending}
            onClick={enviar}
          >
            {submitMutation.isPending ? 'Enviando...' : 'Enviar Respuestas'}
          </button>
        </div>
      </div>
  );

  if (esInformes) {
    return (
      <InformesPageFrame title={title} description={description} backHref={backHref} backLabel={backLabel}>
        {contenido}
      </InformesPageFrame>
    );
  }

  return (
    <EncuestasPageFrame title={title} description={description} backHref={backHref} backLabel={backLabel}>
      {contenido}
    </EncuestasPageFrame>
  );
}
