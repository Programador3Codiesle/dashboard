"use client";

import Link from "next/link";
import { ArrowRight, Car } from "lucide-react";
import type { TotalSede } from "../types/informe-ot-abiertas.types";
import { IOA_CARD } from "../utils/informe-ot-abiertas.styles";

interface SedesSummaryCardsProps {
  totales: TotalSede[];
}

export function SedesSummaryCards({ totales }: SedesSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {totales.map((item) => (
        <div
          key={item.sede}
          className={`${IOA_CARD} overflow-hidden border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/60 flex flex-col h-full`}
        >
          <div className="p-4 flex flex-1 items-start justify-between gap-3">
            <div>
              <p className="text-3xl font-bold text-gray-900">{item.total}</p>
              <p className="text-sm text-gray-700 mt-1 leading-snug">
                Cantidad de Órdenes Abiertas {item.label}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <Link
            href={`/dashboard/taller/informe-ordenes-abiertas/sede/${item.sede}`}
            className="mt-auto flex items-center justify-between px-4 py-2.5 text-sm font-medium text-amber-900 bg-amber-200/50 hover:bg-amber-200 transition-colors border-t border-amber-200/80"
          >
            Más información
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ))}
    </div>
  );
}
