"use client";

import React, { useEffect, useMemo } from "react";
import { Pagination } from "@/components/shared/ui/Pagination";
import { usePagination } from "@/components/shared/ui/hooks/usePagination";
import type { OrdenTallerAbierta } from "../types/estado-taller.types";
import { ET_COL_ESTADO, ET_COL_FACTURA } from "../utils/estado-taller.styles";
import { EstadoTallerTableRow } from "./EstadoTallerTableRow";

const PAGE_SIZE = 4;

interface EstadoTallerTableProps {
  ordenes: OrdenTallerAbierta[];
  busqueda: string;
  onAgregarEvento: (numero: number) => void;
  onVerHistorial: (numero: number) => void;
  onValoresEstimados: (numero: number) => void;
  onFacturaMes: (numero: number) => void;
  onSacyr: (numero: number, ids: number[]) => void;
}

function EstadoTallerTableComponent({
  ordenes,
  busqueda,
  onAgregarEvento,
  onVerHistorial,
  onValoresEstimados,
  onFacturaMes,
  onSacyr,
}: EstadoTallerTableProps) {
  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return ordenes;
    return ordenes.filter((o) =>
      [
        o.bodega,
        String(o.numero),
        o.estado,
        o.razon2Label,
        o.cliente,
        o.placa,
        o.asesor,
        o.descripcionVehiculo,
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
      <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
        <table className="w-full text-xs sm:text-sm min-w-[1600px]">
          <thead className="sticky top-0 z-[1] bg-white shadow-sm">
            <tr className="text-center text-gray-600 border-b border-gray-200">
              <th className="px-2 py-2">Acciones</th>
              <th className="px-2 py-2">Bodega</th>
              <th className="px-2 py-2">Orden N</th>
              <th className={`px-2 py-2 ${ET_COL_ESTADO}`}>Estado</th>
              <th className={`px-2 py-2 ${ET_COL_ESTADO}`}>Razón 2</th>
              <th className={`px-2 py-2 ${ET_COL_ESTADO}`}>Fecha entrega real</th>
              <th className={`px-2 py-2 ${ET_COL_ESTADO}`}>Notas</th>
              <th className={`px-2 py-2 ${ET_COL_ESTADO}`}>Fecha promesa</th>
              <th className={`px-2 py-2 ${ET_COL_FACTURA}`}>¿Factura mes?</th>
              <th className="px-2 py-2">Valor MO</th>
              <th className="px-2 py-2">Valor RPTO</th>
              <th className="px-2 py-2">Valor TOT</th>
              <th className="px-2 py-2">Valor MO (Cliente)</th>
              <th className="px-2 py-2">Valor RPTO (Cliente)</th>
              <th className="px-2 py-2">Valor TOT (Cliente)</th>
              <th className="px-2 py-2">Fecha ingreso</th>
              <th className="px-2 py-2">Cliente</th>
              <th className="px-2 py-2">Placa VH</th>
              <th className="px-2 py-2">Aseguradora</th>
              <th className="px-2 py-2">Asesor</th>
              <th className="px-2 py-2">Kilometraje</th>
              <th className="px-2 py-2">Vehículo</th>
              <th className="px-2 py-2">Días</th>
            </tr>
          </thead>
          <tbody>
            {paginadas.length === 0 ? (
              <tr>
                <td colSpan={24} className="py-8 text-center text-gray-500">
                  No hay órdenes para mostrar
                </td>
              </tr>
            ) : (
              paginadas.map((orden) => (
                <EstadoTallerTableRow
                  key={orden.numero}
                  orden={orden}
                  onAgregarEvento={onAgregarEvento}
                  onVerHistorial={onVerHistorial}
                  onValoresEstimados={onValoresEstimados}
                  onFacturaMes={onFacturaMes}
                  onSacyr={onSacyr}
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

export const EstadoTallerTable = React.memo(EstadoTallerTableComponent);
