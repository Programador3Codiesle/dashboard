'use client';

import { useState, useMemo, useEffect, useCallback, memo } from "react";
import { motion } from "framer-motion";
import { Download, Loader2 } from "lucide-react";
import { usePagination } from "@/components/shared/ui/hooks/usePagination";
import { Pagination } from "@/components/shared/ui/Pagination";
import { SEDES, AREAS_SOLICITA } from "@/modules/administracion/constants";
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
  filtroMes,
}: {
  tiempos: TiempoSuplementarioInforme[];
  tiemposMostrados: TiempoSuplementarioInforme[];
  loading: boolean;
  filtroMes: string;
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
        <thead className="brand-bg border-b border-[var(--color-primary-dark)] text-sm">
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
          ) : !filtroMes ? (
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
  onDownload,
  descargando,
  filtroMes,
}: {
  onDownload: () => void;
  descargando: boolean;
  filtroMes: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">Informe Tiempo Suplementario</h1>
        <p className="text-gray-500 mt-1">Informe de tiempo suplementario multiempresa</p>
      </div>
      <button
        type="button"
        onClick={onDownload}
        disabled={descargando || !filtroMes}
        className="flex items-center gap-2 brand-bg brand-bg-hover text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {descargando ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            <span>Descargando...</span>
          </>
        ) : (
          <>
            <Download size={18} />
            <span>Descargar Excel</span>
          </>
        )}
      </button>
    </div>
  );
});

const FiltersSection = memo(function FiltersSection({
  filtroMes,
  filtroSede,
  filtroArea,
  filtroEmpleado,
  empleadosOptions,
  onFiltroMesChange,
  onFiltroSedeChange,
  onFiltroAreaChange,
  onFiltroEmpleadoChange,
}: {
  filtroMes: string;
  filtroSede: string;
  filtroArea: string;
  filtroEmpleado: string;
  empleadosOptions: { value: string; label: string }[];
  onFiltroMesChange: (v: string) => void;
  onFiltroSedeChange: (v: string) => void;
  onFiltroAreaChange: (v: string) => void;
  onFiltroEmpleadoChange: (v: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Mes</label>
          <input
            type="month"
            className="block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white"
            value={filtroMes}
            onChange={(e) => onFiltroMesChange(e.target.value)}
          />
        </div>
        <SelectFilter
          label="Seleccionar Sede"
          value={filtroSede}
          onChange={onFiltroSedeChange}
          options={SEDES.map((sede) => ({ value: sede, label: sede }))}
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
  const [search, setSearch] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroSede, setFiltroSede] = useState("");
  const [filtroArea, setFiltroArea] = useState("");
  const [filtroEmpleado, setFiltroEmpleado] = useState("");
  const [empleadosOptions, setEmpleadosOptions] = useState<{ value: string; label: string }[]>([]);
  const [tiempos, setTiempos] = useState<TiempoSuplementarioInforme[]>([]);
  const [loading, setLoading] = useState(false);
  const [descargando, setDescargando] = useState(false);

  const cargarTiempos = useCallback(async () => {
    if (!filtroMes) return;

    setLoading(true);
    try {
      const [anio, mes] = filtroMes.split("-");
      const fechaDesde = `${anio}-${mes}-01`;
      const ultimoDia = new Date(Number(anio), Number(mes), 0).getDate();
      const fechaHasta = `${anio}-${mes}-${ultimoDia}`;

      const datos = await informeTiempoSuplementarioService.listar({
        fechaDesde,
        fechaHasta,
        sede: filtroSede || undefined,
        area: filtroArea || undefined,
        empleado: filtroEmpleado.trim() || undefined,
      });
      setTiempos(datos);
      if (!filtroEmpleado.trim()) {
        const nombres = [...new Set(datos.map((d) => d.nombreEmpleado).filter(Boolean))].sort();
        setEmpleadosOptions(nombres.map((n) => ({ value: n, label: n })));
      }
    } catch (error) {
      console.error("Error al cargar tiempos suplementarios:", error);
      showError("Error al cargar el informe de tiempo suplementario");
    } finally {
      setLoading(false);
    }
  }, [filtroMes, filtroSede, filtroArea, filtroEmpleado, showError]);

  useEffect(() => {
    if (filtroMes) {
      cargarTiempos();
    } else {
      setTiempos([]);
      setEmpleadosOptions([]);
    }
  }, [filtroMes, filtroSede, filtroArea, filtroEmpleado, cargarTiempos]);

  useEffect(() => {
    if (!filtroMes) setFiltroEmpleado("");
  }, [filtroMes]);

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
    if (!filtroMes) {
      showError("Seleccione un mes para exportar");
      return;
    }
    setDescargando(true);
    try {
      const [anio, mes] = filtroMes.split("-");
      const fechaDesde = `${anio}-${mes}-01`;
      const ultimoDia = new Date(Number(anio), Number(mes), 0).getDate();
      const fechaHasta = `${anio}-${mes}-${ultimoDia}`;

      const blob = await informeTiempoSuplementarioService.exportarExcel({
        fechaDesde,
        fechaHasta,
        sede: filtroSede || undefined,
        area: filtroArea || undefined,
        empleado: filtroEmpleado.trim() || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `informe-tiempo-suplementario-${filtroMes}.xlsx`;
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
  }, [filtroMes, filtroSede, filtroArea, filtroEmpleado, showError, showSuccess]);

  return (
    <div className="space-y-6">
      <HeaderSection onDownload={handleDownload} descargando={descargando} filtroMes={filtroMes} />

      <FiltersSection
        filtroMes={filtroMes}
        filtroSede={filtroSede}
        filtroArea={filtroArea}
        filtroEmpleado={filtroEmpleado}
        empleadosOptions={empleadosOptions}
        onFiltroMesChange={setFiltroMes}
        onFiltroSedeChange={setFiltroSede}
        onFiltroAreaChange={setFiltroArea}
        onFiltroEmpleadoChange={setFiltroEmpleado}
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
          filtroMes={filtroMes}
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
