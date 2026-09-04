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
  formatMoney,
} from '@/modules/indicadores/presupuesto-posventa/components/ProgressCard';
import {
  IndicadoresLoading,
  IndicadoresQueryError,
} from '@/modules/indicadores/shared/components/IndicadoresQueryError';
import { indicadoresKeys } from '@/modules/indicadores/shared/constants/query-keys';
import { useIndicadoresPageGuard } from '@/modules/indicadores/shared/hooks/useIndicadoresPageGuard';
import {
  indicadoresService,
  type PresupuestoConsolidado,
  type PresupuestoSede,
} from '@/modules/indicadores/shared/services/indicadores.service';
import { getErrorMessage } from '@/modules/indicadores/shared/utils/parse-api-error';
import { PRESUPUESTO_POSVENTA_SUBMENU_ID } from '@/utils/constants';

function KpiBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
      <span className={`h-10 w-10 shrink-0 rounded-lg ${accent}`} />
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="break-all text-base font-semibold tabular-nums text-gray-900 sm:text-lg">
          {formatMoney(value)}
        </p>
      </div>
    </div>
  );
}

function ConsolidadoView({ data }: { data: PresupuestoConsolidado }) {
  return (
    <ProgressCard
      titulo="vendido posventa"
      totalDia={data.totalVendido}
      metaHoy={data.metaHoy}
      metaMes={data.metaMes}
      porcentajeHoy={data.porcentajeHoy}
      porcentajeHoyRestante={data.porcentajeHoyRestante}
      porcentajeMes={data.porcentajeMes}
      porcentajeMesRestante={data.porcentajeMesRestante}
      footer={
        <Link
          href="/dashboard/indicadores/presupuesto-posventa/sedes"
          className="inline-flex items-center gap-1 text-sm font-medium brand-text hover:underline"
        >
          Más detalles
          <ChevronRight className="h-4 w-4" />
        </Link>
      }
    >
      <div className="app-kpi-grid">
        <KpiBox
          label="Mano de Obra"
          value={data.manoObra}
          accent="bg-[var(--color-info)]"
        />
        <KpiBox label="TOT" value={data.tot} accent="bg-[var(--color-success)]" />
        <KpiBox
          label="Repuestos taller"
          value={data.repuestosTaller}
          accent="bg-[var(--color-warning)]"
        />
        <KpiBox
          label="Repuestos mostrador"
          value={data.repuestosMostrador}
          accent="bg-gray-500"
        />
      </div>
    </ProgressCard>
  );
}

function SedeCardPerfil({ sede }: { sede: PresupuestoSede }) {
  return (
    <ProgressCard
      titulo={sede.sede}
      totalDia={sede.totalDia}
      metaHoy={sede.metaHoy}
      metaMes={sede.metaMes}
      porcentajeHoy={sede.porcentajeObjetivo}
      porcentajeHoyRestante={sede.porcentajeObjetivoRestante}
      porcentajeMes={sede.porcentajeMes}
      porcentajeMesRestante={sede.porcentajeMesRestante}
      footer={
        <Link
          href={`/dashboard/indicadores/presupuesto-posventa/talleres?sede=${encodeURIComponent(sede.sede)}`}
          className="inline-flex items-center gap-1 text-sm font-medium brand-text hover:underline"
        >
          Más detalles
          <ChevronRight className="h-4 w-4" />
        </Link>
      }
    >
      <BreakdownTable
        columns={[
          { label: 'TOT', value: sede.tot },
          { label: 'MO', value: sede.manoObra },
          { label: 'REP', value: sede.repuestos },
        ]}
      />
    </ProgressCard>
  );
}

export function PresupuestoPosventaGestion() {
  const { user, blocked } = useIndicadoresPageGuard(PRESUPUESTO_POSVENTA_SUBMENU_ID);
  const sesionLista = !!user && !blocked;

  const query = useQuery({
    queryKey: indicadoresKeys.presupuesto,
    queryFn: () => indicadoresService.presupuestoPosventa(),
    enabled: sesionLista,
    refetchInterval: 60_000,
    ...transactionalQueryOptions,
  });

  if (blocked) return null;

  return (
    <IndicadoresPageFrame
      title={INDICADORES_COPY.presupuesto.title}
      description={INDICADORES_COPY.presupuesto.description}
      backHref="/dashboard/indicadores"
      backLabel="← Volver a Indicadores"
    >
      {query.isLoading ? (
        <IndicadoresLoading message="Cargando indicadores..." />
      ) : query.isError ? (
        <IndicadoresQueryError
          message={getErrorMessage(query.error, INDICADORES_COPY.loadError)}
        />
      ) : !query.data ? null : query.data.modo === 'consolidado' ? (
        <ConsolidadoView data={query.data} />
      ) : query.data.sedes.length === 0 ? (
        <div className="space-y-4">
          <p className="app-section-card text-sm text-gray-500">
            No hay sedes asignadas a tu perfil para este indicador.
          </p>
          <Link
            href="/dashboard/indicadores/presupuesto-posventa/sedes"
            className="inline-flex items-center gap-1 text-sm font-medium brand-text hover:underline"
          >
            Ver detalle por sedes
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
          {query.data.sedes.map((sede) => (
            <SedeCardPerfil key={sede.sede} sede={sede} />
          ))}
        </div>
      )}
    </IndicadoresPageFrame>
  );
}
