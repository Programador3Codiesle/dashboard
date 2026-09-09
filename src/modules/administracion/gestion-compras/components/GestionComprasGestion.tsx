'use client';

import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Download, Loader2, Plus } from 'lucide-react';
import { SearchFilter } from '@/components/administracion/filters/SearchFilter';
import CambiarEstadoCompraModal from '@/components/administracion/modals/CambiarEstadoCompraModal';
import EnviarAutorizacionCompraModal from '@/components/administracion/modals/EnviarAutorizacionCompraModal';
import MensajesCompraModal from '@/components/administracion/modals/MensajesCompraModal';
import NuevaSolicitudCompraModal from '@/components/administracion/modals/NuevaSolicitudCompraModal';
import VerSolicitudCompraModal from '@/components/administracion/modals/VerSolicitudCompraModal';
import { SolicitudCompraTableRow } from '@/components/administracion/table/SolicitudCompraTableRow';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useToast } from '@/components/shared/ui/ToastContext';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { AdministracionPageFrame } from '@/modules/administracion/components/AdministracionPageFrame';
import { ADMINISTRACION_COPY } from '@/modules/administracion/constants';
import { AdministracionQueryError } from '@/modules/administracion/shared/components/AdministracionQueryError';
import { administracionKeys } from '@/modules/administracion/shared/constants/query-keys';
import { useAdministracionPageGuard } from '@/modules/administracion/shared/hooks/useAdministracionPageGuard';
import {
  gestionComprasService,
  type SolicitudCompra,
} from '@/modules/administracion/services/gestion-compras.service';
import { getErrorMessage } from '@/modules/administracion/shared/utils/parse-api-error';
import type { NuevaSolicitudCompraDTO } from '@/modules/administracion/types';
import { GESTION_COMPRAS_SUBMENU_ID } from '@/utils/constants';

const PAGE_SIZE = 10;

