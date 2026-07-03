"use client";

import type { VhSinCita } from "../types/entrada-vehiculo.types";
import { parseBodegaId } from "../utils/bodega-visual.config";
import { EV_DETAIL_TABLE } from "../utils/entrada-vehiculo.styles";
import { VehiculoCardLayout } from "./VehiculoCardLayout";
import { VehiculoDetailField } from "./VehiculoDetailField";

interface VehiculoSinCitaCardProps {
  item: VhSinCita;
}

export function VehiculoSinCitaCard({ item }: VehiculoSinCitaCardProps) {
  const bodega = parseBodegaId(item.bodegas);

  return (
    <VehiculoCardLayout placa={item.placa} bodega={bodega}>
      <div className="overflow-x-auto">
        <table className={EV_DETAIL_TABLE}>
          <tbody>
            <tr>
              <VehiculoDetailField label="Fecha" value={item.fecha} />
              <VehiculoDetailField label="Cliente" value={item.nombreCliente} />
            </tr>
            <tr>
              <VehiculoDetailField label="Motivo" value={item.motivoVisita} colSpan={2} />
            </tr>
          </tbody>
        </table>
      </div>
    </VehiculoCardLayout>
  );
}
