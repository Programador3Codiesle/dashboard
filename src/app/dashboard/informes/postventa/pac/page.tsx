'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pacService, PacResumen } from '@/modules/informes/postventa/services/pac.service';
import { useToast } from '@/components/shared/ui/ToastContext';

export default function PacPage() {
  const { showError } = useToast();
  const { data: pacData, isLoading, error } = useQuery<PacResumen, Error>({
    queryKey: ['pac-resumen'],
    queryFn: pacService.obtenerResumen,
  });

  useEffect(() => {
    if (error) {
      showError('No se pudo cargar el informe PAC.');
    }
  }, [error, showError]);

  const resumen = pacData ?? {
    calificacionPac: 0,
    npsCompany: 0,
    enc06: 0,
    enc78: 0,
    enc910: 0,
    porcen06: 0,
    porcen78: 0,
    porcen910: 0,
    toDia: 0,
    toMes: 0,
    porcenHoy: 0,
    porcenHoyRes: 0,
    porcenMes: 0,
    porcenMesRes: 0,
    valTotalInventario: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold brand-text">Informe PAC</h1>
          <p className="text-gray-500 text-sm mt-1">
            Resumen general de NPS, cumplimiento de presupuesto y valor de inventario para PAC.
          </p>
        </div>
        <div className="text-xs text-gray-500">
          {isLoading ? 'Cargando...' : 'Datos actualizados.'}
        </div>
      </div>

      {/* NPS General */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border brand-border p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            NPS General
          </p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">
              {resumen.calificacionPac.toFixed(2)}%
            </span>
            <span className="text-xs text-gray-500">
              / {resumen.npsCompany.toFixed(2)}% objetivo compañía
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-3 mb-1">
            Distribución de encuestas (0-6 / 7-8 / 9-10)
          </p>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
            <div
              className="bg-red-500 h-3"
              style={{ width: `${resumen.porcen06 || 0}%` }}
            />
            <div
              className="bg-amber-400 h-3"
              style={{ width: `${resumen.porcen78 || 0}%` }}
            />
            <div
              className="bg-emerald-500 h-3"
              style={{ width: `${resumen.porcen910 || 0}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-gray-600">
            <span>0-6: {resumen.enc06}</span>
            <span>7-8: {resumen.enc78}</span>
            <span>9-10: {resumen.enc910}</span>
          </div>
        </div>

        {/* Presupuesto */}
        <div className="bg-white rounded-xl shadow-sm border brand-border p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Cumplimiento de presupuesto
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gray-500">Ventas acumuladas (PAC) a hoy</p>
              <p className="text-lg font-semibold text-gray-900">
                ${resumen.toDia.toLocaleString('es-CO')}
              </p>
            </div>
            <div>
              <p className="text-gray-500">% cumplimiento mes</p>
              <p className="text-lg font-semibold text-gray-900">
                {resumen.porcenMes.toFixed(2)}%
              </p>
              <p className="text-[11px] text-gray-500">
                Restante: {resumen.porcenMesRes.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-gray-500">% cumplimiento a hoy</p>
              <p className="text-lg font-semibold text-gray-900">
                {resumen.porcenHoy.toFixed(2)}%
              </p>
              <p className="text-[11px] text-gray-500">
                Restante: {resumen.porcenHoyRes.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-gray-500">Presupuesto mes</p>
              <p className="text-lg font-semibold text-gray-900">
                ${resumen.toMes.toLocaleString('es-CO')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventario */}
      <div className="bg-white rounded-xl shadow-sm border brand-border p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Total inventario PAC
        </p>
        <p className="mt-2 text-2xl font-bold text-gray-900">
          ${resumen.valTotalInventario.toLocaleString('es-CO')}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Valor total del inventario de referencias considerado para el informe PAC.
        </p>
      </div>
    </div>
  );
}

