"use client";

import React, { useEffect, useMemo } from "react";
import { Pagination } from "@/components/shared/ui/Pagination";
import { usePagination } from "@/components/shared/ui/hooks/usePagination";
import type { AsesorOtCount } from "../types/informe-ot-abiertas.types";

const PAGE_SIZE = 10;

interface AsesoresOtTableProps {
  asesores: AsesorOtCount[];
  busqueda: string;
}

function AsesoresOtTableComponent({ asesores, busqueda }: AsesoresOtTableProps) {
  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return asesores;
    return asesores.filter((a) =>
      [a.nombres, String(a.total)].join(" ").toLowerCase().includes(q),
    );
  }, [asesores, busqueda]);

  const { currentPage, totalPages, startIndex, endIndex, changePage } =
    usePagination(filtradas.length, PAGE_SIZE);

  useEffect(() => {
    changePage(1);
  }, [busqueda, changePage]);

  const paginadas = useMemo(
    () => filtradas.slice(startIndex, endIndex),
    [filtradas, startIndex, endIndex],
  );

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-center text-gray-600 border-b border-gray-200 bg-gray-50">
              <th className="px-3 py-2">Asesor</th>
              <th className="px-3 py-2">Órdenes abiertas</th>
            </tr>
          </thead>
          <tbody>
            {paginadas.length === 0 ? (
              <tr>
                <td colSpan={2} className="py-8 text-center text-gray-500">
                  No hay datos para mostrar
                </td>
              </tr>
            ) : (
              paginadas.map((row, idx) => (
                <tr
                  key={`${row.nombres}-${idx}`}
                  className="border-b border-gray-100 hover:bg-gray-50/80"
                >
                  <td className="px-3 py-2 font-semibold text-center">
                    {row.nombres}
                  </td>
                  <td className="px-3 py-2 text-center">{row.total}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtradas.length > 0 && totalPages > 1 && (
        <div className="p-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onChange={changePage}
          />
        </div>
      )}
    </div>
  );
}

export const AsesoresOtTable = React.memo(AsesoresOtTableComponent);
