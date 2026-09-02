'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { IndicadoresPageFrame } from '@/modules/indicadores/components/IndicadoresPageFrame';
import { INDICADORES_COPY } from '@/modules/indicadores/constants';
import { ProgressCard } from '@/modules/indicadores/presupuesto-posventa/components/ProgressCard';
import {
  IndicadoresLoading,
  IndicadoresQueryError,
} from '@/modules/indicadores/shared/components/IndicadoresQueryError';
import { indicadoresKeys } from '@/modules/indicadores/shared/constants/query-keys';
import { useIndicadoresPageGuard } from '@/modules/indicadores/shared/hooks/useIndicadoresPageGuard';
import { indicadoresService } from '@/modules/indicadores/shared/services/indicadores.service';
import { getErrorMessage } from '@/modules/indicadores/shared/utils/parse-api-error';
import { PRESUPUESTO_POSVENTA_SUBMENU_ID } from '@/utils/constants';

export function PresupuestoTipoOperacionesGestion() {
  const { user, blocked } = useIndicadoresPageGuard(PRESUPUESTO_POSVENTA_SUBMENU_ID);
  const searchParams = useSearchParams();
  const bodega = searchParams.get('bodega') ?? '';
  const sede = searchParams.get('sede') ?? '';
  const sesionLista = !!user && !blocked;

  const query = useQuery({
    queryKey: indicadoresKeys.tipoOp(bodega),
    queryFn: () => indicadoresService.presupuestoTipoOperaciones(bodega),
    enabled: sesionLista && !!bodega,
    refetchInterval: 60_000,
    ...transactionalQueryOptions,
  });

  if (blocked) return null;

  const backHref = sede
    ? `/dashboard/indicadores/presupuesto-posventa/talleres?sede=${encodeURIComponent(sede)}`
    : '/dashboard/indicadores/presupuesto-posventa/sedes';

  const operaciones = query.data?.operaciones ?? [];

  return (
    <IndicadoresPageFrame
      title={INDICADORES_COPY.tipoOperaciones.title}
      description={INDICADORES_COPY.tipoOperaciones.description}
    >
      {!bodega ? (
        <p className="rounded-2xl border border-[color-mix(in_srgb,var(--color-warning)_35%,white)] bg-[var(--color-warning-soft)] p-6 text-sm text-gray-800 shadow-sm">
          Falta el parámetro de taller/bodega.
        </p>
      ) : (
        <>
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:brand-text"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver a talleres
          </Link>

          <p className="text-sm text-gray-500">
            Taller: <span className="font-medium text-gray-800">{bodega}</span>
          </p>

          {query.isLoading ? (
            <IndicadoresLoading message="Cargando tipos de operación..." />
          ) : query.isError ? (
            <IndicadoresQueryError
              message={getErrorMessage(
                query.error,
                'No se pudo cargar el detalle por tipo de operación',
              )}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {operaciones.map((op) => (
                <ProgressCard
                  key={op.operacion}
                  titulo={op.operacion}
                  totalDia={op.totalDia}
                  metaHoy={op.metaHoy}
                  metaMes={op.metaMes}
                  porcentajeHoy={op.porcentajeHoy}
                  porcentajeHoyRestante={op.porcentajeHoyRestante}
                  porcentajeMes={op.porcentajeMes}
                  porcentajeMesRestante={op.porcentajeMesRestante}
                />
              ))}
            </div>
          )}
        </>
      )}
    </IndicadoresPageFrame>
  );
}
