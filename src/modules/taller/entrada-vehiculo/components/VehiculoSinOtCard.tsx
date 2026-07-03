"use client";

import type { VhSinOt } from "../types/entrada-vehiculo.types";
import { EV_DETAIL_TABLE } from "../utils/entrada-vehiculo.styles";
import { VehiculoCardLayout } from "./VehiculoCardLayout";
import { VehiculoDetailField } from "./VehiculoDetailField";

interface VehiculoSinOtCardProps {
  item: VhSinOt;
}

export function VehiculoSinOtCard({ item }: VehiculoSinOtCardProps) {
  return (
    <VehiculoCardLayout placa={item.placa} bodega={item.bodega}>
      <div className="overflow-x-auto">
        <table className={EV_DETAIL_TABLE}>
          <tbody>
            <tr>
              <VehiculoDetailField label="Fecha" value={item.fecha} />
              <VehiculoDetailField label="Cliente" value={item.cliente ?? "—"} />
            </tr>
            <tr>
              <VehiculoDetailField label="Encargado" value={item.encargado ?? "—"} />
              <VehiculoDetailField label="Bahía" value={item.bahia ?? "—"} />
            </tr>
            <tr>
              <VehiculoDetailField label="Vehículo" value={item.vh ?? "—"} colSpan={2} />
            </tr>
          </tbody>
        </table>
      </div>
    </VehiculoCardLayout>
  );
}
