'use client';

import { useState, useMemo, useEffect, useCallback, memo } from "react";
import { motion } from "framer-motion";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { AREAS_INFORME_AUSENTISMO } from "@/modules/administracion/constants";
import { useSedesByEmpresa } from "@/modules/administracion/hooks/useSedesByEmpresa";
import { Pagination } from "@/components/shared/ui/Pagination";
import { informeAusentismoService, AusentismoInforme } from "@/modules/administracion/services/informe-ausentismo.service";
import DetalleAusentismoModal from "@/components/administracion/modals/DetalleAusentismoModal";
import { useToast } from "@/components/shared/ui/ToastContext";
import { SearchFilter } from "@/components/administracion/filters/SearchFilter";
import { DateRangeFilter } from "@/components/administracion/filters/DateRangeFilter";
import { SelectFilter } from "@/components/shared/ui/SelectFilter";
import { AusentismoTableRow } from "@/components/administracion/table/AusentismoTableRow";

const PAGE_SIZE = 10;

/** Solo se re-renderiza cuando cambian datos/loading; evita parpadeo en header, filtros y paginación */
const TablaAusentismos = memo(function TablaAusentismos({
  ausentismos,
  ausentismosMostrados,
  loading,
  fechaInicio,
  fechaFin,
  onVerDetalle,
}: {
  ausentismos: AusentismoInforme[];
  ausentismosMostrados: AusentismoInforme[];
  loading: boolean;
  fechaInicio: string;
  fechaFin: string;
  onVerDetalle: (a: AusentismoInforme) => void;
}) {
  return (
    <div className="overflow-x-auto relative">
      {loading && ausentismos.length > 0 && (
        <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-b-xl">
          <div className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-lg shadow-md">
            <Loader2 className="animate-spin" size={20} />
            <span>Cargando...</span>
          </div>
        </div>
      )}
      <table className="w-full">
        <thead className="brand-bg border-b border-(--color-primary-dark) text-sm">
          <tr>
            <th className="text-left py-4 px-6 font-semibold text-white">Gestionado Por</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Colaborador</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Sede</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Área</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Fecha Inicio</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Hora Inicio</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Fecha Fin</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Hora Fin</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Estado</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Detalle</th>
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
          ) : !fechaInicio || !fechaFin ? (
            <tr>
              <td colSpan={10} className="text-center py-10 text-gray-500">
                Seleccione fecha de inicio y fecha final para generar el informe
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

/** Paginación memoizada: no se re-renderiza cuando solo cambian datos/loading de la tabla */
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
      <Pagination currentPage={currentPage} totalPages={totalPages} onChange={onChange} />
    </div>
  );
});

const HeaderSection = memo(function HeaderSection() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">Informe Ausentismo</h1>
        <p className="text-gray-500 mt-1">Informe detallado de ausentismo multiempresa</p>
      </div>
    </div>
  );
});

