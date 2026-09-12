'use client';

import { useCallback, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileSpreadsheet, Loader2, ShoppingCart } from "lucide-react";
import { useToast } from "@/components/shared/ui/ToastContext";
import { getXlsx } from "@/utils/export-xlsx";
import {
  controlComprasService,
  type ControlCompras,
} from "@/modules/informes/gestion-humana/services/control-compras.service";
import { Pagination } from "@/components/shared/ui/Pagination";
import { InformesPageFrame } from "@/modules/informes/components/InformesPageFrame";
import { INFORMES_COPY, INFORMES_GH_TRIMENU } from "@/modules/informes/constants";
import { InformesQueryError } from "@/modules/informes/shared/components/InformesQueryError";
import { informesKeys } from "@/modules/informes/shared/constants/query-keys";
import { useInformesPageGuard } from "@/modules/informes/shared/hooks/useInformesPageGuard";
import { getErrorMessage } from "@/modules/informes/shared/utils/parse-api-error";

function formatNumber(value: number | null | undefined): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function mapControlComprasToExcelRow(row: ControlCompras) {
  return {
    CÓDIGO: row.codigo ?? "",
    DESCRIPCIÓN: row.descripcion ?? "",
    CANTIDAD: row.cantidad ?? "",
    "VALOR UNITARIO": row.valorUnitario ?? "",
    "VALOR TOTAL": row.valorTotal ?? "",
    CALIFICACIÓN: row.calificacionAbc ?? "-",
    "ÚLTIMA COMPRA": row.ultimaCompra ?? "-",
    "ÚLTIMA VENTA": row.ultimaVenta ?? "-",
    GIRÓN: row.giron ?? "",
    CHEVROPARTES: row.chevropartes ?? "",
    BARRANCA: row.barranca ?? "",
    ROSITA: row.rosita ?? "",
    "VILLA DEL ROSARIO": row.villa ?? "",
    SOLOCHEVROLET: row.solochevrolet ?? "",
  };
}

