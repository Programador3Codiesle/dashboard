'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  llegadasTardeService,
  LlegadaTarde,
  ResumenLlegadasTarde,
} from '@/modules/informes/gestion-humana/services/llegadas-tarde.service';
import { useToast } from '@/components/shared/ui/ToastContext';

interface SedeOption {
  value: string;
  label: string;
}

interface EmpleadoOption {
  value: number;
  label: string;
}

// Por ahora, definimos sedes estáticas comunes; si luego quieres,
// podemos cargarlas dinámicamente desde un endpoint dedicado.
const SEDES_OPTIONS: SedeOption[] = [
  { value: 'Giron', label: 'Girón' },
  { value: 'Rosita', label: 'Rosita' },
  { value: 'Bocono', label: 'Bocono' },
  { value: 'Malecon', label: 'Malecon' },
  { value: 'Barranca', label: 'Barranca' },
  { value: 'Otra', label: 'Otra' },
];

export default function LlegadasTardePage() {
  const { showError, showSuccess } = useToast();

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [sede, setSede] = useState<string>('');
  const [empleado, setEmpleado] = useState<number | undefined>(undefined);
  const [fechaInicio, setFechaInicio] = useState<string>(today);
  const [fechaFin, setFechaFin] = useState<string>(today);

  // En este primer paso, lista de empleados vacía; se puede
  // poblar más adelante desde un endpoint si lo deseas.
  const [empleados] = useState<EmpleadoOption[]>([]);

  const detalleMutation = useMutation<LlegadaTarde[]>({
    mutationFn: async () => {
      if (!fechaInicio || !fechaFin) {
        throw new Error(
          `Debe seleccionar dos fechas. Ejemplo:\nDesde: ${today}\nHasta: ${today}`,
        );
      }
      return llegadasTardeService.listar({
        sede: sede || undefined,
        empleado,
        fechaInicio,
        fechaFin,
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Error consultando informe de llegadas tarde';
      showError(message);
    },
  });

  const resumenMutation = useMutation<ResumenLlegadasTarde[]>({
    mutationFn: async () => {
      if (!fechaInicio || !fechaFin) {
        throw new Error('Debe seleccionar dos fechas');
      }
      return llegadasTardeService.listarResumen(fechaInicio, fechaFin);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Error consultando consolidado de llegadas tarde';
      showError(message);
    },
  });

  const handleConsultar = () => {
    detalleMutation.mutate();
  };

  const handleExportDetalle = () => {
    const data = detalleMutation.data ?? [];
    if (!data.length) return;

    const headers = [
      'Documento',
      'Nombre',
      'Sede',
      'Fecha',
      'Hora entrada AM',
      'Hora entrada PM',
      'Hora inicio ausentismo',
      'Hora final ausentismo',
      'Diferencia AM',
      'Diferencia PM',
    ];

    const rows = data.map((r) => [
      String(r.empleado),
      r.nombres,
      r.sede,
      r.fecha,
      r.llegada_am ?? 'NO REGISTRA ENTRADA',
      r.llegada_pm ?? 'NO REGISTRA ENTRADA',
      r.inicio_ausentismo ?? '0',
      r.fin_ausentismo ?? '0',
      r.dif_entrada_am ?? 0,
      r.dif_entrada_pm ?? 0,
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
    a.download = 'informe-llegadas-tarde-detalle.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportResumen = async () => {
    try {
      const data = await resumenMutation.mutateAsync();
      if (!data.length) {
        showSuccess('No hay datos para el consolidado.');
        return;
      }

      const headers = ['NIT', 'Nombres', 'Total Minutos Tarde'];
      const rows = data.map((r) => [
        String(r.nit),
        r.nombres,
        String(r.totalMinutosTarde),
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
      a.download = 'informe-llegadas-tarde-resumen.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // error ya manejado en onError
    }
  };

  const detalle = detalleMutation.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Sede</p>
            <select
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary) min-w-[160px]"
              value={sede}
              onChange={(e) => setSede(e.target.value)}
            >
              <option value="">Todas</option>
              {SEDES_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Empleado</p>
            <select
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary) min-w-[220px]"
              value={empleado ?? ''}
              onChange={(e) =>
                setEmpleado(e.target.value ? Number(e.target.value) : undefined)
              }
            >
              <option value="">Todos</option>
              {empleados.map((emp) => (
                <option key={emp.value} value={emp.value}>
                  {emp.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Desde</p>
            <input
              type="date"
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              min="2024-07-15"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Hasta</p>
            <input
              type="date"
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              max={today}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={handleConsultar}
            disabled={detalleMutation.isPending}
            className="inline-flex items-center px-4 py-2 rounded-md bg-(--color-primary) text-white text-sm font-medium shadow hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {detalleMutation.isPending ? 'Consultando...' : 'Consultar'}
          </button>
          <button
            type="button"
            onClick={handleExportDetalle}
            disabled={!detalle.length}
            className="inline-flex items-center px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium shadow hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Excel (detalle)
          </button>
          <button
            type="button"
            onClick={handleExportResumen}
            disabled={resumenMutation.isPending}
            className="inline-flex items-center px-4 py-2 rounded-md bg-emerald-700 text-white text-sm font-medium shadow hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {resumenMutation.isPending ? 'Generando...' : 'Consolidado horas'}
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs" id="tableInfLlegadasTarde">
            <thead className="bg-(--color-primary) text-white">
              <tr>
                <th className="px-2 py-1 text-left">Documento</th>
                <th className="px-2 py-1 text-left">Nombre</th>
                <th className="px-2 py-1 text-left">Sede</th>
                <th className="px-2 py-1 text-left">Fecha</th>
                <th className="px-2 py-1 text-left">Hora entrada AM</th>
                <th className="px-2 py-1 text-left">Hora entrada PM</th>
                <th className="px-2 py-1 text-left">Hora inicio ausentismo</th>
                <th className="px-2 py-1 text-left">Hora final ausentismo</th>
                <th className="px-2 py-1 text-left">Diferencia AM</th>
                <th className="px-2 py-1 text-left">Diferencia PM</th>
              </tr>
            </thead>
            <tbody>
              {!detalleMutation.isPending && !detalle.length && (
                <tr>
                  <td colSpan={10} className="px-2 py-4 text-center text-gray-500">
                    No se ha encontrado información.
                  </td>
                </tr>
              )}
              {detalle.map((row) => (
                <tr key={`${row.empleado}-${row.fecha}`} className="border-t text-[11px]">
                  <td className="px-2 py-1">{row.empleado}</td>
                  <td className="px-2 py-1">{row.nombres}</td>
                  <td className="px-2 py-1 text-center">{row.sede}</td>
                  <td className="px-2 py-1 text-center">{row.fecha}</td>
                  <td className="px-2 py-1 text-center">
                    {row.llegada_am ?? 'NO REGISTRA ENTRADA'}
                  </td>
                  <td className="px-2 py-1 text-center">
                    {row.llegada_pm ?? 'NO REGISTRA ENTRADA'}
                  </td>
                  <td className="px-2 py-1 text-center">
                    {row.inicio_ausentismo ?? '0'}
                  </td>
                  <td className="px-2 py-1 text-center">
                    {row.fin_ausentismo ?? '0'}
                  </td>
                  <td className="px-2 py-1 text-center">
                    {row.dif_entrada_am ?? 0}
                  </td>
                  <td className="px-2 py-1 text-center">
                    {row.dif_entrada_pm ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

