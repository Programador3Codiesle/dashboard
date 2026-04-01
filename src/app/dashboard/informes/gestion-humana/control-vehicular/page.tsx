'use client';

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, Truck } from "lucide-react";
import { useToast } from "@/components/shared/ui/ToastContext";
import Modal from "@/components/shared/ui/Modal";
import {
  informeControlVehicularService,
  ControlVehicular,
} from "@/modules/informes/gestion-humana/services/informe-control-vehicular.service";

const PORTERIAS = [
  { value: "", label: "Todas las porterías" },
  { value: "Vigilancia Giron", label: "Vigilancia Girón" },
  { value: "Vigilancia Bocono", label: "Vigilancia Bocono" },
  { value: "Vigilancia Rosita", label: "Vigilancia Rosita" },
  { value: "Vigilancia Barranca", label: "Vigilancia Barranca" },
];

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50, 100];

export default function InformeControlVehicularPage() {
  const { showError, showInfo, showSuccess } = useToast();

  const [fechaIni, setFechaIni] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [porteria, setPorteria] = useState("");
  const [buscador, setBuscador] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ControlVehicular[]>([]);
  const [total, setTotal] = useState(0);

  const [detalleOpen, setDetalleOpen] = useState(false);
  const [detalle, setDetalle] = useState<ControlVehicular | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const cargar = useCallback(
    async (pagina: number, opciones?: { silent?: boolean }) => {
      const silent = opciones?.silent ?? false;

      if (!silent) setLoading(true);
      try {
        const res = await informeControlVehicularService.listar({
          page: pagina,
          limit,
          buscador: buscador.trim() || undefined,
          fechaIni: fechaIni || undefined,
          fechaFin: fechaFin || undefined,
          porteria: porteria || undefined,
        });

        setRows(res.items);
        setTotal(res.total);
        setPage(res.page);

        if (!silent) {
          if (res.total === 0) {
            showInfo("No se encontraron registros para los filtros seleccionados.");
          } else {
            showSuccess(`Se cargaron ${res.items.length} registros (de ${res.total}).`);
          }
        }
      } catch (err) {
        console.error(err);
        showError("No se pudo cargar el informe de ingreso y salida de vehículos.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [limit, buscador, fechaIni, fechaFin, porteria, showError, showInfo, showSuccess],
  );

  useEffect(() => {
    // Carga inicial con filtros por defecto (sin fechas: aplica lógica de mes actual en backend)
    cargar(1, { silent: true });
  }, [cargar]);

  const handleAplicarFiltros = async () => {
    if (!fechaIni && !fechaFin && !porteria) {
      showError("Debe seleccionar al menos una opción para aplicar el filtro.");
      return;
    }

    if ((fechaIni && !fechaFin) || (!fechaIni && fechaFin)) {
      showError("Ambas fechas (inicio y fin) son requeridas.");
      return;
    }

    await cargar(1);
  };

  const handleLimpiarFiltros = async () => {
    if (!fechaIni && !fechaFin && !porteria && !buscador) {
      showInfo("No tiene filtros aplicados.");
      return;
    }

    setFechaIni("");
    setFechaFin("");
    setPorteria("");
    setBuscador("");
    setLimit(10);
    await cargar(1);
  };

  const handleCambiarPagina = async (nuevaPagina: number) => {
    if (nuevaPagina < 1 || nuevaPagina > totalPages || nuevaPagina === page) return;
    await cargar(nuevaPagina, { silent: true });
  };

  const handleCambiarLimite = async (nuevoLimite: number) => {
    setLimit(nuevoLimite);
    await cargar(1);
  };

  const handleExportar = async () => {
    try {
      const blob = await informeControlVehicularService.exportar({
        buscador: buscador.trim() || undefined,
        fechaIni: fechaIni || undefined,
        fechaFin: fechaFin || undefined,
        porteria: porteria || undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "informe_ingreso_y_salida_de_vehiculos.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      showError("No se pudo generar el reporte.");
    }
  };

  const abrirDetalle = async (id: number) => {
    setDetalleOpen(true);
    setLoadingDetalle(true);
    setDetalle(null);
    try {
      const data = await informeControlVehicularService.detalle(id);
      if (!data) {
        showError("No se pudo cargar el detalle del registro.");
      } else {
        setDetalle(data);
      }
    } catch (err) {
      console.error(err);
      showError("No se pudo cargar el detalle del registro.");
    } finally {
      setLoadingDetalle(false);
    }
  };

  const renderPaginacion = () => {
    if (totalPages <= 1) return null;

    const rango = 2;
    const inicio = Math.max(1, page - rango);
    const fin = Math.min(totalPages, page + rango);

    const botones = [];

    botones.push(
      <li key="prev" className={`page-item ${page === 1 ? "opacity-50 pointer-events-none" : ""}`}>
        <button
          className="page-link px-2 py-1 text-sm"
          onClick={() => handleCambiarPagina(page - 1)}
        >
          «
        </button>
      </li>,
    );

    for (let i = inicio; i <= fin; i++) {
      botones.push(
        <li key={i} className={`page-item ${i === page ? "bg-(--color-primary) text-white rounded" : ""}`}>
          <button
            className={`page-link px-2 py-1 text-sm ${
              i === page ? "border-0 bg-transparent text-white" : ""
            }`}
            onClick={() => handleCambiarPagina(i)}
          >
            {i}
          </button>
        </li>,
      );
    }

    botones.push(
      <li
        key="next"
        className={`page-item ${page === totalPages ? "opacity-50 pointer-events-none" : ""}`}
      >
        <button
          className="page-link px-2 py-1 text-sm"
          onClick={() => handleCambiarPagina(page + 1)}
        >
          »
        </button>
      </li>,
    );

    return <ul className="flex items-center gap-1">{botones}</ul>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">
            Informe ingreso y salida de vehículos
          </h1>
          <p className="text-gray-500 mt-1">
            Control de movimientos de vehículos por portería, con filtros por fecha, portería y buscador.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Fecha inicio</label>
            <input
              type="date"
              value={fechaIni}
              onChange={(e) => setFechaIni(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Fecha fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Portería</label>
            <select
              value={porteria}
              onChange={(e) => setPorteria(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white"
            >
              {PORTERIAS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Buscar (portería, placa, conductor)
            </label>
            <input
              type="search"
              value={buscador}
              onChange={(e) => setBuscador(e.target.value)}
              placeholder="Buscar..."
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-3 items-center">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAplicarFiltros}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>Aplicar filtro</span>
            </button>
            <button
              type="button"
              onClick={handleLimpiarFiltros}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500 text-red-600 text-sm font-medium bg-white hover:bg-red-50 transition-colors"
            >
              Limpiar filtro
            </button>
            <button
              type="button"
              onClick={handleExportar}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500 text-emerald-600 text-sm font-medium bg-white hover:bg-emerald-50 transition-colors"
            >
              Generar reporte
            </button>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={limit}
              onChange={(e) => handleCambiarLimite(Number(e.target.value))}
              className="border border-gray-300 rounded-xl px-2 py-1 text-xs focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white"
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} por página
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500">
              Mostrando {rows.length} de {total} registros
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Truck size={20} className="text-(--color-primary)" />
            <h2 className="text-base font-semibold text-gray-900">
              Registros de ingreso y salida
            </h2>
          </div>
          {total > 0 && (
            <span className="text-xs text-gray-500">
              Página {page} de {totalPages}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="brand-bg border-b border-(--color-primary-dark)] text-sm">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Portería
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Fecha salida
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Hora salida
                </th>
                <th className="text-right py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Km salida
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Placa
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Tipo vehículo
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Modelo
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Conductor
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Pasajeros
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Autorizado por
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Placa remolcado
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Taller
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Fecha llegada
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Hora llegada
                </th>
                <th className="text-right py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Km llegada
                </th>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Detalle
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={16} className="text-center py-10">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Cargando registros...</span>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={16} className="text-center py-10 text-gray-500">
                    No hay registros para los filtros actuales.
                  </td>
                </tr>
              ) : (
                rows.map((reg) => {
                  const sinLlegada = !reg.fecha_llegada;
                  return (
                    <tr
                      key={reg.id}
                      className={`border-b border-gray-100 hover:bg-gray-50/60 ${
                        sinLlegada ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="px-4 py-2 whitespace-nowrap">{reg.porteria ?? "-"}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{reg.fecha_salida ?? "-"}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{reg.hora_salida ?? "-"}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">
                        {reg.km_salida ?? "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">{reg.placa ?? "-"}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {reg.tipo_vehiculo ?? "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">{reg.modelo ?? "-"}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-lowercase">
                        {reg.conductor ?? "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-lowercase">
                        {reg.pasajeros ?? "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-lowercase">
                        {reg.persona_autorizo ?? "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {reg.placa_vh_remolcado ?? "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">{reg.taller ?? "-"}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {reg.fecha_llegada ?? "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {reg.hora_llegada ?? "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">
                        {reg.km_llegada ?? "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={() => abrirDetalle(reg.id)}
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-(--color-primary) hover:bg-(--color-primary-light) text-xs font-medium"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Mostrando {rows.length} de {total} registros
            </div>
            <nav aria-label="Paginación">{renderPaginacion()}</nav>
          </div>
        )}
      </motion.div>

      <Modal
        open={detalleOpen}
        onClose={() => {
          setDetalleOpen(false);
          setDetalle(null);
        }}
        title="Informe de vehículo"
        width="600px"
      >
        {loadingDetalle ? (
          <div className="flex items-center justify-center gap-2 py-6 text-gray-500">
            <Loader2 className="animate-spin" size={20} />
            <span>Cargando detalle...</span>
          </div>
        ) : !detalle ? (
          <div className="py-6 text-center text-gray-500 text-sm">
            No se pudo cargar el detalle del registro.
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <div>
              <h6 className="font-semibold text-gray-800 mb-2">Información general</h6>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Portería: </span>
                  <span>{detalle.porteria ?? "-"}</span>
                </div>
                <div>
                  <span className="font-medium">Placa: </span>
                  <span>{detalle.placa ?? "-"}</span>
                </div>
                <div>
                  <span className="font-medium">Tipo vehículo: </span>
                  <span>{detalle.tipo_vehiculo ?? "-"}</span>
                </div>
                <div>
                  <span className="font-medium">Modelo: </span>
                  <span>{detalle.modelo ?? "-"}</span>
                </div>
                <div>
                  <span className="font-medium">Conductor: </span>
                  <span className="text-lowercase">
                    {detalle.conductor ?? "-"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Taller: </span>
                  <span>{detalle.taller ?? "-"}</span>
                </div>
                <div>
                  <span className="font-medium">Autorizado por: </span>
                  <span className="text-lowercase">
                    {detalle.persona_autorizo ?? "-"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Placa remolcado: </span>
                  <span>{detalle.placa_vh_remolcado ?? "-"}</span>
                </div>
                <div>
                  <span className="font-medium">Pasajeros: </span>
                  <span className="text-lowercase">
                    {detalle.pasajeros ?? "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <h6 className="font-semibold text-emerald-700 mb-2">Salida</h6>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <span className="font-medium">Fecha: </span>
                  <span>{detalle.fecha_salida ?? "-"}</span>
                </div>
                <div>
                  <span className="font-medium">Hora: </span>
                  <span>{detalle.hora_salida ?? "-"}</span>
                </div>
                <div>
                  <span className="font-medium">Km: </span>
                  <span>{detalle.km_salida ?? "-"}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <h6 className="font-semibold text-red-700 mb-2">Ingreso</h6>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <span className="font-medium">Fecha: </span>
                  <span>{detalle.fecha_llegada ?? "-"}</span>
                </div>
                <div>
                  <span className="font-medium">Hora: </span>
                  <span>{detalle.hora_llegada ?? "-"}</span>
                </div>
                <div>
                  <span className="font-medium">Km: </span>
                  <span>{detalle.km_llegada ?? "-"}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <h6 className="font-semibold text-gray-800 mb-2">Observación</h6>
              <p className="text-gray-700 text-sm text-pretty">
                {detalle.observacion ?? "Sin observaciones."}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

