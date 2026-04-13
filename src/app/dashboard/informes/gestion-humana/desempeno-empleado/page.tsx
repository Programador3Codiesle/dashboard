'use client';

import { useState, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { desempenoEmpleadoService } from '@/modules/informes/gestion-humana/services/desempeno-empleado.service';
import { useToast } from '@/components/shared/ui/ToastContext';

const SEDES_OPTIONS = ['Giron', 'Rosita', 'Bocono', 'Malecon', 'Barranca', 'Otra'];

export default function DesempenoEmpleadoPage() {
  const { showError, showInfo } = useToast();
  const currentYear = new Date().getFullYear();
  const inputClass =
    'border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white w-full';

  const anios = useMemo(() => {
    const diff = Math.min(3, currentYear - 2024);
    const list: number[] = [];
    for (let y = currentYear; y >= currentYear - diff; y -= 1) {
      list.push(y);
    }
    return list;
  }, [currentYear]);

  const [anio, setAnio] = useState<number>(currentYear);
  const [sede, setSede] = useState<string>('');

  const mutation = useMutation({
    mutationFn: async () => {
      return desempenoEmpleadoService.listar({
        anio,
        sede: sede || undefined,
      });
    },
    onSuccess: (result) => {
      if (result.length === 0) {
        showInfo('No hay registros para los filtros seleccionados.');
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Error consultando informe de desempeño de empleados';
      showError(message);
    },
  });

  const handleFiltrar = () => {
    mutation.mutate();
  };

  const data = mutation.data ?? [];

  const handleExportCsv = () => {
    if (!data.length) return;

    const headers = [
      'Nit Empleado',
      'Empleado',
      'Área',
      'Cargo',
      'Sede',
      'Fecha',
      'Calificado',
      'Calificación Empleado',
      'Calificación Jefe',
      'Calificación Final',
      'Necesidades de Entrenamiento',
      'Compromisos',
    ];

    const rows = data.map((r) => [
      String(r.nitEmpleado),
      r.empleado,
      r.area,
      r.cargo,
      r.sede,
      r.fecha,
      r.calificado === 1 ? 'Sí' : 'No',
      r.calificacionEmpleado.toFixed(2),
      r.calificacionJefe.toFixed(2),
      r.calificacionFinal.toFixed(2),
      r.capacidadesEntrenamiento ?? '',
      r.compromisos ?? '',
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
    a.download = 'informe-desempeno-empleado.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Año</label>
            <select
              className={inputClass}
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
            >
              <option value="">Seleccione un año</option>
              {anios.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Sede</label>
            <select
              className={inputClass}
              value={sede}
              onChange={(e) => setSede(e.target.value)}
            >
              <option value="">Todas</option>
              {SEDES_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleFiltrar}
            disabled={mutation.isPending || !anio}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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
                <th className="px-2 py-1 text-left">Nit Empleado</th>
                <th className="px-2 py-1 text-left">Empleado</th>
                <th className="px-2 py-1 text-left">Área</th>
                <th className="px-2 py-1 text-left">Cargo</th>
                <th className="px-2 py-1 text-left">Sede</th>
                <th className="px-2 py-1 text-left">Fecha</th>
                <th className="px-2 py-1 text-left">Calificado</th>
                <th className="px-2 py-1 text-left">Calificación Empleado</th>
                <th className="px-2 py-1 text-left">Calificación Jefe</th>
                <th className="px-2 py-1 text-left">Calificación Final</th>
                <th className="px-2 py-1 text-left">Necesidades de Entrenamiento</th>
                <th className="px-2 py-1 text-left">Compromisos</th>
                <th className="px-2 py-1 text-left">Ver detallado</th>
              </tr>
            </thead>
            <tbody>
              {!mutation.isPending && !data.length && (
                <tr>
                  <td colSpan={13} className="px-2 py-4 text-center text-gray-500">
                    No hay datos para mostrar
                  </td>
                </tr>
              )}
              {data.map((row) => (
                <tr key={row.id} className="border-t text-[11px]">
                  <td className="px-2 py-1">{row.nitEmpleado}</td>
                  <td className="px-2 py-1">{row.empleado}</td>
                  <td className="px-2 py-1">{row.area}</td>
                  <td className="px-2 py-1">{row.cargo}</td>
                  <td className="px-2 py-1">{row.sede}</td>
                  <td className="px-2 py-1">{row.fecha}</td>
                  <td className="px-2 py-1">{row.calificado === 1 ? 'Sí' : 'No'}</td>
                  <td className="px-2 py-1">{row.calificacionEmpleado.toFixed(2)}</td>
                  <td className="px-2 py-1">{row.calificacionJefe.toFixed(2)}</td>
                  <td className="px-2 py-1">{row.calificacionFinal.toFixed(2)}</td>
                  <td className="px-2 py-1">{row.capacidadesEntrenamiento}</td>
                  <td className="px-2 py-1">{row.compromisos}</td>
                  <td className="px-2 py-1">
                    {row.calificado === 1 ? (
                      <a
                        href={`https://intranet.codiesel.co/postventa/FormatosDigitales/verEvaluacion?id=${row.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-3 py-1 rounded-md bg-(--color-primary) text-white text-[11px] font-medium shadow hover:opacity-90"
                      >
                        Ver detallado
                      </a>
                    ) : (
                      ''
                    )}
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

