"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Pagination } from "@/components/shared/ui/Pagination";
import { useToast } from "@/components/shared/ui/ToastContext";
import {
  useCatalogosPosiblesRetornos,
  useCerrarBdcPosibleRetorno,
  useDetallePosibleRetorno,
  useGuardarDefinicionRetorno,
  useListarPosiblesRetornos,
  useSolucionPosibleRetorno,
} from "../hooks/usePosiblesRetornos";
import type {
  DetallePlacaResponse,
  FiltrosPosiblesRetornosState,
  GuardarDefinicionParams,
  SolucionRetorno,
} from "../types";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "../types";
import { FiltrosPosiblesRetornos } from "./FiltrosPosiblesRetornos";
import { TablaPosiblesRetornos } from "./TablaPosiblesRetornos";

const ModalDetalleRetorno = dynamic(
  () =>
    import("./modals/ModalDetalleRetorno").then((m) => m.ModalDetalleRetorno),
  { ssr: false },
);

const ModalGestionRetorno = dynamic(
  () =>
    import("./modals/ModalGestionRetorno").then((m) => m.ModalGestionRetorno),
  { ssr: false },
);

const ModalSolucionRetorno = dynamic(
  () =>
    import("./modals/ModalSolucionRetorno").then((m) => m.ModalSolucionRetorno),
  { ssr: false },
);

const EMPTY_FILTROS: FiltrosPosiblesRetornosState = {
  numero: "",
  bodega: "-1",
  placa: "",
};

export function PosiblesRetornosGestion() {
  const { showError, showSuccess } = useToast();
  const [filtrosUi, setFiltrosUi] = useState<FiltrosPosiblesRetornosState>(EMPTY_FILTROS);
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosPosiblesRetornosState | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [modalGestionOpen, setModalGestionOpen] = useState(false);
  const [modalSolucionOpen, setModalSolucionOpen] = useState(false);
  const [detalle, setDetalle] = useState<DetallePlacaResponse | null>(null);
  const [ordenOrigen, setOrdenOrigen] = useState<number | null>(null);
  const [solucion, setSolucion] = useState<SolucionRetorno | null>(null);

  const { data: catalogos } = useCatalogosPosiblesRetornos();

  const listarParams = useMemo(() => {
    const f = filtrosAplicados ?? EMPTY_FILTROS;
    return {
      numero: f.numero ? Number(f.numero) : undefined,
      placa: f.placa.trim() || undefined,
      bodega: f.bodega ? Number(f.bodega) : undefined,
      page,
      pageSize,
    };
  }, [filtrosAplicados, page, pageSize]);

  const { data: listado, isLoading, isFetching, refetch } = useListarPosiblesRetornos(
    listarParams,
    true,
  );

  const detalleMutation = useDetallePosibleRetorno();
  const guardarMutation = useGuardarDefinicionRetorno();
  const solucionMutation = useSolucionPosibleRetorno();
  const cerrarBdcMutation = useCerrarBdcPosibleRetorno();

  const totalPages = useMemo(() => {
    const total = listado?.total ?? 0;
    if (pageSize === -1) return 1;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [listado?.total, pageSize]);

  const handleBuscar = useCallback(() => {
    const placa = filtrosUi.placa.trim();
    const bodega = filtrosUi.bodega;

    if (!placa && (!bodega || bodega === "")) {
      showError("Seleccione una Bodega o digite una placa.");
      return;
    }

    setFiltrosAplicados({ ...filtrosUi });
    setPage(1);
  }, [filtrosUi, showError]);

  const handleVerDetalle = async (placa: string, numero: number) => {
    if (!placa) {
      showError("Este vehículo no se encuentra registrado con placa.");
      return;
    }
    try {
      const data = await detalleMutation.mutateAsync(placa);
      setDetalle(data);
      setOrdenOrigen(numero);
      setModalDetalleOpen(true);
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "No se ha encontrado información",
      );
    }
  };

  const handleVerSolucion = async (numero: number) => {
    try {
      const data = await solucionMutation.mutateAsync(numero);
      setSolucion(data);
      setModalSolucionOpen(true);
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "No se ha podido cargar la solución",
      );
    }
  };

  const handleCerrarBdc = async (numero: number) => {
    try {
      await cerrarBdcMutation.mutateAsync(numero);
      showSuccess("Registro cerrado correctamente");
      refetch();
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "No se ha podido guardar la información",
      );
    }
  };

  const handleGuardarGestion = async (params: GuardarDefinicionParams) => {
    try {
      await guardarMutation.mutateAsync(params);
      showSuccess("Se ha realizado el registro de gestión para el posible retorno");
      setModalGestionOpen(false);
      setModalDetalleOpen(false);
      refetch();
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "No se ha podido guardar la información",
      );
    }
  };

  const loading = isLoading || isFetching;
  const filas = listado?.filas ?? [];
  const total = listado?.total ?? 0;

  const startIndex = pageSize === -1 ? 0 : (page - 1) * pageSize;
  const endIndex =
    pageSize === -1 ? total : Math.min(startIndex + pageSize, total);

  return (
    <div className="space-y-4">
      <FiltrosPosiblesRetornos
        filtros={filtrosUi}
        bodegas={catalogos?.bodegas ?? []}
        loading={loading}
        onChange={setFiltrosUi}
        onBuscar={handleBuscar}
      />

      <div className="relative bg-white brand-card-elevated rounded-2xl border brand-border-active p-4 sm:p-6">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-2xl">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              Procesando...
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="text-xs text-gray-500">
            {total > 0
              ? `Mostrando ${startIndex + 1}–${endIndex} de ${total} registros`
              : "Sin registros"}
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-xs text-gray-600">
              Por página:
            </label>
            <select
              id="pageSize"
              className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <TablaPosiblesRetornos
          filas={filas}
          onVerDetalle={handleVerDetalle}
          onVerSolucion={handleVerSolucion}
          onCerrarBdc={handleCerrarBdc}
        />

        {total > 0 && totalPages > 1 && (
          <div className="flex flex-col items-center gap-2 pt-4 border-t border-gray-200 mt-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>
        )}
      </div>

      <ModalDetalleRetorno
        open={modalDetalleOpen && !modalGestionOpen}
        detalle={detalle}
        ordenOrigen={ordenOrigen}
        onClose={() => setModalDetalleOpen(false)}
        onGestionar={() => {
          setModalDetalleOpen(false);
          setModalGestionOpen(true);
        }}
      />

      <ModalGestionRetorno
        open={modalGestionOpen}
        catalogos={catalogos}
        detalle={detalle}
        ordenOrigen={ordenOrigen}
        guardando={guardarMutation.isPending}
        onClose={() => {
          setModalGestionOpen(false);
          if (detalle) setModalDetalleOpen(true);
        }}
        onGuardar={handleGuardarGestion}
      />

      <ModalSolucionRetorno
        open={modalSolucionOpen}
        solucion={solucion}
        onClose={() => setModalSolucionOpen(false)}
      />
    </div>
  );
}
