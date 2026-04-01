'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Users } from "lucide-react";
import { useToast } from "@/components/shared/ui/ToastContext";
import {
  informeHorarioService,
  InformeHorario,
} from "@/modules/informes/gestion-humana/services/informe-horario.service";

const SEDES = [
  { value: "", label: "Todas las sedes" },
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

  const handleExportCSV = () => {
    if (!rows.length) {
      showInfo("No hay datos para exportar.");
      return;
    }

    const headers = [
      "CC",
      "Nombres",
      "Sede",
      "Día",
      "Fecha",
      "Horario Entrada AM",
      "Horario Salida AM",
      "Horario Entrada PM",
      "Horario Salida PM",
      "Hora Inicio Ausentismo",
      "Hora Reintegro Ausentismo",
      "Hora Llegada AM",
      "Hora Salida AM",
      "Hora Llegada PM",
      "Hora Salida PM",
      "Dif. Entrada AM (min)",
      "Dif. Salida AM (min)",
      "Dif. Entrada PM (min)",
      "Dif. Salida PM (min)",
    ];

    const lines = rows.map((r) =>
      [
        r.documento,
        r.nombres,
        r.sede,
        r.dia,
        r.fecha,
        r.horarioEntradaAm ?? "",
        r.horarioSalidaAm ?? "",
        r.horarioEntradaPm ?? "",
        r.horarioSalidaPm ?? "",
        r.inicioAusentismo ?? "",
        r.finAusentismo ?? "",
        r.llegadaAm ?? "",
        r.salidaAm ?? "",
        r.llegadaPm ?? "",
        r.salidaPm ?? "",
        r.difEntradaAm ?? "",
        r.difSalidaAm ?? "",
        r.difEntradaPm ?? "",
        r.difSalidaPm ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(";"),
    );

    const csvContent = [headers.join(";"), ...lines].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "informe-ingreso-empleados.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
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
            onClick={handleExportCSV}
            disabled={!rows.length}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Users size={16} />
            <span>Exportar a CSV</span>
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="brand-bg border-b border-(--color-primary-dark)] text-sm">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  CC
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Nombres
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Sede
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Día
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Fecha
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Horario Entrada AM
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Horario Salida AM
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Horario Entrada PM
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Horario Salida PM
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Hora Inicio Ausentismo
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Hora Reintegro Ausentismo
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Hora Llegada AM
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Hora Salida AM
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Hora Llegada PM
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Hora Salida PM
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Dif. Entrada AM (min)
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Dif. Salida AM (min)
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
                  Dif. Entrada PM (min)
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">
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
                rows.map((row, index) => (
                  <tr
                    key={`${row.documento}-${row.fecha}-${index}`}
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
                    <td className="px-4 py-2 whitespace-nowrap">{row.dia}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.fecha}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.horarioEntradaAm ?? "—"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.horarioSalidaAm ?? "—"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.horarioEntradaPm ?? "—"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.horarioSalidaPm ?? "—"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.inicioAusentismo ?? "—"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.finAusentismo ?? "—"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.llegadaAm ?? "—"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.salidaAm ?? "—"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.llegadaPm ?? "—"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.salidaPm ?? "—"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      {row.difEntradaAm ?? "—"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      {row.difSalidaAm ?? "—"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      {row.difEntradaPm ?? "—"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      {row.difSalidaPm ?? "—"}
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

