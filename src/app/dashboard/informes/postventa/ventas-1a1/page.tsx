'use client';

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ventas1a1Service,
  Ventas1a1Asesor,
  Ventas1a1Row,
} from "@/modules/informes/postventa/services/ventas-1a1.service";
import { useToast } from "@/components/ui/use-toast";
import { Pagination } from "@/components/shared/ui/Pagination";

function getCurrentYear(): number {
  return new Date().getFullYear();
}

export default function Ventas1a1Page() {
  const { showError } = useToast();
  const [year, setYear] = useState<number>(getCurrentYear);
  const [asesor, setAsesor] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState<Ventas1a1Row[]>([]);
  const PAGE_SIZE = 10;

  const {
    data: asesores,
    isLoading: loadingAsesores,
    isError: errorAsesores,
  } = useQuery<Ventas1a1Asesor[]>({
    queryKey: ["informes", "postventa", "ventas-1a1", "asesores"],
    queryFn: () => ventas1a1Service.listarAsesores(),
    staleTime: 5 * 60 * 1000,
  });

  const informeMutation = useMutation({
    mutationFn: (payload: { year: number; asesor: string | null }) =>
      ventas1a1Service.obtenerInforme(payload.year, payload.asesor),
    onSuccess: (data) => {
      setRows(data);
    },
    onError: () => {
      showError(
        "No se pudo cargar el informe de Ventas 1 a 1. Verifica los filtros e inténtalo nuevamente.",
      );
    },
  });

  useEffect(() => {
    if (errorAsesores) {
      showError(
        "No se pudo cargar el informe de Ventas 1 a 1. Verifica los filtros e inténtalo nuevamente.",
      );
    }
  }, [errorAsesores, showError]);

  const onBuscar = () => {
    if (!year || year < 2020 || year > getCurrentYear()) {
      showError(
        `Debes seleccionar un año desde 2020 hasta ${getCurrentYear()}.`,
      );
      return;
    }
    informeMutation.mutate({
      year,
      asesor: asesor || null,
    });
  };

  const limpiar = () => {
    setYear(getCurrentYear());
    setAsesor("");
    setRows([]);
    setCurrentPage(1);
  };

  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, currentPage]);
  const inputClass =
    "border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white w-full";

  useEffect(() => {
    setCurrentPage(1);
  }, [rows.length]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">
          Ventas 1 a 1
        </h1>
        <p className="text-gray-500 mt-1">
          Informe general de ventas 1 a 1 por asesor, mostrando venta de mano
          de obra, repuestos, costo y utilidad.
        </p>
      </div>

      <div className="w-full max-w-6xl bg-white rounded-2xl border border-gray-100 p-6 shadow-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Año</label>
            <input
              type="number"
              min={2020}
              max={getCurrentYear()}
              className={inputClass}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Asesor</label>
            <select
              className={inputClass}
              value={asesor}
              onChange={(e) => setAsesor(e.target.value)}
              disabled={loadingAsesores}
            >
              <option value="">Todos los asesores</option>
              {asesores?.map((a) => (
                <option key={a.nitAsesor} value={a.nitAsesor}>
                  {a.asesor} ({a.nitAsesor})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBuscar}
              className="inline-flex-1 w-full justify-center rounded-xl bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-(--color-primary-dark) transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary)"
            >
              Buscar
            </button>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={limpiar}
              className="inline-flex-1 w-full justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Recargar
            </button>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-3">
          <span className="text-xs text-gray-500">
            {rows.length} registro{rows.length === 1 ? "" : "s"} encontrado{rows.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
        {informeMutation.isPending && (
          <p className="text-sm text-gray-500">Cargando información...</p>
        )}

        {!informeMutation.isPending && rows.length === 0 && (
          <p className="text-sm text-gray-500">
            No hay información para los filtros seleccionados.
          </p>
        )}

        {!informeMutation.isPending && rows.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-center font-semibold">#</th>
                  <th className="px-3 py-2 text-center font-semibold">Año</th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Nit Asesor
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Asesor
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Mano de obra
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Venta repuestos
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Costo repuestos
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Utilidad
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    % Conversión (entradas/ventas)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedRows.map((row, index) => (
                  <tr key={`${row.nitAsesor}-${row.anio}-${index}`}>
                    <td className="px-3 py-1.5 text-center">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td className="px-3 py-1.5 text-center">{row.anio}</td>
                    <td className="px-3 py-1.5 text-center">
                      {row.nitAsesor}
                    </td>
                    <td className="px-3 py-1.5 text-center">{row.asesor}</td>
                    <td className="px-3 py-1.5 text-right">
                      {row.ventaManoObra.toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {row.ventaRepuestos.toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {row.costoRepuestos.toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {row.utilidad.toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      {row.porcentajeConversion !== null ? (
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-xs"
                          title={
                            row.entradas != null && row.ventas != null
                              ? `Entradas: ${row.entradas} / Ventas: ${row.ventas}`
                              : undefined
                          }
                        >
                          {row.porcentajeConversion.toFixed(2)}%
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!informeMutation.isPending && totalItems > 0 && (
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

