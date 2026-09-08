'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Download, Loader2 } from 'lucide-react';
import { DateRangeFilter } from '@/components/administracion/filters/DateRangeFilter';
import { SearchFilter } from '@/components/administracion/filters/SearchFilter';
import { InasistenciaTableRow } from '@/components/administracion/table/InasistenciaTableRow';
import { Pagination } from '@/components/shared/ui/Pagination';
import { SelectFilter } from '@/components/shared/ui/SelectFilter';
import { usePagination } from '@/components/shared/ui/hooks/usePagination';
import { useToast } from '@/components/shared/ui/ToastContext';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { AdministracionPageFrame } from '@/modules/administracion/components/AdministracionPageFrame';
import { ADMINISTRACION_COPY } from '@/modules/administracion/constants';
import { AdministracionQueryError } from '@/modules/administracion/shared/components/AdministracionQueryError';
import { administracionKeys } from '@/modules/administracion/shared/constants/query-keys';
import { useAdministracionPageGuard } from '@/modules/administracion/shared/hooks/useAdministracionPageGuard';
import { inasistenciaService } from '@/modules/administracion/services/inasistencia.service';
import { getErrorMessage } from '@/modules/administracion/shared/utils/parse-api-error';
import { INASISTENCIA_SUBMENU_ID } from '@/utils/constants';

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function InasistenciaGestion({
  skipPageGuard = false,
}: {
  skipPageGuard?: boolean;
} = {}) {
  const { user, blocked } = useAdministracionPageGuard(
    skipPageGuard ? undefined : INASISTENCIA_SUBMENU_ID,
  );
  const { showError, showSuccess } = useToast();
  const sesionLista = !!user && !blocked;
  const today = useMemo(() => getToday(), []);
  const [search, setSearch] = useState('');
  const [filtroEmpleado, setFiltroEmpleado] = useState('');
  const [fechaInicio, setFechaInicio] = useState(today);
  const [fechaFinal, setFechaFinal] = useState(today);
  const [descargando, setDescargando] = useState(false);

  const query = useQuery({
    queryKey: administracionKeys.inasistencia(
      fechaInicio,
      fechaFinal,
      filtroEmpleado,
    ),
    queryFn: () =>
      inasistenciaService.listarInasistencias({
        empleado: filtroEmpleado || undefined,
        fechaInicio,
        fechaFinal,
      }),
    enabled: sesionLista && !!fechaInicio && !!fechaFinal,
    ...transactionalQueryOptions,
  });

  const inasistencias = useMemo(() => query.data ?? [], [query.data]);

  const filtered = useMemo(() => {
    if (!search) return inasistencias;
    const searchLower = search.toLowerCase();
    return inasistencias.filter(
      (item) =>
        item.documento.toLowerCase().includes(searchLower) ||
        item.nombre.toLowerCase().includes(searchLower),
    );
  }, [search, inasistencias]);

  const { currentPage, totalPages, startIndex, endIndex, changePage } =
    usePagination(filtered.length, 10);

  const inasistenciasMostradas = useMemo(
    () => filtered.slice(startIndex, endIndex),
    [filtered, startIndex, endIndex],
  );

  const empleadosUnicos = useMemo(() => {
    const seen = new Set<string>();
    return inasistencias
      .filter((item) => {
        if (seen.has(item.documento)) return false;
        seen.add(item.documento);
        return true;
      })
      .map((item) => ({ value: item.documento, label: item.nombre }));
  }, [inasistencias]);

  const handleDownload = useCallback(async () => {
    if (!fechaInicio || !fechaFinal) {
      showError('Seleccione fecha de inicio y fecha final para exportar');
      return;
    }
    setDescargando(true);
    try {
      const blob = await inasistenciaService.exportarExcel({
        empleado: filtroEmpleado || undefined,
        fechaInicio,
        fechaFinal,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inasistencias-${fechaInicio}-${fechaFinal}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess('Excel descargado correctamente');
    } catch {
      showError('Error al descargar el archivo Excel');
    } finally {
      setDescargando(false);
    }
  }, [fechaInicio, fechaFinal, filtroEmpleado, showError, showSuccess]);

  if (blocked) return null;

  return (
    <AdministracionPageFrame
      title={ADMINISTRACION_COPY.inasistencia.title}
      description={ADMINISTRACION_COPY.inasistencia.description}
    >
      {query.isError ? (
        <AdministracionQueryError
          message={getErrorMessage(
            query.error,
            ADMINISTRACION_COPY.inasistencia.loadError,
          )}
        />
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-100 bg-white p-3 shadow-lg sm:p-4 md:p-6"
      >
        <div className="app-filter-grid">
          <SelectFilter
            label="Empleado"
            value={filtroEmpleado}
            onChange={setFiltroEmpleado}
            options={empleadosUnicos}
            placeholder="Todos"
          />
          <DateRangeFilter
            fechaInicio={fechaInicio}
            fechaFinal={fechaFinal}
            onFechaInicioChange={setFechaInicio}
            onFechaFinalChange={setFechaFinal}
            className="md:col-span-2"
          />
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => void handleDownload()}
              disabled={descargando || !fechaInicio || !fechaFinal}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-success)] px-4 py-2.5 font-medium text-white shadow-md transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {descargando ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Descargando...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Descargar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      <SearchFilter
        onSearch={setSearch}
        placeholder="Buscar por documento o nombre..."
        className="w-full max-w-md"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg"
      >
        <div className="app-table-scroll">
          <table className="w-full min-w-[640px]">
            <thead className="brand-bg border-b border-(--color-primary-dark)">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-white">
                  Documento
                </th>
                <th className="px-6 py-4 text-left font-semibold text-white">
                  Nombre
                </th>
                <th className="px-6 py-4 text-left font-semibold text-white">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {query.isLoading ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Cargando inasistencias...</span>
                    </div>
                  </td>
                </tr>
              ) : !fechaInicio || !fechaFinal ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-gray-500">
                    Seleccione fecha de inicio y fecha final para generar el
                    informe
                  </td>
                </tr>
              ) : inasistenciasMostradas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-gray-500">
                    No se encontraron resultados
                  </td>
                </tr>
              ) : (
                inasistenciasMostradas.map((inasistencia) => (
                  <InasistenciaTableRow
                    key={inasistencia.id}
                    inasistencia={inasistencia}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 ? (
          <div className="border-t border-gray-200 p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onChange={changePage}
            />
          </div>
        ) : null}
      </motion.div>
    </AdministracionPageFrame>
  );
}
