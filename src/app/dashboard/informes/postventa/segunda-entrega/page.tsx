'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/shared/components/DateRangePicker';
import { segundaEntregaService, SegundaEntregaDetalle, SegundaEntregaResumen } from '@/modules/informes/postventa/services/segunda-entrega.service';
import { useToast } from '@/components/shared/ui/ToastContext';

interface DataState {
  resumen: SegundaEntregaResumen[];
  detalle: SegundaEntregaDetalle[];
}

export default function SegundaEntregaPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [data, setData] = useState<DataState | null>(null);
  const { showInfo, showError } = useToast();

  const { mutate, status } = useMutation<DataState, Error, void>({
    mutationFn: async () => {
      if (!dateRange?.from || !dateRange?.to) {
        showInfo('Debes seleccionar una fecha de inicio y una fecha final.');
        throw new Error('fechas-requeridas');
      }

      const fi = dateRange.from.toISOString().slice(0, 10);
      const ff = dateRange.to.toISOString().slice(0, 10);

      const resp = await segundaEntregaService.listar(fi, ff);
      if (resp.resumen.length === 0 && resp.detalle.length === 0) {
        showInfo('No hay datos para el rango de fechas seleccionado.');
      }
      setData(resp);
      return resp;
    },
    onError: (error) => {
      if (error.message !== 'fechas-requeridas') {
        showError('No se pudo cargar el informe de Segunda Entrega.');
      }
    },
  });

  const handleBuscar = () => {
    mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold brand-text">Informe Segunda Entrega</h1>
          <p className="text-gray-500 text-sm mt-1">
            Resumen diario y detalle de segundas entregas vs agendas generadas.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border brand-border p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Rango de fechas</p>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
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

      {/* Tabla resumen */}
      <div className="bg-white rounded-xl shadow-sm border brand-border overflow-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-[--color-primary] text-white">
            <tr>
              <th className="px-2 py-2 text-left">Año</th>
              <th className="px-2 py-2 text-left">Mes</th>
              <th className="px-2 py-2 text-left">Día</th>
              <th className="px-2 py-2 text-left">Entregas</th>
              <th className="px-2 py-2 text-left">Agendas</th>
            </tr>
          </thead>
          <tbody>
            {data?.resumen.map((row, idx) => (
              <tr key={`${row.anio}-${row.mes}-${row.dia}-${idx}`} className="border-b last:border-b-0">
                <td className="px-2 py-1">{row.anio}</td>
                <td className="px-2 py-1">{row.mes}</td>
                <td className="px-2 py-1">{row.dia}</td>
                <td className="px-2 py-1 text-right">{row.entregas}</td>
                <td className="px-2 py-1 text-right">{row.agendas}</td>
              </tr>
            ))}
            {!data?.resumen?.length && (
              <tr>
                <td className="px-4 py-4 text-center text-gray-500" colSpan={5}>
                  Sin datos para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tabla detallada */}
      <div className="bg-white rounded-xl shadow-sm border brand-border overflow-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-[--color-primary] text-white">
            <tr>
              <th className="px-2 py-2 text-left">Año</th>
              <th className="px-2 py-2 text-left">Mes</th>
              <th className="px-2 py-2 text-left">Día</th>
              <th className="px-2 py-2 text-left">Vehículo</th>
              <th className="px-2 py-2 text-left">Sede</th>
              <th className="px-2 py-2 text-left">Agendado por</th>
            </tr>
          </thead>
          <tbody>
            {data?.detalle.map((row, idx) => (
              <tr key={`${row.anio}-${row.mes}-${row.dia}-${row.vehiculo}-${idx}`} className="border-b last:border-b-0">
                <td className="px-2 py-1">{row.anio}</td>
                <td className="px-2 py-1">{row.mes}</td>
                <td className="px-2 py-1">{row.dia}</td>
                <td className="px-2 py-1">{row.vehiculo}</td>
                <td className="px-2 py-1">{row.sede}</td>
                <td className="px-2 py-1">{row.agendadoPor}</td>
              </tr>
            ))}
            {!data?.detalle?.length && (
              <tr>
                <td className="px-4 py-4 text-center text-gray-500" colSpan={6}>
                  Sin datos detallados para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

