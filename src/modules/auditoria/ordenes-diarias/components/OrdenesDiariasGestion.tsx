'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useToast } from '@/components/ui/use-toast';
import { useAuditoriaPageGuard } from '@/modules/auditoria/shared/hooks/useAuditoriaPageGuard';
import { BODEGAS_AUDITORIA_BASE } from '@/modules/auditoria/shared/constants/bodegas';
import { auditoriaService } from '@/modules/auditoria/shared/services/auditoria.service';
import { CONTROL_ORDENES_DIARIAS_SUBMENU_ID } from '@/utils/constants';

const PAGE_SIZE = 15;

type Row = Awaited<ReturnType<typeof auditoriaService.ordenesDiarias>>[number];

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

export function OrdenesDiariasGestion() {
  const { blocked } = useAuditoriaPageGuard(CONTROL_ORDENES_DIARIAS_SUBMENU_ID);
  const { showError } = useToast();
  const [fecha, setFecha] = useState(todayYmd);
  const [bodega, setBodega] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, safePage]);

  const handlePageChange = useCallback((p: number) => setPage(p), []);

  async function buscar() {
    if (!fecha || !bodega) {
      showError('Seleccione fecha y bodega');
      return;
    }
    setLoading(true);
    try {
      const data = await auditoriaService.ordenesDiarias(fecha, bodega);
      setRows(data);
      setPage(1);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Error al consultar');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  if (blocked) return null;

  return (
    <div className="space-y-4">
      <Header title="Control de Órdenes Diarias" />
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-4 shadow-sm">
        <label className="text-sm">
          Fecha
          <input
            type="date"
            max={todayYmd()}
            className="mt-1 block rounded border px-3 py-2"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </label>
        <label className="text-sm min-w-[220px]">
          Bodega
          <select
            className="mt-1 block w-full rounded border px-3 py-2"
            value={bodega}
            onChange={(e) => setBodega(e.target.value)}
          >
            <option value="">Seleccione...</option>
            {BODEGAS_AUDITORIA_BASE.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={buscar}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Search className="h-4 w-4" />
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      <TableCard>
        <table className="min-w-full text-sm">
          <thead className="bg-(--color-primary) text-white">
            <tr>
              {[
                'NOMBRES',
                'MANT. PREVENTIVO',
                'MANT. CORRECTIVO',
                'GARANTÍA',
                'RETORNO',
                'COLISIÓN',
                'INTERNO',
              ].map((h) => (
                <th key={h} className="px-3 py-2.5 text-center font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <Empty colSpan={7} text="Cargando..." />
            ) : pageRows.length === 0 ? (
              <Empty colSpan={7} text="Sin registros. Use los filtros para consultar." />
            ) : (
              pageRows.map((r, i) => (
                <tr key={`${r.nombres}-${i}`} className="border-t border-gray-100">
                  <td className="px-3 py-2">{r.nombres}</td>
                  <td className="px-3 py-2 text-center">{r.mantenimiento_preventivo}</td>
                  <td className="px-3 py-2 text-center">{r.mantenimiento_correctivo}</td>
                  <td className="px-3 py-2 text-center">{r.garantia}</td>
                  <td className="px-3 py-2 text-center">{r.retorno}</td>
                  <td className="px-3 py-2 text-center">{r.colision}</td>
                  <td className="px-3 py-2 text-center">{r.interno}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {rows.length > 0 && (
          <Pager
            total={rows.length}
            page={safePage}
            totalPages={totalPages}
            onChange={handlePageChange}
          />
        )}
      </TableCard>
    </div>
  );
}

function Header({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="app-title-xl brand-text">{title}</h1>
      <Link href="/dashboard/auditoria" className="text-sm text-amber-700 hover:underline">
        ← Volver a Auditoría
      </Link>
    </div>
  );
}

function TableCard({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      {children}
    </div>
  );
}

function Empty({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-8 text-center text-gray-500">
        {text}
      </td>
    </tr>
  );
}

function Pager({
  total,
  page,
  totalPages,
  onChange,
}: {
  total: number;
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const inicio = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const fin = Math.min(page * PAGE_SIZE, total);
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-gray-500">
        Mostrando {inicio}–{fin} de {total} ({PAGE_SIZE} por página)
      </p>
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onChange={onChange} />
      )}
    </div>
  );
}
