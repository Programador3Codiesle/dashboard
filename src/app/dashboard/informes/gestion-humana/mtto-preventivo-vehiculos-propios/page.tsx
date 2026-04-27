'use client';

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Car, ListChecks } from "lucide-react";
import { useToast } from "@/components/shared/ui/ToastContext";
import {
  informeMttoPreventivoVhService,
  InformeMttoPreventivo,
  HistorialMtto,
} from "@/modules/informes/gestion-humana/services/informe-mtto-preventivo-vh.service";
import Modal from "@/components/shared/ui/Modal";

const RUTINA_PDF_BY_PLACA: Record<string, string> = {
  WOM803: "RUTINA-N400.pdf",
  XMB415: "RUTINA-NHR.pdf",
  SVP019: "RUTINA-NQR.pdf",
  TAV656: "RUTINA-FVR.pdf",
  TTR469: "RUTINA-N300.pdf",
};

export default function MttoPreventivoVehiculosPropiosPage() {
  const { showError } = useToast();
  const [data, setData] = useState<InformeMttoPreventivo[]>([]);
  const [loading, setLoading] = useState(false);

  const [historialOpen, setHistorialOpen] = useState(false);
  const [historial, setHistorial] = useState<HistorialMtto[]>([]);
  const [placaHistorial, setPlacaHistorial] = useState<string | null>(null);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [historialPage, setHistorialPage] = useState(1);

  const HISTORIAL_PAGE_SIZE = 8;
  const historialTotalItems = historial.length;
  const historialTotalPages = Math.max(1, Math.ceil(historialTotalItems / HISTORIAL_PAGE_SIZE));
  const historialPaginado = useMemo(() => {
    const start = (historialPage - 1) * HISTORIAL_PAGE_SIZE;
    return historial.slice(start, start + HISTORIAL_PAGE_SIZE);
  }, [historial, historialPage]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await informeMttoPreventivoVhService.listar();
        setData(res);
      } catch (err) {
        console.error(err);
        showError("No se pudo cargar el informe de mantenimiento preventivo.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showError]);

  const abrirHistorial = async (placa: string) => {
    setPlacaHistorial(placa);
    setHistorial([]);
    setHistorialPage(1);
    setHistorialOpen(true);
    setLoadingHistorial(true);
    try {
      const res = await informeMttoPreventivoVhService.historial(placa);
      setHistorial(res);
    } catch (err) {
      console.error(err);
      showError("No se pudo cargar el historial de mantenimiento.");
    } finally {
      setLoadingHistorial(false);
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_PUBLIC_URL || ""; // para rutas de PDF si se necesita

  const getRutinaUrl = (placa: string, rutina: string | null) => {
    const rutinaByPlaca = RUTINA_PDF_BY_PLACA[String(placa).toUpperCase()];
    const rutinaFile = rutinaByPlaca || rutina || "";
    if (!rutinaFile) return null;
    const relativePath = `/Informes/Gestion humana/Mtto preventivo/${rutinaFile}`;
    return `${baseUrl}${encodeURI(relativePath)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">
            Mtto Preventivo Vehículos Propios
          </h1>
          <p className="text-gray-500 mt-1">
            Proyección de mantenimientos preventivos para la flota propia, con próximos servicios y
            acceso al historial de órdenes.
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Car size={20} className="text-(--color-primary)" />
            <h2 className="text-base font-semibold text-gray-900">Vehículos y próximos mantenimientos</h2>
          </div>
          <span className="text-xs text-gray-500">
            {data.length} vehículo{data.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="brand-bg border-b border-(--color-primary-dark)] text-sm">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">Placa</th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">Descripción</th>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">Km Actual</th>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">Km Promedio</th>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">Días entre Mtto</th>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">Días prox. Mtto</th>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Próximos Mantenimientos
                </th>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">Rutina</th>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">Historial</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Cargando vehículos...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-gray-500">
                    No se encontraron vehículos con información de mantenimiento preventivo.
                  </td>
                </tr>
              ) : (
                data.map((vh) => {
                  const rutinaUrl = getRutinaUrl(vh.placa, vh.rutina);
                  return (
                    <tr
                      key={vh.placa}
                      className="border-b border-gray-100 hover:bg-gray-50/60 text-sm align-top"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">{vh.placa}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{vh.descripcion}</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">{vh.kilometroFinal}</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {vh.kmPromedio.toFixed(0)}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">{vh.diasEntreMtto}</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">{vh.diasProximoMtto}</td>
                      <td className="px-4 py-3">
                        {vh.proximos.length === 0 ? (
                          <span className="text-gray-400 text-xs">Sin proyección disponible</span>
                        ) : (
                          <table className="mx-auto text-xs border border-gray-200 rounded-lg overflow-hidden">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="px-2 py-1 border-b border-gray-200">MTTO</th>
                                <th className="px-2 py-1 border-b border-gray-200">Fecha</th>
                              </tr>
                            </thead>
                            <tbody>
                              {vh.proximos.map((pm) => (
                                <tr key={`${vh.placa}-${pm.mttoKm}-${pm.fecha}`}>
                                  <td className="px-2 py-1 text-center border-t border-gray-100">
                                    {pm.mttoKm}
                                  </td>
                                  <td className="px-2 py-1 text-center border-t border-gray-100">
                                    {pm.fecha}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {rutinaUrl ? (
                          <a
                            href={rutinaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium shadow-sm"
                          >
                            <ListChecks size={14} />
                            Rutina
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => abrirHistorial(vh.placa)}
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium shadow-sm"
                        >
                          Ver historial
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <Modal
        open={historialOpen}
        onClose={() => {
          setHistorialOpen(false);
          setHistorial([]);
          setPlacaHistorial(null);
          setHistorialPage(1);
        }}
        title={`Historial de mantenimiento${placaHistorial ? ` - ${placaHistorial}` : ""}`}
        width="min(95vw, 1080px)"
      >
        <div className="space-y-4 p-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">Detalle histórico de órdenes</p>
              <p className="text-xs text-gray-500">
                Revise las intervenciones registradas para la placa seleccionada.
              </p>
            </div>
            {!loadingHistorial && historialTotalItems > 0 && (
              <div className="text-xs text-gray-600">
                {historialTotalItems} registro{historialTotalItems === 1 ? "" : "s"} en total
              </div>
            )}
          </div>

          {loadingHistorial ? (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-500 bg-white border border-gray-100 rounded-xl">
              <Loader2 className="animate-spin" size={20} />
              <span>Cargando historial...</span>
            </div>
          ) : historial.length === 0 ? (
            <div className="py-10 text-center text-gray-500 text-sm bg-white border border-gray-100 rounded-xl">
              No se encontraron registros de historial para esta placa.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">
                        N° Orden
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">
                        Bodega
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">
                        Fecha Apertura
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">
                        Fecha Factura
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">
                        Tipo
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">
                        Número
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">
                        Operación
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">
                        Descripción
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">
                        Explicación
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialPaginado.map((h, idx) => (
                      <tr key={`${h.numero_orden}-${idx}`} className="border-b border-gray-100 hover:bg-gray-50/60">
                        <td className="px-3 py-2 whitespace-nowrap">{h.numero_orden}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{h.bodega}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{h.fecha_apertura}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{h.fecha_factura}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{h.tipo}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{h.numero}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{h.operacion}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{h.descripcion}</td>
                        <td className="px-3 py-2 whitespace-pre-wrap max-w-xs">
                          {h.explicacion_operacion}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {historialTotalItems > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                  <span className="text-xs text-gray-500 text-center sm:text-left">
                    Mostrando {historialPaginado.length} de {historialTotalItems} registros
                  </span>
                  <div className="flex items-center justify-center sm:justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setHistorialPage((prev) => Math.max(1, prev - 1))}
                      disabled={historialPage === 1}
                      className="px-2.5 py-1 rounded-md border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <span className="text-xs text-gray-500 min-w-[78px] text-center">
                      {historialPage} / {historialTotalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setHistorialPage((prev) => Math.min(historialTotalPages, prev + 1))}
                      disabled={historialPage === historialTotalPages}
                      className="px-2.5 py-1 rounded-md border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

