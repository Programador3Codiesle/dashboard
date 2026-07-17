'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useToast } from '@/components/ui/use-toast';
import { useAuditoriaPageGuard } from '@/modules/auditoria/shared/hooks/useAuditoriaPageGuard';
import { auditoriaService } from '@/modules/auditoria/shared/services/auditoria.service';
import { ENTREGAS_AUDITORIA_SUBMENU_ID } from '@/utils/constants';

const PAGE_SIZE = 15;
const MESES = [
  '',
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

type Row = Awaited<ReturnType<typeof auditoriaService.entregas>>[number];

function colorPromedio(p: number): string {
  if (p > 100) return 'bg-emerald-500';
  if (p > 50) return 'bg-sky-500';
  if (p > 20) return 'bg-amber-400';
  return 'bg-red-500';
}

export function EntregasGestion() {
  const { blocked } = useAuditoriaPageGuard(ENTREGAS_AUDITORIA_SUBMENU_ID);
  const { showError } = useToast();
  const [ano, setAno] = useState(String(new Date().getFullYear()));
  const [tipo, setTipo] = useState<1 | 2 | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [titulo, setTitulo] = useState('');

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, safePage]);
  const handlePageChange = useCallback((p: number) => setPage(p), []);

  async function cargar(t: 1 | 2) {
    const year = Number(ano);
    if (!year || year < 2022) {
      showError('Ingrese un año válido');
      return;
    }
    setTipo(t);
    setLoading(true);
    try {
      const data = await auditoriaService.entregas(year, t);
      setRows(data);
      setTitulo(t === 1 ? 'Vehículos livianos' : 'Vehículos pesados');
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="app-title-xl brand-text">Entregas por tipo de vehículos</h1>
        <Link href="/dashboard/auditoria" className="text-sm text-amber-700 hover:underline">
          ← Volver a Auditoría
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border bg-white p-4 shadow-sm">
        <input
          type="number"
          min={2022}
          max={2100}
          className="w-28 rounded border px-3 py-2 text-sm"
          value={ano}
          onChange={(e) => setAno(e.target.value.slice(0, 4))}
        />
        <button
          type="button"
          onClick={() => cargar(1)}
          className={`rounded-md border px-4 py-2 text-sm font-medium ${
            tipo === 1 ? 'bg-emerald-600 text-white' : 'border-emerald-600 text-emerald-700'
          }`}
        >
          Vehículos livianos
        </button>
        <button
          type="button"
          onClick={() => cargar(2)}
          className={`rounded-md border px-4 py-2 text-sm font-medium ${
            tipo === 2 ? 'bg-emerald-600 text-white' : 'border-emerald-600 text-emerald-700'
          }`}
        >
          Vehículos pesados
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
        {[
          { cls: 'bg-emerald-500', label: 'Mayor a 100' },
          { cls: 'bg-sky-500', label: 'Mayor a 50 y menor a 100' },
          { cls: 'bg-amber-400', label: 'Mayor a 20 y menor a 50' },
          { cls: 'bg-red-500', label: 'Menor a 20' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <span className={`inline-block h-5 w-5 rounded-full ${l.cls}`} />
            {l.label}
          </div>
        ))}
      </div>

      {titulo && (
        <h2 className="text-center text-lg font-semibold text-gray-700">{titulo}</h2>
      )}

      <div className="overflow-x-auto rounded-2xl border bg-white p-4 shadow-sm">
        <table className="min-w-full text-sm text-center">
          <thead className="bg-(--color-primary) text-white">
            <tr>
              <th className="px-3 py-2.5">Mes</th>
              <th className="px-3 py-2.5">Entregas</th>
              <th className="px-3 py-2.5">Segunda entrega</th>
              <th className="px-3 py-2.5">Promedio</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-gray-500">
                  No se encontraron registros. Use los filtros de consulta.
                </td>
              </tr>
            ) : (
              pageRows.map((r) => (
                <tr key={r.mes} className="border-t">
                  <td className="px-3 py-2">{MESES[r.mes] ?? r.mes}</td>
                  <td className="px-3 py-2">{r.entregas}</td>
                  <td className="px-3 py-2">{r.segunda_entrega}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex min-w-[3rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold text-white ${colorPromedio(r.promedio)}`}
                    >
                      {r.promedio.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {rows.length > 0 && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              {rows.length} registro(s)
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
