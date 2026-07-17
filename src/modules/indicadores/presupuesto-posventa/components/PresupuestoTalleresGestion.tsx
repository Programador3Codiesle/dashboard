'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { indicadoresService } from '@/modules/indicadores/shared/services/indicadores.service';
import { ProgressCard } from '@/modules/indicadores/presupuesto-posventa/components/ProgressCard';

export function PresupuestoTalleresGestion() {
  const searchParams = useSearchParams();
  const sede = searchParams.get('sede') ?? '';

  const query = useQuery({
    queryKey: ['indicadores', 'presupuesto-posventa', 'talleres', sede],
    queryFn: () => indicadoresService.presupuestoTalleres(sede),
    enabled: !!sede,
    refetchInterval: 60_000,
  });

  if (!sede) {
    return (
      <p className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-sm text-amber-800 shadow-sm">
        Falta el parámetro de sede. Vuelve al listado de sedes.
      </p>
    );
  }

  if (query.isLoading) {
    return (
      <p className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500 shadow-sm">
        Cargando talleres...
      </p>
    );
  }

  if (query.isError) {
    return (
      <p className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        {(query.error as Error)?.message ||
          'No se pudo cargar el detalle por talleres'}
      </p>
    );
  }

  const talleres = query.data?.talleres ?? [];

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/indicadores/presupuesto-posventa/sedes"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:brand-text"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a sedes
      </Link>

      <p className="text-sm text-gray-500">
        Sede: <span className="font-medium text-gray-800">{sede}</span>
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
    </div>
  );
}
