'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Eye, FileSpreadsheet, Search, Settings, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/components/ui/use-toast';
import {
  ComisionJefe,
  DetalleComisionJefe,
  JefePorSede,
  comisionesJefesService,
} from '@/modules/nomina/services/comisiones-jefes.service';

const sedes = [
  'Barranca',
  'Bocono',
  'Colision Bocono',
  'Colision Giron',
  'Diesel Giron',
  'Gasolina Giron',
  'Rosita',
];

function formatCurrency(value: number): string {
  return Math.round(Number(value || 0)).toLocaleString('es-CO');
}

export default function ComisionesJefesPage() {
  const { showError, showSuccess } = useToast();
  const [mes, setMes] = useState('');
  const [rows, setRows] = useState<ComisionJefe[]>([]);
  const [detalleRows, setDetalleRows] = useState<DetalleComisionJefe[]>([]);
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);
  const [titleDetalle, setTitleDetalle] = useState('');
  const [isValoresOpen, setIsValoresOpen] = useState(false);
  const [sede, setSede] = useState('');
  const [jefes, setJefes] = useState<JefePorSede[]>([]);
  const [jefeNit, setJefeNit] = useState('');
  const [utilidadSede, setUtilidadSede] = useState('');
  const [bonoNps, setBonoNps] = useState(false);
  const [bonoNpsInt, setBonoNpsInt] = useState(false);
  const [bonoUtilidad, setBonoUtilidad] = useState(false);
  const [bonoNpsDisabled, setBonoNpsDisabled] = useState(true);
  const [bonoNpsIntDisabled, setBonoNpsIntDisabled] = useState(true);
  const [bonoUtilidadDisabled, setBonoUtilidadDisabled] = useState(true);
  const [puedeActualizar, setPuedeActualizar] = useState(false);
  const [bonosInfo, setBonosInfo] = useState<{
    bonoNps: number;
    npsInterno: number;
    bonoUtilidad: number;
  } | null>(null);

  const inputClass =
    'border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white w-full';

  const listarMutation = useMutation({
    mutationFn: (month: string) => comisionesJefesService.listar(month),
    onSuccess: setRows,
    onError: () => showError('No fue posible cargar las comisiones de jefes.'),
  });

  const detalleMutation = useMutation({
    mutationFn: (params: { mes: number; anio: number; nit: string; sede: string }) =>
      comisionesJefesService.obtenerDetalle(params),
    onSuccess: (data) => {
      setDetalleRows(data);
      setIsDetalleOpen(true);
    },
    onError: () => showError('No fue posible cargar el detalle del jefe.'),
  });

  const jefesMutation = useMutation({
    mutationFn: (sedeValue: string) => comisionesJefesService.obtenerJefesPorSede(sedeValue),
    onSuccess: (data) => {
      setJefes(data);
      setJefeNit('');
    },
    onError: () => showError('No fue posible consultar los jefes por sede.'),
  });

  const checkMutation = useMutation({
    mutationFn: (params: { jefe: string; sede: string }) =>
      comisionesJefesService.checkValores(params.jefe, params.sede),
    onSuccess: (resp) => {
      const row = resp.data[0];
      const bono = resp.bono?.[0];
      if (!row) {
        setPuedeActualizar(false);
        showError(resp.message);
        return;
      }
      setBonoNps(row.bonoNps > 0);
      setBonoNpsInt(row.bonoNpsInterno > 0);
      setBonoUtilidad(row.bonoUtilidad > 0);
      setBonoNpsDisabled(row.bonoNps > 0);
      setBonoNpsIntDisabled(row.bonoNpsInterno > 0 || !bono || bono['NPS INTERNO'] === 0);
      setBonoUtilidadDisabled(row.bonoUtilidad > 0);
      setUtilidadSede(String(row.utilidadSede ?? ''));
      setBonosInfo(
        bono
          ? {
              bonoNps: bono['BONO NPS'],
              npsInterno: bono['NPS INTERNO'],
              bonoUtilidad: bono['BONO UTILIDAD'],
            }
          : null,
      );
      setPuedeActualizar(true);
      showSuccess(resp.message);
    },
    onError: () => {
      setPuedeActualizar(false);
      showError('No se pudo validar la información de bonos.');
    },
  });

  const actualizarMutation = useMutation({
    mutationFn: () =>
      comisionesJefesService.actualizarValores({
        comboJefes: jefeNit,
        sede,
        utilidadSede: utilidadSede ? Number(utilidadSede) : 0,
        bonoNps,
        bonoNpsInt,
        bonoUtilidad,
      }),
    onSuccess: (resp) => {
      if (resp.status) {
        showSuccess(resp.message);
        resetModalValores();
        setIsValoresOpen(false);
      } else {
        showError(resp.message);
      }
    },
    onError: () => showError('No fue posible actualizar los valores del jefe.'),
  });

  const resumenMes = useMemo(() => {
    if (!mes) return 'sin mes seleccionado';
    const [anio, month] = mes.split('-');
    return `${month}/${anio}`;
  }, [mes]);

  const resetModalValores = () => {
    setSede('');
    setJefes([]);
    setJefeNit('');
    setUtilidadSede('');
    setBonoNps(false);
    setBonoNpsInt(false);
    setBonoUtilidad(false);
    setBonoNpsDisabled(true);
    setBonoNpsIntDisabled(true);
    setBonoUtilidadDisabled(true);
    setPuedeActualizar(false);
    setBonosInfo(null);
  };

  const onBuscar = () => {
    if (!mes) {
      showError('Debes seleccionar un mes.');
      return;
    }
    listarMutation.mutate(mes);
  };

  const onAbrirDetalle = (row: ComisionJefe) => {
    if (!mes) {
      showError('Selecciona el mes antes de consultar detalle.');
      return;
    }
    const [anio, month] = mes.split('-');
    setTitleDetalle(`Detalle nómina jefe ${row.nit}`);
    detalleMutation.mutate({
      mes: Number(month),
      anio: Number(anio),
      nit: row.nit,
      sede: row.sede,
    });
  };

  const onExportarExcel = () => {
    if (rows.length === 0) {
      showError('No hay información para exportar.');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(
      rows.map((row) => ({
        Cedula: row.nit,
        Nombres: row.nombres,
        Sede: row.sede,
        'Facturacion Posventa': row.facturacionPosventa,
        Internas: row.internas,
        'Comision por Facturacion': row.comisionPorFacturacion,
        'Utilidad sede': row.utilidadSede,
        'Utilidad Neta': row.bonoUtilidad,
        'Utilidad Bruta Repuestos': row.utilidadRepuestos,
        'Comision Utilidad Bruta': row.comisionUtilidadBruta,
        'Bono NPS': row.bonoNps,
        'Bono NPS Interno': row.bonoNpsInterno,
        Total: row.total,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ComisionesJefes');
    XLSX.writeFile(wb, `comisiones-jefes-${mes || 'sin-mes'}.xlsx`);
  };

  const onExportarDetalle = () => {
    if (detalleRows.length === 0) {
      showError('No hay detalle para exportar.');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(detalleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DetalleJefes');
    XLSX.writeFile(wb, `detalle-comisiones-jefes-${mes || 'sin-mes'}.xlsx`);
  };

  const isBusyValores =
    jefesMutation.isPending || checkMutation.isPending || actualizarMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">Comisiones jefes</h1>
        <p className="text-gray-500 mt-1">Migración completa del flujo legacy a Next.js + NestJS.</p>
      </div>

      <div className="w-full bg-white rounded-2xl border border-gray-100 p-6 shadow-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Mes</label>
            <input type="month" className={inputClass} value={mes} onChange={(e) => setMes(e.target.value)} />
          </div>
          <button
            type="button"
            onClick={onBuscar}
            disabled={listarMutation.isPending}
            className="inline-flex items-center justify-center rounded-xl bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Search size={16} className="mr-2" />{' '}
            {listarMutation.isPending ? 'Generando...' : 'Generar nómina'}
          </button>
          <button type="button" onClick={() => setIsValoresOpen(true)} className="inline-flex items-center justify-center rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white">
            <Settings size={16} className="mr-2" /> Ingresar valores
          </button>
          <button
            type="button"
            onClick={onExportarExcel}
            className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet size={16} className="mr-2" /> Exportar Excel
          </button>
        </div>
        <p className="text-xs text-gray-500">{rows.length} registros para {resumenMes}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
        {listarMutation.isPending && <p className="text-sm text-gray-500">Cargando...</p>}
        {!listarMutation.isPending && rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-gray-700">No hay datos para el período seleccionado.</p>
            <p className="text-xs text-gray-500 mt-1">Selecciona otro mes o valida que existan registros cargados.</p>
          </div>
        )}
        {!listarMutation.isPending && rows.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-center font-semibold">Cedula</th>
                  <th className="px-3 py-2 text-center font-semibold">Nombres</th>
                  <th className="px-3 py-2 text-center font-semibold">Sede</th>
                  <th className="px-3 py-2 text-center font-semibold">Facturacion</th>
                  <th className="px-3 py-2 text-center font-semibold">Internas</th>
                  <th className="px-3 py-2 text-center font-semibold">Comision Fact.</th>
                  <th className="px-3 py-2 text-center font-semibold">Utilidad sede</th>
                  <th className="px-3 py-2 text-center font-semibold">Utilidad neta</th>
                  <th className="px-3 py-2 text-center font-semibold">Utilidad rep.</th>
                  <th className="px-3 py-2 text-center font-semibold">Comision utilidad</th>
                  <th className="px-3 py-2 text-center font-semibold">Bono NPS</th>
                  <th className="px-3 py-2 text-center font-semibold">Bono NPS interno</th>
                  <th className="px-3 py-2 text-center font-semibold">Total</th>
                  <th className="px-3 py-2 text-center font-semibold">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={`${row.nit}-${row.sede}`}>
                    <td className="px-3 py-1.5 text-center">{row.nit}</td>
                    <td className="px-3 py-1.5">{row.nombres}</td>
                    <td className="px-3 py-1.5 text-center">{row.sede}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.facturacionPosventa)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.internas)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.comisionPorFacturacion)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.utilidadSede)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.bonoUtilidad)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.utilidadRepuestos)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.comisionUtilidadBruta)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.bonoNps)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.bonoNpsInterno)}</td>
                    <td className="px-3 py-1.5 text-right font-semibold">{formatCurrency(row.total)}</td>
                    <td className="px-3 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => onAbrirDetalle(row)}
                        disabled={detalleMutation.isPending}
                        className="inline-flex items-center rounded-lg bg-sky-600 px-2 py-1 text-white disabled:opacity-60"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isDetalleOpen && (
        <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsDetalleOpen(false)} />
          <div className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-linear-to-r from-slate-50 to-white">
              <h2 className="text-xl font-bold brand-text tracking-tight">{titleDetalle}</h2>
              <div className="flex gap-2">
                <button type="button" onClick={onExportarDetalle} className="inline-flex items-center rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">
                  <FileSpreadsheet size={14} className="mr-1.5" /> Exportar detalle
                </button>
                <button type="button" onClick={() => setIsDetalleOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-x-auto">
              {detalleRows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
                  <p className="text-sm font-medium text-gray-700">Sin detalle disponible</p>
                  <p className="text-xs text-gray-500 mt-1">No se encontraron movimientos para este jefe y sede.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-center font-semibold">NIT</th>
                      <th className="px-3 py-2 text-center font-semibold">Nombres</th>
                      <th className="px-3 py-2 text-center font-semibold">Sede</th>
                      <th className="px-3 py-2 text-center font-semibold">Repuestos</th>
                      <th className="px-3 py-2 text-center font-semibold">Mano de obra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {detalleRows.map((item, idx) => (
                      <tr key={`${item.nit}-${idx}`}>
                        <td className="px-3 py-2 text-center">{item.nit}</td>
                        <td className="px-3 py-2">{item.nombres}</td>
                        <td className="px-3 py-2 text-center">{item.sede}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.repuestos)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.manoDeObra)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {isValoresOpen && (
        <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => {
              resetModalValores();
              setIsValoresOpen(false);
            }}
          />
          <div className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold brand-text tracking-tight">Ingresar valores comisiones jefes</h2>
              <button
                type="button"
                onClick={() => {
                  resetModalValores();
                  setIsValoresOpen(false);
                }}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">Sede</label>
                  <select
                    className={inputClass}
                    value={sede}
                    disabled={isBusyValores}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSede(value);
                      setJefes([]);
                      setJefeNit('');
                      setPuedeActualizar(false);
                      if (value) jefesMutation.mutate(value);
                    }}
                  >
                    <option value="">Seleccione</option>
                    {sedes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Jefe</label>
                  <select
                    className={inputClass}
                    value={jefeNit}
                    disabled={isBusyValores}
                    onChange={(e) => {
                      setJefeNit(e.target.value);
                      setPuedeActualizar(false);
                    }}
                  >
                    <option value="">Seleccione</option>
                    {jefes.map((j) => (
                      <option key={j.nit} value={j.nit}>{j.nombres}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Utilidad sede</label>
                  <input className={inputClass} type="number" value={utilidadSede} disabled={isBusyValores} onChange={(e) => setUtilidadSede(e.target.value)} />
                </div>
              </div>

              {bonosInfo && (
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50 text-sm">
                  Bono NPS: {formatCurrency(bonosInfo.bonoNps)} | NPS Interno: {formatCurrency(bonosInfo.npsInterno)} | Bono Utilidad: {formatCurrency(bonosInfo.bonoUtilidad)}
                </div>
              )}

              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={bonoNps} disabled={bonoNpsDisabled || isBusyValores} onChange={(e) => setBonoNps(e.target.checked)} />
                  Bono NPS
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={bonoNpsInt} disabled={bonoNpsIntDisabled || isBusyValores} onChange={(e) => setBonoNpsInt(e.target.checked)} />
                  Bono NPS Interno
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={bonoUtilidad} disabled={bonoUtilidadDisabled || isBusyValores} onChange={(e) => setBonoUtilidad(e.target.checked)} />
                  Bono Utilidad Neta
                </label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                disabled={isBusyValores}
                className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                onClick={() => {
                  if (!jefeNit || !sede) {
                    showError('Debes seleccionar sede y jefe.');
                    return;
                  }
                  checkMutation.mutate({ jefe: jefeNit, sede });
                }}
              >
                {checkMutation.isPending ? 'Consultando...' : 'Consultar'}
              </button>
              <button
                type="button"
                disabled={isBusyValores || !puedeActualizar}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                onClick={() => actualizarMutation.mutate()}
              >
                {actualizarMutation.isPending ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
