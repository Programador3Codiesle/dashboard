'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Activity } from "lucide-react";
import { useToast } from "@/components/shared/ui/ToastContext";
import { useSedesByEmpresa } from "@/modules/administracion/hooks/useSedesByEmpresa";
import {
  informePausasActivaseService,
  PausaActiva,
} from "@/modules/informes/gestion-humana/services/informe-pausas-activas.service";

export default function InformePausasActivasPage() {
  const { showError } = useToast();
  const sedes = useSedesByEmpresa();

  const [sede, setSede] = useState("");
  const [empleado, setEmpleado] = useState("");
  const [fechaDia, setFechaDia] = useState("");
  const [fechaMes, setFechaMes] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<PausaActiva[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!fechaDia && !fechaMes) {
        setRows([]);
        return;
      }
      setLoading(true);
      try {
        const data = await informePausasActivaseService.listar({
          sede: sede || undefined,
          empleado: empleado.trim() || undefined,
          fechaDia: fechaDia || undefined,
          fechaMes: !fechaDia ? fechaMes || undefined : undefined,
        });
        setRows(data);
      } catch (err) {
        console.error(err);
        showError("No se pudo cargar el informe de pausas activas.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sede, empleado, fechaDia, fechaMes, showError]);

  const handleFechaDiaChange = (value: string) => {
    setFechaDia(value);
    if (value) {
      setFechaMes("");
    }
  };

  const handleFechaMesChange = (value: string) => {
    setFechaMes(value);
    if (value) {
      setFechaDia("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">Informe Pausas Activas</h1>
          <p className="text-gray-500 mt-1">
            Consulta las pausas activas (AM/PM) por colaborador, sede y fecha (día o mes).
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sede</label>
            <select
              className="block w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white"
              value={sede}
              onChange={(e) => setSede(e.target.value)}
            >
              <option value="">Todas</option>
              {sedes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empleado (documento)</label>
            <input
              type="text"
              className="block w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none"
              value={empleado}
              onChange={(e) => setEmpleado(e.target.value)}
              placeholder="Opcional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha (día)</label>
            <input
              type="date"
              className="block w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none"
              value={fechaDia}
              onChange={(e) => handleFechaDiaChange(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha (mes)</label>
            <input
              type="month"
              className="block w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none"
              value={fechaMes}
              onChange={(e) => handleFechaMesChange(e.target.value)}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-(--color-primary)" />
            <h2 className="text-base font-semibold text-gray-900">Resultados</h2>
          </div>
          {(fechaDia || fechaMes) && (
            <span className="text-xs text-gray-500">
              {rows.length} registro{rows.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="brand-bg border-b border-(--color-primary-dark)] text-sm">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">Documento</th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">Nombre</th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">Sede</th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">Fecha AM</th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">Fecha PM</th>
              </tr>
            </thead>
            <tbody>
              {!fechaDia && !fechaMes ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">
                    Seleccione una fecha (día o mes) para ver el informe.
                  </td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Cargando pausas activas...</span>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">
                    No se encontraron datos para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={`${row.documento}-${idx}`} className="border-b border-gray-100 hover:bg-gray-50/60 text-sm">
                    <td className="px-4 py-2 whitespace-nowrap">{row.documento}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{row.nombre}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{row.sede}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{row.fechaAM ?? <span>—</span>}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{row.fechaPM ?? <span>—</span>}</td>
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

