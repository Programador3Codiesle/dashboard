'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { indicadoresService } from '@/modules/indicadores/shared/services/indicadores.service';
import {
  ProgressCard,
  formatMoney,
} from '@/modules/indicadores/presupuesto-posventa/components/ProgressCard';

export function PresupuestoSedesGestion() {
  const query = useQuery({
    queryKey: ['indicadores', 'presupuesto-posventa', 'sedes'],
    queryFn: () => indicadoresService.presupuestoSedes(),
    refetchInterval: 60_000,
  });

  if (query.isLoading) {
    return (
      <p className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500 shadow-sm">
        Cargando sedes...
      </p>
    );
  }

  if (query.isError) {
    return (
      <p className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        {(query.error as Error)?.message ||
          'No se pudo cargar el detalle por sedes'}
      </p>
    );
  }

  const sedes = query.data ?? [];

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/indicadores/presupuesto-posventa"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:brand-text"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al consolidado
      </Link>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
              <div className="overflow-x-auto">
                <table className="min-w-full text-center text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b text-gray-600">
                      <th className="px-1 py-2">TOT</th>
                      <th className="px-1 py-2">MO</th>
                      <th className="px-1 py-2">REP TALL</th>
                      <th className="px-1 py-2">REP MOS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-1 py-2 font-medium">
                        {formatMoney(sede.tot)}
                      </td>
                      <td className="px-1 py-2 font-medium">
                        {formatMoney(sede.manoObra)}
                      </td>
                      <td className="px-1 py-2 font-medium">
                        {formatMoney(sede.repuestosTaller)}
                      </td>
                      <td className="px-1 py-2 font-medium">
                        {formatMoney(sede.repuestosMostrador)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : null}
          </ProgressCard>
        ))}
      </div>
    </div>
  );
}
