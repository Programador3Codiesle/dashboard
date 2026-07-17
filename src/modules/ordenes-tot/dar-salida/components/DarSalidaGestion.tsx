'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Printer, RotateCcw } from 'lucide-react';
import Modal from '@/components/shared/ui/Modal';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useToast } from '@/components/ui/use-toast';
import {
  btnPrimaryClass,
  btnSecondaryClass,
  btnSuccessClass,
  inputClass,
} from '@/modules/ordenes-tot/shared/constants/ui';
import {
  ordenesTotService,
  type TotListadoItem,
} from '@/modules/ordenes-tot/shared/services/ordenes-tot.service';

export type DarSalidaTipo = 'vehiculo' | 'tot' | 'repuesto';

type Props = {
  tipo: DarSalidaTipo;
};

const PAGE_SIZE = 10;

const TITULOS: Record<DarSalidaTipo, string> = {
  vehiculo: 'Dar salida vehículos',
  tot: 'Dar salida TOT',
  repuesto: 'Ingreso Repuestos',
};

const BTN_REGISTRAR: Record<DarSalidaTipo, string> = {
  vehiculo: 'Dar salida vehículo',
  tot: 'Dar salida TOT',
  repuesto: 'Registrar',
};

function totRowClass(item: TotListadoItem): string {
  if (!item.fechaSalida) return 'bg-amber-50';
  if (!item.fechaReingreso) return 'bg-red-50';
  return 'bg-emerald-50';
}

