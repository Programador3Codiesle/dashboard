'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import {
  indicadoresService,
  type PresupuestoConsolidado,
  type PresupuestoSede,
} from '@/modules/indicadores/shared/services/indicadores.service';
import {
  DualProgressBar,
  ProgressCard,
  formatMoney,
} from '@/modules/indicadores/presupuesto-posventa/components/ProgressCard';

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
        <p className="text-lg font-semibold text-gray-900">
          {formatMoney(value)}
        </p>
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
            <span className="font-medium text-sky-600">
              {formatMoney(data.totalVendido)}
            </span>
            {' / '}
            <span className="font-medium text-red-600">
              {formatMoney(data.metaHoy)}
            </span>
          </span>
        </div>
        <DualProgressBar
          pctFilled={data.porcentajeHoy}
          pctRest={data.porcentajeHoyRestante}
          filledClass="bg-sky-500"
        />
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
          <span>Meta a cumplir al mes</span>
          <span>
            <span className="font-medium text-emerald-600">
              {formatMoney(data.totalVendido)}
            </span>
            {' / '}
            <span className="font-medium text-red-600">
              {formatMoney(data.metaMes)}
            </span>
          </span>
        </div>
        <DualProgressBar
          pctFilled={data.porcentajeMes}
          pctRest={data.porcentajeMesRestante}
          filledClass="bg-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiBox
          label="Mano de Obra"
          value={data.manoObra}
          accent="bg-sky-500"
        />
        <KpiBox label="TOT" value={data.tot} accent="bg-emerald-500" />
        <KpiBox
          label="Repuestos taller"
          value={data.repuestosTaller}
          accent="bg-amber-500"
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
  const query = useQuery({
    queryKey: ['indicadores', 'presupuesto-posventa'],
    queryFn: () => indicadoresService.presupuestoPosventa(),
    refetchInterval: 60_000,
  });

  if (query.isLoading) {
    return (
      <p className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500 shadow-sm">
        Cargando indicadores...
      </p>
    );
  }

  if (query.isError) {
    return (
      <p className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        {(query.error as Error)?.message ||
          'No se pudo cargar el presupuesto posventa'}
      </p>
    );
  }

  const data = query.data;
  if (!data) return null;

  if (data.modo === 'consolidado') {
    return <ConsolidadoView data={data} />;
  }

  if (data.sedes.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {data.sedes.map((sede) => (
        <SedeCardPerfil key={sede.sede} sede={sede} />
      ))}
    </div>
  );
}
