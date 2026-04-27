'use client';

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ticketPromedioTecnicoService,
  TicketPromedioTecnicoRow,
} from "@/modules/informes/postventa/services/ticket-promedio-tecnico.service";
import { formatCantidadCo } from "@/modules/informes/postventa/format-cantidad-co";
import { useToast } from "@/components/ui/use-toast";
import { Pagination } from "@/components/shared/ui/Pagination";

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
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

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
  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, currentPage]);

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

      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col min-w-0 gap-1">
            <label className="text-xs font-medium text-gray-600">
              Año / Mes
            </label>
            <input
              type="month"
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none"
              value={yearMonth}
              onChange={(e) => setYearMonth(e.target.value)}
            />
          </div>
          <div className="flex flex-col min-w-0 gap-1">
            <label className="text-xs font-medium text-gray-600">
              Patio / Sede
            </label>
            <select
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white"
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
        <div className="border-t border-gray-100 pt-3">
          <span className="text-xs text-gray-500">
            {rows.length} registro{rows.length === 1 ? "" : "s"} encontrado
            {rows.length === 1 ? "" : "s"}
          </span>
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
                {paginatedRows.map((row) => (
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
                      {formatCantidadCo(row.ventaRepuestos)}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {formatCantidadCo(row.ventaManoObra)}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {formatCantidadCo(row.ventaTotal)}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      {formatCantidadCo(row.ordenesRepuestos)}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      {formatCantidadCo(row.ordenesManoObra)}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      {formatCantidadCo(row.totalOrdenes)}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {formatCantidadCo(row.promedioRepuestos)}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {formatCantidadCo(row.promedioManoObra)}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {formatCantidadCo(row.promedioTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && totalItems > 0 && (
          <div className="p-4 border-t border-gray-200 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

