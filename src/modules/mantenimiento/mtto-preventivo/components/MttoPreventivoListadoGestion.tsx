'use client';

import { useCallback, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ConfirmModal from '@/components/shared/ui/ConfirmModal';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useToast } from '@/components/ui/use-toast';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { MantenimientoPageFrame } from '@/modules/mantenimiento/components/MantenimientoPageFrame';
import { MANTENIMIENTO_COPY } from '@/modules/mantenimiento/constants';
import { MantenimientoQueryError } from '@/modules/mantenimiento/shared/components/MantenimientoQueryError';
import { mantenimientoKeys } from '@/modules/mantenimiento/shared/constants/query-keys';
import { btnIconClass } from '@/modules/mantenimiento/shared/constants/ui';
import { useMantenimientoPageGuard } from '@/modules/mantenimiento/shared/hooks/useMantenimientoPageGuard';
import { mantenimientoService } from '@/modules/mantenimiento/shared/services/mantenimiento.service';
import { getErrorMessage } from '@/modules/mantenimiento/shared/utils/parse-api-error';
import { paginateRows } from '@/modules/mantenimiento/shared/utils/paginate';
import { MTTO_PREVENTIVO_SUBMENU_ID } from '@/utils/constants';

const PAGE_SIZE = 10;

export function MttoPreventivoListadoGestion() {
  const { blocked, user } = useMantenimientoPageGuard(
    MTTO_PREVENTIVO_SUBMENU_ID,
  );
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();
  const sesionLista = !!user && !blocked;
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const listQuery = useQuery({
    queryKey: mantenimientoKeys.preventivoListado,
    queryFn: () => mantenimientoService.listadoPreventivo(),
    enabled: sesionLista,
    ...transactionalQueryOptions,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => mantenimientoService.eliminarOrden(id),
    onSuccess: async () => {
      showSuccess('Eliminada');
      await queryClient.invalidateQueries({
        queryKey: mantenimientoKeys.preventivoListado,
      });
      await queryClient.invalidateQueries({
        queryKey: mantenimientoKeys.preventivoEventos,
      });
    },
    onError: (e) => {
      showError(getErrorMessage(e, 'Error al eliminar'));
    },
  });

  const rows = listQuery.data ?? [];
  const { pageRows, totalPages, safePage, total } = paginateRows(
    rows,
    page,
    PAGE_SIZE,
  );
  const onPage = useCallback((p: number) => setPage(p), []);

  if (blocked) return null;

  return (
    <MantenimientoPageFrame
      title={MANTENIMIENTO_COPY.preventivoListado.title}
      backHref="/dashboard/mantenimiento/mtto-preventivo"
      backLabel={MANTENIMIENTO_COPY.backCronograma}
    >
      {listQuery.isError ? (
        <MantenimientoQueryError
          message={getErrorMessage(
            listQuery.error,
            MANTENIMIENTO_COPY.preventivoListado.loadError,
          )}
        />
      ) : null}

      <div className="app-section-card w-full min-w-0">
        <div data-testid="mtto-preventivo-listado-table" className="app-table-scroll">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="brand-bg text-white">
            <tr>
              {['Código', 'Equipo', 'Bodega', 'Fecha req.', 'Descripción', 'Acciones'].map(
                (h) => (
                  <th key={h} className="px-2 py-2">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {listQuery.isFetching && rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  {MANTENIMIENTO_COPY.preventivoListado.empty}
                </td>
              </tr>
            ) : (
              pageRows.map((r) => {
                const id = Number(r.id_mantenimientos);
                const busy =
                  deleteMutation.isPending &&
                  deleteMutation.variables === id;
                return (
                  <tr key={id} className="border-t text-center">
                    <td className="px-2 py-2">{String(r.codigo)}</td>
                    <td className="px-2 py-2 text-left">
                      {String(r.nombre_equipo)}
                    </td>
                    <td className="px-2 py-2">{String(r.bodega)}</td>
                    <td className="px-2 py-2">
                      {String(r.fecha_requerida ?? '').slice(0, 10)}
                    </td>
                    <td className="px-2 py-2 text-left max-w-[220px] truncate">
                      {String(r.descripcion ?? '')}
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        disabled={busy}
                        className={`${btnIconClass} bg-[var(--color-danger)]`}
                        title="Eliminar orden"
                        onClick={() => setConfirmId(id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {busy ? 'Eliminando…' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
        {total > 0 && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-gray-600">{total} registros</span>
            {totalPages > 1 && (
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onChange={onPage}
              />
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmId != null}
        title="Confirmar eliminación"
        message="¿Eliminar esta OT preventiva? Esta acción no se puede deshacer."
        variant="danger"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={() => {
          if (confirmId == null) return;
          const id = confirmId;
          setConfirmId(null);
          deleteMutation.mutate(id);
        }}
        onCancel={() => setConfirmId(null)}
      />
    </MantenimientoPageFrame>
  );
}
