'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { pacNpsInternoDetalladoService, PacNpsInternoDetalladoResponse } from '@/modules/informes/postventa/services/pac-nps-interno-detallado.service';
import { useToast } from '@/components/shared/ui/ToastContext';

function getDefaultMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  return `${year}-${month}`;
}

export default function PacNpsInternoDetalladoPage() {
  const [month, setMonth] = useState<string>(getDefaultMonth);
  const [data, setData] = useState<PacNpsInternoDetalladoResponse | null>(null);
  const { showError, showInfo } = useToast();

  const { mutate, status } = useMutation<PacNpsInternoDetalladoResponse, Error, void>({
    mutationFn: async () => {
      if (!month) {
        showInfo('Seleccione un año y mes para realizar la búsqueda.');
        throw new Error('mes-requerido');
      }
      const resp = await pacNpsInternoDetalladoService.listar(month);
      if (!resp.bodegas.length) {
        showInfo('No hay datos para el mes seleccionado.');
      }
      setData(resp);
      return resp;
    },
    onError: (error) => {
      if (error.message !== 'mes-requerido') {
        showError('No se pudo cargar el informe de órdenes finalizadas vs encuestas realizadas.');
      }
    },
  });

  useEffect(() => {
    mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBuscar = () => {
    mutate();
  };

  const bodegas = data?.bodegas ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold brand-text">
            Órdenes Finalizadas vs Encuestas Realizadas
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Comparativo por bodega entre órdenes finalizadas y encuestas NPS internas realizadas.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border brand-border p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Año y mes</p>
            <input
              type="month"
              className="w-full rounded-md border-gray-300 text-sm px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleBuscar}
              disabled={status === 'pending'}
              className="inline-flex items-center px-4 py-2 rounded-md bg-[--color-primary] text-white text-sm font-medium hover:opacity-90 disabled:opacity-60"
            >
              {status === 'pending' ? 'Cargando...' : 'Buscar'}
            </button>
          </div>
          <div className="flex flex-col justify-end text-xs text-gray-600 space-y-1">
            <div>
              <span className="font-semibold">Total órdenes finalizadas: </span>
              {data?.cantOrdenes ?? 0}
            </div>
            <div>
              <span className="font-semibold">Total encuestas realizadas: </span>
              {data?.cantEncuestas ?? 0}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bodegas.map((bodega) => (
          <div
            key={bodega.bodega}
            className="bg-white rounded-xl border brand-border shadow-sm p-4 flex flex-col justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Bodega {bodega.bodega}
              </p>
              <h3 className="text-sm font-semibold text-gray-900">
                {bodega.descripcion}
              </h3>
            </div>

            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Órdenes finalizadas:</span>
                <span className="font-semibold">{bodega.ordenesFinalizadas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Encuestas:</span>
                <span className="font-semibold">{bodega.encuestas}</span>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-[11px] text-gray-500 mb-1">NPS interno</p>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {bodega.nps.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}

        {status !== 'pending' && bodegas.length === 0 && (
          <div className="col-span-full text-center text-gray-500 text-sm">
            No hay datos para el mes seleccionado.
          </div>
        )}
      </div>
    </div>
  );
}

