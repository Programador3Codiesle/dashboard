"use client";

import { Car, CarFront, Truck } from "lucide-react";
import type { BodegaVisualConfig } from "../types/entrada-vehiculo.types";

interface BodegaIconProps {
  config: BodegaVisualConfig;
  placa: string;
}

export function BodegaIconPanel({ config, placa }: BodegaIconProps) {
  const Icon =
    config.iconKey === "truck"
      ? Truck
      : config.iconKey === "carFront"
        ? CarFront
        : Car;

  return (
    <div
      className={`flex flex-col items-center justify-center w-full h-[200px] rounded-lg border-2 bg-white shadow-sm ${config.borderClass}`}
    >
      <Icon className="w-16 h-16 shrink-0 brand-text opacity-80" strokeWidth={1.25} />
      <span className="mt-2 text-sm font-bold tracking-wide text-gray-900 text-center leading-tight">
        {placa}
      </span>
    </div>
  );
}
