'use client';

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, ShoppingCart } from "lucide-react";
import { useToast } from "@/components/shared/ui/ToastContext";
import {
  controlComprasService,
} from "@/modules/informes/gestion-humana/services/control-compras.service";
import { Pagination } from "@/components/shared/ui/Pagination";

function formatNumber(value: number | null | undefined): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ControlComprasPage() {
  const PAGE_SIZE = 10;
  const { showError } = useToast();

  const [orden, setOrden] = useState<string>("");
  const [appliedOrden, setAppliedOrden] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["informes", "control-compras", appliedOrden, currentPage],
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">
            Control Compras
          </h1>
          <p className="text-gray-500 mt-1">
            Detalle de referencias, valores y existencias por bodega para una orden de compra.
          </p>
        </div>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col w-full sm:w-auto sm:min-w-[200px] sm:max-w-xs">
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isFetching && <Loader2 size={16} className="animate-spin" />}
            <span>Generar</span>
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
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
    </div>
  );
}

