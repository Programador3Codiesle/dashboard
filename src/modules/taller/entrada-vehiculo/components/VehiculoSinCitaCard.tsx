"use client";

import type { VhSinCita } from "../types/entrada-vehiculo.types";
import { parseBodegaId } from "../utils/bodega-visual.config";
import { VehiculoCardLayout } from "./VehiculoCardLayout";
import { VehiculoDetailField } from "./VehiculoDetailField";

interface VehiculoSinCitaCardProps {
  item: VhSinCita;
}

export function VehiculoSinCitaCard({ item }: VehiculoSinCitaCardProps) {
  const bodega = parseBodegaId(item.bodegas);

  return (
    <VehiculoCardLayout placa={item.placa} bodega={bodega}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <VehiculoDetailField label="Fecha" value={item.fecha} />
        <VehiculoDetailField label="Cliente" value={item.nombreCliente} />
        <VehiculoDetailField
          className="sm:col-span-2"
          label="Motivo"
          value={item.motivoVisita}
        />
      </div>
    </VehiculoCardLayout>
  );
}