export function ControlComprasGestion() {
  const PAGE_SIZE = 10;
  const { blocked } = useInformesPageGuard({
    trimenuId: INFORMES_GH_TRIMENU.controlCompras,
    redirectTo: "/dashboard/informes/gestion-humana",
  });
  const { showError } = useToast();

  const [orden, setOrden] = useState<string>("");
  const [appliedOrden, setAppliedOrden] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingExport, setLoadingExport] = useState(false);
  const hasAppliedSearch = appliedOrden != null;

  const handleGenerar = () => {
    if (!orden.trim()) {
      showError("El campo del número de orden se encuentra vacío.");
      return;
    }

    const numOrden = Number(orden);
    if (!numOrden || numOrden <= 0) {
      showError("Ingrese un número de orden válido.");
      return;
    }

    setAppliedOrden(numOrden);
    setCurrentPage(1);
  };

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: informesKeys.gh.controlCompras(appliedOrden, currentPage),
    enabled: hasAppliedSearch,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (appliedOrden == null) return { items: [], total: 0 };
      return controlComprasService.listar({
        orden: appliedOrden,
        pagina: currentPage,
        limite: PAGE_SIZE,
      });
    },
  });

  const rows = data?.items ?? [];
  const totalItems = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const showInitialLoader = hasAppliedSearch && isLoading && rows.length === 0;
  const showUpdating = hasAppliedSearch && isFetching && rows.length > 0;
  const generarDisabled = !orden.trim() || isFetching;

  const handleExportar = useCallback(async () => {
    if (appliedOrden == null) {
      showError("Genere el informe antes de exportar.");
      return;
    }
    if (totalItems === 0) {
      showError("No hay datos para exportar");
      return;
    }
    setLoadingExport(true);
    try {
      const resultado = await controlComprasService.listar({
        orden: appliedOrden,
        pagina: 1,
        limite: totalItems,
      });
      const excelRows = resultado.items.map(mapControlComprasToExcelRow);
      const XLSX = await getXlsx();
      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Control Compras");
      XLSX.writeFile(workbook, `Control-Compras-${appliedOrden}.xlsx`);
    } catch {
      showError("No se pudo exportar el informe");
    } finally {
      setLoadingExport(false);
    }
  }, [appliedOrden, totalItems, showError]);

  if (blocked) return null;

  return (
    <InformesPageFrame
      title={INFORMES_COPY.controlCompras.title}
      description={INFORMES_COPY.controlCompras.description}
      backHref="/dashboard/informes/gestion-humana"
      backLabel={INFORMES_COPY.backGh}
    >
      {isError ? (
        <InformesQueryError
          message={getErrorMessage(error, INFORMES_COPY.controlCompras.loadError)}
        />
      ) : null}

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6 space-y-4">
        <div className="app-filter-grid">
          <div className="flex flex-col min-w-0">
            <label className="text-xs font-medium text-gray-600 mb-1">
              N° Orden
            </label>
            <input
              type="number"
              min={1}
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              placeholder="Número de orden"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleGenerar}
            disabled={generarDisabled}
            className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isFetching && <Loader2 size={16} className="animate-spin" />}
            <span>Generar</span>
          </button>
          <button
            type="button"
            onClick={handleExportar}
            disabled={loadingExport || !hasAppliedSearch || totalItems === 0 || isFetching}
            className={`inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
              totalItems > 0
                ? "bg-(--color-success) text-white hover:opacity-90"
                : "border border-gray-300 text-gray-700 bg-white"
            }`}
          >
            {loadingExport && <Loader2 size={16} className="animate-spin" />}
            <FileSpreadsheet size={16} />
            <span>Exportar a Excel</span>
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
            <ShoppingCart size={20} className="text-(--color-primary)" />
            <h2 className="text-base font-semibold text-gray-900">
              Detalle de la orden
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {hasAppliedSearch && totalItems > 0 && (
              <span className="text-xs text-gray-500">
                {totalItems} referencia{totalItems === 1 ? "" : "s"}
              </span>
            )}
            {showUpdating && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 className="animate-spin" size={14} />
                Actualizando...
              </div>
            )}
          </div>
        </div>

        <div className="app-table-scroll">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="brand-bg border-b border-(--color-primary-dark) text-sm">
              <tr>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">
                  CÓDIGO
                </th>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">
                  DESCRIPCIÓN
                </th>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">
                  CANTIDAD
                </th>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">
                  VALOR UNITARIO
                </th>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">
                  VALOR TOTAL
                </th>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">
                  CALIFICACIÓN
                </th>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">
                  ÚLTIMA COMPRA
                </th>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">
                  ÚLTIMA VENTA
                </th>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">
                  GIRÓN
                </th>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">
                  CHEVROPARTES
                </th>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">
                  BARRANCA
                </th>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">
                  ROSITA
                </th>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">
                  VILLA DEL ROSARIO
                </th>
                <th className="text-center py-3 px-4 font-semibold text-white whitespace-nowrap">
                  SOLOCHEVROLET
                </th>
              </tr>
            </thead>
            <tbody>
              {showInitialLoader ? (
                <tr>
                  <td colSpan={14} className="text-center py-10">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Cargando información...</span>
                    </div>
                  </td>
                </tr>
              ) : !hasAppliedSearch ? (
                <tr>
                  <td colSpan={14} className="text-center py-10 text-gray-500">
                    Ingrese un número de orden y genere el informe para ver resultados.
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={14} className="text-center py-10 text-gray-500">
                    No se ha encontrado información para la orden indicada.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={`${row.numero}-${row.codigo}`} className="border-b border-gray-100 hover:bg-gray-50/60">
                    <td className="px-4 py-2 text-center whitespace-nowrap">{row.codigo}</td>
                    <td className="px-4 py-2 text-center whitespace-nowrap">{row.descripcion}</td>
                    <td className="px-4 py-2 text-center whitespace-nowrap">
                      {formatNumber(row.cantidad)}
                    </td>
                    <td className="px-4 py-2 text-center whitespace-nowrap">
                      {formatNumber(row.valorUnitario)}
                    </td>
                    <td className="px-4 py-2 text-center whitespace-nowrap">
                      {formatNumber(row.valorTotal)}
                    </td>
                    <td className="px-4 py-2 text-center whitespace-nowrap">
                      {row.calificacionAbc ?? "-"}
                    </td>
                    <td className="px-4 py-2 text-center whitespace-nowrap">
                      {row.ultimaCompra ?? "-"}
                    </td>
                    <td className="px-4 py-2 text-center whitespace-nowrap">
                      {row.ultimaVenta ?? "-"}
                    </td>
                    <td className="px-4 py-2 text-center whitespace-nowrap">
                      {formatNumber(row.giron)}
                    </td>
                    <td className="px-4 py-2 text-center whitespace-nowrap">
                      {formatNumber(row.chevropartes)}
                    </td>
                    <td className="px-4 py-2 text-center whitespace-nowrap">
                      {formatNumber(row.barranca)}
                    </td>
                    <td className="px-4 py-2 text-center whitespace-nowrap">
                      {formatNumber(row.rosita)}
                    </td>
                    <td className="px-4 py-2 text-center whitespace-nowrap">
                      {formatNumber(row.villa)}
                    </td>
                    <td className="px-4 py-2 text-center whitespace-nowrap">
                      {formatNumber(row.solochevrolet)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {hasAppliedSearch && totalItems > 0 && (
          <div className="p-4 border-t border-gray-200 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </motion.div>
    </InformesPageFrame>
  );
}

