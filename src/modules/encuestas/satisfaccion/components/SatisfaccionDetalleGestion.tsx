'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { EncuestasPageFrame } from '@/modules/encuestas/components/EncuestasPageFrame';
import { ENCUESTAS_COPY } from '@/modules/encuestas/constants';
import {
  EncuestasLoading,
  EncuestasQueryError,
} from '@/modules/encuestas/shared/components/EncuestasQueryError';
import { encuestasKeys } from '@/modules/encuestas/shared/constants/query-keys';
import { useEncuestasPageGuard } from '@/modules/encuestas/shared/hooks/useEncuestasPageGuard';
import { encuestasService } from '@/modules/encuestas/shared/services/encuestas.service';
import { getErrorMessage } from '@/modules/encuestas/shared/utils/parse-api-error';
import { SATISFACCION_SUBMENU_ID } from '@/utils/constants';

function colorNps(val: string | number | null | undefined): string {
  const n = Number(val);
  if (!Number.isFinite(n)) return 'bg-slate-500';
  if (n >= 9) return 'bg-[var(--color-success)]';
  if (n >= 7) return 'bg-[var(--color-warning)]';
  return 'bg-[var(--color-danger)]';
}

function colorSn(val: string | number | null | undefined): string {
  const s = String(val ?? '').toUpperCase();
  if (s === 'SI') return 'bg-[var(--color-success)]';
  if (s === 'NO') return 'bg-[var(--color-danger)]';
  return 'bg-slate-500';
}

export function SatisfaccionDetalleGestion() {
  const { user, blocked } = useEncuestasPageGuard(SATISFACCION_SUBMENU_ID);
  const searchParams = useSearchParams();
  const ot = searchParams.get('ot') ?? '';
  const sesionLista = !!user && !blocked && !!ot;

  const detalleQuery = useQuery({
    queryKey: encuestasKeys.satisfaccionDetalle(ot),
    queryFn: () => encuestasService.detalleSatisfaccion(ot),
    enabled: sesionLista,
    ...transactionalQueryOptions,
  });

  if (blocked) return null;

  const r = detalleQuery.data?.respuestas;
  const o = detalleQuery.data?.orden;

  return (
    <EncuestasPageFrame
      title={ENCUESTAS_COPY.satisfaccionDetalle.title}
      description={ENCUESTAS_COPY.satisfaccionDetalle.description}
      backHref="/dashboard/encuestas/satisfaccion"
      backLabel={ENCUESTAS_COPY.satisfaccionDetalle.backLabel}
    >
      {!ot ? (
        <EncuestasQueryError
          message={ENCUESTAS_COPY.satisfaccionDetalle.missingOt}
        />
      ) : detalleQuery.isPending ? (
        <EncuestasLoading message="Cargando..." />
      ) : detalleQuery.isError ? (
        <EncuestasQueryError
          message={getErrorMessage(
            detalleQuery.error,
            ENCUESTAS_COPY.satisfaccionDetalle.loadError,
          )}
        />
      ) : !o ? (
        <p className="text-muted-foreground">
          {ENCUESTAS_COPY.satisfaccionDetalle.notFound} {ot}
        </p>
      ) : (
        <>
          <div className="app-section-card w-full min-w-0 text-sm">
            <h2 className="mb-3 break-words text-center text-lg font-semibold">
              Respuestas de: {o.cliente}
            </h2>
            <div className="app-form-grid-3 gap-2">
              <div className="min-w-0 break-words">
                <strong>N° Orden:</strong> {o.numero}
              </div>
              <div className="min-w-0 break-words">
                <strong>Bodega:</strong> {o.descripcion}
              </div>
              <div className="min-w-0 break-words">
                <strong>Técnico:</strong> {o.tecnico}
              </div>
            </div>
          </div>

          {!r ? (
            <p className="text-muted-foreground">Sin respuestas registradas</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Card
                title="Satisfacción con el concesionario"
                value={r.pregunta1}
                className={colorNps(r.pregunta1)}
              />
              <Card
                title="Satisfacción con el trabajo realizado"
                value={r.pregunta2}
                className={colorNps(r.pregunta2)}
              />
              <Card
                title="Explicación todo el trabajo realizado"
                value={r.pregunta3}
                className={colorSn(r.pregunta3)}
              />
              <Card
                title="Se cumplieron los compromisos pactados"
                value={r.pregunta4}
                className={colorSn(r.pregunta4)}
              />
              <div className="sm:col-span-2 xl:col-span-4">
                <Card
                  title="Para nosotros es importante conocer tu opinión"
                  value={r.pregunta5}
                  className="bg-[var(--color-info)]"
                />
              </div>
            </div>
          )}
        </>
      )}
    </EncuestasPageFrame>
  );
}

function Card({
  title,
  value,
  className,
}: {
  title: string;
  value: string | number | null | undefined;
  className: string;
}) {
  return (
    <div className={`min-w-0 rounded-lg text-white shadow ${className}`}>
      <div className="border-b border-white/20 px-3 py-2 text-sm font-medium break-words">
        {title}
      </div>
      <div
        className={`px-3 py-6 text-center font-bold break-words ${
          String(value ?? '').length > 8 ? 'text-base sm:text-lg' : 'text-3xl'
        }`}
      >
        {value == null || value === '' ? '—' : String(value)}
      </div>
    </div>
  );
}
