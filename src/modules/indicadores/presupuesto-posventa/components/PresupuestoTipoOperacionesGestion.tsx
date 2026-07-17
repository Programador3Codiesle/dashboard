'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { indicadoresService } from '@/modules/indicadores/shared/services/indicadores.service';
import { ProgressCard } from '@/modules/indicadores/presupuesto-posventa/components/ProgressCard';

export function PresupuestoTipoOperacionesGestion() {
  const searchParams = useSearchParams();
  const bodega = searchParams.get('bodega') ?? '';
  const sede = searchParams.get('sede') ?? '';

  const query = useQuery({
    queryKey: ['indicadores', 'presupuesto-posventa', 'tipo-op', bodega],
    queryFn: () => indicadoresService.presupuestoTipoOperaciones(bodega),
    enabled: !!bodega,
    refetchInterval: 60_000,
  });

  const backHref = sede
    ? `/dashboard/indicadores/presupuesto-posventa/talleres?sede=${encodeURIComponent(sede)}`
    : '/dashboard/indicadores/presupuesto-posventa/sedes';

  if (!bodega) {
    return (
      <p className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-sm text-amber-800 shadow-sm">
        Falta el parámetro de taller/bodega.
      </p>
    );
  }

  if (query.isLoading) {
    return (
      <p className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500 shadow-sm">
        Cargando tipos de operación...
      </p>
    );
  }

  if (query.isError) {
    return (
      <p className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        {(query.error as Error)?.message ||
          'No se pudo cargar el detalle por tipo de operación'}
      </p>
    );
  }

  const operaciones = query.data?.operaciones ?? [];

  return (
    <div className="space-y-4">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:brand-text"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a talleres
      </Link>

      <p className="text-sm text-gray-500">
        Taller:{' '}
        <span className="font-medium text-gray-800">{bodega}</span>
      </p>

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
    </div>
  );
}
