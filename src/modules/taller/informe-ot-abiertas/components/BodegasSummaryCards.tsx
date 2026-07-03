"use client";

import Link from "next/link";
import { ArrowRight, Car } from "lucide-react";
import type { TotalBodega } from "../types/informe-ot-abiertas.types";
import { IOA_CARD } from "../utils/informe-ot-abiertas.styles";

interface BodegasSummaryCardsProps {
  totales: TotalBodega[];
}

export function BodegasSummaryCards({ totales }: BodegasSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {totales.map((item) => (
        <div
          key={item.bodegaId}
          className={`${IOA_CARD} overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/60 flex flex-col h-full`}
        >
          <div className="p-4 flex flex-1 items-start justify-between gap-3">
            <div>
              <p className="text-3xl font-bold text-gray-900">{item.total}</p>
              <p className="text-sm text-gray-700 mt-1 leading-snug">
                Cantidad de Órdenes Abiertas {item.descripcion}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <Link
            href={`/dashboard/taller/informe-ordenes-abiertas/taller/${item.bodegaId}`}
            className="mt-auto flex items-center justify-between px-4 py-2.5 text-sm font-medium text-emerald-900 bg-emerald-200/50 hover:bg-emerald-200 transition-colors border-t border-emerald-200/80"
          >
            Más información
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ))}
    </div>
  );
}
