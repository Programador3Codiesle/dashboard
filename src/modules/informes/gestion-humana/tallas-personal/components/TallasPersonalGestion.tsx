'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tallasPersonalService } from '@/modules/informes/gestion-humana/services/tallas-personal.service';
import { useToast } from '@/components/shared/ui/ToastContext';
import { Pagination } from '@/components/shared/ui/Pagination';
import { InformesPageFrame } from '@/modules/informes/components/InformesPageFrame';
import { INFORMES_COPY, INFORMES_GH_TRIMENU } from '@/modules/informes/constants';
import { informesKeys } from '@/modules/informes/shared/constants/query-keys';
import { useInformesPageGuard } from '@/modules/informes/shared/hooks/useInformesPageGuard';
import { getErrorMessage } from '@/modules/informes/shared/utils/parse-api-error';

const PAGE_SIZE = 25;

export function TallasPersonalGestion() {
  const { blocked } = useInformesPageGuard({
    trimenuId: INFORMES_GH_TRIMENU.tallasPersonal,
    redirectTo: '/dashboard/informes/gestion-humana',
  });
  const { showError } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: informesKeys.gh.tallasPersonal(''),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      try {
        return await tallasPersonalService.listar();
      } catch (error: unknown) {
        showError(
          getErrorMessage(
            error,
            'Error consultando informe de tallas del personal',
          ),
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

  const handleExportCsv = async () => {
    if (!rows.length) return;
    const XLSX = await import('xlsx');

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

  if (blocked) return null;

  return (
    <InformesPageFrame
      title={INFORMES_COPY.tallasPersonal.title}
      description={INFORMES_COPY.tallasPersonal.description}
      backHref="/dashboard/informes/gestion-humana"
      backLabel={INFORMES_COPY.backGh}
    >
    <div className="space-y-4">
      <div className="flex">
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={!rows.length}
        className="inline-flex w-full sm:w-auto justify-center items-center px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium shadow hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Exportar a Excel
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="app-table-scroll">
          <table className="min-w-[720px] w-full text-xs" id="tabladatos">
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
    </InformesPageFrame>
  );
}

