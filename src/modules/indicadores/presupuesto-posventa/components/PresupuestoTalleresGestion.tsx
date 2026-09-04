'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
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

export function PresupuestoTalleresGestion() {
  const { user, blocked } = useIndicadoresPageGuard(PRESUPUESTO_POSVENTA_SUBMENU_ID);
  const searchParams = useSearchParams();
  const sede = searchParams.get('sede') ?? '';
  const sesionLista = !!user && !blocked;

  const query = useQuery({
    queryKey: indicadoresKeys.talleres(sede),
    queryFn: () => indicadoresService.presupuestoTalleres(sede),
    enabled: sesionLista && !!sede,
    refetchInterval: 60_000,
    ...transactionalQueryOptions,
  });

  if (blocked) return null;

  const talleres = query.data?.talleres ?? [];

  return (
    <IndicadoresPageFrame
      title={INDICADORES_COPY.talleres.title}
      description={INDICADORES_COPY.talleres.description}
      backHref="/dashboard/indicadores/presupuesto-posventa/sedes"
      backLabel="← Volver a sedes"
    >
      {!sede ? (
        <p className="app-section-card border-[color-mix(in_srgb,var(--color-warning)_35%,white)] bg-[var(--color-warning-soft)] text-sm text-gray-800">
          Falta el parámetro de sede. Vuelve al listado de sedes.
        </p>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            Sede: <span className="font-medium text-gray-800">{sede}</span>
          </p>

          {query.isLoading ? (
            <IndicadoresLoading message="Cargando talleres..." />
          ) : query.isError ? (
            <IndicadoresQueryError
              message={getErrorMessage(
                query.error,
                'No se pudo cargar el detalle por talleres',
              )}
            />
          ) : (
            <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
              {talleres.map((taller) => (
                <ProgressCard
                  key={taller.nombre}
                  titulo={taller.nombre}
                  totalDia={taller.totalDia}
                  metaHoy={taller.metaHoy}
                  metaMes={taller.metaMes}
                  porcentajeHoy={taller.porcentajeHoy}
                  porcentajeHoyRestante={taller.porcentajeHoyRestante}
                  porcentajeMes={taller.porcentajeMes}
                  porcentajeMesRestante={taller.porcentajeMesRestante}
                  footer={
                    !taller.esMostrador ? (
                      <Link
                        href={`/dashboard/indicadores/presupuesto-posventa/tipo-operaciones?bodega=${encodeURIComponent(taller.nombre)}&sede=${encodeURIComponent(sede)}`}
                        className="inline-flex items-center gap-1 text-sm font-medium brand-text hover:underline"
                      >
                        Más detalles
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    ) : null
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </IndicadoresPageFrame>
  );
}
