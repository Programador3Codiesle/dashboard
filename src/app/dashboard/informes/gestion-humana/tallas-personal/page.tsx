'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { tallasPersonalService } from '@/modules/informes/gestion-humana/services/tallas-personal.service';
import { useToast } from '@/components/shared/ui/ToastContext';
import { Pagination } from '@/components/shared/ui/Pagination';

const PAGE_SIZE = 25;

export default function TallasPersonalPage() {
  const { showError } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['informes', 'tallas-personal'],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
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
  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, currentPage]);

  const handleExportCsv = () => {
    if (!rows.length) return;

    const excelRows = rows.map((r) => {
      const genero = r.genero === 0 ? 'Mujer' : 'Hombre';
      const botas = !r.talla_botas || r.talla_botas === 0 ? 'No aplica' : String(r.talla_botas);
      return {
        Documento: String(r.nit),
        Nombre: r.nombre,
        Genero: genero,
        'Talla Camisa': r.talla_camisa ?? '',
        'Talla Pantalón': r.talla_pantalon ?? '',
        'Talla Botas': botas,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TallasPersonal');
    XLSX.writeFile(workbook, 'informe-tallas-personal.xlsx');
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
                paginatedRows.map((r) => {
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
        {!isLoading && totalItems > 0 && (
          <div className="p-4 border-t border-gray-200 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

