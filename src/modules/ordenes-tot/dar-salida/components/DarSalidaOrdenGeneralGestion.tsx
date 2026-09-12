'use client';

import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Modal from '@/components/shared/ui/Modal';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useToast } from '@/components/ui/use-toast';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { OrdenesTotPageFrame } from '@/modules/ordenes-tot/components/OrdenesTotPageFrame';
import { ORDENES_TOT_COPY } from '@/modules/ordenes-tot/constants';
import { OtQueryError } from '@/modules/ordenes-tot/shared/components/OtQueryError';
import {
  btnPrimaryClass,
  btnSecondaryClass,
  btnSuccessClass,
  inputClass,
} from '@/modules/ordenes-tot/shared/constants/ui';
import { ordenesTotKeys } from '@/modules/ordenes-tot/shared/constants/query-keys';
import { useOrdenesTotPageGuard } from '@/modules/ordenes-tot/shared/hooks/useOrdenesTotPageGuard';
import { ordenesTotService } from '@/modules/ordenes-tot/shared/services/ordenes-tot.service';
import { getErrorMessage } from '@/modules/ordenes-tot/shared/utils/parse-api-error';
import { DAR_SALIDA_ORDEN_GENERAL_SUBMENU_ID } from '@/utils/constants';

const PAGE_SIZE = 10;

export function DarSalidaOrdenGeneralGestion() {
  const { user, blocked } = useOrdenesTotPageGuard(
    DAR_SALIDA_ORDEN_GENERAL_SUBMENU_ID,
  );
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();
  const sesionLista = !!user && !blocked;

  const [modalOpen, setModalOpen] = useState(false);
  const [serial, setSerial] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [page, setPage] = useState(1);

  const pendientesQuery = useQuery({
    queryKey: ordenesTotKeys.ordenesGeneralesPendientes,
    queryFn: () => ordenesTotService.ordenesGeneralesPendientes(),
    enabled: sesionLista,
    ...transactionalQueryOptions,
  });

  const rows = useMemo(
    () => pendientesQuery.data ?? [],
    [pendientesQuery.data],
  );
  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, safePage]);

  const closeModal = () => {
    setModalOpen(false);
    setSerial('');
    setDescripcion('');
  };

  const crear = useMutation({
    mutationFn: () =>
      ordenesTotService.crearOrdenGeneral({
        serial: serial.trim(),
        descripcion: descripcion.trim(),
      }),
    onSuccess: () => {
      showSuccess('Orden general registrada para salida');
      queryClient.invalidateQueries({
        queryKey: ordenesTotKeys.ordenesGeneralesPendientes,
      });
      queryClient.invalidateQueries({ queryKey: ordenesTotKeys.porteria });
      closeModal();
    },
    onError: (e: unknown) =>
      showError(getErrorMessage(e, 'No se pudo registrar la orden general')),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!serial.trim()) {
      showError('El serial es obligatorio');
      return;
    }
    crear.mutate();
  };

  const handlePageChange = useCallback((next: number) => {
    setPage(next);
  }, []);

  const inicioRango = totalItems === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const finRango = totalItems === 0 ? 0 : Math.min(safePage * PAGE_SIZE, totalItems);

  if (blocked) return null;

  return (
    <OrdenesTotPageFrame
      title={ORDENES_TOT_COPY.darSalidaOrdenGeneral.title}
      description={ORDENES_TOT_COPY.darSalidaOrdenGeneral.description}
    >
      <div className="space-y-4">
        <div className="app-section-card min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-w-0 text-sm text-gray-500">
              Registre serial y descripción. Quedan pendientes de confirmación en portería.
            </p>
            <button
              type="button"
              data-testid="ot-registrar"
              className={btnPrimaryClass}
              onClick={() => setModalOpen(true)}
            >
              Registrar
            </button>
          </div>
        </div>

        <div className="app-section-card min-w-0 space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">
            Órdenes generales pendientes
          </h3>
          {pendientesQuery.isLoading ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : pendientesQuery.isError ? (
            <OtQueryError
              message={getErrorMessage(
                pendientesQuery.error,
                'Error al cargar órdenes generales',
              )}
            />
          ) : (
            <>
              <div data-testid="ot-table" className="app-table-scroll">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="brand-bg text-white">
                    <tr>
                      <th className="px-3 py-2.5 text-left font-semibold">Serial</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Descripción</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Fecha registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totalItems === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-3 py-4 text-gray-500">
                          No hay órdenes generales pendientes
                        </td>
                      </tr>
                    ) : (
                      paginatedRows.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-50 bg-[var(--color-warning-soft)]"
                        >
                          <td className="px-3 py-2 font-medium">{item.serial}</td>
                          <td className="px-3 py-2">{item.descripcion || '—'}</td>
                          <td className="px-3 py-2">{item.fechaIngreso ?? '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {totalItems > 0 && (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-gray-500">
                    Mostrando {inicioRango}–{finRango} de {totalItems} ({PAGE_SIZE} por
                    página)
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

        <Modal
          open={modalOpen}
          onClose={closeModal}
          title="Registrar Orden General para Salida"
          width="480px"
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="ot-serial" className="mb-1 block text-sm font-medium text-gray-700">
                Serial (SN)
              </label>
              <input
                id="ot-serial"
                data-testid="ot-serial"
                className={inputClass}
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                placeholder="xxxxx"
                required
              />
            </div>
            <div>
              <label
                htmlFor="ot-descripcion"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Descripción
              </label>
              <textarea
                id="ot-descripcion"
                data-testid="ot-descripcion"
                className={inputClass}
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" className={btnSecondaryClass} onClick={closeModal}>
                Cancelar
              </button>
              <button
                type="submit"
                className={btnSuccessClass}
                disabled={crear.isPending}
              >
                {crear.isPending ? 'Guardando...' : 'Dar salida orden general'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </OrdenesTotPageFrame>
  );
}
