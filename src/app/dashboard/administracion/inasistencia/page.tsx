'use client';

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Download, Calendar, User, Loader2 } from "lucide-react";
import { usePagination } from "@/components/shared/ui/hooks/usePagination";
import { Pagination } from "@/components/shared/ui/Pagination";
import { inasistenciaService, Inasistencia } from "@/modules/administracion/services/inasistencia.service";
import { useToast } from "@/components/shared/ui/ToastContext";
import { SearchFilter } from "@/components/administracion/filters/SearchFilter";
import { DateRangeFilter } from "@/components/administracion/filters/DateRangeFilter";
import { SelectFilter } from "@/components/shared/ui/SelectFilter";
import { InasistenciaTableRow } from "@/components/administracion/table/InasistenciaTableRow";

export default function InasistenciaPage() {
  const { showError, showSuccess } = useToast();
  const [search, setSearch] = useState("");
  const [filtroEmpleado, setFiltroEmpleado] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [inasistencias, setInasistencias] = useState<Inasistencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [descargando, setDescargando] = useState(false);

  const cargarInasistencias = useCallback(async () => {
    if (!fechaInicio || !fechaFinal) return;

    setLoading(true);
    try {
      const datos = await inasistenciaService.listarInasistencias({
        empleado: filtroEmpleado || undefined,
        fechaInicio,
        fechaFinal,
      });
      setInasistencias(datos);
    } catch (error) {
      console.error("Error al cargar inasistencias:", error);
      showError("Error al cargar las inasistencias");
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFinal, filtroEmpleado, showError]);

  useEffect(() => {
    if (fechaInicio && fechaFinal) {
      cargarInasistencias();
    } else {
      setInasistencias([]);
    }
  }, [fechaInicio, fechaFinal, filtroEmpleado, cargarInasistencias]);


  const filtered = useMemo(() => {
    let result = inasistencias;

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.documento.toLowerCase().includes(searchLower) ||
          item.nombre.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [search, inasistencias]);

  const { currentPage, totalPages, startIndex, endIndex, changePage } = usePagination(filtered.length, 10);

  const inasistenciasMostradas = useMemo(
    () => filtered.slice(startIndex, endIndex),
    [filtered, startIndex, endIndex]
  );

  // Opciones del select: value = NIT (documento) para enviar al backend; label = nombre para mostrar
  const empleadosUnicos = useMemo(() => {
    const seen = new Set<string>();
    const list = inasistencias
      .filter((item) => {
        if (seen.has(item.documento)) return false;
        seen.add(item.documento);
        return true;
      })
      .map((item) => ({ value: item.documento, label: item.nombre }));
    return [{ value: "", label: "Todos" }, ...list];
  }, [inasistencias]);

  const handleDownload = async () => {
    if (!fechaInicio || !fechaFinal) {
      showError("Seleccione fecha de inicio y fecha final para exportar");
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
      const a = document.createElement("a");
      a.href = url;
      a.download = `inasistencias-${fechaInicio}-${fechaFinal}.xlsx`;
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">Informe Inasistencia Empleados</h1>
        <p className="text-gray-500 mt-1">Consulta y gestiona el informe de inasistencia</p>
      </div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              onClick={handleDownload}
              disabled={descargando || !fechaInicio || !fechaFinal}
              className="w-full flex items-center justify-center gap-2 brand-bg brand-bg-hover text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Búsqueda */}
      <SearchFilter
        onSearch={setSearch}
        placeholder="Buscar por documento o nombre..."
        className="flex-1 max-w-md"
      />

      {/* Tabla */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="brand-bg border-b border-[var(--color-primary-dark)]">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-white">Documento</th>
                <th className="text-left py-4 px-6 font-semibold text-white">Nombre</th>
                <th className="text-left py-4 px-6 font-semibold text-white">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-10">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Cargando inasistencias...</span>
                    </div>
                  </td>
                </tr>
              ) : !fechaInicio || !fechaFinal ? (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-gray-500">
                    Seleccione fecha de inicio y fecha final para generar el informe
                  </td>
                </tr>
              ) : inasistenciasMostradas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-gray-500">
                    No se encontraron resultados
                  </td>
                </tr>
              ) : (
                inasistenciasMostradas.map((inasistencia) => (
                  <InasistenciaTableRow key={inasistencia.id} inasistencia={inasistencia} />
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200">
            <Pagination currentPage={currentPage} totalPages={totalPages} onChange={changePage} />
          </div>
        )}
      </motion.div>
    </div>
  );
}