const FiltersSection = memo(function FiltersSection({
  fechaInicio,
  fechaFin,
  filtroSede,
  filtroArea,
  sedesOptions,
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
  sedesOptions: { value: string; label: string }[];
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
      className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          options={sedesOptions}
          placeholder="Todas"
        />
        <SelectFilter
          label="Área"
          value={filtroArea}
          onChange={onFiltroAreaChange}
          options={AREAS_INFORME_AUSENTISMO.map((area) => ({ value: area, label: area }))}
          placeholder="Todas"
        />
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <button
          type="button"
          onClick={onBuscar}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 transition-colors"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          <span>Buscar</span>
        </button>
        <button
          type="button"
          onClick={onExportar}
          disabled={loadingExport || totalRegistros === 0}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
            totalRegistros > 0
              ? "bg-emerald-600 text-white hover:opacity-90"
              : "border border-gray-300 text-gray-700 bg-white"
          }`}
        >
          {loadingExport && <Loader2 size={16} className="animate-spin" />}
          <FileSpreadsheet size={16} />
          <span>Exportar a Excel</span>
        </button>
        {totalRegistros > 0 && (
          <span className="text-xs text-gray-500">
            {totalRegistros} registro{totalRegistros === 1 ? "" : "s"}
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

export default function InformeAusentismoPage() {
  const { showError } = useToast();
  const sedes = useSedesByEmpresa();
  const sedesOptions = useMemo(() => sedes.map((sede) => ({ value: sede, label: sede })), [sedes]);
  const [search, setSearch] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [filtroSede, setFiltroSede] = useState("");
  const [filtroArea, setFiltroArea] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedFechaInicio, setAppliedFechaInicio] = useState("");
  const [appliedFechaFin, setAppliedFechaFin] = useState("");
  const [appliedSede, setAppliedSede] = useState("");
  const [appliedArea, setAppliedArea] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [ausentismoSeleccionado, setAusentismoSeleccionado] = useState<AusentismoInforme | null>(null);
  const [ausentismos, setAusentismos] = useState<AusentismoInforme[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);

  const cargarAusentismos = useCallback(async (page: number = currentPage) => {
    if (!appliedFechaInicio || !appliedFechaFin) return;

    setLoading(true);
    try {
      const resultado = await informeAusentismoService.listar({
        fechaDesde: appliedFechaInicio,
        fechaHasta: appliedFechaFin,
        sede: appliedSede || undefined,
        area: appliedArea || undefined,
        empleado: appliedSearch.trim() || undefined,
        pagina: page,
        limite: PAGE_SIZE,
      });
      setAusentismos(resultado.items);
      setTotalItems(resultado.total);
    } catch (error) {
      console.error("Error al cargar ausentismos:", error);
      showError("Error al cargar el informe de ausentismo");
    } finally {
      setLoading(false);
    }
  }, [appliedFechaInicio, appliedFechaFin, appliedSede, appliedArea, appliedSearch, currentPage, showError]);

  useEffect(() => {
    if (hasSearched) {
      cargarAusentismos();
    } else {
      setAusentismos([]);
      setTotalItems(0);
    }
  }, [hasSearched, currentPage, cargarAusentismos]);

  const ausentismosMostrados = useMemo(() => ausentismos, [ausentismos]);

  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;

  const changePage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleVerDetalle = useCallback((ausentismo: AusentismoInforme) => {
    setAusentismoSeleccionado(ausentismo);
    setDetalleModalOpen(true);
  }, []);

  const handleBuscar = useCallback(() => {
    if (!fechaInicio || !fechaFin) {
      showError("Seleccione fecha de inicio y fecha final para generar el informe");
      return;
    }
    setAppliedFechaInicio(fechaInicio);
    setAppliedFechaFin(fechaFin);
    setAppliedSede(filtroSede);
    setAppliedArea(filtroArea);
    setAppliedSearch(search);
    setHasSearched(true);
    setCurrentPage(1);
  }, [fechaInicio, fechaFin, filtroSede, filtroArea, search, showError]);

  const handleExportar = useCallback(async () => {
    if (!hasSearched || totalItems === 0) {
      showError("No hay datos para exportar");
      return;
    }
    setLoadingExport(true);
    try {
      const resultado = await informeAusentismoService.listar({
        fechaDesde: appliedFechaInicio,
        fechaHasta: appliedFechaFin,
        sede: appliedSede || undefined,
        area: appliedArea || undefined,
        empleado: appliedSearch.trim() || undefined,
        pagina: 1,
        limite: totalItems,
      });
      const rows = resultado.items.map((r) => ({
        Documento: r.documento,
        "Gestionado Por": r.gestionadoPor,
        Colaborador: r.colaborador,
        Motivo: r.motivo,
        Sede: r.sede,
        Area: r.area,
        "Fecha Inicio": r.fechaInicio,
        "Hora Inicio": r.horaInicio,
        "Fecha Fin": r.fechaFin,
        "Hora Fin": r.horaFin,
        Estado: r.estado,
        Detalle: r.detalle,
      }));
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ausentismo");
      XLSX.writeFile(workbook, "informe-ausentismo.xlsx");
    } catch {
      showError("No se pudo exportar el informe");
    } finally {
      setLoadingExport(false);
    }
  }, [hasSearched, totalItems, appliedFechaInicio, appliedFechaFin, appliedSede, appliedArea, appliedSearch, showError]);

  return (
    <div className="space-y-6">
      <HeaderSection />

      <FiltersSection
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        filtroSede={filtroSede}
        filtroArea={filtroArea}
        sedesOptions={sedesOptions}
        onFechaInicioChange={setFechaInicio}
        onFechaFinalChange={setFechaFin}
        onFiltroSedeChange={setFiltroSede}
        onFiltroAreaChange={setFiltroArea}
        onBuscar={handleBuscar}
        onExportar={handleExportar}
        loading={loading}
        loadingExport={loadingExport}
        totalRegistros={totalItems}
      />

      <SearchSection
        onSearch={setSearch}
        placeholder="Buscar por colaborador, gestionado por o motivo..."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <TablaAusentismos
          ausentismos={ausentismos}
          ausentismosMostrados={ausentismosMostrados}
          loading={loading}
          fechaInicio={appliedFechaInicio}
          fechaFin={appliedFechaFin}
          onVerDetalle={handleVerDetalle}
        />
        <PaginacionAusentismos
          currentPage={currentPage}
          totalPages={totalPages}
          onChange={changePage}
        />
      </motion.div>

      <DetalleAusentismoModal
        key={
          ausentismoSeleccionado
            ? `detalle-${ausentismoSeleccionado.id}-${ausentismoSeleccionado.colaborador}-${ausentismoSeleccionado.fechaInicio}-${ausentismoSeleccionado.horaInicio}`
            : "detalle-closed"
        }
        open={detalleModalOpen}
        onClose={() => {
          setDetalleModalOpen(false);
          setAusentismoSeleccionado(null);
        }}
        ausentismo={ausentismoSeleccionado}
      />
    </div>
  );
}
