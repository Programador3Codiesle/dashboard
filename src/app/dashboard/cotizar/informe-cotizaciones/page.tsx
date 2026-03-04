'use client';

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarRange, FileText, Truck } from "lucide-react";
import { useInformeCotizaciones } from "@/modules/cotizador/hooks/useInformeCotizaciones";
import { TipoCotizacion } from "@/modules/cotizador/services/cotizador-informes.service";

function getDefaultDates() {
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const format = (d: Date) => d.toISOString().slice(0, 10);
  return {
    start: format(oneMonthAgo),
    end: format(today),
  };
}

export default function InformeCotizacionesPage() {
  const defaults = useMemo(() => getDefaultDates(), []);
  const [tipo, setTipo] = useState<TipoCotizacion>("livianos");
  const [dateStart, setDateStart] = useState<string>(defaults.start);
  const [dateEnd, setDateEnd] = useState<string>(defaults.end);

  const { cotizaciones, loading, error } = useInformeCotizaciones(tipo, dateStart, dateEnd);

  const resumen = useMemo(() => {
    const total = cotizaciones.length;
    const agendadas = cotizaciones.filter((c) => c.estado === 1).length;
    const sinAgenda = total - agendadas;
    return { total, agendadas, sinAgenda };
  }, [cotizaciones]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">
            Informe de cotizaciones
          </h1>
          <p className="text-gray-500 mt-1">
            Consulta las cotizaciones realizadas para livianos y pesados en un rango de fechas.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
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
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {tipo === "livianos" ? "Cotizaciones livianos" : "Cotizaciones pesados"}
          </h2>
          {loading && (
            <span className="text-xs text-gray-500">Cargando cotizaciones...</span>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-500 mb-3">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
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
              </tr>
            </thead>
            <tbody>
              {cotizaciones.map((c) => {
                const estadoLabel = c.estado === 1 ? "AGENDADA" : "SIN AGENDAR";
                const estadoClass =
                  c.estado === 1
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-amber-100 text-amber-800 border border-amber-200";

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
                      {new Date(c.fecha_creacion).toLocaleString("es-CO", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                );
              })}
              {!loading && cotizaciones.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-4 px-3 text-center text-gray-500">
                    No se encontraron cotizaciones para el rango seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

