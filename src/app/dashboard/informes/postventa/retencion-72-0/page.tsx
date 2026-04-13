'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { Loader2 } from 'lucide-react';
import Modal from '@/components/shared/ui/Modal';
import { useToast } from '@/components/shared/ui/ToastContext';
import { Retencion72BarChart } from '@/modules/informes/postventa/components/Retencion72BarChart';
import {
  type Retencion720FiltroRow,
  type Retencion720Row,
  retencion720Service,
} from '@/modules/informes/postventa/services/retencion-72-0.service';

type Vista = 'general' | 'autos' | 'byc' | 'familia';
type TipoVehiculosModal = '12m' | 'anio' | null;

const TRAMOS = [
  { label: '12-0', p: 'p0_12', e: 'e0_12' },
  { label: '24-12', p: 'p13_24', e: 'e13_24' },
  { label: '36-24', p: 'p25_36', e: 'e25_36' },
  { label: '48-36', p: 'p37_48', e: 'e37_48' },
  { label: '60-48', p: 'p49_60', e: 'e49_60' },
  { label: '72-60', p: 'p61_72', e: 'e61_72' },
] as const;

function getPorcentaje(entradas: number, parque: number): number {
  if (!parque || parque <= 0) return 0;
  return (entradas / parque) * 100;
}

function normalize(row: Retencion720Row | Retencion720FiltroRow): Retencion720Row {
  return {
    tipoVh: row.tipoVh,
    p0_12: row.p0_12,
    e0_12: row.e0_12,
    p13_24: row.p13_24,
    e13_24: row.e13_24,
    p25_36: row.p25_36,
    e25_36: row.e25_36,
    p37_48: row.p37_48,
    e37_48: row.e37_48,
    p49_60: row.p49_60,
    e49_60: row.e49_60,
    p61_72: row.p61_72,
    e61_72: row.e61_72,
  };
}

function sumRows(rows: Retencion720Row[]): Retencion720Row {
  return rows.reduce<Retencion720Row>(
    (acc, row) => ({
      ...acc,
      p0_12: acc.p0_12 + row.p0_12,
      e0_12: acc.e0_12 + row.e0_12,
      p13_24: acc.p13_24 + row.p13_24,
      e13_24: acc.e13_24 + row.e13_24,
      p25_36: acc.p25_36 + row.p25_36,
      e25_36: acc.e25_36 + row.e25_36,
      p37_48: acc.p37_48 + row.p37_48,
      e37_48: acc.e37_48 + row.e37_48,
      p49_60: acc.p49_60 + row.p49_60,
      e49_60: acc.e49_60 + row.e49_60,
      p61_72: acc.p61_72 + row.p61_72,
      e61_72: acc.e61_72 + row.e61_72,
    }),
    {
      tipoVh: 'Total',
      p0_12: 0,
      e0_12: 0,
      p13_24: 0,
      e13_24: 0,
      p25_36: 0,
      e25_36: 0,
      p37_48: 0,
      e37_48: 0,
      p49_60: 0,
      e49_60: 0,
      p61_72: 0,
      e61_72: 0,
    },
  );
}

