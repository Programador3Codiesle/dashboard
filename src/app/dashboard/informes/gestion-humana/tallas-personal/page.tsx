'use client';

import { useQuery } from '@tanstack/react-query';
import { tallasPersonalService } from '@/modules/informes/gestion-humana/services/tallas-personal.service';
import { useToast } from '@/components/shared/ui/ToastContext';

export default function TallasPersonalPage() {
  const { showError } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['informes', 'tallas-personal'],
    queryFn: async () => {
      try {
        return await tallasPersonalService.listar();
      } catch (error: any) {
        showError(
          error?.response?.data?.message ||
            'Error consultando informe de tallas del personal',
        );
        throw error;
      }
    },
  });

  const rows = data ?? [];

  const handleExportCsv = () => {
    if (!rows.length) return;

    const headers = [
      'Documento',
      'Nombre',
      'Genero',
      'Talla Camisa',
      'Talla Pantalón',
      'Talla Botas',
    ];

    const csvRows = rows.map((r) => {
      const genero = r.genero === 0 ? 'Mujer' : 'Hombre';
      const botas = !r.talla_botas || r.talla_botas === 0 ? 'No aplica' : String(r.talla_botas);
      return [
        String(r.nit),
        r.nombre,
        genero,
        r.talla_camisa ?? '',
        r.talla_pantalon ?? '',
        botas,
      ];
    });

    const csvContent =
      [headers, ...csvRows]
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
    a.download = 'informe-tallas-personal.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            Consulta consolidada de tallas de dotación del personal.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={!rows.length}
          className="inline-flex items-center px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium shadow hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Exportar a Excel
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs" id="tabladatos">
            <thead className="bg-(--color-primary) text-white">
              <tr>
                <th className="px-2 py-1 text-left">Documento</th>
                <th className="px-2 py-1 text-left">Nombre</th>
                <th className="px-2 py-1 text-left">Genero</th>
                <th className="px-2 py-1 text-left">Talla Camisa</th>
                <th className="px-2 py-1 text-left">Talla Pantalón</th>
                <th className="px-2 py-1 text-left">Talla Botas</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-2 py-4 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              )}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-2 py-4 text-center text-gray-500">
                    No hay datos para mostrar
                  </td>
                </tr>
              )}
              {!isLoading &&
                rows.map((r) => {
                  const genero = r.genero === 0 ? 'Mujer' : 'Hombre';
                  const botas =
                    !r.talla_botas || r.talla_botas === 0
                      ? 'No aplica'
                      : String(r.talla_botas);
                  return (
                    <tr key={r.nit} className="border-t text-[11px]">
                      <td className="px-2 py-1">{r.nit}</td>
                      <td className="px-2 py-1">{r.nombre}</td>
                      <td className="px-2 py-1">{genero}</td>
                      <td className="px-2 py-1">{r.talla_camisa}</td>
                      <td className="px-2 py-1">{r.talla_pantalon}</td>
                      <td className="px-2 py-1">{botas}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