export function DarSalidaGestion({ tipo }: Props) {
  const { showError, showSuccess, showInfo } = useToast();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [placa, setPlaca] = useState('');
  const [orden, setOrden] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [contenido, setContenido] = useState('');
  const [ordenMsg, setOrdenMsg] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [ordenValida, setOrdenValida] = useState(false);
  const [estadoTot, setEstadoTot] = useState<1 | 2>(1);
  const [page, setPage] = useState(1);

  const pendientesQuery = useQuery({
    queryKey: ['ordenes-tot', 'vehiculos-pendientes'],
    queryFn: () => ordenesTotService.vehiculosPendientes(),
    enabled: tipo === 'vehiculo',
  });

  const totQuery = useQuery({
    queryKey: ['ordenes-tot', 'listado-tot', estadoTot],
    queryFn: () => ordenesTotService.listadoTot(estadoTot),
    enabled: tipo === 'tot',
  });

  const candidatosQuery = useQuery({
    queryKey: ['ordenes-tot', 'repuestos-candidatos'],
    queryFn: () => ordenesTotService.repuestosCandidatos(),
    enabled: tipo === 'repuesto',
  });

  const tableRows = useMemo(() => {
    if (tipo === 'vehiculo') return pendientesQuery.data ?? [];
    if (tipo === 'tot') return totQuery.data ?? [];
    return candidatosQuery.data ?? [];
  }, [tipo, pendientesQuery.data, totQuery.data, candidatosQuery.data]);

  const totalItems = tableRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return tableRows.slice(start, start + PAGE_SIZE);
  }, [tableRows, safePage]);

  useEffect(() => {
    setPage(1);
  }, [tipo, estadoTot]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handlePageChange = useCallback((next: number) => {
    setPage(next);
  }, []);

  useEffect(() => {
    if (tipo !== 'tot' || !modalOpen) return;
    const value = orden.trim();
    if (!value) {
      setOrdenMsg(null);
      setOrdenValida(false);
      return;
    }

    setOrdenValida(false);
    const timer = setTimeout(async () => {
      try {
        const result = await ordenesTotService.validarOrden(value);
        if (result.abierta) {
          setOrdenMsg({ ok: true, text: 'Bien, la orden existe' });
          setOrdenValida(true);
        } else {
          setOrdenMsg({ ok: false, text: 'Error, orden no existe' });
          setOrdenValida(false);
        }
      } catch (e) {
        setOrdenMsg({
          ok: false,
          text: e instanceof Error ? e.message : 'Error al validar la orden',
        });
        setOrdenValida(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [orden, tipo, modalOpen]);

  const resetForm = () => {
    setPlaca('');
    setOrden('');
    setProveedor('');
    setContenido('');
    setOrdenMsg(null);
    setOrdenValida(false);
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
        queryKey: ['ordenes-tot', 'vehiculos-pendientes'],
      });
      closeModal();
    },
    onError: (e: Error) => showError(e.message),
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
      queryClient.invalidateQueries({ queryKey: ['ordenes-tot', 'listado-tot'] });
      closeModal();
    },
    onError: (e: Error) => showError(e.message),
  });

  const reingreso = useMutation({
    mutationFn: (id: number) => ordenesTotService.reingresoTot(id),
    onSuccess: () => {
      showSuccess('Reingreso marcado correctamente');
      queryClient.invalidateQueries({ queryKey: ['ordenes-tot', 'listado-tot'] });
    },
    onError: (e: Error) => showError(e.message),
  });

  const imprimirRecibo = useMutation({
    mutationFn: (id: number) => ordenesTotService.reciboTot(id),
    onSuccess: (blob) => {
      ordenesTotService.openPdfBlob(blob);
    },
    onError: (e: Error) => showError(e.message),
  });

  const submitting = crearVehiculo.isPending || crearTot.isPending;

  const modalTitle = useMemo(() => `Registrar ${tipo} para Salida`, [tipo]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (tipo === 'vehiculo') {
      if (!placa.trim() || !orden.trim()) {
        showError('Placa y orden son obligatorias');
        return;
      }
      crearVehiculo.mutate();
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

  const inicioRango = totalItems === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const finRango = totalItems === 0 ? 0 : Math.min(safePage * PAGE_SIZE, totalItems);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold brand-text">{TITULOS[tipo]}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {tipo === 'vehiculo' &&
                'Registre vehículos pendientes de confirmación en portería.'}
              {tipo === 'tot' &&
                'Registre salidas TOT, imprima recibos y marque reingresos.'}
              {tipo === 'repuesto' &&
                'Consulte candidatos a salida de repuestos por orden.'}
            </p>
          </div>
          <button
            type="button"
            className={btnPrimaryClass}
            onClick={() => setModalOpen(true)}
          >
            Registrar
          </button>
        </div>
      </div>

      {tipo === 'vehiculo' && (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">
            Vehículos pendientes
          </h3>
          {pendientesQuery.isLoading ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : (
            <>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-600">
                    <th className="px-2 py-2">Placa</th>
                    <th className="px-2 py-2">Orden</th>
                    <th className="px-2 py-2">Fecha ingreso</th>
                    <th className="px-2 py-2">Autorización</th>
                  </tr>
                </thead>
                <tbody>
                  {totalItems === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-2 py-4 text-gray-500">
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
                          <td className="px-2 py-2 font-medium">{item.placa}</td>
                          <td className="px-2 py-2">{item.orden}</td>
                          <td className="px-2 py-2">{item.fechaIngreso ?? '—'}</td>
                          <td className="px-2 py-2">{item.autorizacion || '—'}</td>
                        </tr>
                      ),
                    )
                  )}
                </tbody>
              </table>
              {totalItems > 0 && (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-gray-500">
                    Mostrando {inicioRango}–{finRango} de {totalItems} ({PAGE_SIZE}{' '}
                    por página)
                  </p>
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={safePage}
                      totalPages={totalPages}
                      onChange={handlePageChange}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tipo === 'tot' && (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Listado TOT</h3>
            <button
              type="button"
              className={btnSecondaryClass}
              onClick={() => setEstadoTot((prev) => (prev === 1 ? 2 : 1))}
            >
              {estadoTot === 1 ? 'Ver todos los registros' : 'Ver solo pendientes'}
            </button>
          </div>
          {totQuery.isLoading ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : (
            <>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-600">
                    <th className="px-2 py-2">N° de orden</th>
                    <th className="px-2 py-2">Placa</th>
                    <th className="px-2 py-2">Vehículo</th>
                    <th className="px-2 py-2">Proveedor</th>
                    <th className="px-2 py-2">Contenido</th>
                    <th className="px-2 py-2">Fecha salida</th>
                    <th className="px-2 py-2">Fecha reingreso</th>
                    <th className="px-2 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {totalItems === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-2 py-4 text-gray-500">
                        Sin registros
                      </td>
                    </tr>
                  ) : (
                    (paginatedRows as TotListadoItem[]).map((item) => (
                      <tr
                        key={item.id}
                        className={`border-b border-gray-50 ${totRowClass(item)}`}
                      >
                        <td className="px-2 py-2">{item.orden}</td>
                        <td className="px-2 py-2">{item.placa}</td>
                        <td className="px-2 py-2">{item.descripcion || '—'}</td>
                        <td className="px-2 py-2">{item.proveedor || '—'}</td>
                        <td className="px-2 py-2">{item.contenido || '—'}</td>
                        <td className="px-2 py-2">{item.fechaSalida ?? '—'}</td>
                        <td className="px-2 py-2">{item.fechaReingreso ?? '—'}</td>
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className={`${btnSuccessClass} !px-2 !py-1`}
                              title="Imprimir recibo"
                              disabled={estadoTot === 2 || imprimirRecibo.isPending}
                              onClick={() => imprimirRecibo.mutate(item.id)}
                            >
                              <Printer size={14} />
                            </button>
                            <button
                              type="button"
                              className={`${btnPrimaryClass} !px-2 !py-1`}
                              title="Marcar reingreso"
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
              {totalItems > 0 && (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-gray-500">
                    Mostrando {inicioRango}–{finRango} de {totalItems} ({PAGE_SIZE}{' '}
                    por página)
                  </p>
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={safePage}
                      totalPages={totalPages}
                      onChange={handlePageChange}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tipo === 'repuesto' && (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">
            Candidatos a salida de repuestos
          </h3>
          {candidatosQuery.isLoading ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : (
            <>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-600">
                    <th className="px-2 py-2">N° orden</th>
                    <th className="px-2 py-2">Placa</th>
                    <th className="px-2 py-2">Bodega / descripción</th>
                    <th className="px-2 py-2">Fecha ingreso</th>
                  </tr>
                </thead>
                <tbody>
                  {totalItems === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-2 py-4 text-gray-500">
                        No hay candidatos
                      </td>
                    </tr>
                  ) : (
                    (
                      paginatedRows as NonNullable<typeof candidatosQuery.data>
                    ).map((item, idx) => (
                      <tr
                        key={`${item.numero}-${item.placa}-${idx}`}
                        className="border-b border-gray-50"
                      >
                        <td className="px-2 py-2 font-medium">{item.numero}</td>
                        <td className="px-2 py-2">{item.placa}</td>
                        <td className="px-2 py-2">{item.descripcion || '—'}</td>
                        <td className="px-2 py-2">{item.fechaIngreso ?? '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {totalItems > 0 && (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-gray-500">
                    Mostrando {inicioRango}–{finRango} de {totalItems} ({PAGE_SIZE}{' '}
                    por página)
                  </p>
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={safePage}
                      totalPages={totalPages}
                      onChange={handlePageChange}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={modalTitle} width="480px">
        {tipo === 'repuesto' ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Formulario no disponible en legacy. El registro de repuestos requería
              placa y orden, pero el modal quedó sin campos en el sistema anterior.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" className={btnSecondaryClass} onClick={closeModal}>
                Cerrar
              </button>
              <button
                type="button"
                className={btnSuccessClass}
                disabled
                onClick={() => showInfo('Formulario incompleto en legacy')}
              >
                {BTN_REGISTRAR.repuesto}
              </button>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {tipo === 'vehiculo' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Placa
                </label>
                <input
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
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Orden
              </label>
              <input
                className={inputClass}
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                placeholder="######"
                required
              />
              {tipo === 'tot' && ordenMsg && (
                <p
                  className={`mt-1 text-xs font-semibold ${
                    ordenMsg.ok ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {ordenMsg.text}
                </p>
              )}
            </div>

            {tipo === 'tot' && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Proveedor
                  </label>
                  <input
                    className={inputClass}
                    value={proveedor}
                    onChange={(e) => setProveedor(e.target.value)}
                    placeholder="Escriba algo..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Contiene
                  </label>
                  <textarea
                    className={inputClass}
                    rows={3}
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2">
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
        )}
      </Modal>
    </div>
  );
}
