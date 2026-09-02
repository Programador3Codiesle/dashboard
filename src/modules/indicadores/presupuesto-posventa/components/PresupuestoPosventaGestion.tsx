'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { IndicadoresPageFrame } from '@/modules/indicadores/components/IndicadoresPageFrame';
import { INDICADORES_COPY } from '@/modules/indicadores/constants';
import {
  DualProgressBar,
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
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
      <span className={`h-10 w-10 shrink-0 rounded-lg ${accent}`} />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-900">{formatMoney(value)}</p>
      </div>
    </div>
  );
}

function ConsolidadoView({ data }: { data: PresupuestoConsolidado }) {
  return (
    <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="text-center">
        <p className="text-3xl font-bold brand-text sm:text-4xl">
          {formatMoney(data.totalVendido)}
        </p>
        <p className="mt-1 text-sm text-gray-500">Total vendido posventa</p>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
          <span>Meta a cumplir a día de hoy</span>
          <span>
            <span className="font-medium text-[var(--color-info)]">
              {formatMoney(data.totalVendido)}
            </span>
            {' / '}
            <span className="font-medium text-[var(--color-danger)]">
              {formatMoney(data.metaHoy)}
            </span>
          </span>
        </div>
        <DualProgressBar
          pctFilled={data.porcentajeHoy}
          pctRest={data.porcentajeHoyRestante}
          filledClass="bg-[var(--color-info)]"
        />
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
          <span>Meta a cumplir al mes</span>
          <span>
            <span className="font-medium text-[var(--color-success)]">
              {formatMoney(data.totalVendido)}
            </span>
            {' / '}
            <span className="font-medium text-[var(--color-danger)]">
              {formatMoney(data.metaMes)}
            </span>
          </span>
        </div>
        <DualProgressBar
          pctFilled={data.porcentajeMes}
          pctRest={data.porcentajeMesRestante}
          filledClass="bg-[var(--color-success)]"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="border-t border-gray-100 pt-4 text-center">
        <Link
          href="/dashboard/indicadores/presupuesto-posventa/sedes"
          className="inline-flex items-center gap-1 text-sm font-medium brand-text hover:underline"
        >
          Más detalles
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
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
      <div className="overflow-x-auto">
        <table className="min-w-full text-center text-sm">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="px-2 py-2">TOT</th>
              <th className="px-2 py-2">MO</th>
              <th className="px-2 py-2">REP</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-2 py-2 font-medium">{formatMoney(sede.tot)}</td>
              <td className="px-2 py-2 font-medium">
                {formatMoney(sede.manoObra)}
              </td>
              <td className="px-2 py-2 font-medium">
                {formatMoney(sede.repuestos)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
          <p className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500 shadow-sm">
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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {query.data.sedes.map((sede) => (
            <SedeCardPerfil key={sede.sede} sede={sede} />
          ))}
        </div>
      )}
    </IndicadoresPageFrame>
  );
}
