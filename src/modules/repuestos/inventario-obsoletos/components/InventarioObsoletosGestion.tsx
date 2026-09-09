'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  inventarioObsoletosService,
  InventarioObsoletoDetalleRow,
  InventarioObsoletoResumenRow,
  TipoInventarioObsoleto,
} from '@/modules/informes/postventa/services/inventario-obsoletos.service';
import {
  formatCantidadCo,
  formatNumeroCo,
} from '@/modules/informes/postventa/format-cantidad-co';
import { useToast } from '@/components/ui/use-toast';
import Modal from '@/components/shared/ui/Modal';
import { Pagination } from '@/components/shared/ui/Pagination';
import { getXlsx } from '@/utils/export-xlsx';
import { Loader2 } from 'lucide-react';
import { RepuestosPageFrame } from '@/modules/repuestos/components/RepuestosPageFrame';
import { REPUESTOS_COPY } from '@/modules/repuestos/constants';
import { useRepuestosPageGuard } from '@/modules/repuestos/shared/hooks/useRepuestosPageGuard';
import { INVENTARIO_OBSOLETOS_SUBMENU_ID } from '@/utils/constants';

interface RowExtendido extends InventarioObsoletoDetalleRow {
  descuento?: number | null;
  nuevoPvp?: number | null;
  nuevoMargen?: number | null;
}

const PAGE_SIZE = 10;

function claveFila(row: { codigo: string; bodega: number }) {
  return `${row.codigo}-${row.bodega}`;
}

function aplicarDescuento(
  row: InventarioObsoletoDetalleRow,
  descuento: number | null,
): RowExtendido {
  if (descuento == null) {
    return { ...row, descuento: null, nuevoPvp: null, nuevoMargen: null };
  }
  const nuevoPvp = row.pvpAntesIva * (1 - descuento / 100);
  const nuevoMargen =
    ((nuevoPvp - row.costo) / (nuevoPvp === 0 ? 1 : nuevoPvp)) * 100;
  return { ...row, descuento, nuevoPvp, nuevoMargen };
}