export function GestionComprasGestion() {
  const { user, blocked } = useAdministracionPageGuard(
    GESTION_COMPRAS_SUBMENU_ID,
  );
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const sesionLista = !!user && !blocked;
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [descargando, setDescargando] = useState(false);

  const [solicitudSeleccionada, setSolicitudSeleccionada] =
    useState<SolicitudCompra | null>(null);
  const [modalVerDetalle, setModalVerDetalle] = useState(false);
  const [modalMensajes, setModalMensajes] = useState(false);
  const [modalCambiarEstado, setModalCambiarEstado] = useState(false);
  const [modalAutorizacion, setModalAutorizacion] = useState(false);
  const [solicitudIdAccion, setSolicitudIdAccion] = useState<number | null>(
    null,
  );
  const [estadoActualAccion, setEstadoActualAccion] = useState<number>(1);

  const query = useQuery({
    queryKey: [...administracionKeys.gestionCompras, search, currentPage],
    queryFn: () =>
      gestionComprasService.listarSolicitudes({
        buscar: search || undefined,
        pagina: currentPage,
        limite: PAGE_SIZE,
      }),
    enabled: sesionLista,
    ...transactionalQueryOptions,
  });

  const solicitudes = query.data?.items ?? [];
  const totalItems = query.data?.total ?? 0;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  const invalidateCompras = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: administracionKeys.gestionCompras,
    });
  }, [queryClient]);

  const crearMutation = useMutation({
    mutationFn: (data: NuevaSolicitudCompraDTO) =>
      gestionComprasService.crearSolicitud(data, user?.empresa),
    onSuccess: async () => {
      showSuccess('Solicitud creada correctamente');
      setModalOpen(false);
      setCurrentPage(1);
      await queryClient.invalidateQueries({
        queryKey: administracionKeys.gestionCompras,
      });
    },
    onError: () => {
      showError('Error al crear la solicitud de compra');
    },
  });

  const facturaMutation = useMutation({
    mutationFn: ({
      solicitudId,
      conFactura,
    }: {
      solicitudId: number;
      conFactura: boolean;
    }) =>
      gestionComprasService.marcarConFactura(
        solicitudId,
        conFactura ? 'Si' : 'No',
      ),
    onSuccess: async (result) => {
      if (result.status) {
        showSuccess(result.message);
        await queryClient.invalidateQueries({
          queryKey: administracionKeys.gestionCompras,
        });
      } else {
        showError(
          result.message || 'Error al actualizar el estado de factura',
        );
      }
    },
    onError: () => {
      showError('Error al actualizar el estado de factura');
    },
  });

  const changePage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const handleSave = async (data: NuevaSolicitudCompraDTO) => {
    await crearMutation.mutateAsync(data);
  };

  const handleDownload = async () => {
    setDescargando(true);
    try {
      const blob = await gestionComprasService.exportarExcel({
        buscar: search || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `solicitudes-compras-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess('Excel descargado correctamente');
    } catch {
      showError('Error al descargar el archivo Excel');
    } finally {
      setDescargando(false);
    }
  };

  const getUrgenciaBadge = useCallback((urgencia: number) => {
    if (urgencia === 1) return 'bg-green-100 text-green-700 border-green-200';
    if (urgencia === 2)
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  }, []);

  const handleVerDetalle = useCallback((solicitud: SolicitudCompra) => {
    setSolicitudSeleccionada(solicitud);
    setModalVerDetalle(true);
  }, []);

  const handleVerMensajes = useCallback((solicitudId: number) => {
    setSolicitudIdAccion(solicitudId);
    setModalMensajes(true);
  }, []);

  const handleCambiarEstado = useCallback(
    (solicitudId: number, estadoActual: number) => {
      setSolicitudIdAccion(solicitudId);
      setEstadoActualAccion(estadoActual);
      setModalCambiarEstado(true);
    },
    [],
  );

  const handleEnviarAutorizacion = useCallback((solicitudId: number) => {
    setSolicitudIdAccion(solicitudId);
    setModalAutorizacion(true);
  }, []);

  const handleToggleFactura = useCallback(
    (solicitudId: number, conFactura: boolean) => {
      facturaMutation.mutate({ solicitudId, conFactura });
    },
    [facturaMutation],
  );

  if (blocked) return null;

  return (
    <AdministracionPageFrame
      title={ADMINISTRACION_COPY.gestionCompras.title}
      description={ADMINISTRACION_COPY.gestionCompras.description}
    >
      {query.isError ? (
        <AdministracionQueryError
          message={getErrorMessage(
            query.error,
            ADMINISTRACION_COPY.gestionCompras.loadError,
          )}
        />
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={descargando}
          className="flex w-full sm:w-auto justify-center items-center gap-2 rounded-xl bg-(--color-success) px-4 py-2.5 font-medium text-white shadow-md transition-colors hover:opacity-90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {descargando ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>Descargando...</span>
            </>
          ) : (
            <>
              <Download size={18} />
              <span>Descargar Excel</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex w-full sm:w-auto justify-center items-center gap-2 rounded-xl brand-bg px-4 py-2.5 font-medium text-white shadow-md transition-colors hover:opacity-90 hover:shadow-lg"
        >
          <Plus size={18} />
          <span>Nueva Solicitud</span>
        </button>
      </div>

      <SearchFilter
        onSearch={handleSearchChange}
        placeholder="Buscar por descripción, usuario o número..."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg"
      >
        <div data-testid="adm-table" className="app-table-scroll">
          <table className="w-full min-w-[1200px]">
            <thead className="brand-bg border-b border-(--color-primary-dark) text-sm">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-white">
                  #
                </th>
                <th className="px-6 py-4 text-left font-semibold text-white">
                  Descripción
                </th>
                <th className="px-6 py-4 text-left font-semibold text-white">
                  Mensajes
                </th>
                <th className="px-6 py-4 text-left font-semibold text-white">
                  Con Factura
                </th>
                <th className="px-6 py-4 text-left font-semibold text-white">
                  Estado
                </th>
                <th className="px-6 py-4 text-left font-semibold text-white">
                  Estado Autorización
                </th>
                <th className="px-6 py-4 text-left font-semibold text-white">
                  Usuario Solicita
                </th>
                <th className="px-6 py-4 text-left font-semibold text-white">
                  Gerente Autoriza
                </th>
                <th className="px-6 py-4 text-left font-semibold text-white">
                  Fecha Solicitud
                </th>
                <th className="px-6 py-4 text-left font-semibold text-white">
                  Fecha Autorización
                </th>
                <th className="px-4 py-4 text-left font-semibold text-white">
                  Gestión Días
                </th>
                <th className="px-8 py-4 text-left font-semibold text-white">
                  Urgencia
                </th>
              </tr>
            </thead>
            <tbody>
              {query.isLoading ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Cargando solicitudes...</span>
                    </div>
                  </td>
                </tr>
              ) : solicitudes.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="py-10 text-center text-gray-500"
                  >
                    No se encontraron solicitudes
                  </td>
                </tr>
              ) : (
                solicitudes.map((solicitud) => (
                  <SolicitudCompraTableRow
                    key={solicitud.id}
                    solicitud={solicitud}
                    getUrgenciaBadge={getUrgenciaBadge}
                    onRefresh={invalidateCompras}
                    onVerDetalle={handleVerDetalle}
                    onVerMensajes={handleVerMensajes}
                    onCambiarEstado={handleCambiarEstado}
                    onEnviarAutorizacion={handleEnviarAutorizacion}
                    onToggleFactura={handleToggleFactura}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 ? (
          <div className="border-t border-gray-200 p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onChange={changePage}
            />
          </div>
        ) : null}
      </motion.div>

      <NuevaSolicitudCompraModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <VerSolicitudCompraModal
        open={modalVerDetalle}
        onClose={() => {
          setModalVerDetalle(false);
          setSolicitudSeleccionada(null);
        }}
        solicitud={solicitudSeleccionada}
      />

      {solicitudIdAccion !== null ? (
        <>
          <MensajesCompraModal
            open={modalMensajes}
            onClose={() => {
              setModalMensajes(false);
              setSolicitudIdAccion(null);
            }}
            solicitudId={solicitudIdAccion}
          />

          <CambiarEstadoCompraModal
            open={modalCambiarEstado}
            onClose={() => {
              setModalCambiarEstado(false);
              setSolicitudIdAccion(null);
            }}
            solicitudId={solicitudIdAccion}
            estadoActual={estadoActualAccion}
            onSuccess={invalidateCompras}
          />

          <EnviarAutorizacionCompraModal
            open={modalAutorizacion}
            onClose={() => {
              setModalAutorizacion(false);
              setSolicitudIdAccion(null);
            }}
            solicitudId={solicitudIdAccion}
            onSuccess={invalidateCompras}
          />
        </>
      ) : null}
    </AdministracionPageFrame>
  );
}
