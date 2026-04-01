'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { useMutation } from '@tanstack/react-query';
import { tiempoGestionComprasService } from '@/modules/informes/gestion-humana/services/tiempo-gestion-compras.service';
import { DateRangePicker } from '@/shared/components/DateRangePicker';
import { useToast } from '@/components/shared/ui/ToastContext';

const ESTADOS = ['DESPACHADA', 'EN PROCESO', 'EN TRANSITO', 'NEGADA', 'SIN REVISAR'];
const URGENCIAS = ['', 'No tan urgente', 'Urgente', 'Muy urgente'];

export default function TiempoGestionComprasPage() {
  const { showError } = useToast();
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [estado, setEstado] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      if ((range?.from && !range?.to) || (!range?.from && range?.to)) {
        throw new Error('Por favor ingrese ambas fechas');
      }
      return tiempoGestionComprasService.listar({
        fechaIni: range?.from ? range.from.toISOString().slice(0, 10) : undefined,
        fechaFin: range?.to ? range.to.toISOString().slice(0, 10) : undefined,
        estado: estado || undefined,
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Error consultando informe de tiempo gestión compras';
      showError(message);
    },
  });

  const data = mutation.data ?? [];

  const handleFiltrar = () => {
    mutation.mutate();
  };

  const handleExportCsv = () => {
    if (!data.length) return;

    const headers = [
      'Solicitado Por',
      'Descripción',
      'Area a Cargar',
      'Urgencia',
      'Fecha Solicitud',
      'Fecha Negada',
      'Fecha Despacho',
      'Estado Actual',
      'Días',
    ];

    const rows = data.map((r) => [
      r.solicitado_por,
      r.descri_prod,
      r.area_cargar,
      URGENCIAS[r.urgencia] ?? '',
      r.fecha_solicitud ?? '',
      r.fecha_negada ?? '',
      r.fecha_despacho ?? '',
      r.estado_actual,
      String(r.dias),
    ]);

    const csvContent =
      [headers, ...rows]
        .map((cols) =>
          cols
            .map((c) => `"${String(c).replace(/"/g, '""')}"`)
            .join(','),
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'informe-tiempo-gestion-compras.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Rango de fechas</p>
          <DateRangePicker value={range} onChange={setRange} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Estado</p>
          <select
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="">Seleccione una opción</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleFiltrar}
            disabled={mutation.isPending}
            className="inline-flex items-center px-4 py-2 rounded-md bg-(--color-primary) text-white text-sm font-medium shadow hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Consultando...' : 'Filtrar'}
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={!data.length}
            className="inline-flex items-center px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium shadow hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Exportar a Excel
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs" id="tabladatos">
            <thead className="bg-(--color-primary) text-white">
              <tr>
                <th className="px-2 py-1 text-left">Solicitado Por</th>
                <th className="px-2 py-1 text-left">Descripción</th>
                <th className="px-2 py-1 text-left">Area a Cargar</th>
                <th className="px-2 py-1 text-left">Urgencia</th>
                <th className="px-2 py-1 text-left">Fecha Solicitud</th>
                <th className="px-2 py-1 text-left">Fecha Negada</th>
                <th className="px-2 py-1 text-left">Fecha Despacho</th>
                <th className="px-2 py-1 text-left">Estado Actual</th>
                <th className="px-2 py-1 text-left">Días</th>
              </tr>
            </thead>
            <tbody>
              {!mutation.isPending && !data.length && (
                <tr>
                  <td colSpan={9} className="px-2 py-4 text-center text-gray-500">
                    No hay datos para mostrar
                  </td>
                </tr>
              )}
              {data.map((row, idx) => (
                <tr key={idx} className="border-t text-[11px]">
                  <td className="px-2 py-1">{row.solicitado_por}</td>
                  <td className="px-2 py-1">{row.descri_prod}</td>
                  <td className="px-2 py-1">{row.area_cargar}</td>
                  <td className="px-2 py-1">{URGENCIAS[row.urgencia] ?? ''}</td>
                  <td className="px-2 py-1">{row.fecha_solicitud}</td>
                  <td className="px-2 py-1">{row.fecha_negada}</td>
                  <td className="px-2 py-1">{row.fecha_despacho}</td>
                  <td className="px-2 py-1">{row.estado_actual}</td>
                  <td className="px-2 py-1">{row.dias}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

