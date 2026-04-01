'use client';

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ticketPromedioTecnicoService,
  TicketPromedioTecnicoRow,
} from "@/modules/informes/postventa/services/ticket-promedio-tecnico.service";
import { useToast } from "@/components/ui/use-toast";

const PATIOS = [
  { value: "all", label: "Todos" },
  { value: "1", label: "GIRON GASOLINA" },
  { value: "2", label: "GIRON COLISION" },
  { value: "3", label: "GIRON DIESEL" },
  { value: "4", label: "ROSITA" },
  { value: "5", label: "BARRANCA 1" },
  { value: "6", label: "BARRANCA 2" },
  { value: "7", label: "CUCUTA GASOLINA" },
  { value: "8", label: "CUCUTA DIESEL" },
  { value: "9", label: "CUCUTA COLISION" },
];

function getCurrentYearMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function TicketPromedioTecnicoPage() {
  const { showError } = useToast();
  const [yearMonth, setYearMonth] = useState<string>(getCurrentYearMonth);
  const [patio, setPatio] = useState<string>("all");

  const filtros = useMemo(() => {
    const [yearStr, monthStr] = yearMonth.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    return { year, month, patio };
  }, [yearMonth, patio]);

  const {
    data,
    isLoading,
    isError,
  } = useQuery<TicketPromedioTecnicoRow[], Error>({
    queryKey: ["informes", "postventa", "ticket-promedio-tecnico", filtros],
    queryFn: () => ticketPromedioTecnicoService.listar(filtros),
    enabled: !!filtros.year && !!filtros.month,
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (isError) {
    showError(
      "No se pudo cargar el informe de Ticket Promedio Técnico. Verifica los filtros e inténtalo nuevamente.",
    );
  }

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">
          Ticket Promedio Técnico
        </h1>
        <p className="text-gray-500 mt-1">
          Consulta el ticket promedio por técnico, sede y mes a partir de las
          ventas de repuestos y mano de obra.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Año / Mes
            </label>
            <input
              type="month"
              className="form-input rounded-lg border-gray-300 focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary) text-sm"
              value={yearMonth}
              onChange={(e) => setYearMonth(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Patio / Sede
            </label>
            <select
              className="form-select rounded-lg border-gray-300 focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary) text-sm"
              value={patio}
              onChange={(e) => setPatio(e.target.value)}
            >
              {PATIOS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
        {isLoading && (
          <p className="text-sm text-gray-500">Cargando información...</p>
        )}
        {!isLoading && rows.length === 0 && (
          <p className="text-sm text-gray-500">
            No hay información para los filtros seleccionados.
          </p>
        )}

        {!isLoading && rows.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
              <thead className="bg-(--color-primary) text-white">
                <tr>
                  <th className="px-3 py-2 text-center font-semibold">
                    Operario
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Técnico
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">Sede</th>
                  <th className="px-3 py-2 text-center font-semibold">Año</th>
                  <th className="px-3 py-2 text-center font-semibold">Mes</th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Venta repuestos
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Venta mano de obra
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Venta total
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Órdenes repuestos
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Órdenes mano de obra
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Total órdenes
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Ticket prom. repuestos
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Ticket prom. mano de obra
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Ticket prom. total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={`${row.operario}-${row.anio}-${row.mes}-${row.sede}`}>
                    <td className="px-3 py-1.5 text-center">
                      {row.operario}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      {row.tecnico}
                    </td>
                    <td className="px-3 py-1.5 text-center">{row.sede}</td>
                    <td className="px-3 py-1.5 text-center">{row.anio}</td>
                    <td className="px-3 py-1.5 text-center">{row.mes}</td>
                    <td className="px-3 py-1.5 text-right">
                      {row.ventaRepuestos.toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {row.ventaManoObra.toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {row.ventaTotal.toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      {row.ordenesRepuestos.toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      {row.ordenesManoObra.toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      {row.totalOrdenes.toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {row.promedioRepuestos.toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {row.promedioManoObra.toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {row.promedioTotal.toLocaleString("es-CO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

