'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import ConfirmModal from '@/components/shared/ui/ConfirmModal';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useToast } from '@/components/ui/use-toast';
import { useMantenimientoPageGuard } from '@/modules/mantenimiento/shared/hooks/useMantenimientoPageGuard';
import { mantenimientoService } from '@/modules/mantenimiento/shared/services/mantenimiento.service';
import { MTTO_PREVENTIVO_SUBMENU_ID } from '@/utils/constants';

const PAGE_SIZE = 10;

const btnBase =
  'inline-flex items-center justify-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90';

export function MttoPreventivoListadoGestion() {
  const { blocked } = useMantenimientoPageGuard(MTTO_PREVENTIVO_SUBMENU_ID);
  const { showError, showSuccess } = useToast();
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    try {
      setRows(await mantenimientoService.listadoPreventivo());
      setPage(1);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (blocked) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocked]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, safePage]);
  const onPage = useCallback((p: number) => setPage(p), []);

  async function handleConfirmEliminar() {
    if (confirmId == null) return;
    const id = confirmId;
    setConfirmId(null);
    setDeletingId(id);
    try {
      await mantenimientoService.eliminarOrden(id);
      showSuccess('Eliminada');
      await load();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Error');
    } finally {
      setDeletingId(null);
    }
  }

  if (blocked) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="app-title-xl brand-text">Listado OT preventivas pendientes</h1>
        <Link
          href="/dashboard/mantenimiento/mtto-preventivo"
          className="text-sm text-amber-700 hover:underline"
        >
          ← Volver al cronograma
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white p-4 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-(--color-primary) text-white">
            <tr>
              {['Código', 'Equipo', 'Bodega', 'Fecha req.', 'Descripción', 'Acciones'].map((h) => (
                <th key={h} className="px-2 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  Sin pendientes
                </td>
              </tr>
            ) : (
              pageRows.map((r) => {
                const id = Number(r.id_mantenimientos);
                const busy = deletingId === id;
                return (
                  <tr key={id} className="border-t text-center">
                    <td className="px-2 py-2">{String(r.codigo)}</td>
                    <td className="px-2 py-2 text-left">{String(r.nombre_equipo)}</td>
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
                        className={`${btnBase} bg-red-600 disabled:opacity-50`}
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
        {rows.length > 0 && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-gray-600">{rows.length} registros</span>
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
        onConfirm={() => void handleConfirmEliminar()}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
