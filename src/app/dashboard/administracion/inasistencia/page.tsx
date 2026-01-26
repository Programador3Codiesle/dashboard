'use client';

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Download, Calendar, User } from "lucide-react";
import { OptimizedInput } from "@/components/shared/ui/OptimizedInput";
import { MOCK_INASISTENCIAS } from "@/modules/administracion/constants";
import { usePagination } from "@/components/shared/ui/hooks/usePagination";
import { Pagination } from "@/components/shared/ui/Pagination";
import { Inasistencia } from "@/modules/administracion/types";

export default function InasistenciaPage() {
  const [search, setSearch] = useState("");
  const [filtroEmpleado, setFiltroEmpleado] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");

  const filtered = useMemo(() => {
    let result = MOCK_INASISTENCIAS;

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.documento.toLowerCase().includes(searchLower) ||
          item.nombre.toLowerCase().includes(searchLower)
      );
    }

    if (filtroEmpleado) {
      result = result.filter((item) => item.nombre === filtroEmpleado);
    }

    if (fechaInicio) {
      result = result.filter((item) => item.fecha >= fechaInicio);
    }

    if (fechaFinal) {
      result = result.filter((item) => item.fecha <= fechaFinal);
    }

    return result;
  }, [search, filtroEmpleado, fechaInicio, fechaFinal]);

  const { currentPage, totalPages, startIndex, endIndex, changePage } = usePagination(filtered.length, 10);

  const inasistenciasMostradas = useMemo(
    () => filtered.slice(startIndex, endIndex),
    [filtered, startIndex, endIndex]
  );

  const empleadosUnicos = useMemo(() => {
    return Array.from(new Set(MOCK_INASISTENCIAS.map((item) => item.nombre)));
  }, []);

  const handleDownload = () => {
    // Simulación de descarga - luego se conectará a API
    console.log("Descargando Excel...", filtered);
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empleado</label>
            <div className="relative">
              <select
                className="block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white appearance-none pr-10"
                value={filtroEmpleado}
                onChange={(e) => setFiltroEmpleado(e.target.value)}
              >
                <option value="">Todos</option>
                {empleadosUnicos.map((empleado) => (
                  <option key={empleado} value={empleado}>
                    {empleado}
                  </option>
                ))}
              </select>
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <div className="relative">
              <input
                type="date"
                className="block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white pr-10"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Final</label>
            <div className="relative">
              <input
                type="date"
                className="block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white pr-10"
                value={fechaFinal}
                onChange={(e) => setFechaFinal(e.target.value)}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition-colors"
            >
              <Download size={18} />
              <span>Descargar</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Búsqueda */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <OptimizedInput
            placeholder="Buscar por documento o nombre..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all"
            value={search}
            onValueChange={(val) => setSearch(val)}
          />
        </div>
      </div>

      {/* Tabla */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Documento</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Nombre</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {inasistenciasMostradas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-gray-500">
                    No se encontraron resultados
                  </td>
                </tr>
              ) : (
                inasistenciasMostradas.map((inasistencia) => (
                  <tr key={inasistencia.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">{inasistencia.documento}</td>
                    <td className="py-4 px-6 font-medium text-gray-900">{inasistencia.nombre}</td>
                    <td className="py-4 px-6 text-gray-600">{inasistencia.fecha}</td>
                  </tr>
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

