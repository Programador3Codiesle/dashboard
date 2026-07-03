"use client";

import { useCallback, useMemo, useState } from "react";
import { useToast } from "@/components/shared/ui/ToastContext";
import {
  useCitasProgramadasPorFecha,
  useEntradaVehiculoPanel,
  useMarcarEntrada,
  useRegistrarVehiculoSinCita,
} from "../hooks/useEntradaVehiculo";
import {
  EntradaVehiculoAccordion,
  PanelBusqueda,
} from "./EntradaVehiculoAccordion";
import { ModalVehiculoSinCita } from "./ModalVehiculoSinCita";
import {
  EntradaVehiculoLoading,
  EntradaVehiculoLoadingOverlay,
} from "./EntradaVehiculoLoading";
import { EV_CARD } from "../utils/entrada-vehiculo.styles";

function sameCalendarDay(isoOrDate: string, today: Date): boolean {
  const d = new Date(isoOrDate);
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export function EntradaVehiculoGestion() {
  const { showError } = useToast();
  const [placaBusqueda, setPlacaBusqueda] = useState<string | null>(null);
  const [fechaBusqueda, setFechaBusqueda] = useState<string | null>(null);
  const [modalSinCitaOpen, setModalSinCitaOpen] = useState(false);

  const { panel, loading, error } = useEntradaVehiculoPanel(placaBusqueda);
  const { citas: citasPorFecha, loading: loadingFecha } =
    useCitasProgramadasPorFecha(fechaBusqueda);

  const marcarEntrada = useMarcarEntrada();
  const registrarSinCita = useRegistrarVehiculoSinCita();

  const citasProgramadas = useMemo(() => {
    if (fechaBusqueda) return citasPorFecha;
    return panel?.citasProgramadas ?? [];
  }, [fechaBusqueda, citasPorFecha, panel?.citasProgramadas]);

  const visualContext = fechaBusqueda ? "fecha" : "full";

  const handleMarcarEntrada = useCallback(
    (idCita: number, fechaHoraIni: string) => {
      if (!sameCalendarDay(fechaHoraIni, new Date())) {
        showError(
          "No puede marcar la entrada si la fecha no corresponde a la fecha programada",
        );
        return;
      }
      marcarEntrada.mutate({ idCita });
    },
    [marcarEntrada, showError],
  );

  const handleBuscarPlaca = useCallback(
    (placa: string) => {
      setFechaBusqueda(null);
      setPlacaBusqueda(placa);
    },
    [],
  );

  const handleBuscarFecha = useCallback((fecha: string) => {
    setFechaBusqueda(fecha);
  }, []);

  const handleAbrirModalSinCita = useCallback(() => {
    setModalSinCitaOpen(true);
  }, []);

  const handleCerrarModalSinCita = useCallback(() => {
    setModalSinCitaOpen(false);
  }, []);

  const handleGuardarSinCita = useCallback(
    async (payload: {
      placa: string;
      cliente: string;
      motivo: string;
      bodega: number;
    }) => {
      await registrarSinCita.mutateAsync(payload);
    },
    [registrarSinCita],
  );

  const buscandoPlaca = placaBusqueda != null && loading;
  const buscandoFecha = fechaBusqueda != null && loadingFecha;
  const buscandoResultados = buscandoPlaca || buscandoFecha;
  const cargandoInicial = loading && !panel && !placaBusqueda && !fechaBusqueda;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 lg:gap-6">
        <div>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {cargandoInicial ? (
            <div className={`${EV_CARD} border brand-border-active`}>
              <EntradaVehiculoLoading message="Cargando panel de entrada..." />
            </div>
          ) : (
            <div className="relative">
              {buscandoResultados && (
                <EntradaVehiculoLoadingOverlay
                  message={
                    buscandoFecha
                      ? "Buscando citas por fecha..."
                      : "Buscando vehículo por placa..."
                  }
                />
              )}
              <EntradaVehiculoAccordion
                citasProgramadas={citasProgramadas}
                citasAtendidas={panel?.citasAtendidas ?? []}
                citasSinOt={panel?.citasSinOt ?? []}
                vehiculosSinCita={panel?.vehiculosSinCita ?? []}
                citasProgramadasVisualContext={visualContext}
                onMarcarEntrada={handleMarcarEntrada}
                marcandoEntrada={marcarEntrada.isPending}
              />
            </div>
          )}
        </div>

        <PanelBusqueda
          onBuscarFecha={handleBuscarFecha}
          onBuscarPlaca={handleBuscarPlaca}
          onAbrirModalSinCita={handleAbrirModalSinCita}
          buscandoFecha={buscandoFecha}
          buscandoPlaca={buscandoPlaca}
        />
      </div>

      <ModalVehiculoSinCita
        open={modalSinCitaOpen}
        onClose={handleCerrarModalSinCita}
        sedes={panel?.sedes ?? []}
        guardando={registrarSinCita.isPending}
        onGuardar={handleGuardarSinCita}
      />
    </>
  );
}
