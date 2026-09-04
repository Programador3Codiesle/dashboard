'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { IndicadoresPageFrame } from '@/modules/indicadores/components/IndicadoresPageFrame';
import { INDICADORES_COPY } from '@/modules/indicadores/constants';
import {
  BreakdownTable,
  ProgressCard,
} from '@/modules/indicadores/presupuesto-posventa/components/ProgressCard';
import {
  IndicadoresLoading,
  IndicadoresQueryError,
} from '@/modules/indicadores/shared/components/IndicadoresQueryError';
import { indicadoresKeys } from '@/modules/indicadores/shared/constants/query-keys';
import { useIndicadoresPageGuard } from '@/modules/indicadores/shared/hooks/useIndicadoresPageGuard';
import { indicadoresService } from '@/modules/indicadores/shared/services/indicadores.service';
import { getErrorMessage } from '@/modules/indicadores/shared/utils/parse-api-error';
import { PRESUPUESTO_POSVENTA_SUBMENU_ID } from '@/utils/constants';

export function PresupuestoSedesGestion() {
  const { user, blocked } = useIndicadoresPageGuard(PRESUPUESTO_POSVENTA_SUBMENU_ID);
  const sesionLista = !!user && !blocked;

  const query = useQuery({
    queryKey: indicadoresKeys.sedes,
    queryFn: () => indicadoresService.presupuestoSedes(),
    enabled: sesionLista,
    refetchInterval: 60_000,
    ...transactionalQueryOptions,
  });

  if (blocked) return null;

  const sedes = query.data ?? [];

  return (
    <IndicadoresPageFrame
      title={INDICADORES_COPY.sedes.title}
      description={INDICADORES_COPY.sedes.description}
      backHref="/dashboard/indicadores/presupuesto-posventa"
      backLabel="← Volver al consolidado"
    >
      {query.isLoading ? (
        <IndicadoresLoading message="Cargando sedes..." />
      ) : query.isError ? (
        <IndicadoresQueryError
          message={getErrorMessage(query.error, 'No se pudo cargar el detalle por sedes')}
        />
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sedes.map((sede) => (
            <ProgressCard
              key={sede.sede}
              titulo={sede.sede}
              totalDia={sede.totalDia}
              metaHoy={sede.metaHoy}
              metaMes={sede.metaMes}
              porcentajeHoy={sede.porcentajeHoy}
              porcentajeHoyRestante={sede.porcentajeHoyRestante}
              porcentajeMes={sede.porcentajeMes}
              porcentajeMesRestante={sede.porcentajeMesRestante}
              footer={
                sede.conDetalleTaller ? (
                  <Link
                    href={`/dashboard/indicadores/presupuesto-posventa/talleres?sede=${encodeURIComponent(sede.sede)}`}
                    className="inline-flex items-center gap-1 text-sm font-medium brand-text hover:underline"
                  >
                    Más detalles
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : null
              }
            >
              {sede.conDetalleTaller ? (
                <BreakdownTable
                  columns={[
                    { label: 'TOT', value: sede.tot },
                    { label: 'MO', value: sede.manoObra },
                    { label: 'REP TALL', value: sede.repuestosTaller },
                    { label: 'REP MOS', value: sede.repuestosMostrador },
                  ]}
                />
              ) : null}
            </ProgressCard>
          ))}
        </div>
      )}
    </IndicadoresPageFrame>
  );
}
