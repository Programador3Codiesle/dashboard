'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, Search } from 'lucide-react';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useEncuestasPageGuard } from '@/modules/encuestas/shared/hooks/useEncuestasPageGuard';
import {
  encuestasService,
  type SatisfaccionItem,
} from '@/modules/encuestas/shared/services/encuestas.service';
import { SATISFACCION_SUBMENU_ID } from '@/utils/constants';
import { useToast } from '@/components/ui/use-toast';

const PAGE_SIZE = 15;

export function SatisfaccionListadoGestion() {
  const { blocked } = useEncuestasPageGuard(SATISFACCION_SUBMENU_ID);
  const { showError } = useToast();
  const [items, setItems] = useState<SatisfaccionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (blocked) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await encuestasService.listarSatisfaccion();
        if (!cancelled) setItems(data);
      } catch (e) {
        showError(e instanceof Error ? e.message : 'No se pudo cargar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [blocked, showError]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (r) =>
        r.nit_real.toLowerCase().includes(term) ||
        r.nombres.toLowerCase().includes(term) ||
        r.numero.toLowerCase().includes(term) ||
        r.placa.toLowerCase().includes(term),
    );
  }, [items, q]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handlePageChange = useCallback((next: number) => {
    setPage(next);
  }, []);

  const inicioRango = totalItems === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const finRango = Math.min(safePage * PAGE_SIZE, totalItems);

  if (blocked) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="app-title-xl brand-text">Satisfacción</h1>
          <p className="text-sm text-muted-foreground">
            Encuestas de satisfacción respondidas (canal email/link)
          </p>
        </div>
        <Link
          href="/dashboard/encuestas"
          className="text-sm text-amber-700 hover:underline"
        >
          ← Volver a Encuestas
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
          placeholder="Buscar NIT, cliente, orden o placa..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-(--color-primary) text-white">
            <tr>
              <th className="px-3 py-2.5 text-left font-semibold">NIT</th>
              <th className="px-3 py-2.5 text-left font-semibold">Cliente</th>
              <th className="px-3 py-2.5 text-left font-semibold">N° Orden</th>
              <th className="px-3 py-2.5 text-left font-semibold">Placa</th>
              <th className="px-3 py-2.5 text-left font-semibold">Fecha</th>
              <th className="px-3 py-2.5 text-center font-semibold">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                  Sin registros
                </td>
              </tr>
            ) : (
              pageItems.map((row) => (
                <tr
                  key={`${row.numero}-${row.placa}-${row.fecha}`}
                  className="border-t border-gray-100"
                >
                  <td className="px-3 py-2">{row.nit_real}</td>
                  <td className="px-3 py-2">{row.nombres}</td>
                  <td className="px-3 py-2">{row.numero}</td>
                  <td className="px-3 py-2">{row.placa}</td>
                  <td className="px-3 py-2">{row.fecha || '—'}</td>
                  <td className="px-3 py-2 text-center">
                    <Link
                      href={`/dashboard/encuestas/satisfaccion/detalle?ot=${encodeURIComponent(row.numero)}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-(--color-primary) px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalItems > 0 && !loading && (
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
      </div>
    </div>
  );
}