export default function Retencion720Page() {
  const { showError, showInfo, showSuccess } = useToast();
  const emptyInfoShown = useRef(false);
  const errorShown = useRef(false);

  const [vista, setVista] = useState<Vista>('general');
  const [filtroAutos, setFiltroAutos] = useState('Autos');
  const [filtroByC, setFiltroByC] = useState('B&C');
  const [modalFamilia, setModalFamilia] = useState(false);
  const [modalObjetivos, setModalObjetivos] = useState(false);
  const [modalVehiculos, setModalVehiculos] = useState<TipoVehiculosModal>(null);
  const [tipoFamilia, setTipoFamilia] = useState<'autos' | 'byc'>('autos');
  const [segmentoFamilia, setSegmentoFamilia] = useState('');
  const [familiasSeleccionadas, setFamiliasSeleccionadas] = useState<string[]>([]);
  const [objetivos, setObjetivos] = useState<Record<string, number>>({});

  const resumenQuery = useQuery({
    queryKey: ['retencion-72-0', 'resumen'],
    queryFn: () => retencion720Service.obtener(),
    staleTime: 60 * 1000,
  });

  const segmentosAutosQuery = useQuery({
    queryKey: ['retencion-72-0', 'segmentos', 'autos'],
    queryFn: () => retencion720Service.listarSegmentosAutos(),
    staleTime: 5 * 60 * 1000,
  });

  const segmentosByCQuery = useQuery({
    queryKey: ['retencion-72-0', 'segmentos', 'byc'],
    queryFn: () => retencion720Service.listarSegmentosByC(),
    staleTime: 5 * 60 * 1000,
  });

  const filtroAutosQuery = useQuery({
    queryKey: ['retencion-72-0', 'filtro', 'autos', filtroAutos],
    queryFn: () => retencion720Service.obtenerFiltroAutos(filtroAutos),
    enabled: vista === 'autos',
    staleTime: 60 * 1000,
  });

  const filtroByCQuery = useQuery({
    queryKey: ['retencion-72-0', 'filtro', 'byc', filtroByC],
    queryFn: () => retencion720Service.obtenerFiltroByC(filtroByC),
    enabled: vista === 'byc',
    staleTime: 60 * 1000,
  });

  const familiasQuery = useQuery({
    queryKey: ['retencion-72-0', 'familias', segmentoFamilia],
    queryFn: () => retencion720Service.listarFamilias(segmentoFamilia),
    enabled: modalFamilia && segmentoFamilia.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const familiasKey = useMemo(
    () => [...familiasSeleccionadas].sort(),
    [familiasSeleccionadas],
  );

  const filtroFamiliaQuery = useQuery({
    queryKey: ['retencion-72-0', 'familia', familiasKey],
    queryFn: () =>
      retencion720Service.obtenerFiltroFamilia(segmentoFamilia, familiasKey),
    enabled:
      vista === 'familia' &&
      segmentoFamilia.length > 0 &&
      familiasKey.length > 0,
    staleTime: 60 * 1000,
  });

  const modoComparacion = vista === 'autos' ? 'autos' : vista === 'byc' ? 'byc' : null;
  const filtroComparacion = vista === 'autos' ? filtroAutos : vista === 'byc' ? filtroByC : '';
  const comparacionQuery = useQuery({
    queryKey: ['retencion-72-0', 'comparacion', modoComparacion, filtroComparacion],
    queryFn: () =>
      retencion720Service.obtenerComparacion(
        modoComparacion as 'autos' | 'byc',
        filtroComparacion,
      ),
    enabled: modoComparacion != null,
    staleTime: 60 * 1000,
  });

  const vehiculos12Query = useQuery({
    queryKey: ['retencion-72-0', 'vehiculos', '12m'],
    queryFn: () => retencion720Service.obtenerVehiculos12Meses(1, 2000),
    enabled: modalVehiculos === '12m',
    staleTime: 10 * 60 * 1000,
  });

  const vehiculosAnioQuery = useQuery({
    queryKey: ['retencion-72-0', 'vehiculos', 'anio'],
    queryFn: () => retencion720Service.obtenerVehiculosAnoActual(1, 2000),
    enabled: modalVehiculos === 'anio',
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    const rows = resumenQuery.data ?? [];
    if (resumenQuery.isSuccess && rows.length === 0 && !emptyInfoShown.current) {
      emptyInfoShown.current = true;
      showInfo('No hay datos para mostrar en el informe de retención 72-0.');
    }
  }, [resumenQuery.isSuccess, resumenQuery.data, showInfo]);

  useEffect(() => {
    if (resumenQuery.isError && !errorShown.current) {
      errorShown.current = true;
      showError('No se pudo cargar el informe de retención 72-0.');
    }
  }, [resumenQuery.isError, showError]);

  const rows = useMemo(() => {
    if (vista === 'general') return (resumenQuery.data ?? []).map(normalize);
    if (vista === 'autos') return (filtroAutosQuery.data ?? []).map(normalize);
    if (vista === 'byc') return (filtroByCQuery.data ?? []).map(normalize);
    return (filtroFamiliaQuery.data ?? []).map(normalize);
  }, [
    vista,
    resumenQuery.data,
    filtroAutosQuery.data,
    filtroByCQuery.data,
    filtroFamiliaQuery.data,
  ]);

  const totalRow = useMemo(() => sumRows(rows), [rows]);

  const chartData = useMemo(() => {
    const principal = totalRow;
    const comparacionRows = (comparacionQuery.data?.comparacion ?? []) as Array<
      Retencion720Row | Retencion720FiltroRow
    >;
    const compTotal = comparacionRows.length > 0 ? sumRows(comparacionRows.map(normalize)) : null;
    return TRAMOS.map((t) => {
      const parque = principal[t.p];
      const entradas = principal[t.e];
      const valor = getPorcentaje(entradas, parque);
      const compValor =
        compTotal == null
          ? undefined
          : getPorcentaje(compTotal[t.e], compTotal[t.p]);
      return { label: t.label, valor, comparacion: compValor };
    });
  }, [totalRow, comparacionQuery.data]);

  const objetivosResultados = useMemo(
    () =>
      TRAMOS.map((t) => {
        const parque = totalRow[t.p];
        const entradas = totalRow[t.e];
        const actual = getPorcentaje(entradas, parque);
        const objetivo = objetivos[t.label] ?? 0;
        const faltantePct = objetivo > actual ? objetivo - actual : 0;
        const entradasObjetivo = parque * (objetivo / 100);
        const entradasFaltantes = Math.max(0, Math.round(entradasObjetivo - entradas));
        return { tramo: t.label, actual, objetivo, faltantePct, entradasFaltantes };
      }),
    [objetivos, totalRow],
  );

  const tablaLoading =
    (vista === 'general' && resumenQuery.isPending) ||
    (vista === 'autos' && filtroAutosQuery.isPending) ||
    (vista === 'byc' && filtroByCQuery.isPending) ||
    (vista === 'familia' && filtroFamiliaQuery.isPending);

  const exportarVehiculos = () => {
    const items =
      modalVehiculos === '12m'
        ? vehiculos12Query.data?.items ?? []
        : vehiculosAnioQuery.data?.items ?? [];
    if (items.length === 0) {
      showInfo('No hay datos para exportar.');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(items);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vehiculos');
    XLSX.writeFile(
      wb,
      modalVehiculos === '12m'
        ? 'retencion-72-0-vehiculos-12-meses.xlsx'
        : 'retencion-72-0-vehiculos-anio-actual.xlsx',
    );
    showSuccess('Archivo Excel generado correctamente.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold brand-text">Informe Retención 72 - 0</h1>
          <p className="text-gray-500 text-sm mt-1">
            Paridad funcional con filtros, objetivos, exportación y comparación.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button className="px-3 py-2 rounded border brand-border text-sm" onClick={() => setVista('general')}>General</button>
          <select
            className="px-3 py-2 rounded border text-sm"
            value={filtroAutos}
            onChange={(e) => {
              setFiltroAutos(e.target.value);
              setVista('autos');
            }}
          >
            <option value="Autos">General de Autos</option>
            {(segmentosAutosQuery.data ?? []).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            className="px-3 py-2 rounded border text-sm"
            value={filtroByC}
            onChange={(e) => {
              setFiltroByC(e.target.value);
              setVista('byc');
            }}
          >
            <option value="B&C">General de B&C</option>
            {(segmentosByCQuery.data ?? []).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button className="px-3 py-2 rounded border text-sm" onClick={() => setModalFamilia(true)}>Filtrar por familia</button>
          <button className="px-3 py-2 rounded border text-sm" onClick={() => setModalObjetivos(true)}>Objetivos</button>
          <button className="px-3 py-2 rounded border text-sm" onClick={() => setModalVehiculos('12m')}>Vehículos últimos 12 meses</button>
          <button className="px-3 py-2 rounded border text-sm" onClick={() => setModalVehiculos('anio')}>Vehículos año actual</button>
          <Link className="px-3 py-2 rounded border text-sm text-blue-700" href="/dashboard/informes/postventa/retencion-72-0/tabla-general">Tabla general</Link>
          <Link className="px-3 py-2 rounded border text-sm text-blue-700" href="/dashboard/informes/postventa/retencion-72-0/comparacion-vs">Comparación Vs</Link>
        </div>
      </div>

      <Retencion72BarChart
        title="Tendencia de retención por tramo"
        data={chartData}
        labelComparacion={comparacionQuery.data?.etiquetaComparacion ?? 'Comparación'}
      />

      <div className="bg-white rounded-xl shadow-sm border brand-border p-4 md:p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Resumen por tipo de vehículo(Total ventas)</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border-collapse">
            <thead>
              <tr className="bg-(--color-primary) text-white text-center">
                <th className="px-2 py-2 align-middle">Tipo</th>
                {TRAMOS.map((t) => (
                  <th key={`${t.label}-p`} className={`px-2 py-2 align-middle parque-${t.label.replace('-', '')}`}>{t.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tablaLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Cargando informe...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {rows.map((row) => (
                    <tr key={`${row.tipoVh}-${row.p0_12}-${row.e0_12}`} className="border-t text-center text-gray-800">
                      <td className="px-2 py-1 font-semibold text-center">{row.tipoVh}</td>
                      {TRAMOS.map((t) => (
                        <td key={`${row.tipoVh}-${t.label}`} className="px-2 py-1">
                          {row[t.p]}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td className="px-3 py-3 text-center text-gray-400 text-xs" colSpan={7}>
                        No hay datos para mostrar.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot className="border-t bg-slate-50">
                <tr className="text-center font-semibold">
                  <td className="px-2 py-1 text-center">Total</td>
                  {TRAMOS.map((t) => (
                    <td key={`tot-${t.label}`} className="px-2 py-1">
                      {totalRow[t.p]}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <Modal open={modalFamilia} onClose={() => setModalFamilia(false)} title="Filtrar por familia" width="680px">
        <div className="space-y-3">
          <div className="flex gap-2">
            <button className="px-2 py-1 border rounded text-xs" onClick={() => setTipoFamilia('autos')}>Autos</button>
            <button className="px-2 py-1 border rounded text-xs" onClick={() => setTipoFamilia('byc')}>B&C</button>
          </div>
          <select className="w-full border rounded px-2 py-2 text-sm" value={segmentoFamilia} onChange={(e) => setSegmentoFamilia(e.target.value)}>
            <option value="">Seleccione segmento</option>
            {((tipoFamilia === 'autos'
              ? segmentosAutosQuery.data
              : segmentosByCQuery.data) ?? []).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="max-h-52 overflow-auto border rounded p-2">
            {(familiasQuery.data ?? []).map((f) => (
              <label key={f} className="flex items-center gap-2 text-sm py-1">
                <input
                  type="checkbox"
                  checked={familiasSeleccionadas.includes(f)}
                  onChange={(e) =>
                    setFamiliasSeleccionadas((prev) =>
                      e.target.checked ? [...prev, f] : prev.filter((x) => x !== f),
                    )
                  }
                />
                {f}
              </label>
            ))}
          </div>
          <button
            className="px-3 py-2 rounded border text-sm"
            onClick={() => {
              setVista('familia');
              setModalFamilia(false);
            }}
          >
            Aplicar filtro
          </button>
        </div>
      </Modal>

      <Modal open={modalObjetivos} onClose={() => setModalObjetivos(false)} title="Verificar objetivos" width="760px">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="text-left border-b">
                <th className="py-1">Tramo</th>
                <th className="py-1">Actual</th>
                <th className="py-1">Meta %</th>
                <th className="py-1">% faltante</th>
                <th className="py-1">Entradas faltantes</th>
              </tr>
            </thead>
            <tbody>
              {objetivosResultados.map((r) => (
                <tr key={r.tramo} className="border-b">
                  <td className="py-1">{r.tramo}</td>
                  <td className="py-1">{r.actual.toFixed(1)}%</td>
                  <td className="py-1">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      className="border rounded px-2 py-1 w-24"
                      value={objetivos[r.tramo] ?? ''}
                      onChange={(e) =>
                        setObjetivos((prev) => ({
                          ...prev,
                          [r.tramo]: Number(e.target.value || 0),
                        }))
                      }
                    />
                  </td>
                  <td className="py-1">{r.faltantePct.toFixed(1)}%</td>
                  <td className="py-1">{r.entradasFaltantes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      <Modal
        open={modalVehiculos != null}
        onClose={() => setModalVehiculos(null)}
        title={modalVehiculos === '12m' ? 'Vehículos últimos 12 meses' : 'Vehículos año actual'}
        width="900px"
      >
        <div className="space-y-3">
          <div className="flex justify-end">
            <button className="px-3 py-2 rounded border text-sm" onClick={exportarVehiculos}>
              Exportar Excel
            </button>
          </div>
          <div className="max-h-[420px] overflow-auto border rounded">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-100 sticky top-0">
                <tr>
                  <th className="px-2 py-2 text-left">Placa</th>
                  <th className="px-2 py-2 text-left">Serie</th>
                  <th className="px-2 py-2 text-left">Código</th>
                  <th className="px-2 py-2 text-left">Familia</th>
                  <th className="px-2 py-2 text-left">Tipo</th>
                  <th className="px-2 py-2 text-left">Cumple retención</th>
                </tr>
              </thead>
              <tbody>
                {(modalVehiculos === '12m'
                  ? vehiculos12Query.data?.items
                  : vehiculosAnioQuery.data?.items
                )?.map((v) => (
                  <tr key={`${v.placa}-${v.codigo}`} className="border-t">
                    <td className="px-2 py-1">{v.placa ?? '-'}</td>
                    <td className="px-2 py-1">{v.serie ?? '-'}</td>
                    <td className="px-2 py-1">{v.codigo ?? '-'}</td>
                    <td className="px-2 py-1">{v.familia ?? '-'}</td>
                    <td className="px-2 py-1">{v.tipoVh ?? '-'}</td>
                    <td className="px-2 py-1">{v.cumpleRetencion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
}

