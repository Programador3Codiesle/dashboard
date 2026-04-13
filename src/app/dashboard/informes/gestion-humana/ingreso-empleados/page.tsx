'use client';

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Users } from "lucide-react";
import { useToast } from "@/components/shared/ui/ToastContext";
import * as XLSX from "xlsx";
import { Pagination } from "@/components/shared/ui/Pagination";
import {
  informeHorarioService,
  InformeHorario,
} from "@/modules/informes/gestion-humana/services/informe-horario.service";

const SEDES = [
  { value: "giron", label: "Girón" },
  { value: "rosita", label: "La Rosita" },
  { value: "bocono", label: "Cúcuta Boconó" },
  { value: "Malecon", label: "Cúcuta Malecón" },
  { value: "Barrancabermeja", label: "Barrancabermeja" },
];

export default function IngresoEmpleadosPage() {
  const { showError, showInfo, showSuccess } = useToast();

  const [sede, setSede] = useState("");
  const [fechaIni, setFechaIni] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [empleado, setEmpleado] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<InformeHorario[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, currentPage]);

  const handleBuscar = async () => {
    if (!fechaIni || !fechaFin) {
      showError("Debe seleccionar fecha inicial y fecha final.");
      return;
    }

    setLoading(true);
    try {
      const data = await informeHorarioService.listar({
        sede: sede || undefined,
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
      showError("No se pudo cargar el informe de ingreso de empleados.");
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
      CC: r.documento,
      Nombres: r.nombres,
      Sede: r.sede,
      Dia: r.dia,
      Fecha: r.fecha,
      "Horario Entrada AM": r.horarioEntradaAm ?? "",
      "Horario Salida AM": r.horarioSalidaAm ?? "",
      "Horario Entrada PM": r.horarioEntradaPm ?? "",
      "Horario Salida PM": r.horarioSalidaPm ?? "",
      "Hora Inicio Ausentismo": r.inicioAusentismo ?? "",
      "Hora Reintegro Ausentismo": r.finAusentismo ?? "",
      "Hora Llegada AM": r.llegadaAm ?? "",
      "Hora Salida AM": r.salidaAm ?? "",
      "Hora Llegada PM": r.llegadaPm ?? "",
      "Hora Salida PM": r.salidaPm ?? "",
      "Dif. Entrada AM (min)": r.difEntradaAm ?? "",
      "Dif. Salida AM (min)": r.difSalidaAm ?? "",
      "Dif. Entrada PM (min)": r.difEntradaPm ?? "",
      "Dif. Salida PM (min)": r.difSalidaPm ?? "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ingreso empleados");
    XLSX.writeFile(workbook, "informe-ingreso-empleados.xlsx");
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">
            Ingreso de empleados
          </h1>
          <p className="text-gray-500 mt-1">
            Horarios de llegada y salida por sede, rango de fechas y empleado,
            replicando el informe del sistema legacy.
          </p>
        </div>
      </div>

      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col min-w-0">
            <label className="text-xs font-medium text-gray-600 mb-1">Sede</label>
            <select
              value={sede}
              onChange={(e) => setSede(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white"
            >
              <option value="" disabled>
                Seleccione una sede
              </option>
              {SEDES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col min-w-0">
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

          <div className="flex flex-col min-w-0">
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

          <div className="flex flex-col min-w-0">
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
            disabled={loading || !sede}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            <span>Buscar</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            disabled={!rows.length}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
              rows.length
                ? "bg-emerald-600 text-white hover:opacity-90"
                : "border border-gray-300 text-gray-700 bg-white"
            }`}
          >
            <Users size={16} />
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
        className="w-full max-w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-(--color-primary)" />
            <h2 className="text-base font-semibold text-gray-900">
              Resultados
            </h2>
          </div>
          {rows.length > 0 && (
            <span className="text-xs text-gray-500">
              {rows.length} registro{rows.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed text-[11px]">
            <thead className="brand-bg border-b border-(--color-primary-dark)] text-sm">
              <tr>
                <th className="text-left py-2 px-2 font-semibold text-white whitespace-normal break-words">
                  CC
                </th>
                <th className="text-left py-2 px-2 font-semibold text-white whitespace-normal break-words">
                  Nombres
                </th>
                <th className="text-left py-2 px-2 font-semibold text-white whitespace-normal break-words">
                  Sede
                </th>
                <th className="text-left py-2 px-2 font-semibold text-white whitespace-normal break-words">
                  Día
                </th>
                <th className="text-left py-2 px-2 font-semibold text-white whitespace-normal break-words">
                  Fecha
                </th>
                <th className="text-left py-2 px-2 font-semibold text-white whitespace-normal break-words">
                  Horario Entrada AM
                </th>
                <th className="text-left py-2 px-2 font-semibold text-white whitespace-normal break-words">
                  Horario Salida AM
                </th>
                <th className="text-left py-2 px-2 font-semibold text-white whitespace-normal break-words">
                  Horario Entrada PM
                </th>
                <th className="text-left py-2 px-2 font-semibold text-white whitespace-normal break-words">
                  Horario Salida PM
                </th>
                <th className="text-left py-2 px-2 font-semibold text-white whitespace-normal break-words">
                  Hora Inicio Ausentismo
                </th>
                <th className="text-left py-2 px-2 font-semibold text-white whitespace-normal break-words">
                  Hora Reintegro Ausentismo
                </th>
                <th className="text-left py-2 px-2 font-semibold text-white whitespace-normal break-words">
                  Hora Llegada AM
                </th>
                <th className="text-left py-2 px-2 font-semibold text-white whitespace-normal break-words">
                  Hora Salida AM
                </th>
                <th className="text-left py-2 px-2 font-semibold text-white whitespace-normal break-words">
                  Hora Llegada PM
                </th>
                <th className="text-left py-2 px-2 font-semibold text-white whitespace-normal break-words">
                  Hora Salida PM
                </th>
                <th className="text-left py-2 px-2 font-semibold text-white whitespace-normal break-words">
                  Dif. Entrada AM (min)
                </th>
                <th className="text-left py-2 px-2 font-semibold text-white whitespace-normal break-words">
                  Dif. Salida AM (min)
                </th>
                <th className="text-left py-2 px-2 font-semibold text-white whitespace-normal break-words">
                  Dif. Entrada PM (min)
                </th>
                <th className="text-left py-2 px-2 font-semibold text-white whitespace-normal break-words">
                  Dif. Salida PM (min)
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={19} className="text-center py-10">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Cargando registros...</span>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={19} className="text-center py-10 text-gray-500">
                    Ingrese un rango de fechas y filtre para ver resultados.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr
                    key={`${row.documento}-${row.fecha}-${index}`}
                    className="border-b border-gray-100 hover:bg-gray-50/60"
                  >
                    <td className="px-2 py-1 whitespace-normal break-words">
                      {row.documento}
                    </td>
                    <td className="px-2 py-1 whitespace-normal break-words">
                      {row.nombres}
                    </td>
                    <td className="px-2 py-1 whitespace-normal break-words">
                      {row.sede}
                    </td>
                    <td className="px-2 py-1 whitespace-normal break-words">{row.dia}</td>
                    <td className="px-2 py-1 whitespace-normal break-words">
                      {row.fecha}
                    </td>
                    <td className="px-2 py-1 whitespace-normal break-words">
                      {row.horarioEntradaAm ?? "—"}
                    </td>
                    <td className="px-2 py-1 whitespace-normal break-words">
                      {row.horarioSalidaAm ?? "—"}
                    </td>
                    <td className="px-2 py-1 whitespace-normal break-words">
                      {row.horarioEntradaPm ?? "—"}
                    </td>
                    <td className="px-2 py-1 whitespace-normal break-words">
                      {row.horarioSalidaPm ?? "—"}
                    </td>
                    <td className="px-2 py-1 whitespace-normal break-words">
                      {row.inicioAusentismo ?? "—"}
                    </td>
                    <td className="px-2 py-1 whitespace-normal break-words">
                      {row.finAusentismo ?? "—"}
                    </td>
                    <td className="px-2 py-1 whitespace-normal break-words">
                      {row.llegadaAm ?? "—"}
                    </td>
                    <td className="px-2 py-1 whitespace-normal break-words">
                      {row.salidaAm ?? "—"}
                    </td>
                    <td className="px-2 py-1 whitespace-normal break-words">
                      {row.llegadaPm ?? "—"}
                    </td>
                    <td className="px-2 py-1 whitespace-normal break-words">
                      {row.salidaPm ?? "—"}
                    </td>
                    <td className="px-2 py-1 whitespace-normal break-words text-right">
                      {row.difEntradaAm ?? "—"}
                    </td>
                    <td className="px-2 py-1 whitespace-normal break-words text-right">
                      {row.difSalidaAm ?? "—"}
                    </td>
                    <td className="px-2 py-1 whitespace-normal break-words text-right">
                      {row.difEntradaPm ?? "—"}
                    </td>
                    <td className="px-2 py-1 whitespace-normal break-words text-right">
                      {row.difSalidaPm ?? "—"}
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

