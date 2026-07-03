"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import ConfirmModal from "@/components/shared/ui/ConfirmModal";
import { useToast } from "@/components/shared/ui/ToastContext";
import { useAuth } from "@/core/auth/hooks/useAuth";
import {
  useAgregarEventoOt,
  useEstadoTallerPanel,
  useEstadosOtCatalogo,
  useGuardarFacturaMesActual,
  useGuardarValoresEstimados,
  useHistorialOt,
} from "../hooks/useEstadoTaller";
import { EstadoTallerTable } from "./EstadoTallerTable";
import {
  EstadoTallerToolbar,
  exportEstadoTallerExcel,
} from "./EstadoTallerToolbar";
import {
  EstadoTallerLoading,
  EstadoTallerLoadingOverlay,
} from "./EstadoTallerLoading";
import { ET_CARD } from "../utils/estado-taller.styles";

const ModalAgregarEvento = dynamic(
  () =>
    import("./modals/ModalAgregarEvento").then((m) => ({
      default: m.ModalAgregarEvento,
    })),
  { ssr: false },
);

const ModalHistorialOt = dynamic(
  () =>
    import("./modals/ModalHistorialOt").then((m) => ({
      default: m.ModalHistorialOt,
    })),
  { ssr: false },
);

const ModalValoresEstimados = dynamic(
  () =>
    import("./modals/ModalValoresEstimados").then((m) => ({
      default: m.ModalValoresEstimados,
    })),
  { ssr: false },
);

const ModalCotizacionesSacyr = dynamic(
  () =>
    import("./modals/ModalCotizacionesSacyr").then((m) => ({
      default: m.ModalCotizacionesSacyr,
    })),
  { ssr: false },
);


export function EstadoTallerGestion() {
  const { showError } = useToast();
  const { user } = useAuth();
  const empresa = user?.empresa;

  const [bodega, setBodega] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [modalEvento, setModalEvento] = useState<number | null>(null);
  const [modalHistorial, setModalHistorial] = useState<number | null>(null);
  const [modalEstimados, setModalEstimados] = useState<number | null>(null);
  const [modalSacyr, setModalSacyr] = useState<{
    numero: number;
    ids: number[];
  } | null>(null);
  const [facturaConfirmNumero, setFacturaConfirmNumero] = useState<number | null>(
    null,
  );

  useEffect(() => {
    setBodega("todas");
  }, [empresa]);

  const { panel, loading, error } = useEstadoTallerPanel(bodega, empresa);
  const { data: estados = [] } = useEstadosOtCatalogo(modalEvento != null);
  const { data: historial = [], isLoading: loadingHistorial } =
    useHistorialOt(modalHistorial);

  const agregarEvento = useAgregarEventoOt();
  const guardarFactura = useGuardarFacturaMesActual();
  const guardarEstimados = useGuardarValoresEstimados();

  const handleFacturaMes = useCallback((numeroOrden: number) => {
    setFacturaConfirmNumero(numeroOrden);
  }, []);

  const handleConfirmFacturaSi = useCallback(async () => {
    if (facturaConfirmNumero == null) return;
    await guardarFactura.mutateAsync({
      numeroOrden: facturaConfirmNumero,
      estado: 1,
    });
    setFacturaConfirmNumero(null);
  }, [facturaConfirmNumero, guardarFactura]);

  const handleFacturaNo = useCallback(async () => {
    if (facturaConfirmNumero == null) return;
    await guardarFactura.mutateAsync({
      numeroOrden: facturaConfirmNumero,
      estado: 0,
    });
    setFacturaConfirmNumero(null);
  }, [facturaConfirmNumero, guardarFactura]);

  const handleDismissFactura = useCallback(() => {
    setFacturaConfirmNumero(null);
  }, []);

  const handleExportarExcel = useCallback(() => {
    if (!panel?.ordenes.length) {
      showError("No hay datos para exportar");
      return;
    }
    const { headers, data } = exportEstadoTallerExcel(panel.ordenes, busqueda);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estado Taller");
    const f = new Date();
    const fecha = `${f.getDate()}-${f.getMonth() + 1}-${f.getFullYear()}`;
    XLSX.writeFile(wb, `Informe-${fecha}.xlsx`);
  }, [panel?.ordenes, busqueda, showError]);

  const cargandoInicial = loading && !panel;

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {cargandoInicial ? (
        <div className={ET_CARD}>
          <EstadoTallerLoading message="Cargando estado del taller..." />
        </div>
      ) : (
        <>
          <EstadoTallerToolbar
            sedes={panel?.sedes ?? []}
            bodega={bodega}
            totalAbiertas={panel?.totalAbiertas ?? 0}
            cargando={loading}
            onBodegaChange={setBodega}
            onBusquedaChange={setBusqueda}
            onExportarExcel={handleExportarExcel}
          />

          <div className={`${ET_CARD} p-0 overflow-hidden relative`}>
            {loading && panel && (
              <EstadoTallerLoadingOverlay message="Actualizando órdenes..." />
            )}
            <EstadoTallerTable
              ordenes={panel?.ordenes ?? []}
              busqueda={busqueda}
              onAgregarEvento={setModalEvento}
              onVerHistorial={setModalHistorial}
              onValoresEstimados={setModalEstimados}
              onFacturaMes={handleFacturaMes}
              onSacyr={(numero, ids) => setModalSacyr({ numero, ids })}
            />
          </div>
        </>
      )}

      {modalEvento != null && (
        <ModalAgregarEvento
          open
          numeroOrden={modalEvento}
          estados={estados}
          guardando={agregarEvento.isPending}
          onClose={() => setModalEvento(null)}
          onGuardar={async (payload) => {
            await agregarEvento.mutateAsync(payload);
          }}
        />
      )}

      {modalHistorial != null && (
        <ModalHistorialOt
          open
          numeroOrden={modalHistorial}
          historial={historial}
          loading={loadingHistorial}
          onClose={() => setModalHistorial(null)}
        />
      )}

      {modalEstimados != null && (
        <ModalValoresEstimados
          open
          numeroOrden={modalEstimados}
          guardando={guardarEstimados.isPending}
          onClose={() => setModalEstimados(null)}
          onGuardar={async (payload) => {
            await guardarEstimados.mutateAsync(payload);
          }}
        />
      )}

      {modalSacyr != null && (
        <ModalCotizacionesSacyr
          open
          numeroOrden={modalSacyr.numero}
          cotizacionIds={modalSacyr.ids}
          onClose={() => setModalSacyr(null)}
        />
      )}

      <ConfirmModal
        open={facturaConfirmNumero != null}
        title="¿Factura mes actual?"
        message="¿Se factura en el mes actual?"
        variant="success"
        confirmLabel="Sí"
        cancelLabel="No"
        onConfirm={handleConfirmFacturaSi}
        onCancel={handleFacturaNo}
        onDismiss={handleDismissFactura}
      />
    </div>
  );
}
