'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { checklistPesvService, TipoChecklistPesv } from '@/modules/informes/gestion-humana/services/checklist-pesv.service';
import { useToast } from '@/components/shared/ui/ToastContext';
import { Pagination } from '@/components/shared/ui/Pagination';
import { InformesPageFrame } from '@/modules/informes/components/InformesPageFrame';
import { INFORMES_COPY, INFORMES_GH_TRIMENU } from '@/modules/informes/constants';
import { InformesQueryError } from '@/modules/informes/shared/components/InformesQueryError';
import { informesKeys } from '@/modules/informes/shared/constants/query-keys';
import { useInformesPageGuard } from '@/modules/informes/shared/hooks/useInformesPageGuard';
import { getErrorMessage } from '@/modules/informes/shared/utils/parse-api-error';

const PAGE_SIZE = 10;

export function IndicadorChecklistPesvGestion() {
  const { blocked } = useInformesPageGuard({
    trimenuId: INFORMES_GH_TRIMENU.indicadorChecklistPesv,
    redirectTo: '/dashboard/informes/gestion-humana',
  });
  const { showError, showInfo } = useToast();
  const [fechaIni, setFechaIni] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipo, setTipo] = useState<TipoChecklistPesv>('carro');
  const [placa, setPlaca] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filtrosAplicados, setFiltrosAplicados] = useState<{
    tipo: TipoChecklistPesv;
    placa?: string;
    fechaIni: string;
    fechaFin: string;
  } | null>(null);

  const {
    data = [],
    isFetching,
    isError,
    error,
    isFetched,
  } = useQuery({
    queryKey: informesKeys.gh.indicadorPesv(
      filtrosAplicados ? JSON.stringify(filtrosAplicados) : '',
    ),
    queryFn: () => checklistPesvService.listar(filtrosAplicados!),
    enabled: filtrosAplicados != null,
    retry: false,
  });

  const handleGenerar = () => {
    if (!fechaIni || !fechaFin) {
      showError('Por favor ingrese fecha inicial y fecha final.');
      return;
    }
    if (isFetching) return;
    setCurrentPage(1);
    setFiltrosAplicados({
      tipo,
      placa: placa.trim() || undefined,
      fechaIni,
      fechaFin,
    });
  };

  useEffect(() => {
    if (!isFetched || isFetching || filtrosAplicados == null) return;
    if (data.length === 0) {
      showInfo('Con los filtros seleccionados no se encontraron registros.');
    }
  }, [isFetched, isFetching, filtrosAplicados, data.length, showInfo]);

  const consultaSinResultados = isFetched && data.length === 0;

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, safeCurrentPage]);

  const fieldClass =
    'border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white w-full';

  const hasDates = Boolean(fechaIni && fechaFin);

  if (blocked) return null;

  return (
    <InformesPageFrame
      title={INFORMES_COPY.indicadorChecklistPesv.title}
      description={INFORMES_COPY.indicadorChecklistPesv.description}
      backHref="/dashboard/informes/gestion-humana"
      backLabel={INFORMES_COPY.backGh}
    >
      {isError ? (
        <InformesQueryError
          message={getErrorMessage(
            error,
            INFORMES_COPY.indicadorChecklistPesv.loadError,
          )}
        />
      ) : null}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Fecha inicial
            </label>
            <input
              type="date"
              value={fechaIni}
              onChange={(e) => setFechaIni(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Fecha final
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Tipo</label>
            <select
              className={fieldClass}
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoChecklistPesv)}
            >
              <option value="carro">Carro</option>
              <option value="moto">Moto</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Placa (opcional)
            </label>
            <input
              type="text"
              className={fieldClass}
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              placeholder="Ej: ABC123"
            />
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleGenerar}
            disabled={isFetching || !hasDates}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isFetching && <Loader2 size={16} className="animate-spin" />}
            <span>{isFetching ? 'Consultando...' : 'Generar'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {!isFetching && totalItems > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-3 px-4 py-3 border-b border-gray-100">
            <span className="text-xs text-gray-500">
              {totalItems} placa{totalItems === 1 ? '' : 's'}
            </span>
          </div>
        )}
        <div className="app-table-scroll">
          <table className="w-full text-sm">
            <thead className="brand-bg border-b border-(--color-primary-dark) text-sm">
              <tr>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Placa
                </th>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">
                  N° Registros
                </th>
              </tr>
            </thead>
            <tbody>
              {isFetching && (
                <tr>
                  <td colSpan={2} className="text-center py-10">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Cargando datos...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!isFetching && data.length === 0 && consultaSinResultados && (
                <tr>
                  <td colSpan={2} className="text-center py-10 text-gray-500">
                    No se encontraron registros con los filtros seleccionados.
                  </td>
                </tr>
              )}
              {!isFetching && data.length === 0 && !consultaSinResultados && (
                <tr>
                  <td colSpan={2} className="text-center py-10 text-gray-500">
                    No hay datos para mostrar. Ingrese fechas y pulse Generar.
                  </td>
                </tr>
              )}
              {!isFetching &&
                paginatedRows.map((row) => (
                  <tr
                    key={row.placa}
                    className="border-b border-gray-100 hover:bg-gray-50/60"
                  >
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      {row.placa}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      {row.numRegistros.toLocaleString('es-CO')}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!isFetching && totalItems > 0 && (
          <div className="p-4 border-t border-gray-200 flex justify-center">
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </InformesPageFrame>
  );
}
