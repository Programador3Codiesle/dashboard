'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import {
  ventas1a1Service,
  Ventas1a1Asesor,
  Ventas1a1Row,
} from "@/modules/informes/postventa/services/ventas-1a1.service";
import {
  formatCantidadCo,
  formatNumeroCo,
} from "@/modules/informes/postventa/format-cantidad-co";
import { getXlsx } from "@/utils/export-xlsx";
import { useToast } from "@/components/ui/use-toast";
import { Pagination } from "@/components/shared/ui/Pagination";
import { InformesPageFrame } from "@/modules/informes/components/InformesPageFrame";
import { INFORMES_COPY, INFORMES_PV_TRIMENU } from "@/modules/informes/constants";
import { informesKeys } from "@/modules/informes/shared/constants/query-keys";
import { useInformesPageGuard } from "@/modules/informes/shared/hooks/useInformesPageGuard";

function getCurrentYear(): number {
  return new Date().getFullYear();
}

function formatExcelFechaHoy(): string {
  const f = new Date();
  return `${f.getDate()}-${f.getMonth() + 1}-${f.getFullYear()}`;
}

export function Ventas1a1Gestion() {
  const { blocked } = useInformesPageGuard({
    trimenuId: INFORMES_PV_TRIMENU.ventas1a1,
    redirectTo: "/dashboard/informes/postventa",
  });
  const { showError } = useToast();
  const [year, setYear] = useState<number>(getCurrentYear);
  const [asesor, setAsesor] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filtrosAplicados, setFiltrosAplicados] = useState<{
    year: number;
    asesor: string | null;
  } | null>(null);
  const PAGE_SIZE = 10;
  const [loadingExport, setLoadingExport] = useState(false);

  const {
    data: asesores,
    isLoading: loadingAsesores,
    isError: errorAsesores,
  } = useQuery<Ventas1a1Asesor[]>({
    queryKey: informesKeys.pv.ventas1a1("asesores"),
    queryFn: () => ventas1a1Service.listarAsesores(),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: rows = [],
    isFetching: informeLoading,
    isError: informeError,
  } = useQuery<Ventas1a1Row[]>({
    queryKey: informesKeys.pv.ventas1a1(JSON.stringify(filtrosAplicados)),
    queryFn: () =>
      ventas1a1Service.obtenerInforme(
        filtrosAplicados!.year,
        filtrosAplicados!.asesor,
      ),
    enabled: filtrosAplicados != null,
    staleTime: 60 * 1000,
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
    setCurrentPage(1);
    setFiltrosAplicados({
      year,
      asesor: asesor || null,
    });
  };

  const limpiar = () => {
    setYear(getCurrentYear());
    setAsesor("");
    setFiltrosAplicados(null);
    setCurrentPage(1);
  };

  const handleExportar = useCallback(async () => {
    if (rows.length === 0) {
      showError("No hay datos para exportar");
      return;
    }
    setLoadingExport(true);
    try {
      const excelRows = rows.map((row, index) => ({
        "#": index + 1,
        Año: row.anio,
        "Nit Asesor": row.nitAsesor,
        Asesor: row.asesor,
        "Mano de obra": Math.round(row.ventaManoObra),
        "Venta de repuestos": Math.round(row.ventaRepuestos),
        "Costo de repuestos": Math.round(row.costoRepuestos),
        Utilidad: Math.round(row.utilidad),
        Porcentaje:
          row.porcentajeConversion !== null
            ? Number(row.porcentajeConversion.toFixed(2))
            : "",
      }));
      const XLSX = await getXlsx();
      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas 1 a 1");
      XLSX.writeFile(workbook, `InformeVentas1a1-${formatExcelFechaHoy()}.xlsx`);
    } catch {
      showError("No se pudo exportar el informe");
    } finally {
      setLoadingExport(false);
    }
  }, [rows, showError]);

  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, currentPage]);
  const inputClass =
    "border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white w-full";

  useEffect(() => {
    if (!informeError) return;
    showError(
      "No se pudo cargar el informe de Ventas 1 a 1. Verifica los filtros e inténtalo nuevamente.",
    );
  }, [informeError, showError]);

  if (blocked) return null;

  return (
    <InformesPageFrame
      title={INFORMES_COPY.ventas1a1.title}
      description={INFORMES_COPY.ventas1a1.description}
      backHref="/dashboard/informes/postventa"
      backLabel={INFORMES_COPY.backPv}
    >

      <div className="w-full max-w-6xl bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 md:p-6 shadow-lg space-y-4">
        <div className="app-filter-grid">
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
              disabled={informeLoading}
              className="inline-flex w-full justify-center items-center gap-2 rounded-xl bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-(--color-primary-dark) transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {informeLoading && <Loader2 size={16} className="animate-spin" />}
              <span>Buscar</span>
            </button>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleExportar}
              disabled={loadingExport || informeLoading || rows.length === 0}
              className={`inline-flex w-full justify-center items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition-colors focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
                rows.length > 0
                  ? "bg-(--color-success) text-white hover:opacity-90"
                  : "border border-gray-300 text-gray-700 bg-white"
              }`}
            >
              {loadingExport && <Loader2 size={16} className="animate-spin" />}
              <FileSpreadsheet size={16} />
              <span>Exportar a Excel</span>
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
        {informeLoading && (
          <p className="text-sm text-gray-500">Cargando información...</p>
        )}

        {!informeLoading && rows.length === 0 && (
          <p className="text-sm text-gray-500">
            No hay información para los filtros seleccionados.
          </p>
        )}

        {!informeLoading && rows.length > 0 && (
          <div className="app-table-scroll">
            <table className="min-w-[720px] w-full divide-y divide-gray-200 text-xs md:text-sm">
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
                      {formatCantidadCo(row.ventaManoObra)}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {formatCantidadCo(row.ventaRepuestos)}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {formatCantidadCo(row.costoRepuestos)}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {formatCantidadCo(row.utilidad)}
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
                          {formatNumeroCo(row.porcentajeConversion, 2, 2)}%
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
        {!informeLoading && totalItems > 0 && (
          <div className="p-4 border-t border-gray-200 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </InformesPageFrame>
  );
}

