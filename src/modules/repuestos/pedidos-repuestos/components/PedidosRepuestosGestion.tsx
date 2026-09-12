'use client';

import { FormEvent, useState } from 'react';
import { RepuestosPageFrame } from '@/modules/repuestos/components/RepuestosPageFrame';
import { REPUESTOS_COPY } from '@/modules/repuestos/constants';
import {
  btnPrimaryClass,
  inputClass,
} from '@/modules/repuestos/shared/constants/ui';
import { useRepuestosPageGuard } from '@/modules/repuestos/shared/hooks/useRepuestosPageGuard';
import { getErrorMessage } from '@/modules/repuestos/shared/utils/get-error-message';
import { usePedidosRepuestos } from '../hooks/usePedidosRepuestos';
import type { PedidoRepuestoItem } from '../services/pedidos-repuestos.service';

const PEDIDOS_VACIOS: PedidoRepuestoItem[] = [];

function formatValor(value: number): string {
  return value.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatFechaHora(value: string | null): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('es-CO');
}

export function PedidosRepuestosGestion() {
  const { blocked } = useRepuestosPageGuard();
  const [buscar, setBuscar] = useState('');
  const [q, setQ] = useState('');
  const query = usePedidosRepuestos(!blocked, q);
  const items = query.data ?? PEDIDOS_VACIOS;
  const buscando = query.isFetching && !query.isLoading;

  const aplicarBusqueda = (e: FormEvent) => {
    e.preventDefault();
    const termino = buscar.trim();
    if (termino === q) {
      void query.refetch();
      return;
    }
    setQ(termino);
  };

  if (blocked) return null;

  return (
    <RepuestosPageFrame
      title={REPUESTOS_COPY.pedidosRepuestos.title}
      description={REPUESTOS_COPY.pedidosRepuestos.description}
    >
      <div className="space-y-4">
        <form
          className="bg-white brand-card-elevated rounded-2xl border brand-border-active p-4 sm:p-5"
          onSubmit={aplicarBusqueda}
        >
          <label htmlFor="pedidos-repuestos-buscar" className="block text-xs font-semibold text-gray-600 mb-1">
            Buscar
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              id="pedidos-repuestos-buscar"
              data-testid="repuestos-pedidos-buscar"
              className={inputClass}
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              placeholder="Número, cliente, vendedor o bodega"
            />
            <button
              type="submit"
              data-testid="repuestos-pedidos-buscar-btn"
              className={btnPrimaryClass}
            >
              Buscar
            </button>
          </div>
          {buscando ? (
            <p
              data-testid="repuestos-pedidos-buscando"
              className="mt-2 text-xs text-gray-500"
            >
              Buscando...
            </p>
          ) : null}
        </form>

        <div className="bg-white brand-card-elevated rounded-2xl border brand-border-active overflow-hidden">
          {query.isLoading ? (
            <p className="px-4 py-6 text-sm text-gray-500">Cargando pedidos...</p>
          ) : query.isError ? (
            <p className="px-4 py-6 text-sm text-red-600">
              {getErrorMessage(query.error, 'No se pudieron cargar los pedidos')}
            </p>
          ) : (
            <div data-testid="repuestos-pedidos-table" className="app-table-scroll">
              <table className="w-full min-w-[960px] text-sm">
                <thead className="brand-bg text-white">
                  <tr>
                    <th className="px-3 py-2.5 text-center font-semibold">Número</th>
                    <th className="px-3 py-2.5 text-center font-semibold">NIT cliente</th>
                    <th className="px-3 py-2.5 text-left font-semibold">Cliente</th>
                    <th className="px-3 py-2.5 text-center font-semibold">NIT vendedor</th>
                    <th className="px-3 py-2.5 text-left font-semibold">Vendedor</th>
                    <th className="px-3 py-2.5 text-left font-semibold">Bodega</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Valor total</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-4 text-center text-gray-500">
                        No hay pedidos intranet.
                      </td>
                    </tr>
                  ) : (
                    items.map((row) => (
                      <tr key={row.numero} className="border-b border-gray-50">
                        <td className="px-3 py-2 text-center">{row.numero}</td>
                        <td className="px-3 py-2 text-center">{row.nitCliente}</td>
                        <td className="px-3 py-2">{row.cliente}</td>
                        <td className="px-3 py-2 text-center">{row.nitVendedor}</td>
                        <td className="px-3 py-2">{row.vendedor}</td>
                        <td className="px-3 py-2">{row.bodega}</td>
                        <td className="px-3 py-2 text-right">{formatValor(row.valorTotal)}</td>
                        <td className="px-3 py-2 text-right">{formatFechaHora(row.fechaHora)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RepuestosPageFrame>
  );
}
