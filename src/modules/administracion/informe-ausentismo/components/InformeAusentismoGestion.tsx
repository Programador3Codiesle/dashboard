'use client';

import { useCallback, useMemo, useState, memo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { getXlsx } from '@/utils/export-xlsx';
import { Pagination } from '@/components/shared/ui/Pagination';
import {
  informeAusentismoService,
  type AusentismoInforme,
} from '@/modules/administracion/services/informe-ausentismo.service';
import DetalleAusentismoModal from '@/components/administracion/modals/DetalleAusentismoModal';
import { useToast } from '@/components/shared/ui/ToastContext';
import { SearchFilter } from '@/components/administracion/filters/SearchFilter';
import { DateRangeFilter } from '@/components/administracion/filters/DateRangeFilter';
import { SelectFilter } from '@/components/shared/ui/SelectFilter';
import { AusentismoTableRow } from '@/components/administracion/table/AusentismoTableRow';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { AdministracionPageFrame } from '@/modules/administracion/components/AdministracionPageFrame';
import {
  ADMINISTRACION_COPY,
  AREAS_INFORME_AUSENTISMO,
  SEDES_INFORME_AUSENTISMO,
} from '@/modules/administracion/constants';
import { AdministracionQueryError } from '@/modules/administracion/shared/components/AdministracionQueryError';
import { administracionKeys } from '@/modules/administracion/shared/constants/query-keys';
import { useAdministracionPageGuard } from '@/modules/administracion/shared/hooks/useAdministracionPageGuard';
import { getErrorMessage } from '@/modules/administracion/shared/utils/parse-api-error';
import { INFORME_AUSENTISMO_SUBMENU_ID } from '@/utils/constants';

const PAGE_SIZE = 10;

function fechaDmY(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function veTodosLosAusentismos(nit: unknown, perfil: unknown): boolean {
  return (
    String(nit ?? '') === '63369607' ||
    Number(perfil) === 20 ||
    Number(perfil) === 25
  );
}

type AppliedAusentismo = {
  fechaInicio: string;
  fechaFin: string;
  sede: string;
  area: string;
  search: string;
};

function serializeAusentismoParams(applied: AppliedAusentismo, page: number) {
  return [
    applied.fechaInicio,
    applied.fechaFin,
    applied.sede,
    applied.area,
    applied.search,
    String(page),
  ].join('|');
}

const TablaAusentismos = memo(function TablaAusentismos({
  ausentismos,
  ausentismosMostrados,
  loading,
  onVerDetalle,
}: {
  ausentismos: AusentismoInforme[];
  ausentismosMostrados: AusentismoInforme[];
  loading: boolean;
  onVerDetalle: (a: AusentismoInforme) => void;
}) {
  return (
    <div data-testid="adm-table" className="app-table-scroll relative">
      {loading && ausentismos.length > 0 && (
        <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-b-xl">
          <div className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-lg shadow-md">
            <Loader2 className="animate-spin" size={20} />
            <span>Cargando...</span>
          </div>
        </div>
      )}
      <table className="w-full min-w-[1100px]">
        <thead className="brand-bg border-b border-(--color-primary-dark) text-sm">
          <tr>
            <th className="text-left py-4 px-6 font-semibold text-white">
              Gestionado Por
            </th>
            <th className="text-left py-4 px-6 font-semibold text-white">
              Colaborador
            </th>
            <th className="text-left py-4 px-6 font-semibold text-white">Sede</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Área</th>
            <th className="text-left py-4 px-6 font-semibold text-white">
              Fecha Inicio
            </th>
            <th className="text-left py-4 px-6 font-semibold text-white">
              Hora Inicio
            </th>
            <th className="text-left py-4 px-6 font-semibold text-white">
              Fecha Fin
            </th>
            <th className="text-left py-4 px-6 font-semibold text-white">
              Hora Fin
            </th>
            <th className="text-left py-4 px-6 font-semibold text-white">
              Estado
            </th>
            <th className="text-left py-4 px-6 font-semibold text-white">
              Detalle
            </th>
          </tr>
        </thead>
        <tbody>
          {loading && ausentismos.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center py-10">
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Cargando ausentismos...</span>
                </div>
              </td>
            </tr>
          ) : ausentismosMostrados.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center py-10 text-gray-500">
                No se encontraron resultados
              </td>
            </tr>
          ) : (
            ausentismosMostrados.map((ausentismo, index) => (
              <AusentismoTableRow
                key={`${ausentismo.id}-${index}`}
                ausentismo={ausentismo}
                onVerDetalle={onVerDetalle}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
});

const PaginacionAusentismos = memo(function PaginacionAusentismos({
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
  fechaInicio,
  fechaFin,
  filtroSede,
  filtroArea,
  onFechaInicioChange,
  onFechaFinalChange,
  onFiltroSedeChange,
  onFiltroAreaChange,
  onBuscar,
  onExportar,
  loading,
  loadingExport,
  totalRegistros,
}: {
  fechaInicio: string;
  fechaFin: string;
  filtroSede: string;
  filtroArea: string;
  onFechaInicioChange: (v: string) => void;
  onFechaFinalChange: (v: string) => void;
  onFiltroSedeChange: (v: string) => void;
  onFiltroAreaChange: (v: string) => void;
  onBuscar: () => void;
  onExportar: () => void;
  loading: boolean;
  loadingExport: boolean;
  totalRegistros: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6 space-y-4"
    >
      <div className="app-filter-grid">
        <DateRangeFilter
          fechaInicio={fechaInicio}
          fechaFinal={fechaFin}
          onFechaInicioChange={onFechaInicioChange}
          onFechaFinalChange={onFechaFinalChange}
          className="md:col-span-2"
        />
        <SelectFilter
          label="Sede"
          value={filtroSede}
          onChange={onFiltroSedeChange}
          options={SEDES_INFORME_AUSENTISMO}
          placeholder="Todas"
        />
        <SelectFilter
          label="Área"
          value={filtroArea}
          onChange={onFiltroAreaChange}
          options={AREAS_INFORME_AUSENTISMO}
          placeholder="Todas"
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          data-testid="adm-buscar"
          onClick={onBuscar}
          disabled={loading}
          className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 transition-colors"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          <span>Buscar</span>
        </button>
        <button
          type="button"
          onClick={onExportar}
          disabled={loadingExport || totalRegistros === 0}
          className={`inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
            totalRegistros > 0
              ? 'bg-emerald-600 text-white hover:opacity-90'
              : 'border border-gray-300 text-gray-700 bg-white'
          }`}
        >
          {loadingExport && <Loader2 size={16} className="animate-spin" />}
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

export function InformeAusentismoGestion() {
  const { user, blocked } = useAdministracionPageGuard(
    INFORME_AUSENTISMO_SUBMENU_ID,
  );
  const sesionLista = !!user && !blocked;
  const { showError } = useToast();
  const veTodos = veTodosLosAusentismos(
    user?.nit_usuario,
    user?.perfil_postventa,
  );
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [filtroSede, setFiltroSede] = useState('');
  const [filtroArea, setFiltroArea] = useState('');
  const [applied, setApplied] = useState<AppliedAusentismo>({
    fechaInicio: '',
    fechaFin: '',
    sede: '',
    area: '',
    search: '',
  });
  const [page, setPage] = useState(1);
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [ausentismoSeleccionado, setAusentismoSeleccionado] =
    useState<AusentismoInforme | null>(null);
  const [loadingExport, setLoadingExport] = useState(false);

  const paramsString = serializeAusentismoParams(applied, page);

  const query = useQuery({
    queryKey: administracionKeys.informeAusentismo(paramsString),
    queryFn: () =>
      informeAusentismoService.listar({
        fechaDesde: applied.fechaInicio || undefined,
        fechaHasta: applied.fechaFin || undefined,
        sede: applied.sede || undefined,
        area: applied.area || undefined,
        empleado: applied.search.trim() || undefined,
        pagina: page,
        limite: PAGE_SIZE,
      }),
    enabled: sesionLista,
    placeholderData: keepPreviousData,
    ...transactionalQueryOptions,
  });

  const presentar = useCallback(
    (item: AusentismoInforme): AusentismoInforme => ({
      ...item,
      fechaInicio: fechaDmY(item.fechaInicio),
      fechaFin: fechaDmY(item.fechaFin),
      estado:
        item.estado === 'Pendiente' && !veTodos
          ? 'Pendiente de Autorizar'
          : item.estado,
    }),
    [veTodos],
  );
  const ausentismos = useMemo(
    () => (query.data?.items ?? []).map(presentar),
    [query.data?.items, presentar],
  );
  const totalItems = query.data?.total ?? 0;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;
  const loading = query.isFetching;

  const changePage = useCallback((next: number) => {
    setPage(next);
  }, []);

  const handleVerDetalle = useCallback((ausentismo: AusentismoInforme) => {
    setAusentismoSeleccionado(ausentismo);
    setDetalleModalOpen(true);
  }, []);

  const handleBuscar = useCallback(() => {
    if (!fechaInicio || !fechaFin) {
      showError(
        'Seleccione fecha de inicio y fecha final para generar el informe',
      );
      return;
    }
    setApplied((prev) => ({
      ...prev,
      fechaInicio,
      fechaFin,
      sede: filtroSede,
      area: filtroArea,
    }));
    setPage(1);
  }, [fechaInicio, fechaFin, filtroSede, filtroArea, showError]);

  const handleSearch = useCallback((value: string) => {
    setApplied((prev) => ({ ...prev, search: value }));
    setPage(1);
  }, []);

  const handleExportar = useCallback(async () => {
    if (!applied || totalItems === 0) {
      showError('No hay datos para exportar');
      return;
    }
    setLoadingExport(true);
    try {
      const resultado = await informeAusentismoService.listar({
        fechaDesde: applied.fechaInicio || undefined,
        fechaHasta: applied.fechaFin || undefined,
        sede: applied.sede || undefined,
        area: applied.area || undefined,
        empleado: applied.search.trim() || undefined,
        pagina: 1,
        limite: totalItems,
      });
      const rows = resultado.items.map((r) => {
        const item = presentar(r);
        return {
          Nombre: item.colaborador,
          Documento: item.documento,
          Cargo: item.cargo,
          Sede: item.sede,
          Area: item.area,
          'Fecha inicio': item.fechaInicio,
          'Hora inicio': item.horaInicio,
          'Fecha fin': item.fechaFin,
          'Hora fin': item.horaFin,
          Motivo: item.motivo,
          Descripcion: item.detalle,
          Estado: item.estado,
          'Gestionado por': item.gestionadoPor,
        };
      });
      const XLSX = await getXlsx();
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ausentismo');
      XLSX.writeFile(workbook, 'informe_de_ausentismo.xlsx');
    } catch {
      showError('No se pudo exportar el informe');
    } finally {
      setLoadingExport(false);
    }
  }, [applied, totalItems, showError, presentar]);

  if (blocked) return null;

  return (
    <AdministracionPageFrame
      title={ADMINISTRACION_COPY.informeAusentismo.title}
      description={ADMINISTRACION_COPY.informeAusentismo.description}
    >
      {query.isError ? (
        <AdministracionQueryError
          message={getErrorMessage(
            query.error,
            ADMINISTRACION_COPY.informeAusentismo.loadError,
          )}
        />
      ) : null}

      <FiltersSection
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        filtroSede={filtroSede}
        filtroArea={filtroArea}
        onFechaInicioChange={setFechaInicio}
        onFechaFinalChange={setFechaFin}
        onFiltroSedeChange={(value) => {
          setFiltroSede(value);
          setApplied((prev) => ({ ...prev, sede: value }));
          setPage(1);
        }}
        onFiltroAreaChange={(value) => {
          setFiltroArea(value);
          setApplied((prev) => ({ ...prev, area: value }));
          setPage(1);
        }}
        onBuscar={handleBuscar}
        onExportar={handleExportar}
        loading={loading}
        loadingExport={loadingExport}
        totalRegistros={totalItems}
      />

      <SearchSection
        onSearch={handleSearch}
        placeholder="Documento, nombre del empleado o del jefe"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <TablaAusentismos
          ausentismos={ausentismos}
          ausentismosMostrados={ausentismos}
          loading={loading}
          onVerDetalle={handleVerDetalle}
        />
        <PaginacionAusentismos
          currentPage={page}
          totalPages={totalPages}
          onChange={changePage}
        />
      </motion.div>

      <DetalleAusentismoModal
        key={
          ausentismoSeleccionado
            ? `detalle-${ausentismoSeleccionado.id}-${ausentismoSeleccionado.colaborador}-${ausentismoSeleccionado.fechaInicio}-${ausentismoSeleccionado.horaInicio}`
            : 'detalle-closed'
        }
        open={detalleModalOpen}
        onClose={() => {
          setDetalleModalOpen(false);
          setAusentismoSeleccionado(null);
        }}
        ausentismo={ausentismoSeleccionado}
      />
    </AdministracionPageFrame>
  );
}
