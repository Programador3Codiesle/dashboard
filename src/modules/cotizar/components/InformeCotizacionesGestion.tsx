'use client';

import { INFORME_COTIZACIONES_SUBMENU_ID } from '@/utils/constants';
import { useCotizarPageGuard } from '@/modules/cotizar/shared/hooks/useCotizarPageGuard';
import { defaultDateRangeMonthsBack } from '@/modules/cotizar/constants';
import { getErrorMessage } from '@/modules/cotizar/utils/get-error-message';
import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarRange, FileSpreadsheet, FileText, Loader2, Mail, Truck } from "lucide-react";
import { getXlsx } from "@/utils/export-xlsx";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { useInformeCotizaciones } from "@/modules/cotizador/hooks/useInformeCotizaciones";
import {
  cotizadorInformesService,
  TipoCotizacion,
} from "@/modules/cotizador/services/cotizador-informes.service";
import { useToast } from "@/components/shared/ui/ToastContext";
import { usePagination } from "@/components/shared/ui/hooks/usePagination";
import { Pagination } from "@/components/shared/ui/Pagination";
import { getApiBaseUrl } from "@/config/public-env";
import { PageTitleRow } from '@/components/shared/layout/PageTitleRow';

function formatFechaCotizacion(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso || "-";
  return parsed.toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function InformeCotizacionesGestion() {
  const { blocked } = useCotizarPageGuard(INFORME_COTIZACIONES_SUBMENU_ID);
  const defaults = useMemo(() => defaultDateRangeMonthsBack(1), []);
  const [tipo, setTipo] = useState<TipoCotizacion>("livianos");
  const [dateStart, setDateStart] = useState<string>(defaults.start);
  const [dateEnd, setDateEnd] = useState<string>(defaults.end);
  const [emailLoadingId, setEmailLoadingId] = useState<number | null>(null);
  const [agendaLoadingId, setAgendaLoadingId] = useState<number | null>(null);
  const [loadingExport, setLoadingExport] = useState(false);

  const { user } = useAuth();
  const { cotizaciones, loading, error, refetch } = useInformeCotizaciones(tipo, dateStart, dateEnd);
  const { showSuccess, showError } = useToast();

  const emailMutation = useMutation({
    mutationFn: async (vars: { idCotizacion: number; placa: string }) => {
      setEmailLoadingId(vars.idCotizacion);
      return cotizadorInformesService.enviarEmail({
        tipo,
        idCotizacion: vars.idCotizacion,
        placa: vars.placa,
        estado: 0,
        agenda: false,
        empresa: user?.empresa,
      });
    },
    onSuccess: (data) => {
      showSuccess(data?.message ?? "Correo de cotización enviado correctamente.");
    },
    onError: (err: unknown) => {
      showError(getErrorMessage(err, "No se pudo enviar el correo de la cotización."));
    },
    onSettled: () => {
      setEmailLoadingId(null);
    },
  });

  const agendaMutation = useMutation({
    mutationFn: async (vars: { idCotizacion: number; placa: string }) => {
      setAgendaLoadingId(vars.idCotizacion);
      await cotizadorInformesService.actualizarEstado({
        tipo,
        idCotizacion: vars.idCotizacion,
      });
      const result = await cotizadorInformesService.enviarEmail({
        tipo,
        idCotizacion: vars.idCotizacion,
        placa: vars.placa,
        estado: 1,
        agenda: true,
        empresa: user?.empresa,
      });
      return result;
    },
    onSuccess: async (data) => {
      showSuccess(data?.message ?? "Estado de agenda actualizado y correo enviado.");
      await refetch();
    },
    onError: (err: unknown) => {
      showError(getErrorMessage(err, "No se pudo actualizar la agenda de la cotización."));
    },
    onSettled: () => {
      setAgendaLoadingId(null);
    },
  });

  const handleVerPdf = (c: { id_cotizacion: number; placa: string; origen: TipoCotizacion }) => {
    const baseUrl = getApiBaseUrl();
    let url = `${baseUrl}/cotizador/informe-cotizaciones/pdf?origen=${c.origen}&idCotizacion=${c.id_cotizacion}&placa=${encodeURIComponent(
      c.placa,
    )}`;
    if (user?.empresa != null) url += `&empresa=${user.empresa}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const filtered = useMemo(() => cotizaciones, [cotizaciones]);

  const resumen = useMemo(() => {
    const total = filtered.length;
    const agendadas = filtered.filter((c) => c.estado === 1).length;
    const sinAgenda = total - agendadas;
    return { total, agendadas, sinAgenda };
  }, [filtered]);

  const { currentPage, totalPages, startIndex, endIndex, changePage } = usePagination(filtered.length, 20);

  const cotizacionesMostradas = useMemo(
    () => filtered.slice(startIndex, endIndex),
    [filtered, startIndex, endIndex],
  );

  const handleExportar = useCallback(async () => {
    if (loading || filtered.length === 0) return;
    setLoadingExport(true);
    try {
      const rows = filtered.map((c) => ({
        ID: c.id_cotizacion,
        Asesor: c.asesor || "-",
        Placa: c.placa,
        Clase: c.clase,
        Modelo: c.des_modelo,
        Km: c.kilometraje_cliente != null ? c.kilometraje_cliente : "-",
        Revisión: c.revision != null ? c.revision : "-",
        Bodega: c.NomBodega || "-",
        Estado: c.estado === 1 ? "AGENDADA" : "SIN AGENDAR",
        Fecha: formatFechaCotizacion(c.fecha_creacion),
      }));
      const XLSX = await getXlsx();
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Cotizaciones");
      XLSX.writeFile(workbook, "Cotizaciones.xlsx");
    } catch {
      showError("No se pudo exportar el informe de cotizaciones.");
    } finally {
      setLoadingExport(false);
    }
  }, [filtered, loading, showError]);

  if (blocked) return null;

  return (
    <div data-testid="cotizar-informe-page" className="space-y-6">
      <PageTitleRow
        title="Informe de cotizaciones"
        description="Consulta las cotizaciones realizadas para livianos y pesados en un rango de fechas."
      />

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-5 space-y-4"
      >
        <div className="app-form-grid-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desde
            </label>
            <div className="relative">
              <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="date"
                className="block w-full border border-gray-300 rounded-xl pl-9 p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none transition-all"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hasta
            </label>
            <div className="relative">
              <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="date"
                className="block w-full border border-gray-300 rounded-xl pl-9 p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none transition-all"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <div className="inline-flex w-full sm:w-auto flex-wrap rounded-xl border border-gray-200 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => setTipo("livianos")}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  tipo === "livianos"
                    ? "brand-bg text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FileText size={14} />
                Livianos
              </button>
              <button
                type="button"
                onClick={() => setTipo("pesados")}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  tipo === "pesados"
                    ? "brand-bg text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Truck size={14} />
                Pesados
              </button>
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="app-kpi-grid-3 pt-2">
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total cotizaciones</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{resumen.total}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-green-50 px-4 py-3">
            <p className="text-xs text-green-700 uppercase tracking-wide">Agendadas</p>
            <p className="mt-1 text-2xl font-semibold text-green-800">{resumen.agendadas}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-amber-50 px-4 py-3">
            <p className="text-xs text-amber-700 uppercase tracking-wide">Sin agenda</p>
            <p className="mt-1 text-2xl font-semibold text-amber-800">{resumen.sinAgenda}</p>
          </div>
        </div>
      </motion.div>

      {/* Tabla */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {tipo === "livianos" ? "Cotizaciones livianos" : "Cotizaciones pesados"}
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {loading && (
              <span className="text-xs text-gray-500">Cargando cotizaciones...</span>
            )}
            <button
              type="button"
              data-testid="cotizar-informe-excel"
              onClick={() => void handleExportar()}
              disabled={loadingExport || loading || filtered.length === 0}
              className={`inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                filtered.length > 0
                  ? "bg-(--color-success) text-white hover:opacity-90"
                  : "border border-gray-300 text-gray-700 bg-white"
              }`}
            >
              {loadingExport && <Loader2 size={16} className="animate-spin" />}
              <FileSpreadsheet size={16} />
              <span>Exportar a Excel</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-500 mb-3">
            {error}
          </div>
        )}

        <div data-testid="cotizar-informe-table" className="app-table-scroll">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3">ID</th>
                <th className="text-left py-2 px-3">Asesor</th>
                <th className="text-left py-2 px-3">Placa</th>
                <th className="text-left py-2 px-3">Clase</th>
                <th className="text-left py-2 px-3">Modelo</th>
                <th className="text-right py-2 px-3">Km cliente</th>
                <th className="text-center py-2 px-3">Revisión</th>
                <th className="text-left py-2 px-3">Bodega</th>
                <th className="text-center py-2 px-3">Estado</th>
                <th className="text-left py-2 px-3">Fecha</th>
                <th className="text-center py-2 px-3">PDF</th>
                <th className="text-center py-2 px-3">Email</th>
                <th className="text-center py-2 px-3">Agenda</th>
              </tr>
            </thead>
            <tbody>
              {cotizacionesMostradas.map((c) => {
                const estadoLabel = c.estado === 1 ? "AGENDADA" : "SIN AGENDAR";
                const estadoClass =
                  c.estado === 1
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-amber-100 text-amber-800 border border-amber-200";
                const todayIso = new Date().toISOString().slice(0, 10);
                const caducidadValida = c.caducidad != null && c.caducidad >= todayIso;
                const puedeAgendar = c.estado === 0 && caducidadValida;
                const isEmailLoading = emailLoadingId === c.id_cotizacion;
                const isAgendaLoading = agendaLoadingId === c.id_cotizacion;

                return (
                  <tr key={`${c.origen}-${c.id_cotizacion}`} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3">{c.id_cotizacion}</td>
                    <td className="py-2 px-3">{c.asesor || "-"}</td>
                    <td className="py-2 px-3">{c.placa}</td>
                    <td className="py-2 px-3">{c.clase}</td>
                    <td className="py-2 px-3">{c.des_modelo}</td>
                    <td className="py-2 px-3 text-right">
                      {c.kilometraje_cliente != null
                        ? c.kilometraje_cliente.toLocaleString("es-CO")
                        : "-"}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {c.revision != null ? c.revision : "-"}
                    </td>
                    <td className="py-2 px-3">{c.NomBodega || "-"}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${estadoClass}`}>
                        {estadoLabel}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {formatFechaCotizacion(c.fecha_creacion)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleVerPdf(c)}
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <FileText size={14} className="mr-1" />
                        Ver
                      </button>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        disabled={isEmailLoading}
                        onClick={() =>
                          emailMutation.mutate({
                            idCotizacion: c.id_cotizacion,
                            placa: c.placa,
                          })
                        }
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium brand-bg brand-bg-hover text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        <Mail size={14} className="mr-1" />
                        {isEmailLoading ? "Enviando..." : "Email"}
                      </button>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        disabled={!puedeAgendar || isAgendaLoading}
                        onClick={() =>
                          agendaMutation.mutate({
                            idCotizacion: c.id_cotizacion,
                            placa: c.placa,
                          })
                        }
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium border border-(--color-primary) text-(--color-primary) hover:bg-(--color-primary) hover:text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {isAgendaLoading ? "Actualizando..." : "Agenda"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={13} className="py-4 px-3 text-center text-gray-500">
                    No se encontraron cotizaciones para el rango seleccionado.
                  </td>
                </tr>
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

