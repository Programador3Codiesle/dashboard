"use client";

import type { CitaEntrada, BodegaVisualContext } from "../types/entrada-vehiculo.types";
import { EV_DETAIL_TABLE } from "../utils/entrada-vehiculo.styles";
import { VehiculoCardLayout } from "./VehiculoCardLayout";
import { VehiculoDetailField } from "./VehiculoDetailField";

interface CitaVehiculoCardProps {
  cita: CitaEntrada;
  showMarcarEntrada?: boolean;
  visualContext?: BodegaVisualContext;
  onMarcarEntrada?: (idCita: number, fechaHoraIni: string) => void;
  marcando?: boolean;
}

function sameCalendarDay(isoOrDate: string, today: Date): boolean {
  const d = new Date(isoOrDate);
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export function CitaVehiculoCard({
  cita,
  showMarcarEntrada = false,
  visualContext = "full",
  onMarcarEntrada,
  marcando = false,
}: CitaVehiculoCardProps) {
  const puedeMarcar =
    showMarcarEntrada && sameCalendarDay(cita.fechaHoraIni, new Date());

  return (
    <VehiculoCardLayout
      placa={cita.placa}
      bodega={cita.bodega}
      visualContext={visualContext}
      footer={
        showMarcarEntrada ? (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              disabled={marcando}
              onClick={() => onMarcarEntrada?.(cita.idCita, cita.fechaHoraIni)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all shadow-sm ${
                puedeMarcar
                  ? "text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border border-[var(--color-primary)]"
                  : "bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed"
              }`}
              title={
                puedeMarcar
                  ? "Marcar entrada del vehículo"
                  : "Solo puede marcar entrada si la fecha de la cita es hoy"
              }
            >
              {marcando ? "Procesando..." : "Marcar entrada"}
            </button>
          </div>
        ) : undefined
      }
    >
      <div className="overflow-x-auto">
        <table className={EV_DETAIL_TABLE}>
          <tbody>
            <tr>
              <VehiculoDetailField label="Cliente" value={cita.nombreCliente ?? "—"} />
              <VehiculoDetailField label="Encargado" value={cita.nombreEncargado ?? "—"} />
            </tr>
            <tr>
              <VehiculoDetailField label="Vehículo" value={cita.vehiculo ?? "—"} />
              <VehiculoDetailField label="Fecha/Hora cita" value={cita.fechaCita} />
            </tr>
            <tr>
              <VehiculoDetailField label="Bahía/Técnico" value={cita.descripcionBahia ?? "—"} />
              <VehiculoDetailField label="Notas" value={cita.notas ?? "—"} />
            </tr>
          </tbody>
        </table>
      </div>
    </VehiculoCardLayout>
  );
}
