'use client';

import { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useSedesByEmpresa } from '@/modules/administracion/hooks/useSedesByEmpresa';
import {
  informeTiempoSuplementarioService,
  type TiempoSuplementarioInforme,
} from '@/modules/administracion/services/informe-tiempo-suplementario.service';
import { useToast } from '@/components/shared/ui/ToastContext';
import { SearchFilter } from '@/components/administracion/filters/SearchFilter';
import { SelectFilter } from '@/components/shared/ui/SelectFilter';
import { TiempoSuplementarioTableRow } from '@/components/administracion/table/TiempoSuplementarioTableRow';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { AdministracionPageFrame } from '@/modules/administracion/components/AdministracionPageFrame';
import {
  ADMINISTRACION_COPY,
  AREAS_SOLICITA,
} from '@/modules/administracion/constants';
import { AdministracionQueryError } from '@/modules/administracion/shared/components/AdministracionQueryError';
import { administracionKeys } from '@/modules/administracion/shared/constants/query-keys';
import { useAdministracionPageGuard } from '@/modules/administracion/shared/hooks/useAdministracionPageGuard';
import { getErrorMessage } from '@/modules/administracion/shared/utils/parse-api-error';
import { INFORME_TIEMPO_SUPLEMENTARIO_SUBMENU_ID } from '@/utils/constants';

const PAGE_SIZE = 10;

type AppliedTiempo = {
  mes: string;
  sede: string;
  area: string;
  empleado: string;
};

function rangoMes(mes: string) {
  const [anio, mesNum] = mes.split('-');
  const fechaDesde = `${anio}-${mesNum}-01`;
  const ultimoDia = new Date(Number(anio), Number(mesNum), 0).getDate();
  const fechaHasta = `${anio}-${mesNum}-${ultimoDia}`;
  return { fechaDesde, fechaHasta };
}

function serializeTiempoParams(applied: AppliedTiempo) {
  return [applied.mes, applied.sede, applied.area, applied.empleado].join('|');
}

