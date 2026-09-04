"use client";

import type { VhSinOt } from "../types/entrada-vehiculo.types";
import { VehiculoCardLayout } from "./VehiculoCardLayout";
import { VehiculoDetailField } from "./VehiculoDetailField";

interface VehiculoSinOtCardProps {
  item: VhSinOt;
}

export function VehiculoSinOtCard({ item }: VehiculoSinOtCardProps) {
  return (
    <VehiculoCardLayout placa={item.placa} bodega={item.bodega}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <VehiculoDetailField label="Fecha" value={item.fecha} />
        <VehiculoDetailField label="Cliente" value={item.cliente ?? "—"} />
        <VehiculoDetailField label="Encargado" value={item.encargado ?? "—"} />
        <VehiculoDetailField label="Bahía" value={item.bahia ?? "—"} />
        <VehiculoDetailField
          className="sm:col-span-2"
          label="Vehículo"
          value={item.vh ?? "—"}
        />
      </div>
    </VehiculoCardLayout>
  );
}
