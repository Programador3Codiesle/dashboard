'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { useAuth } from '@/core/auth/hooks/useAuth';
import Modal from '@/components/shared/ui/Modal';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useToast } from '@/components/ui/use-toast';
import {
  btnPrimaryClass,
  btnSecondaryClass,
  inputClass,
} from '@/modules/repuestos/shared/constants/ui';
import { ordenCompraService, OrdenCompraItem } from '../services/orden-compra.service';

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function inicioMesISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export function OrdenCompraGestion() {
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

  const items = data?.items ?? [];
  const totalPaginas = Math.max(1, Math.ceil(items.length / registrosPorPagina));
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const paginatedItems = items.slice(inicio, inicio + registrosPorPagina);

  useEffect(() => {
    setPaginaActual(1);
  }, [items.length, buscar]);

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
    onError: (e: Error) => showError(e.message),
  });

  const denegar = useMutation({
    mutationFn: () => ordenCompraService.denegar(seleccionados),
    onSuccess: () => { showSuccess('Órdenes denegadas'); refetch(); setSeleccion({}); },
    onError: (e: Error) => showError(e.message),
  });

  const guardarPresupuesto = useMutation({
    mutationFn: () =>
      ordenCompraService.guardarPresupuesto({
        fechaMes,
        presupuesto: presupuesto ? Number(presupuesto.replace(/\./g, '')) : undefined,
        compras: compras ? Number(compras.replace(/\./g, '')) : undefined,
      }),
    onSuccess: () => { showSuccess('Presupuesto guardado'); setModalPresupuesto(false); refetch(); },
    onError: (e: Error) => showError(e.message),
  });

  const exportarExcel = () => {
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

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-sm text-gray-600">Desde</label>
          <input type="date" className={inputClass} value={fechaIni} onChange={(e) => setFechaIni(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-600">Hasta</label>
          <input type="date" className={inputClass} value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        </div>
        <button
          type="button"
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
          className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition-colors"
          onClick={exportarExcel}
        >
          Excel
        </button>
        {puedeAuth && (
          <>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!seleccionados.length}
              onClick={() => autorizar.mutate()}
            >
              Autorizar
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm overflow-x-auto max-h-[65vh]">
        <table className="min-w-full text-[11px]">
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
              paginatedItems.map((item) => {
                const key = `${item.numeroOc}-${item.codigo}`;
                return (
                  <tr key={key} className={`border-t ${rowClass(item)}`}>
                    <td className="px-1 py-1">{String(item.fechaOc).slice(0, 10)}</td>
                    <td className="px-1 py-1 text-center">{item.bodega}</td>
                    <td className="px-1 py-1 text-center">{item.numeroOc}</td>
                    <td className="px-1 py-1 text-center">
                      {puedeAuth ? (
                        <input
                          type="checkbox"
                          checked={!!seleccion[key]}
                          onChange={(e) => setSeleccion((p) => ({ ...p, [key]: e.target.checked }))}
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
            currentPage={paginaActual}
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
  );
}
