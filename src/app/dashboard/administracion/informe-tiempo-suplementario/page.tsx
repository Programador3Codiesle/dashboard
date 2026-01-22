'use client';

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Download } from "lucide-react";
import { MOCK_TIEMPO_SUPLEMENTARIO } from "@/modules/administracion/constants";
import { usePagination } from "@/components/shared/ui/hooks/usePagination";
import { Pagination } from "@/components/shared/ui/Pagination";
import { SEDES, AREAS_SOLICITA } from "@/modules/administracion/constants";
import { ChevronDown } from "lucide-react";

export default function InformeTiempoSuplementarioPage() {
  const [search, setSearch] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroSede, setFiltroSede] = useState("");
  const [filtroArea, setFiltroArea] = useState("");
  const [filtroEmpleado, setFiltroEmpleado] = useState("");

  const filtered = useMemo(() => {
    let result = MOCK_TIEMPO_SUPLEMENTARIO;

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.nombreEmpleado.toLowerCase().includes(searchLower) ||
          item.nombreJefe.toLowerCase().includes(searchLower) ||
          item.descripcion.toLowerCase().includes(searchLower)
      );
    }

    if (filtroMes) {
      const mes = filtroMes.split("-")[1];
      result = result.filter((item) => item.fechaInicio.split("-")[1] === mes);
    }

    if (filtroSede) {
      result = result.filter((item) => item.sede === filtroSede);
    }

    if (filtroArea) {
      result = result.filter((item) => item.area === filtroArea);
    }

    if (filtroEmpleado) {
      result = result.filter((item) => item.nombreEmpleado === filtroEmpleado);
    }

    return result;
  }, [search, filtroMes, filtroSede, filtroArea, filtroEmpleado]);

  const { currentPage, totalPages, startIndex, endIndex, changePage } = usePagination(filtered.length, 10);

  const tiemposMostrados = useMemo(
    () => filtered.slice(startIndex, endIndex),
    [filtered, startIndex, endIndex]
  );

  const empleadosUnicos = useMemo(() => {
    return Array.from(new Set(MOCK_TIEMPO_SUPLEMENTARIO.map((item) => item.nombreEmpleado)));
  }, []);

  const handleDownload = () => {
    console.log("Descargando Excel...", filtered);
  };

  const inputClass = "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white appearance-none pr-10";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">Informe Tiempo Suplementario</h1>
          <p className="text-gray-500 mt-1">Informe de tiempo suplementario multiempresa</p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition-colors"
        >
          <Download size={18} />
          <span>Descargar Excel</span>
        </button>
      </div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Mes</label>
            <div className="relative">
              <input
                type="month"
                className={inputClass.replace("appearance-none pr-10", "")}
                value={filtroMes}
                onChange={(e) => setFiltroMes(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Sede</label>
            <div className="relative">
              <select className={inputClass} value={filtroSede} onChange={(e) => setFiltroSede(e.target.value)}>
                <option value="">Todas</option>
                {SEDES.map((sede) => (
                  <option key={sede} value={sede}>{sede}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Área</label>
            <div className="relative">
              <select className={inputClass} value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)}>
                <option value="">Todas</option>
                {AREAS_SOLICITA.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empleado</label>
            <div className="relative">
              <select className={inputClass} value={filtroEmpleado} onChange={(e) => setFiltroEmpleado(e.target.value)}>
                <option value="">Todos</option>
                {empleadosUnicos.map((empleado) => (
                  <option key={empleado} value={empleado}>{empleado}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre, jefe o descripción..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Nombre del Jefe</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Nombre del Empleado</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Sede</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Área</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Cargo</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Fecha de Inicio</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Hora de Inicio</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Fecha de Solicitud</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Descripción</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Autorización</th>
              </tr>
            </thead>
            <tbody>
              {tiemposMostrados.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-gray-500">
                    No se encontraron resultados
                  </td>
                </tr>
              ) : (
                tiemposMostrados.map((tiempo) => (
                  <tr key={tiempo.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">{tiempo.nombreJefe}</td>
                    <td className="py-4 px-6 font-medium text-gray-900">{tiempo.nombreEmpleado}</td>
                    <td className="py-4 px-6">{tiempo.sede}</td>
                    <td className="py-4 px-6">{tiempo.area}</td>
                    <td className="py-4 px-6">{tiempo.cargo}</td>
                    <td className="py-4 px-6">{tiempo.fechaInicio}</td>
                    <td className="py-4 px-6">{tiempo.horaInicio}</td>
                    <td className="py-4 px-6 text-gray-600">{tiempo.fechaSolicitud}</td>
                    <td className="py-4 px-6 text-sm">{tiempo.descripcion}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        {tiempo.autorizacion}
                      </span>
                    </td>
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

