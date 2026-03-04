'use client';

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarRange, Search, AlertTriangle, Package } from "lucide-react";
import { useRepuestosNoDisponibles } from "@/modules/cotizador/hooks/useRepuestosNoDisponibles";

function getDefaultDates() {
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);
  const format = (d: Date) => d.toISOString().slice(0, 10);
  return {
    start: format(oneWeekAgo),
    end: format(today),
  };
}

const BODEGAS = [
  { value: null as number | null, label: "Seleccione una opción" },
  { value: 1, label: "Girón Gasolina" },
  { value: 6, label: "Barranca" },
  { value: 7, label: "Rosita" },
  { value: 8, label: "Cúcuta" },
];

export default function RepuestosNoDisponiblesPage() {
  const defaults = useMemo(() => getDefaultDates(), []);
  const [dateStart, setDateStart] = useState<string>(defaults.start);
  const [dateEnd, setDateEnd] = useState<string>(defaults.end);
  const [bodega, setBodega] = useState<number | null>(null);
  const [showDateError, setShowDateError] = useState(false);

  const filtro = { dateStart, dateEnd, bodega: bodega ?? undefined };

  const {
    filas,
    loading,
    error,
    refetch,
    enabled,
  } = useRepuestosNoDisponibles(filtro);

  const handleBuscar = () => {
    if (dateStart && dateEnd && dateStart > dateEnd) {
      setShowDateError(true);
      return;
    }
    setShowDateError(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">
          Repuestos no disponibles
        </h1>
        <p className="text-gray-500 mt-1">
          Repuestos de cotización con unidades disponibles en 0 en el rango de fechas seleccionado.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha inicio
            </label>
            <div className="relative">
              <CalendarRange
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
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
              Fecha final
            </label>
            <div className="relative">
              <CalendarRange
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="date"
                className="block w-full border border-gray-300 rounded-xl pl-9 p-2.5 text-sm bg-white focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none transition-all"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={handleBuscar}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-(--color-primary) hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-(--color-primary) focus:ring-offset-2 disabled:opacity-60 transition-all"
            >
              <Search size={18} />
              Buscar
            </button>
          </div>
        </div>

        {showDateError && (
          <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-sm">
            <AlertTriangle size={18} />
            La fecha de inicio debe ser menor o igual a la fecha final.
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Package size={20} className="text-amber-500" />
            Repuestos con 0 unidades disponibles
          </h2>
          {loading && (
            <span className="text-sm text-gray-500">Cargando...</span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">
                  Bodega
                </th>
                <th scope="col" className="px-5 py-3 font-medium text-center">
                  Cantidad
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Código
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Descripción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!enabled && !loading && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                    Ajuste las fechas (inicio ≤ final) y pulse Buscar para cargar los repuestos no disponibles.
                  </td>
                </tr>
              )}
              {enabled && !loading && filas.length === 0 && !error && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                    No se encontraron repuestos con 0 unidades en el rango seleccionado.
                  </td>
                </tr>
              )}
              {filas.map((row, idx) => (
                <tr
                  key={`${row.bodega}-${row.codigo}-${idx}`}
                  className="hover:bg-gray-50/80 transition-colors"
                >
                  <td className="px-5 py-3 text-gray-800">{row.bodega}</td>
                  <td className="px-5 py-3 text-center text-gray-800">
                    {row.cant_codigo}
                  </td>
                  <td className="px-5 py-3 font-mono text-gray-800">
                    {row.codigo}
                  </td>
                  <td className="px-5 py-3 text-gray-700">{row.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
