"use client";

import { useState } from "react";
import { ChevronDown, Loader2, Search } from "lucide-react";
import { useToast } from "@/components/shared/ui/ToastContext";
import type { CitaEntrada, VhSinCita, VhSinOt } from "../types/entrada-vehiculo.types";
import { CitaVehiculoCard } from "./CitaVehiculoCard";
import { VehiculoSinOtCard } from "./VehiculoSinOtCard";
import { VehiculoSinCitaCard } from "./VehiculoSinCitaCard";
import { EV_CARD, EV_INGRESAR_BTN, EV_INPUT, EV_SEARCH_BTN } from "../utils/entrada-vehiculo.styles";

interface AccordionSectionProps {
  title: string;
  defaultOpen?: boolean;
  count: number;
  children: React.ReactNode;
}

function AccordionSection({ title, defaultOpen = false, count, children }: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`${EV_CARD} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-white brand-text font-semibold hover:bg-gray-50/80 transition-colors"
      >
        <span>
          {title}
          <span className="ml-2 text-sm font-normal text-gray-500">({count})</span>
        </span>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t brand-border-active pt-3 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

interface EntradaVehiculoAccordionProps {
  citasProgramadas: CitaEntrada[];
  citasAtendidas: CitaEntrada[];
  citasSinOt: VhSinOt[];
  vehiculosSinCita: VhSinCita[];
  citasProgramadasVisualContext?: "full" | "fecha";
  onMarcarEntrada?: (idCita: number, fechaHoraIni: string) => void;
  marcandoEntrada?: boolean;
}

export function EntradaVehiculoAccordion({
  citasProgramadas,
  citasAtendidas,
  citasSinOt,
  vehiculosSinCita,
  citasProgramadasVisualContext = "full",
  onMarcarEntrada,
  marcandoEntrada = false,
}: EntradaVehiculoAccordionProps) {
  return (
    <div className="space-y-3">
      <AccordionSection
        title="Vehículos con cita programada"
        defaultOpen
        count={citasProgramadas.length}
      >
        {citasProgramadas.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">No hay citas programadas para mostrar.</p>
        ) : (
          citasProgramadas.map((cita) => (
            <CitaVehiculoCard
              key={`prog-${cita.idCita}`}
              cita={cita}
              showMarcarEntrada
              visualContext={citasProgramadasVisualContext}
              onMarcarEntrada={onMarcarEntrada}
              marcando={marcandoEntrada}
            />
          ))
        )}
      </AccordionSection>

      <AccordionSection title="Vehículos sin orden de trabajo" count={citasSinOt.length}>
        {citasSinOt.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">No hay vehículos sin orden de trabajo.</p>
        ) : (
          citasSinOt.map((item, idx) => (
            <VehiculoSinOtCard key={`sin-ot-${item.placa}-${idx}`} item={item} />
          ))
        )}
      </AccordionSection>

      <AccordionSection title="Vehículos con cita atendida" count={citasAtendidas.length}>
        {citasAtendidas.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">No hay citas atendidas para mostrar.</p>
        ) : (
          citasAtendidas.map((cita) => (
            <CitaVehiculoCard
              key={`atend-${cita.idCita}`}
              cita={cita}
              visualContext="full"
            />
          ))
        )}
      </AccordionSection>

      <AccordionSection title="Vehículos sin cita" count={vehiculosSinCita.length}>
        {vehiculosSinCita.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">No hay vehículos sin cita registrados hoy.</p>
        ) : (
          vehiculosSinCita.map((item, idx) => (
            <VehiculoSinCitaCard key={`sin-cita-${item.placa}-${idx}`} item={item} />
          ))
        )}
      </AccordionSection>
    </div>
  );
}

interface PanelBusquedaProps {
  onBuscarFecha: (fecha: string) => void;
  onBuscarPlaca: (placa: string) => void;
  onAbrirModalSinCita: () => void;
  buscandoFecha?: boolean;
  buscandoPlaca?: boolean;
}

export function PanelBusqueda({
  onBuscarFecha,
  onBuscarPlaca,
  onAbrirModalSinCita,
  buscandoFecha = false,
  buscandoPlaca = false,
}: PanelBusquedaProps) {
  const { showError } = useToast();
  const [fecha, setFecha] = useState("");
  const [placa, setPlaca] = useState("");

  return (
    <div className="space-y-4">
      <div className={`${EV_CARD} p-4 space-y-4`}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ingrese la fecha para buscar
          </label>
          <div className="flex gap-2 min-w-0">
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className={`flex-1 min-w-0 ${EV_INPUT}`}
            />
            <button
              type="button"
              onClick={() => fecha && onBuscarFecha(fecha)}
              disabled={!fecha || buscandoFecha}
              className={EV_SEARCH_BTN}
              aria-label="Buscar por fecha"
              title="Buscar por fecha"
            >
              {buscandoFecha ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ingrese la placa para buscar
          </label>
          <div className="flex gap-2 min-w-0">
            <input
              type="text"
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="ABC123"
              className={`flex-1 min-w-0 ${EV_INPUT} uppercase`}
            />
            <button
              type="button"
              onClick={() => {
                const p = placa.trim().toUpperCase();
                if (p.length >= 6) {
                  onBuscarPlaca(p);
                } else if (p.length > 0) {
                  showError("Verifique que sea una placa válida");
                }
              }}
              disabled={buscandoPlaca}
              className={EV_SEARCH_BTN}
              aria-label="Buscar por placa"
              title="Buscar por placa"
            >
              {buscandoPlaca ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={`${EV_CARD} p-4`}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ingresar vehículo sin cita
        </label>
        <button type="button" onClick={onAbrirModalSinCita} className={EV_INGRESAR_BTN}>
          Ingresar
        </button>
      </div>
    </div>
  );
}
