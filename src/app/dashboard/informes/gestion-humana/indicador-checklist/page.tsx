'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ListChecks } from "lucide-react";
import { useToast } from "@/components/shared/ui/ToastContext";
import {
  indicadorChecklistService,
  IndicadorChecklist,
} from "@/modules/informes/gestion-humana/services/indicador-checklist.service";

const OPCIONES_CHECKLIST = [
  { value: 0, label: "CheckList Trabajo en Caliente" },
  { value: 1, label: "CheckList Alineador" },
  { value: 2, label: "CheckList Elevadores" },
  { value: 3, label: "CheckList Tijera" },
  { value: 4, label: "CheckList Hidráulicos" },
  { value: 5, label: "CheckList Pórtico" },
];

const SEDES = [
  { value: "Todas", label: "Todas las sedes" },
  { value: "Giron", label: "Girón" },
  { value: "Rosita", label: "Rosita" },
  { value: "Bocono", label: "Bocono" },
  { value: "Malecon", label: "Malecón" },
  { value: "Barranca", label: "Barranca" },
  { value: "Otra", label: "Otra" },
];

export default function IndicadorChecklistPage() {
  const { showError, showInfo, showSuccess } = useToast();

  const [op, setOp] = useState(0);
  const [sede, setSede] = useState("Todas");
  const [fechaIni, setFechaIni] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<IndicadorChecklist[]>([]);

  const handleFiltrar = async () => {
    if (!fechaIni || !fechaFin) {
      showError("Por favor ingrese el rango de fechas.");
      return;
    }

    setLoading(true);
    try {
      const data = await indicadorChecklistService.listar({
        op,
        sede,
        fechaIni,
        fechaFin,
      });

      setRows(data);

      if (data.length === 0) {
        showInfo("No hay datos para mostrar con los filtros seleccionados.");
      } else {
        showSuccess(`Se encontraron ${data.length} sede(s) con registros.`);
      }
    } catch (err) {
      console.error(err);
      showError("No se pudo cargar el indicador de checklist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">
            Indicador Checklist
          </h1>
          <p className="text-gray-500 mt-1">
            Informe de número de registros por sede para los diferentes tipos de checklist.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Checklist
            </label>
            <select
              value={op}
              onChange={(e) => setOp(Number(e.target.value))}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white"
            >
              {OPCIONES_CHECKLIST.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Fecha inicial
            </label>
            <input
              type="date"
              value={fechaIni}
              onChange={(e) => setFechaIni(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Fecha final
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Sede</label>
            <select
              value={sede}
              onChange={(e) => setSede(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white"
            >
              {SEDES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleFiltrar}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            <span>Filtrar</span>
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ListChecks size={20} className="text-(--color-primary)" />
            <h2 className="text-base font-semibold text-gray-900">
              Resultados por sede
            </h2>
          </div>
          {rows.length > 0 && (
            <span className="text-xs text-gray-500">
              {rows.length} sede{rows.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="brand-bg border-b border-(--color-primary-dark)] text-sm">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Sede
                </th>
                <th className="text-right py-3 px-4 font-semibold text-white whitespace-nowrap">
                  N° Registros
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} className="text-center py-10">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Cargando datos...</span>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-center py-10 text-gray-500">
                    No hay datos para mostrar. Ingrese un rango de fechas y filtre.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.sede} className="border-b border-gray-100 hover:bg-gray-50/60">
                    <td className="px-4 py-2 whitespace-nowrap">{row.sede}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      {row.numRegistros}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