const TablaTiemposSuplementarios = memo(function TablaTiemposSuplementarios({
  tiempos,
  tiemposMostrados,
  loading,
  filtroMesAplicado,
}: {
  tiempos: TiempoSuplementarioInforme[];
  tiemposMostrados: TiempoSuplementarioInforme[];
  loading: boolean;
  filtroMesAplicado: string;
}) {
  return (
    <div className="app-table-scroll relative">
      {loading && tiempos.length > 0 && (
        <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-b-xl">
          <div className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-lg shadow-md">
            <Loader2 className="animate-spin" size={20} />
            <span>Cargando...</span>
          </div>
        </div>
      )}
      <table className="w-full min-w-[960px]">
        <thead className="brand-bg border-b border-(--color-primary-dark) text-sm">
          <tr>
            <th className="text-left py-4 px-6 font-semibold text-white">
              Nombre del Empleado
            </th>
            <th className="text-left py-4 px-6 font-semibold text-white">Sede</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Área</th>
            <th className="text-left py-4 px-6 font-semibold text-white">
              Fecha
            </th>
            <th className="text-left py-4 px-6 font-semibold text-white">
              Hora Inicio
            </th>
            <th className="text-left py-4 px-6 font-semibold text-white">
              Hora Fin
            </th>
            <th className="text-left py-4 px-6 font-semibold text-white">
              Descripción
            </th>
            <th className="text-left py-4 px-6 font-semibold text-white">
              Estado
            </th>
          </tr>
        </thead>
        <tbody>
          {loading && tiempos.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-10">
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Cargando tiempos suplementarios...</span>
                </div>
              </td>
            </tr>
          ) : !filtroMesAplicado ? (
            <tr>
              <td colSpan={8} className="text-center py-10 text-gray-500">
                Seleccione un mes para generar el informe
              </td>
            </tr>
          ) : tiemposMostrados.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-10 text-gray-500">
                No se encontraron resultados
              </td>
            </tr>
          ) : (
            tiemposMostrados.map((tiempo) => (
              <TiempoSuplementarioTableRow key={tiempo.id} tiempo={tiempo} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
});

const PaginacionTiempos = memo(function PaginacionTiempos({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="p-4 border-t border-gray-200">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onChange={onChange}
      />
    </div>
  );
});

const FiltersSection = memo(function FiltersSection({
  filtroMes,
  filtroSede,
  filtroArea,
  filtroEmpleado,
  sedesOptions,
  empleadosOptions,
  onFiltroMesChange,
  onFiltroSedeChange,
  onFiltroAreaChange,
  onFiltroEmpleadoChange,
  onBuscar,
  loading,
  onDownload,
  descargando,
  totalRegistros,
}: {
  filtroMes: string;
  filtroSede: string;
  filtroArea: string;
  filtroEmpleado: string;
  sedesOptions: { value: string; label: string }[];
  empleadosOptions: { value: string; label: string }[];
  onFiltroMesChange: (v: string) => void;
  onFiltroSedeChange: (v: string) => void;
  onFiltroAreaChange: (v: string) => void;
  onFiltroEmpleadoChange: (v: string) => void;
  onBuscar: () => void;
  loading: boolean;
  onDownload: () => void;
  descargando: boolean;
  totalRegistros: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6 space-y-4"
    >
      <div className="app-filter-grid">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seleccionar Mes
          </label>
          <input
            type="month"
            className="block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none transition-all text-sm bg-white"
            value={filtroMes}
            onChange={(e) => onFiltroMesChange(e.target.value)}
          />
        </div>
        <SelectFilter
          label="Seleccionar Sede"
          value={filtroSede}
          onChange={onFiltroSedeChange}
          options={sedesOptions}
          placeholder="Todas"
        />
        <SelectFilter
          label="Seleccionar Área"
          value={filtroArea}
          onChange={onFiltroAreaChange}
          options={AREAS_SOLICITA.map((area) => ({ value: area, label: area }))}
          placeholder="Todas"
        />
        <SelectFilter
          label="Seleccionar Empleado"
          value={filtroEmpleado}
          onChange={onFiltroEmpleadoChange}
          options={empleadosOptions}
          placeholder="Todos"
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          onClick={onBuscar}
          disabled={loading}
          className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 transition-colors"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          <span>Buscar</span>
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={descargando || loading || totalRegistros === 0}
          className={`inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
            totalRegistros > 0
              ? 'bg-emerald-600 text-white hover:opacity-90'
              : 'border border-gray-300 text-gray-700 bg-white'
          }`}
        >
          {descargando && <Loader2 size={16} className="animate-spin" />}
          <FileSpreadsheet size={16} />
          <span>Exportar a Excel</span>
        </button>
        {totalRegistros > 0 && (
          <span className="text-xs text-gray-500">
            {totalRegistros} registro{totalRegistros === 1 ? '' : 's'}
          </span>
        )}
      </div>
    </motion.div>
  );
});

const SearchSection = memo(function SearchSection({
  onSearch,
  placeholder,
}: {
  onSearch: (v: string) => void;
  placeholder: string;
}) {
  return <SearchFilter onSearch={onSearch} placeholder={placeholder} />;
});

export function InformeTiempoSuplementarioGestion({
  skipPageGuard = false,
}: {
  skipPageGuard?: boolean;
} = {}) {
  const { user, blocked } = useAdministracionPageGuard(
    skipPageGuard ? undefined : INFORME_TIEMPO_SUPLEMENTARIO_SUBMENU_ID,
  );
  const sesionLista = !!user && !blocked;
  const { showError, showSuccess } = useToast();
  const sedes = useSedesByEmpresa();
  const sedesOptions = useMemo(
    () => sedes.map((sede) => ({ value: sede, label: sede })),
    [sedes],
  );
  const [search, setSearch] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroSede, setFiltroSede] = useState('');
  const [filtroArea, setFiltroArea] = useState('');
  const [filtroEmpleado, setFiltroEmpleado] = useState('');
  const [applied, setApplied] = useState<AppliedTiempo | null>(null);
  const [page, setPage] = useState(1);
  const [empleadosOptions, setEmpleadosOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [descargando, setDescargando] = useState(false);

  const paramsString = applied ? serializeTiempoParams(applied) : '';

  const query = useQuery({
    queryKey: administracionKeys.informeTiempo(paramsString),
    queryFn: () => {
      const { fechaDesde, fechaHasta } = rangoMes(applied!.mes);
      return informeTiempoSuplementarioService.listar({
        fechaDesde,
        fechaHasta,
        sede: applied!.sede || undefined,
        area: applied!.area || undefined,
        empleado: applied!.empleado.trim() || undefined,
      });
    },
    enabled: sesionLista && !!applied,
    placeholderData: keepPreviousData,
    ...transactionalQueryOptions,
  });

  const tiempos = useMemo(() => query.data ?? [], [query.data]);
  const loading = query.isFetching;

  useEffect(() => {
    if (!applied) {
      setEmpleadosOptions([]);
      return;
    }
    if (!query.data || applied.empleado.trim()) return;
    const nombres = [
      ...new Set(query.data.map((d) => d.nombreEmpleado).filter(Boolean)),
    ].sort();
    setEmpleadosOptions(nombres.map((n) => ({ value: n, label: n })));
  }, [applied, query.data]);

  useEffect(() => {
    if (!filtroMes) setFiltroEmpleado('');
  }, [filtroMes]);

  const handleBuscar = useCallback(() => {
    if (!filtroMes) {
      showError('Seleccione un mes para generar el informe');
      return;
    }
    setApplied({
      mes: filtroMes,
      sede: filtroSede,
      area: filtroArea,
      empleado: filtroEmpleado,
    });
    setPage(1);
  }, [filtroMes, filtroSede, filtroArea, filtroEmpleado, showError]);

  const filtered = useMemo(() => {
    let result = tiempos;
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.nombreEmpleado.toLowerCase().includes(searchLower) ||
          item.descripcion.toLowerCase().includes(searchLower),
      );
    }
    return result;
  }, [search, tiempos]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const tiemposMostrados = useMemo(
    () => filtered.slice(startIndex, startIndex + PAGE_SIZE),
    [filtered, startIndex],
  );

  const handleDownload = useCallback(async () => {
    if (!applied?.mes) {
      showError('Seleccione un mes para exportar');
      return;
    }
    setDescargando(true);
    try {
      const { fechaDesde, fechaHasta } = rangoMes(applied.mes);
      const blob = await informeTiempoSuplementarioService.exportarExcel({
        fechaDesde,
        fechaHasta,
        sede: applied.sede || undefined,
        area: applied.area || undefined,
        empleado: applied.empleado.trim() || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `informe-tiempo-suplementario-${applied.mes}.xlsx`;
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
  }, [applied, showError, showSuccess]);

  if (blocked) return null;

  return (
    <AdministracionPageFrame
      title={ADMINISTRACION_COPY.informeTiempoSuplementario.title}
      description={ADMINISTRACION_COPY.informeTiempoSuplementario.description}
    >
      {query.isError ? (
        <AdministracionQueryError
          message={getErrorMessage(
            query.error,
            ADMINISTRACION_COPY.informeTiempoSuplementario.loadError,
          )}
        />
      ) : null}

      <FiltersSection
        filtroMes={filtroMes}
        filtroSede={filtroSede}
        filtroArea={filtroArea}
        filtroEmpleado={filtroEmpleado}
        sedesOptions={sedesOptions}
        empleadosOptions={empleadosOptions}
        onFiltroMesChange={setFiltroMes}
        onFiltroSedeChange={setFiltroSede}
        onFiltroAreaChange={setFiltroArea}
        onFiltroEmpleadoChange={setFiltroEmpleado}
        onBuscar={handleBuscar}
        loading={loading}
        onDownload={() => void handleDownload()}
        descargando={descargando}
        totalRegistros={filtered.length}
      />

      <SearchSection
        onSearch={setSearch}
        placeholder="Buscar por nombre, jefe o descripción..."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <TablaTiemposSuplementarios
          tiempos={tiempos}
          tiemposMostrados={tiemposMostrados}
          loading={loading}
          filtroMesAplicado={applied?.mes ?? ''}
        />
        <PaginacionTiempos
          currentPage={safePage}
          totalPages={totalPages}
          onChange={setPage}
        />
      </motion.div>
    </AdministracionPageFrame>
  );
}
