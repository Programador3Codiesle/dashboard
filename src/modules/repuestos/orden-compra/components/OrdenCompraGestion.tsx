'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getXlsx } from '@/utils/export-xlsx';
import { useAuth } from '@/core/auth/hooks/useAuth';
import Modal from '@/components/shared/ui/Modal';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useToast } from '@/components/ui/use-toast';
import { RepuestosPageFrame } from '@/modules/repuestos/components/RepuestosPageFrame';
import { REPUESTOS_COPY } from '@/modules/repuestos/constants';
import {
  btnPrimaryClass,
  inputClass,
} from '@/modules/repuestos/shared/constants/ui';
import { useRepuestosPageGuard } from '@/modules/repuestos/shared/hooks/useRepuestosPageGuard';
import { getErrorMessage } from '@/modules/repuestos/shared/utils/get-error-message';
import { ORDEN_COMPRA_SUBMENU_ID } from '@/utils/constants';
import { ordenCompraService, OrdenCompraItem } from '../services/orden-compra.service';

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function inicioMesISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

const ITEMS_VACIOS: OrdenCompraItem[] = [];

export function OrdenCompraGestion() {
  const { blocked } = useRepuestosPageGuard(ORDEN_COMPRA_SUBMENU_ID);
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const puedeAuth = user?.perfil_postventa === '1' || user?.perfil_postventa === '20';
  const [fechaIni, setFechaIni] = useState(inicioMesISO());
  const [fechaFin, setFechaFin] = useState(hoyISO());
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    fechaIni: inicioMesISO(),
    fechaFin: hoyISO(),
  });
  const [buscar, setBuscar] = useState(0);
  const [seleccion, setSeleccion] = useState<Record<string, boolean>>({});
  const [modalPresupuesto, setModalPresupuesto] = useState(false);
  const [fechaMes, setFechaMes] = useState(new Date().toISOString().slice(0, 7));
  const [presupuesto, setPresupuesto] = useState('');
  const [compras, setCompras] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 10;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['repuestos', 'orden-compra', filtrosAplicados.fechaIni, filtrosAplicados.fechaFin, buscar],
    queryFn: () => ordenCompraService.listar(filtrosAplicados.fechaIni, filtrosAplicados.fechaFin),
    enabled: buscar > 0,
  });

  const items = data?.items ?? ITEMS_VACIOS;
  const totalPaginas = Math.max(1, Math.ceil(items.length / registrosPorPagina));
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const inicio = (paginaSegura - 1) * registrosPorPagina;
  const paginatedItems = items.slice(inicio, inicio + registrosPorPagina);

  const seleccionados = useMemo(
    () =>
      items.filter((i) => seleccion[`${i.numeroOc}-${i.codigo}`]).map((i) => ({
        numeroOc: i.numeroOc,
        codigo: i.codigo,
      })),
    [items, seleccion],
  );

  const autorizar = useMutation({
    mutationFn: () => ordenCompraService.autorizar(seleccionados),
    onSuccess: () => { showSuccess('Órdenes autorizadas'); refetch(); setSeleccion({}); },
    onError: (e: unknown) => showError(getErrorMessage(e, 'No se pudo autorizar')),
  });

  const denegar = useMutation({
    mutationFn: () => ordenCompraService.denegar(seleccionados),
    onSuccess: () => { showSuccess('Órdenes denegadas'); refetch(); setSeleccion({}); },
    onError: (e: unknown) => showError(getErrorMessage(e, 'No se pudo denegar')),
  });

  const guardarPresupuesto = useMutation({
    mutationFn: () =>
      ordenCompraService.guardarPresupuesto({
        fechaMes,
        presupuesto: presupuesto ? Number(presupuesto.replace(/\./g, '')) : undefined,
        compras: compras ? Number(compras.replace(/\./g, '')) : undefined,
      }),
    onSuccess: () => { showSuccess('Presupuesto guardado'); setModalPresupuesto(false); refetch(); },
    onError: (e: unknown) => showError(getErrorMessage(e, 'No se pudo guardar presupuesto')),
  });

  const exportarExcel = async () => {
    const XLSX = await getXlsx();
    const rows = items.map((i) => ({
      Fecha: i.fechaOc,
      Bodega: i.bodega,
      Orden: i.numeroOc,
      Autorizado: i.autorizadoLabel,
      Codigo: i.codigo,
      Repuesto: i.repuesto,
      Cantidad: i.cantidad,
      'Costo total': i.costoTotal,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'OC');
    XLSX.writeFile(wb, 'ordenes-compra-repuestos.xlsx');
  };

  const rowClass = (item: OrdenCompraItem) =>
    item.denegado ? 'bg-red-50' : 'bg-green-50';

  if (blocked) return null;

  return (
    <RepuestosPageFrame
      title={REPUESTOS_COPY.ordenCompra.title}
      description={REPUESTOS_COPY.ordenCompra.description}
    >
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 shadow-sm space-y-3">
        <div className="app-form-grid-2">
        <div>
          <label htmlFor="repuestos-oc-desde" className="text-sm text-gray-600">Desde</label>
          <input id="repuestos-oc-desde" data-testid="repuestos-oc-desde" type="date" className={inputClass} value={fechaIni} onChange={(e) => setFechaIni(e.target.value)} />
        </div>
        <div>
          <label htmlFor="repuestos-oc-hasta" className="text-sm text-gray-600">Hasta</label>
          <input id="repuestos-oc-hasta" data-testid="repuestos-oc-hasta" type="date" className={inputClass} value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          data-testid="repuestos-oc-buscar"
          className={btnPrimaryClass}
          onClick={() => {
            setFiltrosAplicados({ fechaIni, fechaFin });
            setBuscar((prev) => prev + 1);
            setPaginaActual(1);
            refetch();
          }}
        >
          Buscar
        </button>
        <button
          type="button"
          className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition-colors"
          onClick={exportarExcel}
        >
          Excel
        </button>
        {puedeAuth && (
          <>
            <button
              type="button"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl brand-bg px-4 py-2 text-sm font-semibold text-white shadow-sm brand-bg-hover transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!seleccionados.length}
              onClick={() => autorizar.mutate()}
            >
              Autorizar
            </button>
            <button
              type="button"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!seleccionados.length}
              onClick={() => denegar.mutate()}
            >
              Denegar
            </button>
            <button type="button" className={btnPrimaryClass} onClick={() => setModalPresupuesto(true)}>Nuevo presupuesto</button>
          </>
        )}
        {(isLoading || (buscar > 0 && data == null)) && (
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-(--color-primary)" />
            Cargando datos...
          </div>
        )}
        </div>
      </div>

      <div className="app-kpi-grid-3">
        {[
          { label: 'Presupuesto', value: data?.presupuesto ?? 0 },
          { label: 'Compras realizadas', value: data?.compras ?? 0 },
          { label: 'Compras autorizadas', value: data?.costoTotalAutorizado ?? 0 },
        ].map((box) => (
          <div key={box.label} className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-sm text-gray-500">{box.label}</p>
            <p className="text-xl font-bold brand-text">{box.value.toLocaleString('es-CO')}</p>
          </div>
        ))}
      </div>

      <div data-testid="repuestos-oc-table" className="app-table-scroll">
        <table className="w-full min-w-[1800px] text-[11px]">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {['Fecha', 'Bodega', 'N° OC', 'Auth', 'Notas', 'Código', 'Repuesto', 'Cant', 'Costo und', 'Costo total', 'Girón', 'Chevropartes', 'Barranca', 'Rosita', 'Villa', 'Dieselco Cúcuta', 'Stock seg.'].map((h) => (
                <th key={h} className="px-1 py-2 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={17} className="py-8 text-center">Cargando...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={17} className="py-8 text-center">Sin datos</td></tr>
            ) : (
              paginatedItems.map((item, i) => {
                const identityKey = `${item.numeroOc}-${item.codigo}`;
                const rowKey = `${identityKey}-${inicio + i}`;
                return (
                  <tr key={rowKey} className={`border-t ${rowClass(item)}`}>
                    <td className="px-1 py-1">{String(item.fechaOc).slice(0, 10)}</td>
                    <td className="px-1 py-1 text-center">{item.bodega}</td>
                    <td className="px-1 py-1 text-center">{item.numeroOc}</td>
                    <td className="px-1 py-1 text-center">
                      {puedeAuth ? (
                        <input
                          type="checkbox"
                          checked={!!seleccion[identityKey]}
                          onChange={(e) => setSeleccion((p) => ({ ...p, [identityKey]: e.target.checked }))}
                        />
                      ) : (
                        item.autorizadoLabel
                      )}
                    </td>
                    <td className="px-1 py-1">{item.notas}</td>
                    <td className="px-1 py-1">{item.codigo}</td>
                    <td className="px-1 py-1">{item.repuesto}</td>
                    <td className="px-1 py-1 text-center">{item.cantidad}</td>
                    <td className="px-1 py-1 text-right">{item.costoUnitario.toFixed(2)}</td>
                    <td className="px-1 py-1 text-right">{item.costoTotal.toFixed(2)}</td>
                    <td className="px-1 py-1 text-center">{item.giron}</td>
                    <td className="px-1 py-1 text-center">{item.chevropartes}</td>
                    <td className="px-1 py-1 text-center">{item.barranca}</td>
                    <td className="px-1 py-1 text-center">{item.rosita}</td>
                    <td className="px-1 py-1 text-center">{item.villa}</td>
                    <td className="px-1 py-1 text-center">{item.solochevrolet}</td>
                    <td className="px-1 py-1 text-center">{item.stockSeguridad}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <p className="text-sm text-gray-600">
            Mostrando {inicio + 1}-{Math.min(inicio + registrosPorPagina, items.length)} de {items.length} registros
          </p>
          <Pagination
            currentPage={paginaSegura}
            totalPages={totalPaginas}
            onChange={setPaginaActual}
          />
        </div>
      )}

      <Modal open={modalPresupuesto} onClose={() => setModalPresupuesto(false)} title="Cargar presupuesto">
        <div className="space-y-3">
          <input type="month" className={inputClass} value={fechaMes} onChange={(e) => setFechaMes(e.target.value)} />
          <input className={inputClass} placeholder="Presupuesto" value={presupuesto} onChange={(e) => setPresupuesto(e.target.value)} />
          <input className={inputClass} placeholder="Compras" value={compras} onChange={(e) => setCompras(e.target.value)} />
          <button type="button" className={btnPrimaryClass} onClick={() => guardarPresupuesto.mutate()}>Guardar</button>
        </div>
      </Modal>
    </div>
    </RepuestosPageFrame>
  );
}
