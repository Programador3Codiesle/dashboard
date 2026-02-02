'use client';

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Download, Loader2 } from "lucide-react";
import { Pagination } from "@/components/shared/ui/Pagination";
import { NuevaSolicitudCompraDTO } from "@/modules/administracion/types";
import { gestionComprasService, SolicitudCompra } from "@/modules/administracion/services/gestion-compras.service";
import NuevaSolicitudCompraModal from "@/components/administracion/modals/NuevaSolicitudCompraModal";
import VerSolicitudCompraModal from "@/components/administracion/modals/VerSolicitudCompraModal";
import CambiarEstadoCompraModal from "@/components/administracion/modals/CambiarEstadoCompraModal";
import MensajesCompraModal from "@/components/administracion/modals/MensajesCompraModal";
import EnviarAutorizacionCompraModal from "@/components/administracion/modals/EnviarAutorizacionCompraModal";
import { useToast } from "@/components/shared/ui/ToastContext";
import { SearchFilter } from "@/components/administracion/filters/SearchFilter";
import { SolicitudCompraTableRow } from "@/components/administracion/table/SolicitudCompraTableRow";
import { useAuth } from "@/core/auth/hooks/useAuth";

export default function GestionComprasPage() {
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [solicitudes, setSolicitudes] = useState<SolicitudCompra[]>([]);
  const [loading, setLoading] = useState(true);
  const [descargando, setDescargando] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // Estados para modales
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudCompra | null>(null);
  const [modalVerDetalle, setModalVerDetalle] = useState(false);
  const [modalMensajes, setModalMensajes] = useState(false);
  const [modalCambiarEstado, setModalCambiarEstado] = useState(false);
  const [modalAutorizacion, setModalAutorizacion] = useState(false);
  const [solicitudIdAccion, setSolicitudIdAccion] = useState<number | null>(null);
  const [estadoActualAccion, setEstadoActualAccion] = useState<number>(1);

  const cargarSolicitudes = useCallback(async () => {
    setLoading(true);
    try {
      const resultado = await gestionComprasService.listarSolicitudes({
        buscar: search || undefined,
        pagina: currentPage,
        limite: pageSize,
      });
      setSolicitudes(resultado.items);
      setTotalItems(resultado.total);
    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
      showError("Error al cargar las solicitudes de compra");
    } finally {
      setLoading(false);
    }
  }, [search, currentPage, showError]);

  useEffect(() => {
    cargarSolicitudes();
  }, [cargarSolicitudes]);

  const totalPages = Math.ceil(totalItems / pageSize);

  const changePage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const handleSave = async (data: NuevaSolicitudCompraDTO) => {
    try {
      // Enviar id de empresa seleccionada en el dashboard (cookie/header) para que el backend la inserte
      await gestionComprasService.crearSolicitud(data, user?.empresa);
      showSuccess("Solicitud creada correctamente");
      setModalOpen(false);
      // Recargar la primera página
      setCurrentPage(1);
      await cargarSolicitudes();
    } catch (error) {
      console.error("Error al crear solicitud:", error);
      showError("Error al crear la solicitud de compra");
    }
  };

  const handleDownload = async () => {
    setDescargando(true);
    try {
      const blob = await gestionComprasService.exportarExcel({
        buscar: search || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `solicitudes-compras-${new Date().toISOString().split("T")[0]}.xlsx`;
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

  const getUrgenciaBadge = useCallback((urgencia: number) => {
    if (urgencia === 1) return "bg-green-100 text-green-700 border-green-200";
    if (urgencia === 2) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  }, []);

  const handleVerDetalle = useCallback((solicitud: SolicitudCompra) => {
    setSolicitudSeleccionada(solicitud);
    setModalVerDetalle(true);
  }, []);

  const handleVerMensajes = useCallback((solicitudId: number) => {
    setSolicitudIdAccion(solicitudId);
    setModalMensajes(true);
  }, []);

  const handleCambiarEstado = useCallback((solicitudId: number, estadoActual: number) => {
    setSolicitudIdAccion(solicitudId);
    setEstadoActualAccion(estadoActual);
    setModalCambiarEstado(true);
  }, []);

  const handleEnviarAutorizacion = useCallback((solicitudId: number) => {
    setSolicitudIdAccion(solicitudId);
    setModalAutorizacion(true);
  }, []);

  const handleToggleFactura = useCallback(async (solicitudId: number, conFactura: boolean) => {
    try {
      const conFacturaStr = conFactura ? "Si" : "No";
      const result = await gestionComprasService.marcarConFactura(solicitudId, conFacturaStr);
      if (result.status) {
        showSuccess(result.message);
        await cargarSolicitudes();
      } else {
        showError(result.message || "Error al actualizar el estado de factura");
      }
    } catch (error) {
      console.error("Error al cambiar estado de factura:", error);
      showError("Error al actualizar el estado de factura");
    }
  }, [showSuccess, showError, cargarSolicitudes]);

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
            disabled={descargando}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 brand-bg brand-bg-hover text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
          >
            <Plus size={18} />
            <span>Nueva Solicitud</span>
          </button>
        </div>
      </div>

      {/* Búsqueda: callback estable para evitar re-renders de SearchFilter/SearchInput */}
      <SearchFilter
        onSearch={handleSearchChange}
        placeholder="Buscar por descripción, usuario o número..."
      />

      {/* Tabla */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="brand-bg border-b border-[var(--color-primary-dark)] text-sm">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-white">#</th>
                <th className="text-left py-4 px-6 font-semibold text-white">Descripción</th>
                <th className="text-left py-4 px-6 font-semibold text-white">Mensajes</th>
                <th className="text-left py-4 px-6 font-semibold text-white">Con Factura</th>
                <th className="text-left py-4 px-6 font-semibold text-white">Estado</th>
                <th className="text-left py-4 px-6 font-semibold text-white">Estado Autorización</th>
                <th className="text-left py-4 px-6 font-semibold text-white">Usuario Solicita</th>
                <th className="text-left py-4 px-6 font-semibold text-white">Gerente Autoriza</th>
                <th className="text-left py-4 px-6 font-semibold text-white">Fecha Solicitud</th>
                <th className="text-left py-4 px-6 font-semibold text-white">Fecha Autorización</th>
                <th className="text-left py-4 px-4 font-semibold text-white">Gestión Días</th>
                <th className="text-left py-4 px-8 font-semibold text-white">Urgencia</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} className="text-center py-10">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Cargando solicitudes...</span>
                    </div>
                  </td>
                </tr>
              ) : solicitudes.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-10 text-gray-500">
                    No se encontraron solicitudes
                  </td>
                </tr>
              ) : (
                solicitudes.map((solicitud) => (
                  <SolicitudCompraTableRow
                    key={solicitud.id}
                    solicitud={solicitud}
                    getUrgenciaBadge={getUrgenciaBadge}
                    onRefresh={cargarSolicitudes}
                    onVerDetalle={handleVerDetalle}
                    onVerMensajes={handleVerMensajes}
                    onCambiarEstado={handleCambiarEstado}
                    onEnviarAutorizacion={handleEnviarAutorizacion}
                    onToggleFactura={handleToggleFactura}
                  />
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

      <VerSolicitudCompraModal
        open={modalVerDetalle}
        onClose={() => {
          setModalVerDetalle(false);
          setSolicitudSeleccionada(null);
        }}
        solicitud={solicitudSeleccionada}
      />

      {solicitudIdAccion !== null && (
        <>
          <MensajesCompraModal
            open={modalMensajes}
            onClose={() => {
              setModalMensajes(false);
              setSolicitudIdAccion(null);
            }}
            solicitudId={solicitudIdAccion}
          />

          <CambiarEstadoCompraModal
            open={modalCambiarEstado}
            onClose={() => {
              setModalCambiarEstado(false);
              setSolicitudIdAccion(null);
            }}
            solicitudId={solicitudIdAccion}
            estadoActual={estadoActualAccion}
            onSuccess={cargarSolicitudes}
          />

          <EnviarAutorizacionCompraModal
            open={modalAutorizacion}
            onClose={() => {
              setModalAutorizacion(false);
              setSolicitudIdAccion(null);
            }}
            solicitudId={solicitudIdAccion}
            onSuccess={cargarSolicitudes}
          />
        </>
      )}
    </div>
  );
}

