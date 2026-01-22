'use client';

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Download } from "lucide-react";
import { MOCK_SOLICITUDES_COMPRA } from "@/modules/administracion/constants";
import { usePagination } from "@/components/shared/ui/hooks/usePagination";
import { Pagination } from "@/components/shared/ui/Pagination";
import { SolicitudCompra, NuevaSolicitudCompraDTO } from "@/modules/administracion/types";
import NuevaSolicitudCompraModal from "@/components/administracion/modals/NuevaSolicitudCompraModal";
import { useToast } from "@/components/shared/ui/ToastContext";

export default function GestionComprasPage() {
  const { showSuccess } = useToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [solicitudes, setSolicitudes] = useState<SolicitudCompra[]>(MOCK_SOLICITUDES_COMPRA);

  const filtered = useMemo(() => {
    if (!search.trim()) return solicitudes;
    const searchLower = search.toLowerCase();
    return solicitudes.filter(
      (item) =>
        item.descripcion.toLowerCase().includes(searchLower) ||
        item.usuarioSolicita.toLowerCase().includes(searchLower) ||
        item.numero.toString().includes(searchLower)
    );
  }, [search, solicitudes]);

  const { currentPage, totalPages, startIndex, endIndex, changePage } = usePagination(filtered.length, 10);

  const solicitudesMostradas = useMemo(
    () => filtered.slice(startIndex, endIndex),
    [filtered, startIndex, endIndex]
  );

  const handleSave = (data: NuevaSolicitudCompraDTO) => {
    const nuevaSolicitud: SolicitudCompra = {
      id: solicitudes.length + 1,
      numero: solicitudes.length + 1001,
      descripcion: data.descripcion,
      mensajes: "Pendiente aprobación",
      conFactura: false,
      estado: "Pendiente",
      estadoAutorizacion: "En revisión",
      usuarioSolicita: data.nombrePersona,
      gerenteAutoriza: data.gerenteAutoriza,
      fechaSolicitud: new Date().toISOString().split("T")[0],
      gestionDias: 0,
      urgencia: data.nivelUrgencia,
      areaSolicita: data.areaSolicita,
      sede: data.sede,
      proveedoresSugeridos: data.proveedoresSugeridos,
      areaCarga: data.areaCarga,
    };
    setSolicitudes([...solicitudes, nuevaSolicitud]);
    showSuccess("Solicitud creada correctamente");
  };

  const handleDownload = () => {
    console.log("Descargando Excel...", filtered);
  };

  const getUrgenciaBadge = (urgencia: number) => {
    if (urgencia === 1) return "bg-green-100 text-green-700 border-green-200";
    if (urgencia === 2) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">Gestión de Compras</h1>
          <p className="text-gray-500 mt-1">Gestiona las solicitudes de compra multiempresa</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition-colors"
          >
            <Download size={18} />
            <span>Descargar Excel</span>
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 brand-bg brand-bg-hover text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
          >
            <Plus size={18} />
            <span>Nueva Solicitud</span>
          </button>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por descripción, usuario o número..."
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
            <thead className="bg-gray-50 border-b border-gray-200 text-sm">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">#</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Descripción</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Mensajes</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Con Factura</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Estado</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Estado Autorización</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Usuario Solicita</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Gerente Autoriza</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Fecha Solicitud</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Fecha Autorización</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Gestión Días</th>
                <th className="text-left py-4 px-8 font-semibold text-gray-700">Urgencia</th>
              </tr>
            </thead>
            <tbody>
              {solicitudesMostradas.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-10 text-gray-500">
                    No se encontraron solicitudes
                  </td>
                </tr>
              ) : (
                solicitudesMostradas.map((solicitud) => (
                  <tr key={solicitud.id} className="border-b border-gray-100 hover:bg-gray-50 text-sm">
                    <td className="py-4 px-6 font-medium text-gray-900">{solicitud.numero}</td>
                    <td className="py-4 px-6">{solicitud.descripcion}</td>
                    <td className="py-4 px-6 text-sm">{solicitud.mensajes}</td>
                    <td className="py-4 px-6">
                      {solicitud.conFactura ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Sí</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">No</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {solicitud.estado}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 brand-badge rounded text-xs font-medium">
                        {solicitud.estadoAutorizacion}
                      </span>
                    </td>
                    <td className="py-4 px-6">{solicitud.usuarioSolicita}</td>
                    <td className="py-4 px-6">{solicitud.gerenteAutoriza}</td>
                    <td className="py-4 px-6 text-gray-600">{solicitud.fechaSolicitud}</td>
                    <td className="py-4 px-6 text-gray-600">{solicitud.fechaAutorizacion || "-"}</td>
                    <td className="py-4 px-6">{solicitud.gestionDias}</td>
                    <td className="py-4 px-6">
                      <span className={`px-1 py-1 rounded text-xs font-medium border ${getUrgenciaBadge(solicitud.urgencia)}`}>
                        Urgencia {solicitud.urgencia}
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

      <NuevaSolicitudCompraModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}

