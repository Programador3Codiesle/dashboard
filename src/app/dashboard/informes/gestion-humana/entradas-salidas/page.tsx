'use client';

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, LogOut } from "lucide-react";
import { useToast } from "@/components/shared/ui/ToastContext";
import * as XLSX from "xlsx";
import { Pagination } from "@/components/shared/ui/Pagination";
import {
  informeEntradasSalidasService,
  EntradaSalida,
} from "@/modules/informes/gestion-humana/services/informe-entradas-salidas.service";

const SEDES = [
  { value: "giron", label: "Girón" },
  { value: "rosita", label: "La Rosita" },
  { value: "bocono", label: "Cúcuta Boconó" },
  { value: "Malecon", label: "Cúcuta Malecón" },
  { value: "Barrancabermeja", label: "Barrancabermeja" },
];

export default function EntradasSalidasPage() {
  const { showError, showInfo, showSuccess } = useToast();
  const PAGE_SIZE = 10;

  const [sede, setSede] = useState("giron");
  const [fechaIni, setFechaIni] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [empleado, setEmpleado] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<EntradaSalida[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const showInitialLoader = loading && rows.length === 0;
  const showUpdating = loading && rows.length > 0;
  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, currentPage]);

  const formatDateOnly = (value?: string | null) => {
    if (!value) return "";
    const s = String(value).trim();
    const iso = s.match(/^(\d{4}-\d{2}-\d{2})/);
    if (iso) return iso[1];
    return s.slice(0, 10);
  };

  const handleBuscar = async () => {
    if (!fechaIni || !fechaFin) {
      showError("Debe seleccionar fecha inicial y fecha final.");
      return;
    }

    setLoading(true);
    try {
      const data = await informeEntradasSalidasService.listar({
        sede,
        fechaIni,
        fechaFin,
        empleado: empleado.trim() || undefined,
      });

      setRows(data);
      setCurrentPage(1);

      if (data.length === 0) {
        showInfo("No se encontraron registros para los filtros seleccionados.");
      } else {
        showSuccess(`Se cargaron ${data.length} registros.`);
      }
    } catch (err) {
      console.error(err);
      showError("No se pudo cargar el informe de entradas y salidas.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!rows.length) {
      showInfo("No hay datos para exportar.");
      return;
    }

    const excelRows = rows.map((r) => ({
      Documento: r.documento,
      Nombre: r.nombres,
      Sede: r.sede,
      Fecha: formatDateOnly(r.fecha),
      Hora: r.hora,
      Acción: r.accion,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Entradas-salidas");
    XLSX.writeFile(workbook, "informe-entradas-salidas.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">
            Entradas y salidas
          </h1>
          <p className="text-gray-500 mt-1">
            Horarios de llegada y salida por sede, rango de fechas y empleado,
            basados en el registro de ingreso.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <label className="text-xs font-medium text-gray-600 mb-1">
              Empleado (documento)
            </label>
            <input
              type="text"
              value={empleado}
              onChange={(e) => setEmpleado(e.target.value)}
              placeholder="Opcional: filtrar por documento"
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={handleBuscar}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            <span>Buscar</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            disabled={!rows.length}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium shadow-sm hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <LogOut size={16} />
            <span>Exportar a Excel</span>
          </button>

          {rows.length > 0 && (
            <span className="text-xs text-gray-500">
              {rows.length} registro{rows.length === 1 ? "" : "s"} encontrados
            </span>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <LogOut size={20} className="text-(--color-primary)" />
            <h2 className="text-base font-semibold text-gray-900">
              Resultados
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {showUpdating && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 size={14} className="animate-spin" />
                Actualizando...
              </div>
            )}
            {rows.length > 0 && (
              <span className="text-xs text-gray-500">
                {rows.length} registro{rows.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="brand-bg border-b border-(--color-primary-dark)] text-sm">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Documento
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Nombre
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Sede
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Fecha
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Hora
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {showInitialLoader ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Cargando registros...</span>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    Ingrese un rango de fechas y filtre para ver resultados.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-100 hover:bg-gray-50/60"
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.documento}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.nombres}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.sede}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {formatDateOnly(row.fecha)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.hora}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.accion}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && totalItems > 0 && (
          <div className="p-4 border-t border-gray-200 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}

