'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Printer, RotateCcw } from 'lucide-react';
import Modal from '@/components/shared/ui/Modal';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useToast } from '@/components/ui/use-toast';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { OrdenesTotPageFrame } from '@/modules/ordenes-tot/components/OrdenesTotPageFrame';
import { ORDENES_TOT_COPY } from '@/modules/ordenes-tot/constants';
import { OtQueryError } from '@/modules/ordenes-tot/shared/components/OtQueryError';
import {
  btnIconClass,
  btnPrimaryClass,
  btnSecondaryClass,
  btnSuccessClass,
  inputClass,
} from '@/modules/ordenes-tot/shared/constants/ui';
import { ordenesTotKeys } from '@/modules/ordenes-tot/shared/constants/query-keys';
import { useOrdenesTotPageGuard } from '@/modules/ordenes-tot/shared/hooks/useOrdenesTotPageGuard';
import {
  ordenesTotService,
  type TotListadoItem,
} from '@/modules/ordenes-tot/shared/services/ordenes-tot.service';
import { getErrorMessage } from '@/modules/ordenes-tot/shared/utils/parse-api-error';
import {
  DAR_SALIDA_TOT_SUBMENU_ID,
  DAR_SALIDA_VEHICULOS_SUBMENU_ID,
  INGRESO_REPUESTOS_SUBMENU_ID,
} from '@/utils/constants';

export type DarSalidaTipo = 'vehiculo' | 'tot' | 'repuesto';

type Props = {
  tipo: DarSalidaTipo;
};

const PAGE_SIZE = 10;

const SUBMENU_BY_TIPO: Record<DarSalidaTipo, number> = {
  vehiculo: DAR_SALIDA_VEHICULOS_SUBMENU_ID,
  tot: DAR_SALIDA_TOT_SUBMENU_ID,
  repuesto: INGRESO_REPUESTOS_SUBMENU_ID,
};

const COPY_BY_TIPO = {
  vehiculo: ORDENES_TOT_COPY.darSalidaVehiculos,
  tot: ORDENES_TOT_COPY.darSalidaTot,
  repuesto: ORDENES_TOT_COPY.ingresoRepuestos,
} as const;

const BTN_REGISTRAR: Record<DarSalidaTipo, string> = {
  vehiculo: 'Dar salida vehículo',
  tot: 'Dar salida TOT',
  repuesto: 'Dar salida repuesto',
};

function totRowClass(item: TotListadoItem): string {
  if (!item.fechaSalida) return 'bg-[var(--color-warning-soft)]';
  if (!item.fechaReingreso) return 'bg-[var(--color-danger-soft)]';
  return 'bg-[var(--color-success-soft)]';
}

function TablaPaginadaFooter({
  totalItems,
  inicioRango,
  finRango,
  totalPages,
  safePage,
  onPageChange,
}: {
  totalItems: number;
  inicioRango: number;
  finRango: number;
  totalPages: number;
  safePage: number;
  onPageChange: (page: number) => void;
}) {
  if (totalItems === 0) return null;
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-gray-500">
        Mostrando {inicioRango}–{finRango} de {totalItems} ({PAGE_SIZE} por página)
      </p>
      {totalPages > 1 && (
        <Pagination currentPage={safePage} totalPages={totalPages} onChange={onPageChange} />
      )}
    </div>
  );
}

