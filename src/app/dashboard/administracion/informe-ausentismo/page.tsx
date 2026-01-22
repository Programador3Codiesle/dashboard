'use client';

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Download, Eye, FileText } from "lucide-react";
import { MOCK_AUSENTISMOS, SEDES, CENTRALES_BENEFICIOS } from "@/modules/administracion/constants";
import { usePagination } from "@/components/shared/ui/hooks/usePagination";
import { Pagination } from "@/components/shared/ui/Pagination";
import { Ausentismo } from "@/modules/administracion/types";
import DetalleAusentismoModal from "@/components/administracion/modals/DetalleAusentismoModal";
import { ChevronDown, Calendar } from "lucide-react";
import Modal from "@/components/shared/ui/Modal";

export default function InformeAusentismoPage() {
  const [search, setSearch] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [filtroSede, setFiltroSede] = useState("");
  const [filtroCentral, setFiltroCentral] = useState("");
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [ausentismoSeleccionado, setAusentismoSeleccionado] = useState<Ausentismo | null>(null);
  const [informeModalOpen, setInformeModalOpen] = useState(false);
  const [informeConfig, setInformeConfig] = useState({ desde: "", hasta: "", sede: "", area: "" });

  const filtered = useMemo(() => {
    let result = MOCK_AUSENTISMOS;

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.colaborador.toLowerCase().includes(searchLower) ||
          item.gestionadoPor.toLowerCase().includes(searchLower) ||
          item.motivo?.toLowerCase().includes(searchLower)
      );
    }

    if (fechaInicio) {
      result = result.filter((item) => item.fechaInicio >= fechaInicio);
    }

    if (fechaFin) {
      result = result.filter((item) => item.fechaInicio <= fechaFin);
    }

    if (filtroSede) {
      result = result.filter((item) => item.sede === filtroSede);
    }

    if (filtroCentral) {
      // Simulación - en producción se filtraría por central de beneficios
      result = result;
    }

    return result;
  }, [search, fechaInicio, fechaFin, filtroSede, filtroCentral]);

  const { currentPage, totalPages, startIndex, endIndex, changePage } = usePagination(filtered.length, 10);

  const ausentismosMostrados = useMemo(
    () => filtered.slice(startIndex, endIndex),
    [filtered, startIndex, endIndex]
  );

  const handleVerDetalle = (ausentismo: Ausentismo) => {
    setAusentismoSeleccionado(ausentismo);
    setDetalleModalOpen(true);
  };

  const handleGenerarInforme = () => {
    console.log("Generando informe con configuración:", informeConfig);
    setInformeModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">Informe Ausentismo</h1>
          <p className="text-gray-500 mt-1">Informe detallado de ausentismo multiempresa</p>
        </div>
        <button
          onClick={() => setInformeModalOpen(true)}
          className="flex items-center gap-2 brand-bg brand-bg-hover text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
        >
          <FileText size={18} />
          <span>Generar Informe</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
            <div className="relative">
              <input
                type="date"
                className="block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white pr-10"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sede</label>
            <div className="relative">
              <select
                className="block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white appearance-none pr-10"
                value={filtroSede}
                onChange={(e) => setFiltroSede(e.target.value)}
              >
                <option value="">Todas</option>
                {SEDES.map((sede) => (
                  <option key={sede} value={sede}>{sede}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Central de Beneficios</label>
            <div className="relative">
              <select
                className="block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white appearance-none pr-10"
                value={filtroCentral}
                onChange={(e) => setFiltroCentral(e.target.value)}
              >
                <option value="">Todas</option>
                {CENTRALES_BENEFICIOS.map((central) => (
                  <option key={central} value={central}>{central}</option>
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
          placeholder="Buscar por colaborador, gestionado por o motivo..."
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
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Gestionado Por</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Colaborador</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Sede</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Área</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Fecha Inicio</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Hora Inicio</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Fecha Fin</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Hora Fin</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Estado</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {ausentismosMostrados.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-gray-500">
                    No se encontraron resultados
                  </td>
                </tr>
              ) : (
                ausentismosMostrados.map((ausentismo) => (
                  <tr key={ausentismo.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">{ausentismo.gestionadoPor}</td>
                    <td className="py-4 px-6 font-medium text-gray-900">{ausentismo.colaborador}</td>
                    <td className="py-4 px-6">{ausentismo.sede}</td>
                    <td className="py-4 px-6">{ausentismo.area}</td>
                    <td className="py-4 px-6">{ausentismo.fechaInicio}</td>
                    <td className="py-4 px-6">{ausentismo.horaInicio}</td>
                    <td className="py-4 px-6">{ausentismo.fechaFin}</td>
                    <td className="py-4 px-6">{ausentismo.horaFin}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        ausentismo.estado === "Aprobado" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {ausentismo.estado}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleVerDetalle(ausentismo)}
                        className="brand-text brand-text-hover"
                      >
                        <Eye size={18} />
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

      <DetalleAusentismoModal
        open={detalleModalOpen}
        onClose={() => {
          setDetalleModalOpen(false);
          setAusentismoSeleccionado(null);
        }}
        ausentismo={ausentismoSeleccionado}
      />

      {/* Modal Generar Informe */}
      <Modal open={informeModalOpen} onClose={() => setInformeModalOpen(false)} title="Generar Informe" width="500px">
        <div className="space-y-4 p-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              className="block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white"
              value={informeConfig.desde}
              onChange={(e) => setInformeConfig({ ...informeConfig, desde: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              className="block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white"
              value={informeConfig.hasta}
              onChange={(e) => setInformeConfig({ ...informeConfig, hasta: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sede</label>
            <div className="relative">
              <select
                className="block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white appearance-none pr-10"
                value={informeConfig.sede}
                onChange={(e) => setInformeConfig({ ...informeConfig, sede: e.target.value })}
              >
                <option value="">Todas</option>
                {SEDES.map((sede) => (
                  <option key={sede} value={sede}>{sede}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
            <input
              type="text"
              className="block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white"
              value={informeConfig.area}
              onChange={(e) => setInformeConfig({ ...informeConfig, area: e.target.value })}
              placeholder="Área (opcional)"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setInformeModalOpen(false)}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleGenerarInforme}
              className="px-5 py-2.5 brand-bg brand-bg-hover text-white rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
            >
              Generar Informe
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

