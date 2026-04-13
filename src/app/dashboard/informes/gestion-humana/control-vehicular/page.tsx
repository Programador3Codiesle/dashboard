'use client';

import { useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { Loader2, Truck, X, CalendarClock, MapPin, FileText } from "lucide-react";
import { useToast } from "@/components/shared/ui/ToastContext";
import Modal from "@/components/shared/ui/Modal";
import { Pagination } from "@/components/shared/ui/Pagination";
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

/** Mismo criterio que el export del backend: todos los registros que cumplan filtros. */
const EXPORT_LIST_LIMIT = 1_000_000;

const inputFilterClass =
  "border border-gray-300 rounded-xl px-3 py-2 text-sm w-full focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white";

function DetalleCampo({
  etiqueta,
  valor,
  className = "",
}: {
  etiqueta: string;
  valor: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-gray-100 bg-gradient-to-b from-gray-50/90 to-white px-3.5 py-2.5 shadow-sm ${className}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
        {etiqueta}
      </p>
      <p className="text-sm font-medium text-gray-900 leading-snug break-words">{valor}</p>
    </div>
  );
}

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
  const [exporting, setExporting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  /** Tabla vacía + cargando: fila de carga. Con datos + cargando: mantener filas y spinner en encabezado. */
  const showInitialLoader = loading && rows.length === 0;
  const showUpdating = loading && rows.length > 0;

  const cargar = useCallback(
    async (
      pagina: number,
      opciones?: { silent?: boolean; limitOverride?: number },
    ) => {
      const silent = opciones?.silent ?? false;
      const effectiveLimit = opciones?.limitOverride ?? limit;

      if (!silent) {
        setLoading(true);
      } else if (rows.length === 0) {
        setLoading(true);
      }
      try {
        const res = await informeControlVehicularService.listar({
          page: pagina,
          limit: effectiveLimit,
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
        if (!silent) {
          setLoading(false);
        } else if (rows.length === 0) {
          setLoading(false);
        }
      }
    },
    [limit, buscador, fechaIni, fechaFin, porteria, rows.length, showError, showInfo, showSuccess],
  );

  const cargarRef = useRef(cargar);
  cargarRef.current = cargar;

  // Solo al montar: si dependemos de `cargar`, cada cambio de filtro dispara otra petición
  // y al pulsar "Aplicar filtro" se duplicaba la consulta.
  useEffect(() => {
    void cargarRef.current(1, { silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carga inicial única
  }, []);

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

  const handlePaginationChange = useCallback(
    (nuevaPagina: number) => {
      if (nuevaPagina < 1 || nuevaPagina > totalPages || nuevaPagina === page) return;
      void cargar(nuevaPagina, { silent: true });
    },
    [cargar, page, totalPages],
  );

  const handleCambiarLimite = async (nuevoLimite: number) => {
    setLimit(nuevoLimite);
    await cargar(1, { limitOverride: nuevoLimite });
  };

  const handleExportar = async () => {
    try {
      setExporting(true);
      const res = await informeControlVehicularService.listar({
        page: 1,
        limit: EXPORT_LIST_LIMIT,
        buscador: buscador.trim() || undefined,
        fechaIni: fechaIni || undefined,
        fechaFin: fechaFin || undefined,
        porteria: porteria || undefined,
      });

      if (!res.items.length) {
        showInfo("No hay registros para exportar con los filtros actuales.");
        return;
      }

      const filas = res.items.map((r) => ({
        Portería: r.porteria ?? "",
        "Fecha salida": r.fecha_salida ?? "",
        "Hora salida": r.hora_salida ?? "",
        "Km salida": r.km_salida ?? "",
        Placa: r.placa ?? "",
        "Tipo vehículo": r.tipo_vehiculo ?? "",
        Modelo: r.modelo ?? "",
        Conductor: r.conductor ?? "",
        Pasajeros: r.pasajeros ?? "",
        "Autorizado por": r.persona_autorizo ?? "",
        "Placa remolcado": r.placa_vh_remolcado ?? "",
        Taller: r.taller ?? "",
        "Fecha llegada": r.fecha_llegada ?? "",
        "Hora llegada": r.hora_llegada ?? "",
        "Km llegada": r.km_llegada ?? "",
        Observación: r.observacion ?? "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(filas);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Control vehicular");
      XLSX.writeFile(workbook, "informe_ingreso_y_salida_de_vehiculos.xlsx");
      showSuccess(`Se exportaron ${res.items.length} registro(s) a Excel.`);
    } catch (err) {
      console.error(err);
      showError("No se pudo generar el reporte Excel.");
    } finally {
      setExporting(false);
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

      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col min-w-0">
            <label className="text-xs font-medium text-gray-600 mb-1">Fecha inicio</label>
            <input
              type="date"
              value={fechaIni}
              onChange={(e) => setFechaIni(e.target.value)}
              className={inputFilterClass}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <label className="text-xs font-medium text-gray-600 mb-1">Fecha fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className={inputFilterClass}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <label className="text-xs font-medium text-gray-600 mb-1">Portería</label>
            <select
              value={porteria}
              onChange={(e) => setPorteria(e.target.value)}
              className={inputFilterClass}
            >
              {PORTERIAS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col min-w-0">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Buscar (portería, placa, conductor)
            </label>
            <input
              type="search"
              value={buscador}
              onChange={(e) => setBuscador(e.target.value)}
              placeholder="Buscar..."
              className={inputFilterClass}
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-3 items-center pt-1 border-t border-gray-100">
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
              disabled={loading || exporting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500 text-emerald-600 text-sm font-medium bg-white hover:bg-emerald-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exporting && <Loader2 size={16} className="animate-spin" />}
              <span>{exporting ? "Generando Excel…" : "Generar reporte"}</span>
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Truck size={20} className="text-(--color-primary) shrink-0" />
            <h2 className="text-base font-semibold text-gray-900 truncate">
              Registros de ingreso y salida
            </h2>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {showUpdating && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 size={14} className="animate-spin" />
                Actualizando…
              </div>
            )}
            {total > 0 && (
              <span className="text-xs text-gray-500 whitespace-nowrap">
                Página {page} de {totalPages}
              </span>
            )}
          </div>
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
              {showInitialLoader ? (
                <tr>
                  <td colSpan={15} className="text-center py-10">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Cargando registros...</span>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={15} className="text-center py-10 text-gray-500">
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
          <div className="border-t border-gray-200">
            <div className="px-6 py-2 text-xs text-gray-500 text-center">
              Mostrando {rows.length} de {total} registros
            </div>
            <div className="pb-4 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onChange={handlePaginationChange}
              />
            </div>
          </div>
        )}
      </motion.div>

      <Modal
        open={detalleOpen}
        onClose={() => {
          setDetalleOpen(false);
          setDetalle(null);
        }}
        width="min(92vw, 640px)"
      >
        {loadingDetalle ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-gray-500">
            <Loader2 className="animate-spin text-(--color-primary)" size={28} />
            <span className="text-sm font-medium">Cargando detalle del registro…</span>
          </div>
        ) : !detalle ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            No se pudo cargar el detalle del registro.
          </div>
        ) : (
          <div className="-m-5 -mt-2">
            <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-br from-(--color-primary) to-(--color-primary-dark) px-5 py-4 text-white shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setDetalleOpen(false);
                  setDetalle(null);
                }}
                className="absolute right-3 top-3 rounded-lg p-1.5 text-white/90 hover:bg-white/15 transition-colors"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
              <div className="flex items-start gap-3 pr-10">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                  <Truck size={22} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/80">
                    Informe de vehículo
                  </p>
                  <h3 className="text-lg font-bold tracking-tight truncate">
                    {detalle.placa ?? "Sin placa"}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-white/90 truncate">
                    <MapPin size={14} className="shrink-0 opacity-80" />
                    <span>{detalle.porteria ?? "—"}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 px-5 pb-5 pt-4">
              <section>
                <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <span className="h-px flex-1 bg-gray-200" />
                  <span>Datos del vehículo y autorización</span>
                  <span className="h-px flex-1 bg-gray-200" />
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DetalleCampo etiqueta="Tipo de vehículo" valor={detalle.tipo_vehiculo ?? "—"} />
                  <DetalleCampo etiqueta="Modelo" valor={detalle.modelo ?? "—"} />
                  <DetalleCampo
                    etiqueta="Conductor"
                    valor={
                      <span className="lowercase">{detalle.conductor ?? "—"}</span>
                    }
                  />
                  <DetalleCampo etiqueta="Taller" valor={detalle.taller ?? "—"} />
                  <DetalleCampo
                    etiqueta="Autorizado por"
                    valor={
                      <span className="lowercase">{detalle.persona_autorizo ?? "—"}</span>
                    }
                  />
                  <DetalleCampo
                    etiqueta="Placa remolcado"
                    valor={detalle.placa_vh_remolcado ?? "—"}
                  />
                  <DetalleCampo
                    etiqueta="Pasajeros"
                    className="sm:col-span-2"
                    valor={
                      <span className="lowercase">{detalle.pasajeros ?? "—"}</span>
                    }
                  />
                </div>
              </section>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <section className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-sm">
                  <p className="mb-3 flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CalendarClock size={16} className="text-emerald-600" />
                    Salida
                  </p>
                  <div className="grid gap-2.5">
                    <DetalleCampo etiqueta="Fecha" valor={detalle.fecha_salida ?? "—"} />
                    <DetalleCampo etiqueta="Hora" valor={detalle.hora_salida ?? "—"} />
                    <DetalleCampo etiqueta="Kilometraje" valor={detalle.km_salida ?? "—"} />
                  </div>
                </section>

                <section className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 shadow-sm">
                  <p className="mb-3 flex items-center gap-2 text-xs font-bold text-rose-900">
                    <CalendarClock size={16} className="text-rose-600" />
                    Ingreso
                  </p>
                  <div className="grid gap-2.5">
                    <DetalleCampo etiqueta="Fecha" valor={detalle.fecha_llegada ?? "—"} />
                    <DetalleCampo etiqueta="Hora" valor={detalle.hora_llegada ?? "—"} />
                    <DetalleCampo etiqueta="Kilometraje" valor={detalle.km_llegada ?? "—"} />
                  </div>
                </section>
              </div>

              <section className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
                <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600">
                  <FileText size={14} />
                  Observación
                </p>
                <p className="text-sm leading-relaxed text-gray-800 text-pretty">
                  {detalle.observacion?.trim() || "Sin observaciones registradas."}
                </p>
              </section>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

