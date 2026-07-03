"use client";

import React, { useEffect, useMemo } from "react";
import { Pagination } from "@/components/shared/ui/Pagination";
import { usePagination } from "@/components/shared/ui/hooks/usePagination";
import type { OrdenAbiertaInforme } from "../types/informe-ot-abiertas.types";

const PAGE_SIZE = 10;

interface InformeOtAbiertasTableProps {
  ordenes: OrdenAbiertaInforme[];
  busqueda: string;
}

function InformeOtAbiertasTableRow({
  orden,
}: {
  orden: OrdenAbiertaInforme;
}) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/80">
      <td className="px-3 py-2 font-semibold text-center">{orden.numero}</td>
      <td className="px-3 py-2 text-center">{orden.bodega}</td>
      <td className="px-3 py-2 text-center">{orden.cliente}</td>
      <td className="px-3 py-2 text-center">{orden.asesor}</td>
      <td className="px-3 py-2 text-center">{orden.fecha ?? "—"}</td>
      <td className="px-3 py-2 text-center">{orden.vehiculo}</td>
    </tr>
  );
}

const InformeOtAbiertasTableRowMemo = React.memo(InformeOtAbiertasTableRow);

function InformeOtAbiertasTableComponent({
  ordenes,
  busqueda,
}: InformeOtAbiertasTableProps) {
  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return ordenes;
    return ordenes.filter((o) =>
      [
        String(o.numero),
        o.bodega,
        o.cliente,
        o.asesor,
        o.fecha ?? "",
        o.vehiculo,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [ordenes, busqueda]);

  const { currentPage, totalPages, startIndex, endIndex, changePage } =
    usePagination(filtradas.length, PAGE_SIZE);

  useEffect(() => {
    changePage(1);
  }, [busqueda, changePage]);

  useEffect(() => {
    if (filtradas.length > 0 && startIndex >= filtradas.length) {
      changePage(1);
    }
  }, [filtradas.length, startIndex, changePage]);

  const paginadas = useMemo(
    () => filtradas.slice(startIndex, endIndex),
    [filtradas, startIndex, endIndex],
  );

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="text-center text-gray-600 border-b border-gray-200 bg-gray-50">
              <th className="px-3 py-2">Número Orden</th>
              <th className="px-3 py-2">Bodega</th>
              <th className="px-3 py-2">Cliente</th>
              <th className="px-3 py-2">Asesor</th>
              <th className="px-3 py-2">Fecha Entrada</th>
              <th className="px-3 py-2">Vehículo</th>
            </tr>
          </thead>
          <tbody>
            {paginadas.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No hay órdenes para mostrar
                </td>
              </tr>
            ) : (
              paginadas.map((orden) => (
                <InformeOtAbiertasTableRowMemo
                  key={orden.numero}
                  orden={orden}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtradas.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50/80">
          <p className="text-xs text-gray-500">
            Mostrando {startIndex + 1}–{Math.min(endIndex, filtradas.length)} de{" "}
            {filtradas.length} órdenes
          </p>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onChange={changePage}
            />
          )}
        </div>
      )}
    </div>
  );
}

export const InformeOtAbiertasTable = React.memo(
  InformeOtAbiertasTableComponent,
);
