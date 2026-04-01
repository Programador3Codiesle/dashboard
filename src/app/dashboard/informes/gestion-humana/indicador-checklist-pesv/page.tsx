'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { checklistPesvService, TipoChecklistPesv } from '@/modules/informes/gestion-humana/services/checklist-pesv.service';
import { useToast } from '@/components/shared/ui/ToastContext';
import { Pagination } from '@/components/shared/ui/Pagination';

const PAGE_SIZE = 10;

export default function IndicadorChecklistPesvPage() {
  const { showError, showInfo } = useToast();
  const consultaEnCursoRef = useRef(false);
  const [fechaIni, setFechaIni] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipo, setTipo] = useState<TipoChecklistPesv>('carro');
  const [placa, setPlaca] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const mutation = useMutation({
    retry: false,
    mutationFn: async () => {
      if (!fechaIni || !fechaFin) {
        throw new Error('Debe seleccionar fecha inicial y fecha final');
      }
      return checklistPesvService.listar({
        tipo,
        placa: placa.trim() || undefined,
        fechaIni,
        fechaFin,
      });
    },
    onSuccess: (result) => {
      if (result.length === 0) {
        showInfo(
          'Con los filtros seleccionados no se encontraron registros.',
        );
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Error consultando indicador Checklist PESV';
      showError(message);
    },
  });

  const handleGenerar = () => {
    if (!fechaIni || !fechaFin) {
      showError('Por favor ingrese fecha inicial y fecha final.');
      return;
    }
    if (mutation.isPending || consultaEnCursoRef.current) return;
    setCurrentPage(1);
    consultaEnCursoRef.current = true;
    mutation.mutate(undefined, {
      onSettled: () => {
        consultaEnCursoRef.current = false;
      },
    });
  };

  const data = mutation.data ?? [];
  const consultaSinResultados =
    mutation.isSuccess &&
    Array.isArray(mutation.data) &&
    mutation.data.length === 0;

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  useEffect(() => {
    if (mutation.isPending || totalItems === 0) return;
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, mutation.isPending, totalItems, totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, currentPage]);

  const fieldClass =
    'border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white w-full';

  const hasDates = Boolean(fechaIni && fechaFin);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">
            Indicador Checklist PESV
          </h1>
          <p className="text-gray-500 mt-1">
            Consulta el número de registros por placa en el rango de fechas, por tipo de vehículo.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
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
            disabled={mutation.isPending || !hasDates}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
            <span>{mutation.isPending ? 'Consultando...' : 'Generar'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {!mutation.isPending && totalItems > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-3 px-4 py-3 border-b border-gray-100">
            <span className="text-xs text-gray-500">
              {totalItems} placa{totalItems === 1 ? '' : 's'}
            </span>
          </div>
        )}
        <div className="overflow-x-auto">
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
              {mutation.isPending && (
                <tr>
                  <td colSpan={2} className="text-center py-10">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Cargando datos...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!mutation.isPending && data.length === 0 && consultaSinResultados && (
                <tr>
                  <td colSpan={2} className="text-center py-10 text-gray-500">
                    No se encontraron registros con los filtros seleccionados.
                  </td>
                </tr>
              )}
              {!mutation.isPending && data.length === 0 && !consultaSinResultados && (
                <tr>
                  <td colSpan={2} className="text-center py-10 text-gray-500">
                    No hay datos para mostrar. Ingrese fechas y pulse Generar.
                  </td>
                </tr>
              )}
              {!mutation.isPending &&
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
        {!mutation.isPending && totalItems > 0 && (
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
