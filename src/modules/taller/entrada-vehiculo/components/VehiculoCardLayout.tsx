"use client";

import type { BodegaVisualContext } from "../types/entrada-vehiculo.types";
import { getBodegaVisual } from "../utils/bodega-visual.config";
import { EV_CARD } from "../utils/entrada-vehiculo.styles";
import { BodegaIconPanel } from "./BodegaIconPanel";

interface VehiculoCardLayoutProps {
  placa: string;
  bodega: number;
  visualContext?: BodegaVisualContext;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function VehiculoCardLayout({
  placa,
  bodega,
  visualContext = "full",
  children,
  footer,
}: VehiculoCardLayoutProps) {
  const visual = getBodegaVisual(bodega, visualContext);

  return (
    <div className={`${EV_CARD} border-2 overflow-hidden shadow-sm ${visual.borderClass}`}>
      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-0 bg-white md:items-stretch">
        <div className="p-3 bg-white flex items-center justify-center">
          <BodegaIconPanel config={visual} placa={placa} />
        </div>
        <div className="p-4 sm:p-5 border-t md:border-t-0 md:border-l brand-border-active bg-white flex flex-col h-full min-h-[200px]">
          <div className="flex flex-1 flex-col justify-center">{children}</div>
          {footer}
        </div>
      </div>
    </div>
  );
}