export function InventarioObsoletosGestion() {
  const { blocked } = useRepuestosPageGuard(INVENTARIO_OBSOLETOS_SUBMENU_ID);
  const { showInfo } = useToast();
  const [openModal, setOpenModal] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoInventarioObsoleto | null>(
    null,
  );
  const [selectedTitulo, setSelectedTitulo] = useState('');
  const [descuentos, setDescuentos] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(1);

  const { data: resumen = [], isLoading: loadingResumen } = useQuery<
    InventarioObsoletoResumenRow[],
    Error
  >({
    queryKey: ['informes', 'postventa', 'inventario-obsoletos', 'resumen'],
    queryFn: () => inventarioObsoletosService.obtenerResumen(),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const {
    data: detalle = [],
    isLoading: loadingDetalle,
    isError: errorDetalle,
  } = useQuery({
    queryKey: [
      'informes',
      'postventa',
      'inventario-obsoletos',
      'detalle',
      selectedTipo,
    ],
    queryFn: () => inventarioObsoletosService.obtenerDetalle(selectedTipo!),
    enabled: openModal && selectedTipo != null,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const rows = useMemo(
    () =>
      detalle.map((r) =>
        aplicarDescuento(r, descuentos[claveFila(r)] ?? null),
      ),
    [detalle, descuentos],
  );

  const abrirDetalle = (row: InventarioObsoletoResumenRow) => {
    if (!row.habilitaDetalle) {
      showInfo('Esta categoría no supera el umbral para ver detalle.');
      return;
    }
    setSelectedTipo(row.tipo);
    setSelectedTitulo(row.descripcionTipo);
    setDescuentos({});
    setCurrentPage(1);
    setOpenModal(true);
  };

  const onChangeDescuento = (row: RowExtendido, value: string) => {
    const key = claveFila(row);
    setDescuentos((prev) => {
      const next = { ...prev };
      if (value === '') {
        delete next[key];
      } else {
        next[key] = Number(value);
      }
      return next;
    });
  };

  const totalNuevoPvp = rows.reduce(
    (acc, r) => acc + (r.nuevoPvp ?? 0) * r.stock,
    0,
  );
  const totalObsoleto = resumen.reduce((acc, r) => acc + r.obsoleto, 0);
  const totalGeneral = resumen.reduce((acc, r) => acc + r.total, 0);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paginaSegura = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (paginaSegura - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, paginaSegura]);

  const exportarExcel = async () => {
    const XLSX = await getXlsx();
    if (rows.length === 0) {
      showInfo('No hay datos para exportar.');
      return;
    }
    const excelRows = rows.map((r) => ({
      Rank: r.rnk,
      Codigo: r.codigo,
      Descripcion: r.descripcion,
      Linea: r.linea,
      Bodega: r.bodega,
      Cantidad: r.stock,
      Costo: r.costo,
      'Costo Total': r.costoTotal,
      Meses: r.meses,
      'Venta Antes IVA': r.pvpAntesIva,
      Margen: r.margen,
      Acumulado: r.acumulado,
      Descuento: r.descuento ?? '',
      'Nuevo PVP': r.nuevoPvp ?? '',
      'Nuevo Margen': r.nuevoMargen ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(excelRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Detalle');
    XLSX.writeFile(wb, 'informe-descuento-repuestos-obsoletos.xlsx');
  };

  if (blocked) return null;

  return (
    <RepuestosPageFrame
      title={REPUESTOS_COPY.inventarioObsoletos.title}
      description={REPUESTOS_COPY.inventarioObsoletos.description}
    >
    <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
      <div data-testid="repuestos-inventario-table" className="app-table-scroll">
        <table className="w-full min-w-[640px] text-xs md:text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-center font-semibold">Tipo</th>
              <th className="px-3 py-2 text-center font-semibold">Obsoleto</th>
              <th className="px-3 py-2 text-center font-semibold">Total</th>
              <th className="px-3 py-2 text-center font-semibold">Porcentaje</th>
              <th className="px-3 py-2 text-center font-semibold">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {loadingResumen ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                  Cargando resumen...
                </td>
              </tr>
            ) : resumen.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                  No hay datos de inventario obsoleto.
                </td>
              </tr>
            ) : (
              <>
                {resumen.map((row) => (
                  <tr key={row.tipo} className="border-t border-gray-100">
                    <td className="px-3 py-2">{row.descripcionTipo}</td>
                    <td className="px-3 py-2 text-right">{formatCantidadCo(row.obsoleto)}</td>
                    <td className="px-3 py-2 text-right">{formatCantidadCo(row.total)}</td>
                    <td className="px-3 py-2 text-center">
                      {formatNumeroCo(row.porcentaje, 2, 2)}%
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        disabled={!row.habilitaDetalle}
                        onClick={() => abrirDetalle(row)}
                        className="inline-flex items-center rounded-md brand-bg px-3 py-1.5 text-xs font-semibold text-white shadow-sm brand-bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Detalle
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 border-t border-gray-200">
                  <th className="px-3 py-2 text-left">Totales</th>
                  <th className="px-3 py-2 text-right">{formatCantidadCo(totalObsoleto)}</th>
                  <th className="px-3 py-2 text-right">{formatCantidadCo(totalGeneral)}</th>
                  <th className="px-3 py-2" />
                  <th className="px-3 py-2" />
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={`Detalles del inventario - ${selectedTitulo}`}
        width="min(96vw, 1400px)"
      >
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <p className="text-xs md:text-sm text-gray-500">
              Nuevo PVP total simulado:{' '}
              <span className="font-semibold">{formatCantidadCo(totalNuevoPvp)}</span>
            </p>
            <button
              type="button"
              onClick={exportarExcel}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90"
            >
              Generar Excel
            </button>
          </div>
          {loadingDetalle ? (
            <div className="py-8 text-sm text-gray-500 flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Cargando detalle...
            </div>
          ) : errorDetalle ? (
            <p className="py-8 text-sm text-center text-red-600">
              No se pudo cargar el detalle de inventario obsoleto.
            </p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-gray-500">No hay detalle para mostrar.</p>
          ) : (
            <>
            <div className="app-table-scroll">
              <table className="w-full min-w-[1600px] divide-y divide-gray-200 text-[11px] md:text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    {['#', 'CODIGO', 'DESCRIPCION', 'LINEA', 'BODEGA', 'COSTO', 'CANTIDAD', 'COSTO TOTAL', 'MESES', 'VENTA ANTES IVA', 'MARGEN', 'ACUMULADO', 'DESCUENTO', 'NUEVO PVP', 'NUEVO MARGEN'].map((h) => (
                      <th key={h} className="px-2 py-2 text-center font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedRows.map((row, i) => {
                    const rowIndex = (paginaSegura - 1) * PAGE_SIZE + i;
                    return (
                    <tr key={`${row.rnk}-${claveFila(row)}-${rowIndex}`}>
                      <td className="px-2 py-1.5 text-center">{row.rnk}</td>
                      <td className="px-2 py-1.5 text-center">{row.codigo}</td>
                      <td className="px-2 py-1.5">{row.descripcion}</td>
                      <td className="px-2 py-1.5 text-center">{row.linea}</td>
                      <td className="px-2 py-1.5 text-center">{row.bodega}</td>
                      <td className="px-2 py-1.5 text-right">{formatCantidadCo(row.costo)}</td>
                      <td className="px-2 py-1.5 text-center">{formatCantidadCo(row.stock)}</td>
                      <td className="px-2 py-1.5 text-right">{formatCantidadCo(row.costoTotal)}</td>
                      <td className="px-2 py-1.5 text-center">{row.meses}</td>
                      <td className="px-2 py-1.5 text-right">{formatCantidadCo(row.pvpAntesIva)}</td>
                      <td className="px-2 py-1.5 text-right">{formatNumeroCo(row.margen, 2, 2)}%</td>
                      <td className="px-2 py-1.5 text-right">{formatCantidadCo(row.acumulado)}</td>
                      <td className="px-2 py-1.5 text-right">
                        <input
                          type="number"
                          min={1}
                          max={100}
                          className="w-16 rounded-md border-gray-300 text-[11px] md:text-xs"
                          value={row.descuento ?? ''}
                          onChange={(e) => onChangeDescuento(row, e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        {row.nuevoPvp != null ? formatCantidadCo(row.nuevoPvp) : ''}
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        {row.nuevoMargen != null ? `${formatNumeroCo(row.nuevoMargen, 2, 2)}%` : ''}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <p className="text-sm text-gray-600">
                {`Mostrando ${(paginaSegura - 1) * PAGE_SIZE + 1}-${Math.min(paginaSegura * PAGE_SIZE, rows.length)} de ${rows.length} registros`}
              </p>
              <Pagination
                currentPage={paginaSegura}
                totalPages={totalPages}
                onChange={setCurrentPage}
              />
            </div>
            </>
          )}
        </div>
      </Modal>
    </div>
    </RepuestosPageFrame>
  );
}
