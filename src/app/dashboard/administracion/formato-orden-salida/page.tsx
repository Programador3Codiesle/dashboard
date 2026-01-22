'use client';

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Car } from "lucide-react";
import { MOCK_ORDENES_SALIDA } from "@/modules/administracion/constants";
import { usePagination } from "@/components/shared/ui/hooks/usePagination";
import { Pagination } from "@/components/shared/ui/Pagination";

export default function FormatoOrdenSalidaPage() {
  const [placaSearch, setPlacaSearch] = useState("");

  const filtered = useMemo(() => {
    if (!placaSearch.trim()) return MOCK_ORDENES_SALIDA;
    const searchLower = placaSearch.toLowerCase();
    return MOCK_ORDENES_SALIDA.filter((item) => item.placa.toLowerCase().includes(searchLower));
  }, [placaSearch]);

  const { currentPage, totalPages, startIndex, endIndex, changePage } = usePagination(filtered.length, 10);

  const ordenesMostradas = useMemo(
    () => filtered.slice(startIndex, endIndex),
    [filtered, startIndex, endIndex]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">Formato Orden de Salida</h1>
        <p className="text-gray-500 mt-1">Consulta órdenes de salida por placa</p>
      </div>

      {/* Búsqueda por Placa */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">Buscar por Placa</label>
        <div className="relative">
          <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Ingrese la placa del vehículo..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all"
            value={placaSearch}
            onChange={(e) => setPlacaSearch(e.target.value)}
          />
        </div>
      </motion.div>

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
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Número de Orden</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Bodega</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Placa</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Descripción Modelo</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Fecha</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Opción</th>
              </tr>
            </thead>
            <tbody>
              {ordenesMostradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    No se encontraron órdenes de salida
                  </td>
                </tr>
              ) : (
                ordenesMostradas.map((orden) => (
                  <tr key={orden.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-gray-900">{orden.numeroOrden}</td>
                    <td className="py-4 px-6">{orden.bodega}</td>
                    <td className="py-4 px-6 font-semibold brand-text">{orden.placa}</td>
                    <td className="py-4 px-6">{orden.descripcionModelo}</td>
                    <td className="py-4 px-6 text-gray-600">{orden.fecha}</td>
                    <td className="py-4 px-6">
                      <button className="brand-text brand-text-hover font-medium">
                        Ver Detalle
                      </button>
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

