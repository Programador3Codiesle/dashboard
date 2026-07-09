"use client";

import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/shared/ui/ToastContext";
import {
  useActualizarPresupuesto,
  useCatalogosPresupuesto,
  useConsultarPresupuesto,
} from "../hooks/usePresupuesto";
import type {
  CeldaEditable,
  ConsultarPresupuestoResponse,
  FiltrosPresupuestoState,
  ModalActualizarState,
  ModalActualizarTipo,
} from "../types";
import { FiltrosPresupuesto } from "./FiltrosPresupuesto";
import { TablaPresupuesto } from "./TablaPresupuesto";
import { ModalActualizarPresupuesto } from "./modals/ModalActualizarPresupuesto";

const EMPTY_FILTROS: FiltrosPresupuestoState = {
  idCategoria: "",
  idSede: "",
  idTipo: "",
};

export function PresupuestoGestion() {
  const { showError, showSuccess } = useToast();
  const [filtros, setFiltros] = useState<FiltrosPresupuestoState>(EMPTY_FILTROS);
  const [resultado, setResultado] = useState<ConsultarPresupuestoResponse | null>(
    null,
  );
  const [modal, setModal] = useState<ModalActualizarState | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: catalogos, isLoading: loadingCatalogos } =
    useCatalogosPresupuesto();
  const consultarMutation = useConsultarPresupuesto();
  const actualizarMutation = useActualizarPresupuesto();

  const ejecutarConsulta = useCallback(async () => {
    const params = {
      idCategoria: Number(filtros.idCategoria),
      idSede: Number(filtros.idSede),
      ...(filtros.idTipo ? { idTipo: Number(filtros.idTipo) } : {}),
    };

    try {
      const data = await consultarMutation.mutateAsync(params);
      setResultado(data);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo consultar el presupuesto";
      showError(msg);
      setResultado(null);
    }
  }, [consultarMutation, filtros, showError]);

  const handleConsultar = () => {
    if (!filtros.idCategoria || !filtros.idSede) {
      showError("Categoría y sede son obligatorios");
      return;
    }
    void ejecutarConsulta();
  };

  const handleEditar = (
    tipo: ModalActualizarTipo,
    celda: CeldaEditable,
    valorActual: number | string | null,
  ) => {
    setModal({ tipo, celda, valorActual });
    setModalOpen(true);
  };

  const handleGuardar = async (nuevoValor: number) => {
    if (!modal) return;

    try {
      await actualizarMutation.mutateAsync({
        anio: modal.celda.anio,
        mes: modal.celda.mes,
        sedeId: modal.celda.sedeId,
        tipoId: modal.celda.tipoId,
        tipoVh: modal.celda.tipoVh,
        campo: modal.tipo,
        valor: nuevoValor,
      });
      showSuccess("Presupuesto actualizado correctamente.");
      setModalOpen(false);
      setModal(null);
      await ejecutarConsulta();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Hubo un problema al procesar la solicitud.";
      showError(msg);
    }
  };

  const loading = consultarMutation.isPending || loadingCatalogos;

  return (
    <div className="space-y-4">
      <FiltrosPresupuesto
        filtros={filtros}
        catalogos={catalogos}
        loading={loading}
        onChange={setFiltros}
        onConsultar={handleConsultar}
      />

      <div className="relative bg-white brand-card-elevated rounded-2xl border brand-border-active p-4 sm:p-6">
        {consultarMutation.isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-2xl">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              Cargando presupuesto...
            </div>
          </div>
        )}

        {resultado?.tablas?.length ? (
          resultado.tablas.map((tabla) => (
            <TablaPresupuesto
              key={tabla.titulo}
              tabla={tabla}
              mesActualIndex={resultado.mesActualIndex}
              puedeEditar={resultado.puedeEditar}
              onEditar={handleEditar}
            />
          ))
        ) : (
          !consultarMutation.isPending && (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              Seleccione categoría y sede, luego presione Consultar
            </div>
          )
        )}
      </div>

      <ModalActualizarPresupuesto
        open={modalOpen}
        state={modal}
        guardando={actualizarMutation.isPending}
        onClose={() => {
          setModalOpen(false);
          setModal(null);
        }}
        onGuardar={handleGuardar}
      />
    </div>
  );
}
