'use client';

import { useState, useMemo, useEffect, useCallback, memo } from "react";
import { motion } from "framer-motion";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { usePagination } from "@/components/shared/ui/hooks/usePagination";
import { Pagination } from "@/components/shared/ui/Pagination";
import { AREAS_SOLICITA } from "@/modules/administracion/constants";
import { useSedesByEmpresa } from "@/modules/administracion/hooks/useSedesByEmpresa";
import { informeTiempoSuplementarioService, TiempoSuplementarioInforme } from "@/modules/administracion/services/informe-tiempo-suplementario.service";
import { useToast } from "@/components/shared/ui/ToastContext";
import { SearchFilter } from "@/components/administracion/filters/SearchFilter";
import { SelectFilter } from "@/components/shared/ui/SelectFilter";
import { TiempoSuplementarioTableRow } from "@/components/administracion/table/TiempoSuplementarioTableRow";

/** Solo se re-renderiza cuando cambian datos/loading; evita parpadeo en header, filtros y paginación */
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
    <div className="overflow-x-auto relative">
      {loading && tiempos.length > 0 && (
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
            <th className="text-left py-4 px-6 font-semibold text-white">Nombre del Empleado</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Sede</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Área</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Fecha</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Hora Inicio</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Hora Fin</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Descripción</th>
            <th className="text-left py-4 px-6 font-semibold text-white">Estado</th>
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
      <Pagination currentPage={currentPage} totalPages={totalPages} onChange={onChange} />
    </div>
  );
});

const HeaderSection = memo(function HeaderSection({
}: {
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">Informe Tiempo Suplementario</h1>
        <p className="text-gray-500 mt-1">Informe de tiempo suplementario multiempresa</p>
      </div>
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
      className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Mes</label>
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
          onClick={onDownload}
          disabled={descargando || loading || totalRegistros === 0}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
            totalRegistros > 0
              ? "bg-emerald-600 text-white hover:opacity-90"
              : "border border-gray-300 text-gray-700 bg-white"
          }`}
        >
          {descargando && <Loader2 size={16} className="animate-spin" />}
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

export default function InformeTiempoSuplementarioPage() {
  const { showError, showSuccess } = useToast();
  const sedes = useSedesByEmpresa();
  const sedesOptions = useMemo(() => sedes.map((sede) => ({ value: sede, label: sede })), [sedes]);
  const [search, setSearch] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroSede, setFiltroSede] = useState("");
  const [filtroArea, setFiltroArea] = useState("");
  const [filtroEmpleado, setFiltroEmpleado] = useState("");
  const [appliedMes, setAppliedMes] = useState("");
  const [appliedSede, setAppliedSede] = useState("");
  const [appliedArea, setAppliedArea] = useState("");
  const [appliedEmpleado, setAppliedEmpleado] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [empleadosOptions, setEmpleadosOptions] = useState<{ value: string; label: string }[]>([]);
  const [tiempos, setTiempos] = useState<TiempoSuplementarioInforme[]>([]);
  const [loading, setLoading] = useState(false);
  const [descargando, setDescargando] = useState(false);

  const cargarTiempos = useCallback(async () => {
    if (!appliedMes) return;

    setLoading(true);
    try {
      const [anio, mes] = appliedMes.split("-");
      const fechaDesde = `${anio}-${mes}-01`;
      const ultimoDia = new Date(Number(anio), Number(mes), 0).getDate();
      const fechaHasta = `${anio}-${mes}-${ultimoDia}`;

      const datos = await informeTiempoSuplementarioService.listar({
        fechaDesde,
        fechaHasta,
        sede: appliedSede || undefined,
        area: appliedArea || undefined,
        empleado: appliedEmpleado.trim() || undefined,
      });
      setTiempos(datos);
      if (!appliedEmpleado.trim()) {
        const nombres = [...new Set(datos.map((d) => d.nombreEmpleado).filter(Boolean))].sort();
        setEmpleadosOptions(nombres.map((n) => ({ value: n, label: n })));
      }
    } catch (error) {
      console.error("Error al cargar tiempos suplementarios:", error);
      showError("Error al cargar el informe de tiempo suplementario");
    } finally {
      setLoading(false);
    }
  }, [appliedMes, appliedSede, appliedArea, appliedEmpleado, showError]);

  useEffect(() => {
    if (hasSearched) {
      cargarTiempos();
    } else {
      setTiempos([]);
      setEmpleadosOptions([]);
    }
  }, [hasSearched, cargarTiempos]);

  useEffect(() => {
    if (!filtroMes) setFiltroEmpleado("");
  }, [filtroMes]);

  const handleBuscar = useCallback(() => {
    if (!filtroMes) {
      showError("Seleccione un mes para generar el informe");
      return;
    }
    setAppliedMes(filtroMes);
    setAppliedSede(filtroSede);
    setAppliedArea(filtroArea);
    setAppliedEmpleado(filtroEmpleado);
    setHasSearched(true);
  }, [filtroMes, filtroSede, filtroArea, filtroEmpleado, showError]);

  const filtered = useMemo(() => {
    let result = tiempos;
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.nombreEmpleado.toLowerCase().includes(searchLower) ||
          item.descripcion.toLowerCase().includes(searchLower)
      );
    }
    return result;
  }, [search, tiempos]);

  const { currentPage, totalPages, startIndex, endIndex, changePage } = usePagination(filtered.length, 10);

  const tiemposMostrados = useMemo(
    () => filtered.slice(startIndex, endIndex),
    [filtered, startIndex, endIndex]
  );

  const handleDownload = useCallback(async () => {
    if (!appliedMes) {
      showError("Seleccione un mes para exportar");
      return;
    }
    setDescargando(true);
    try {
      const [anio, mes] = appliedMes.split("-");
      const fechaDesde = `${anio}-${mes}-01`;
      const ultimoDia = new Date(Number(anio), Number(mes), 0).getDate();
      const fechaHasta = `${anio}-${mes}-${ultimoDia}`;

      const blob = await informeTiempoSuplementarioService.exportarExcel({
        fechaDesde,
        fechaHasta,
        sede: appliedSede || undefined,
        area: appliedArea || undefined,
        empleado: appliedEmpleado.trim() || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `informe-tiempo-suplementario-${appliedMes}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess("Excel descargado correctamente");
    } catch (error) {
      console.error("Error al descargar Excel:", error);
      showError("Error al descargar el archivo Excel");
    } finally {
      setDescargando(false);
    }
  }, [appliedMes, appliedSede, appliedArea, appliedEmpleado, showError, showSuccess]);

  return (
    <div className="space-y-6">
      <HeaderSection />

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
        onDownload={handleDownload}
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
          filtroMesAplicado={appliedMes}
        />
        <PaginacionTiempos
          currentPage={currentPage}
          totalPages={totalPages}
          onChange={changePage}
        />
      </motion.div>
    </div>
  );
}
