'use client';

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarRange, PieChart } from "lucide-react";
import {
  useEjecucionResumen,
  useEjecucionCotizacionToFacturado,
  useEjecucionFacturadoToCotizacion,
} from "@/modules/cotizador/hooks/useEjecucionCotizadoVsFacturado";

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

const BODEGAS = [
  { value: null, label: "Todas" },
  { value: 1, label: "Girón Gasolina" },
  { value: 6, label: "Barranca" },
  { value: 7, label: "Rosita" },
  { value: 8, label: "Cúcuta" },
];

export default function EjecucionCotizadoVsFacturadoPage() {
  const defaults = useMemo(() => getDefaultDates(), []);
  const [dateStart, setDateStart] = useState<string>(defaults.start);
  const [dateEnd, setDateEnd] = useState<string>(defaults.end);
  const [bodega, setBodega] = useState<number | null>(null);

  const filtro = { dateStart, dateEnd, bodega };

  const { resumen, totales, loading: loadingResumen, error: errorResumen } = useEjecucionResumen(filtro);
  const {
    filas: filasCotToFact,
    loading: loadingCotToFact,
    error: errorCotToFact,
  } = useEjecucionCotizacionToFacturado(filtro);
  const {
    filas: filasFactToCot,
    loading: loadingFactToCot,
    error: errorFactToCot,
  } = useEjecucionFacturadoToCotizacion(filtro);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">
          Ejecución Cotizado vs Facturado
        </h1>
        <p className="text-gray-500 mt-1">
          Analiza cómo se ejecutan las cotizaciones frente a lo realmente facturado, por rango de fechas y bodega.
        </p>
      </div>

      {/* Filtros y resumen */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              Bodega
            </label>
            <select
              className="block w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none transition-all"
              value={bodega ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setBodega(v === "" ? null : Number(v));
              }}
            >
              {BODEGAS.map((b) => (
                <option key={String(b.value ?? "all")} value={b.value ?? ""}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            {loadingResumen && (
              <span className="text-xs text-gray-500">Cargando resumen...</span>
            )}
          </div>
        </div>

        {/* Cards de resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div className="rounded-xl border border-gray-100 bg-blue-50 px-4 py-3">
            <p className="text-xs text-blue-700 uppercase tracking-wide">Total</p>
            <p className="mt-1 text-2xl font-semibold text-blue-900">
              {resumen?.total_cotizaciones ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-green-50 px-4 py-3">
            <p className="text-xs text-green-700 uppercase tracking-wide">Agendadas</p>
            <p className="mt-1 text-2xl font-semibold text-green-900">
              {resumen?.env_agendadas ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-amber-50 px-4 py-3">
            <p className="text-xs text-amber-700 uppercase tracking-wide">Sin agenda</p>
            <p className="mt-1 text-2xl font-semibold text-amber-900">
              {resumen?.env_sin_agenda ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-purple-50 px-4 py-3">
            <p className="text-xs text-purple-700 uppercase tracking-wide">Asistidas</p>
            <p className="mt-1 text-2xl font-semibold text-purple-900">
              {resumen?.asistidas ?? 0}
            </p>
          </div>
        </div>

        {/* Totales valores */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-center py-2 px-3">Total agendado</th>
                <th className="text-center py-2 px-3">Total facturado</th>
                <th className="text-center py-2 px-3">Items cotizados</th>
                <th className="text-center py-2 px-3">Items facturados</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-3 text-right">
                  {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(
                    totales?.total_agendado ?? 0
                  )}
                </td>
                <td className="py-2 px-3 text-right">
                  {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(
                    totales?.total_facturado ?? 0
                  )}
                </td>
                <td className="py-2 px-3 text-center">
                  {totales?.items_cotizados ?? 0}
                </td>
                <td className="py-2 px-3 text-center">
                  {totales?.items_facturados ?? 0}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {errorResumen && (
          <div className="text-sm text-red-500">
            {errorResumen}
          </div>
        )}
      </motion.div>

      {/* Tabla Cotizado a Facturado */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-3"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <PieChart size={18} className="text-[var(--color-primary)]" />
            <h2 className="text-lg font-semibold text-gray-900">Cotizado a Facturado</h2>
          </div>
          {loadingCotToFact && (
            <span className="text-xs text-gray-500">Cargando...</span>
          )}
        </div>
        {errorCotToFact && (
          <div className="text-sm text-red-500 mb-2">
            {errorCotToFact}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-center py-2 px-3">Id</th>
                <th className="text-center py-2 px-3">Número</th>
                <th className="text-center py-2 px-3">Código</th>
                <th className="text-center py-2 px-3">Valor Cotizado</th>
                <th className="text-center py-2 px-3">Operación</th>
                <th className="text-center py-2 px-3">Valor Facturado</th>
              </tr>
            </thead>
            <tbody>
              {filasCotToFact.map((f) => (
                <tr key={`${f.id_cotizacion}-${f.numero}-${f.codigo}-${f.operacion}`} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 text-center">{f.id_cotizacion}</td>
                  <td className="py-2 px-3 text-center">{f.numero}</td>
                  <td className="py-2 px-3 text-center">{f.codigo}</td>
                  <td className="py-2 px-3 text-right">
                    {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(
                      f.valor_cotizado
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">{f.operacion}</td>
                  <td className="py-2 px-3 text-right">
                    {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(
                      f.valor_facturado
                    )}
                  </td>
                </tr>
              ))}
              {!loadingCotToFact && filasCotToFact.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-3 px-3 text-center text-gray-500">
                    No hay datos de Cotizado a Facturado para el rango seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Tabla Facturado a Cotizado */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-3"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <PieChart size={18} className="text-[var(--color-primary)]" />
            <h2 className="text-lg font-semibold text-gray-900">Facturado a Cotizado</h2>
          </div>
          {loadingFactToCot && (
            <span className="text-xs text-gray-500">Cargando...</span>
          )}
        </div>
        {errorFactToCot && (
          <div className="text-sm text-red-500 mb-2">
            {errorFactToCot}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-center py-2 px-3">Id</th>
                <th className="text-center py-2 px-3">Número</th>
                <th className="text-center py-2 px-3">Operación</th>
                <th className="text-center py-2 px-3">Valor Facturado</th>
                <th className="text-center py-2 px-3">Código</th>
                <th className="text-center py-2 px-3">Valor Cotizado</th>
              </tr>
            </thead>
            <tbody>
              {filasFactToCot.map((f) => (
                <tr key={`${f.id_cotizacion}-${f.numero}-${f.codigo}-${f.operacion}`} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 text-center">{f.id_cotizacion}</td>
                  <td className="py-2 px-3 text-center">{f.numero}</td>
                  <td className="py-2 px-3 text-center">{f.operacion}</td>
                  <td className="py-2 px-3 text-right">
                    {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(
                      f.valor_facturado
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">{f.codigo}</td>
                  <td className="py-2 px-3 text-right">
                    {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(
                      f.valor_cotizado
                    )}
                  </td>
                </tr>
              ))}
              {!loadingFactToCot && filasFactToCot.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-3 px-3 text-center text-gray-500">
                    No hay datos de Facturado a Cotizado para el rango seleccionado.
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

