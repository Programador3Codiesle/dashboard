'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';
import { encuestaSatisfaccionService, EncuestaSatisfaccionResumen } from '@/modules/informes/postventa/services/encuesta-satisfaccion.service';
import { DateRangePicker } from '@/shared/components/DateRangePicker';
import { SelectSede } from '@/shared/components/selects/select-sede';
import { useToast } from '@/components/shared/ui/ToastContext';

type NivelSatisfaccion = 0 | 10 | 8 | 7 | 6;

export default function EncuestaSatisfaccionPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [bodega, setBodega] = useState<string>('todas');
  const [tecnico, setTecnico] = useState<string>('all');
  const [cliente, setCliente] = useState<string>('');
  const [orden, setOrden] = useState<string>('');
  const [nivel, setNivel] = useState<NivelSatisfaccion>(0);

  const { showError, showSuccess, showInfo } = useToast();

  const { mutate, data, status } = useMutation<EncuestaSatisfaccionResumen[], Error, void>({
    mutationFn: async () => {
      if (!dateRange?.from || !dateRange?.to) {
        showInfo('Selecciona un rango de fechas.');
        throw new Error('Rango de fechas requerido');
      }

      const fi = dateRange.from.toISOString().slice(0, 10);
      const ff = dateRange.to.toISOString().slice(0, 10);

      const resultados = await encuestaSatisfaccionService.listar({
        fi,
        ff,
        bode: bodega,
        tec: tecnico,
        cli: cliente || undefined,
        ot: orden || undefined,
        ns: nivel || 0,
      });

      if (resultados.length === 0) {
        showInfo('No hay datos para los filtros seleccionados.');
      }

      return resultados;
    },
    onSuccess: () => {
      showSuccess('Informe de encuestas cargado correctamente.');
    },
    onError: (error) => {
      if (error.message !== 'Rango de fechas requerido') {
        showError('No se pudo cargar el informe de encuestas.');
      }
    },
  });

  const getColorClase = (valor: number) => {
    if (valor > 8 && valor <= 10) return 'bg-emerald-500 text-white';
    if (valor >= 7 && valor <= 8) return 'bg-amber-400 text-gray-900';
    return 'bg-red-500 text-white';
  };

  const handleBuscar = () => {
    mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold brand-text">Encuesta de Satisfacción</h1>
          <p className="text-gray-500 text-sm mt-1">
            Resumen de satisfacción de clientes por asesor/técnico según encuestas registradas.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border brand-border p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Rango de fechas</p>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Bodega</p>
            <SelectSede value={bodega} onChange={setBodega} includeTodas />
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Nivel de satisfacción (NPS)</p>
            <select
              value={nivel}
              onChange={(e) => setNivel(Number(e.target.value) as NivelSatisfaccion)}
              className="w-full rounded-md border-gray-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]"
            >
              <option value={0}>Todos</option>
              <option value={10}>10</option>
              <option value={8}>8 - 9</option>
              <option value={7}>6 - 8</option>
              <option value={6}>0 - 5</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Cliente (NIT)</p>
            <input
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full rounded-md border-gray-300 text-sm px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]"
              placeholder="Opcional"
            />
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Número de orden</p>
            <input
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="w-full rounded-md border-gray-300 text-sm px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]"
              placeholder="Opcional"
            />
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Técnico / Asesor</p>
            <input
              value={tecnico}
              onChange={(e) => setTecnico(e.target.value)}
              className="w-full rounded-md border-gray-300 text-sm px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]"
              placeholder="Por ahora escribe el NIT (legacy usa combo dinámico)"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleBuscar}
            disabled={status === 'pending'}
            className="inline-flex items-center px-4 py-2 rounded-md bg-[--color-primary] text-white text-sm font-medium hover:opacity-90 disabled:opacity-60"
          >
            {status === 'pending' ? 'Cargando...' : 'Buscar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map((row) => {
          const colorP1 = getColorClase(row.promP1);
          const colorP2 = getColorClase(row.promP2);

          return (
            <div
              key={row.vendedor}
              className="bg-white rounded-xl border brand-border shadow-sm overflow-hidden flex flex-col"
            >
              <div className="px-4 py-3 border-b bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">
                  {row.nombres}
                </h3>
                <p className="text-xs text-gray-500">NIT: {row.vendedor}</p>
              </div>
              <div className="p-4 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={`rounded-lg p-3 text-center ${colorP1}`}>
                    <p className="text-[11px] font-semibold mb-1">
                      Satisfacción con el concesionario
                    </p>
                    <p className="text-2xl font-bold tracking-tight">
                      {row.promP1.toFixed(2)}
                    </p>
                  </div>
                  <div className={`rounded-lg p-3 text-center ${colorP2}`}>
                    <p className="text-[11px] font-semibold mb-1">
                      Satisfacción con el trabajo realizado
                    </p>
                    <p className="text-2xl font-bold tracking-tight">
                      {row.promP2.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 border-t bg-gray-50 flex justify-center">
                <a
                  href={`https://intranet.codiesel.co/postventa/encuesta/detalle_encuesta_satisfaccion_v?nit=${row.vendedor}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center px-3 py-1 rounded-md bg-gray-200 text-xs font-medium text-gray-800 hover:bg-gray-300"
                >
                  Ver más información (legacy)
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