export function DarSalidaGestion({ tipo }: Props) {
  const { user, blocked } = useOrdenesTotPageGuard(SUBMENU_BY_TIPO[tipo]);
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();
  const sesionLista = !!user && !blocked;
  const copy = COPY_BY_TIPO[tipo];

  const [modalOpen, setModalOpen] = useState(false);
  const [placa, setPlaca] = useState('');
  const [orden, setOrden] = useState('');
  const [ordenDebounced, setOrdenDebounced] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [contenido, setContenido] = useState('');
  const [estadoTot, setEstadoTot] = useState<1 | 2>(1);
  const [page, setPage] = useState(1);

  const pendientesQuery = useQuery({
    queryKey: ordenesTotKeys.vehiculosPendientes,
    queryFn: () => ordenesTotService.vehiculosPendientes(),
    enabled: tipo === 'vehiculo' && sesionLista,
    ...transactionalQueryOptions,
  });

  const totQuery = useQuery({
    queryKey: ordenesTotKeys.listadoTot(estadoTot, page),
    queryFn: () => ordenesTotService.listadoTot(estadoTot, page, PAGE_SIZE),
    enabled: tipo === 'tot' && sesionLista,
    ...transactionalQueryOptions,
    placeholderData: keepPreviousData,
  });

  const candidatosQuery = useQuery({
    queryKey: ordenesTotKeys.repuestosCandidatos,
    queryFn: () => ordenesTotService.repuestosCandidatos(),
    enabled: tipo === 'repuesto' && sesionLista,
    ...transactionalQueryOptions,
  });

  useEffect(() => {
    const timer = setTimeout(() => setOrdenDebounced(orden.trim()), 400);
    return () => clearTimeout(timer);
  }, [orden]);

  const validarQuery = useQuery({
    queryKey: ordenesTotKeys.validarOrden(ordenDebounced),
    queryFn: () => ordenesTotService.validarOrden(ordenDebounced),
    enabled: tipo === 'tot' && modalOpen && ordenDebounced.length > 0 && sesionLista,
    ...transactionalQueryOptions,
  });

  const ordenAlDia = orden.trim() === ordenDebounced;
  const ordenValida =
    ordenAlDia &&
    ordenDebounced.length > 0 &&
    Boolean(validarQuery.data?.abierta) &&
    !validarQuery.isFetching;

  const ordenMsg =
    tipo !== 'tot' || !modalOpen || !ordenDebounced || !ordenAlDia || validarQuery.isFetching
      ? null
      : validarQuery.isError
        ? {
            ok: false,
            text: getErrorMessage(validarQuery.error, 'Error al validar la orden'),
          }
        : validarQuery.data
          ? {
              ok: Boolean(validarQuery.data.abierta),
              text: validarQuery.data.abierta
                ? 'Bien, la orden existe'
                : 'Error, orden no existe',
            }
          : null;

  const clientRows = useMemo(() => {
    if (tipo === 'vehiculo') return pendientesQuery.data ?? [];
    if (tipo === 'repuesto') return candidatosQuery.data ?? [];
    return [];
  }, [tipo, pendientesQuery.data, candidatosQuery.data]);

  const totTotal = totQuery.data?.total ?? 0;
  const totalItems = tipo === 'tot' ? totTotal : clientRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedRows = useMemo(() => {
    if (tipo === 'tot') return totQuery.data?.items ?? [];
    const start = (safePage - 1) * PAGE_SIZE;
    return clientRows.slice(start, start + PAGE_SIZE);
  }, [tipo, totQuery.data?.items, clientRows, safePage]);

  const handlePageChange = useCallback((next: number) => {
    setPage(next);
  }, []);

  const resetForm = () => {
    setPlaca('');
    setOrden('');
    setOrdenDebounced('');
    setProveedor('');
    setContenido('');
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const crearVehiculo = useMutation({
    mutationFn: () =>
      ordenesTotService.crearVehiculo({
        placa: placa.trim(),
        orden: orden.trim(),
      }),
    onSuccess: () => {
      showSuccess('Vehículo registrado para salida');
      queryClient.invalidateQueries({
        queryKey: ordenesTotKeys.vehiculosPendientes,
      });
      closeModal();
    },
    onError: (e: unknown) =>
      showError(getErrorMessage(e, 'No se pudo registrar el vehículo')),
  });

  const crearRepuesto = useMutation({
    mutationFn: () =>
      ordenesTotService.crearRepuesto({
        placa: placa.trim(),
        orden: orden.trim(),
      }),
    onSuccess: () => {
      showSuccess('Repuesto registrado para salida');
      queryClient.invalidateQueries({
        queryKey: ordenesTotKeys.repuestosCandidatos,
      });
      closeModal();
    },
    onError: (e: unknown) =>
      showError(getErrorMessage(e, 'No se pudo registrar el repuesto')),
  });

  const crearTot = useMutation({
    mutationFn: () =>
      ordenesTotService.crearTot({
        orden: orden.trim(),
        proveedor: proveedor.trim(),
        contenido: contenido.trim(),
        placa: '0',
      }),
    onSuccess: (result) => {
      if (result.kind === 'pdf') {
        ordenesTotService.openPdfBlob(result.blob);
        showSuccess('TOT registrado. Recibo generado.');
      } else {
        showSuccess('TOT registrado correctamente');
      }
      queryClient.invalidateQueries({ queryKey: ordenesTotKeys.listadoTotAll });
      closeModal();
    },
    onError: (e: unknown) => showError(getErrorMessage(e, 'No se pudo registrar el TOT')),
  });

  const reingreso = useMutation({
    mutationFn: (id: number) => ordenesTotService.reingresoTot(id),
    onSuccess: () => {
      showSuccess('Reingreso marcado correctamente');
      queryClient.invalidateQueries({ queryKey: ordenesTotKeys.listadoTotAll });
    },
    onError: (e: unknown) =>
      showError(getErrorMessage(e, 'Error al marcar reingreso')),
  });

  const imprimirRecibo = useMutation({
    mutationFn: (id: number) => ordenesTotService.reciboTot(id),
    onSuccess: (blob) => {
      ordenesTotService.openPdfBlob(blob);
    },
    onError: (e: unknown) =>
      showError(getErrorMessage(e, 'No se pudo generar el recibo')),
  });

  const submitting =
    crearVehiculo.isPending || crearTot.isPending || crearRepuesto.isPending;
  const modalTitle = useMemo(() => `Registrar ${tipo} para Salida`, [tipo]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (tipo === 'vehiculo' || tipo === 'repuesto') {
      if (!placa.trim() || !orden.trim()) {
        showError('Placa y orden son obligatorias');
        return;
      }
      if (tipo === 'vehiculo') crearVehiculo.mutate();
      else crearRepuesto.mutate();
      return;
    }
    if (tipo === 'tot') {
      if (!orden.trim() || !ordenValida) {
        showError('Debe ingresar una orden válida y abierta');
        return;
      }
      crearTot.mutate();
    }
  };

  const openRegistroRepuesto = (item?: { placa: string; numero: string }) => {
    setPlaca(item?.placa ?? '');
    setOrden(item?.numero ?? '');
    setModalOpen(true);
  };

  const inicioRango = totalItems === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const finRango = totalItems === 0 ? 0 : Math.min(safePage * PAGE_SIZE, totalItems);
  const footerProps = {
    totalItems,
    inicioRango,
    finRango,
    totalPages,
    safePage,
    onPageChange: handlePageChange,
  };

  if (blocked) return null;

  return (
    <OrdenesTotPageFrame title={copy.title} description={copy.description}>
      <div className="space-y-4">
        <div className="app-section-card min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-w-0 text-sm text-gray-500">
              {tipo === 'vehiculo' &&
                'Registre vehículos pendientes de confirmación en portería.'}
              {tipo === 'tot' &&
                'Registre salidas TOT, imprima recibos y marque reingresos.'}
              {tipo === 'repuesto' &&
                'Consulte candidatos y registre placa y orden para dar salida de repuestos.'}
            </p>
            <button
              type="button"
              data-testid="ot-registrar"
              className={btnPrimaryClass}
              onClick={() =>
                tipo === 'repuesto' ? openRegistroRepuesto() : setModalOpen(true)
              }
            >
              Registrar
            </button>
          </div>
        </div>

        {tipo === 'vehiculo' && (
          <div className="app-section-card min-w-0 space-y-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Vehículos pendientes
            </h3>
            {pendientesQuery.isLoading ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : pendientesQuery.isError ? (
              <OtQueryError
                message={getErrorMessage(
                  pendientesQuery.error,
                  'Error al cargar vehículos pendientes',
                )}
              />
            ) : (
              <>
                <div data-testid="ot-table" className="app-table-scroll">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead className="brand-bg text-white">
                      <tr>
                        <th className="px-3 py-2.5 text-left font-semibold">Placa</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Orden</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Fecha ingreso</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Autorización</th>
                      </tr>
                    </thead>
                    <tbody>
                      {totalItems === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-gray-500">
                            No hay vehículos pendientes
                          </td>
                        </tr>
                      ) : (
                        (paginatedRows as NonNullable<typeof pendientesQuery.data>).map(
                          (item) => (
                            <tr
                              key={`${item.id}-${item.orden}-${item.placa}`}
                              className="border-b border-gray-50"
                            >
                              <td className="px-3 py-2 font-medium">{item.placa}</td>
                              <td className="px-3 py-2">{item.orden}</td>
                              <td className="px-3 py-2">{item.fechaIngreso ?? '—'}</td>
                              <td className="px-3 py-2">{item.autorizacion || '—'}</td>
                            </tr>
                          ),
                        )
                      )}
                    </tbody>
                  </table>
                </div>
                <TablaPaginadaFooter {...footerProps} />
              </>
            )}
          </div>
        )}

        {tipo === 'tot' && (
          <div className="app-section-card min-w-0 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Listado TOT</h3>
              <button
                type="button"
                className={btnSecondaryClass}
                onClick={() => {
                  setEstadoTot((prev) => (prev === 1 ? 2 : 1));
                  setPage(1);
                }}
              >
                {estadoTot === 1 ? 'Ver todos los registros' : 'Ver solo pendientes'}
              </button>
            </div>
            {totQuery.isLoading ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : totQuery.isError ? (
              <OtQueryError
                message={getErrorMessage(totQuery.error, 'Error al cargar listado TOT')}
              />
            ) : (
              <>
                <div data-testid="ot-table" className="app-table-scroll">
                  <table className="w-full min-w-[1100px] text-sm">
                    <thead className="brand-bg text-white">
                      <tr>
                        <th className="px-3 py-2.5 text-left font-semibold">N° de orden</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Placa</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Vehículo</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Proveedor</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Contenido</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Fecha salida</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Fecha reingreso</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {totalItems === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-3 py-4 text-gray-500">
                            Sin registros
                          </td>
                        </tr>
                      ) : (
                        (paginatedRows as TotListadoItem[]).map((item) => (
                          <tr
                            key={item.id}
                            className={`border-b border-gray-50 ${totRowClass(item)}`}
                          >
                            <td className="px-3 py-2">{item.orden}</td>
                            <td className="px-3 py-2">{item.placa}</td>
                            <td className="px-3 py-2">{item.descripcion || '—'}</td>
                            <td className="px-3 py-2">{item.proveedor || '—'}</td>
                            <td className="px-3 py-2">{item.contenido || '—'}</td>
                            <td className="px-3 py-2">{item.fechaSalida ?? '—'}</td>
                            <td className="px-3 py-2">{item.fechaReingreso ?? '—'}</td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className={`${btnIconClass} brand-success`}
                                  title="Imprimir recibo"
                                  aria-label="Imprimir recibo"
                                  disabled={estadoTot === 2 || imprimirRecibo.isPending}
                                  onClick={() => imprimirRecibo.mutate(item.id)}
                                >
                                  <Printer size={14} />
                                </button>
                                <button
                                  type="button"
                                  className={`${btnIconClass} brand-bg`}
                                  title="Marcar reingreso"
                                  aria-label="Marcar reingreso"
                                  disabled={estadoTot === 2 || reingreso.isPending}
                                  onClick={() => reingreso.mutate(item.id)}
                                >
                                  <RotateCcw size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <TablaPaginadaFooter {...footerProps} />
              </>
            )}
          </div>
        )}

        {tipo === 'repuesto' && (
          <div className="app-section-card min-w-0 space-y-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Candidatos a salida de repuestos
            </h3>
            {candidatosQuery.isLoading ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : candidatosQuery.isError ? (
              <OtQueryError
                message={getErrorMessage(
                  candidatosQuery.error,
                  'Error al cargar candidatos de repuestos',
                )}
              />
            ) : (
              <>
                <div data-testid="ot-table" className="app-table-scroll">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead className="brand-bg text-white">
                      <tr>
                        <th className="px-3 py-2.5 text-left font-semibold">N° orden</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Placa</th>
                        <th className="px-3 py-2.5 text-left font-semibold">
                          Bodega / descripción
                        </th>
                        <th className="px-3 py-2.5 text-left font-semibold">Fecha ingreso</th>
                        <th className="px-3 py-2.5 text-left font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {totalItems === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-4 text-gray-500">
                            No hay candidatos
                          </td>
                        </tr>
                      ) : (
                        (paginatedRows as NonNullable<typeof candidatosQuery.data>).map(
                          (item, idx) => (
                            <tr
                              key={`${item.numero}-${item.placa}-${idx}`}
                              className="border-b border-gray-50"
                            >
                              <td className="px-3 py-2 font-medium">{item.numero}</td>
                              <td className="px-3 py-2">{item.placa}</td>
                              <td className="px-3 py-2">{item.descripcion || '—'}</td>
                              <td className="px-3 py-2">{item.fechaIngreso ?? '—'}</td>
                              <td className="px-3 py-2">
                                <button
                                  type="button"
                                  className={btnSecondaryClass}
                                  onClick={() =>
                                    openRegistroRepuesto({
                                      placa: item.placa,
                                      numero: item.numero,
                                    })
                                  }
                                >
                                  Registrar
                                </button>
                              </td>
                            </tr>
                          ),
                        )
                      )}
                    </tbody>
                  </table>
                </div>
                <TablaPaginadaFooter {...footerProps} />
              </>
            )}
          </div>
        )}

        <Modal open={modalOpen} onClose={closeModal} title={modalTitle} width="480px">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {(tipo === 'vehiculo' || tipo === 'repuesto') && (
                <div>
                  <label htmlFor="ot-placa" className="mb-1 block text-sm font-medium text-gray-700">
                    Placa
                  </label>
                  <input
                    id="ot-placa"
                    data-testid="ot-placa"
                    className={inputClass}
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    required
                  />
                </div>
              )}

              {tipo === 'tot' && <input type="hidden" name="placa" value="0" />}

              <div>
                <label htmlFor="ot-orden" className="mb-1 block text-sm font-medium text-gray-700">
                  Orden
                </label>
                <input
                  id="ot-orden"
                  data-testid="ot-orden"
                  className={inputClass}
                  value={orden}
                  onChange={(e) => setOrden(e.target.value)}
                  placeholder="######"
                  required
                />
                {tipo === 'tot' && ordenMsg && (
                  <p
                    className={`mt-1 text-xs font-semibold ${
                      ordenMsg.ok
                        ? 'text-[var(--color-success)]'
                        : 'text-[var(--color-danger)]'
                    }`}
                  >
                    {ordenMsg.text}
                  </p>
                )}
              </div>

              {tipo === 'tot' && (
                <>
                  <div>
                    <label
                      htmlFor="ot-proveedor"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Proveedor
                    </label>
                    <input
                      id="ot-proveedor"
                      className={inputClass}
                      value={proveedor}
                      onChange={(e) => setProveedor(e.target.value)}
                      placeholder="Escriba algo..."
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="ot-contenido"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Contiene
                    </label>
                    <textarea
                      id="ot-contenido"
                      className={inputClass}
                      rows={3}
                      value={contenido}
                      onChange={(e) => setContenido(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" className={btnSecondaryClass} onClick={closeModal}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={btnSuccessClass}
                  disabled={
                    submitting || (tipo === 'tot' && (!ordenValida || !orden.trim()))
                  }
                >
                  {submitting ? 'Guardando...' : BTN_REGISTRAR[tipo]}
                </button>
              </div>
            </form>
        </Modal>
      </div>
    </OrdenesTotPageFrame>
  );
}
