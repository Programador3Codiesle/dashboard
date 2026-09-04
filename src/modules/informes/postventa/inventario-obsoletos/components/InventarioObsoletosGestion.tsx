'use client';

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  inventarioObsoletosService,
  InventarioObsoletoDetalleRow,
  InventarioObsoletoResumenRow,
  TipoInventarioObsoleto,
} from "@/modules/informes/postventa/services/inventario-obsoletos.service";
import {
  formatCantidadCo,
  formatNumeroCo,
} from "@/modules/informes/postventa/format-cantidad-co";
import { useToast } from "@/components/ui/use-toast";
import Modal from "@/components/shared/ui/Modal";
import * as XLSX from "xlsx";
import { Loader2 } from "lucide-react";
import { InformesPageFrame } from "@/modules/informes/components/InformesPageFrame";
import { INFORMES_COPY, INFORMES_PV_TRIMENU } from "@/modules/informes/constants";
import { informesKeys } from "@/modules/informes/shared/constants/query-keys";
import { useInformesPageGuard } from "@/modules/informes/shared/hooks/useInformesPageGuard";

interface RowExtendido extends InventarioObsoletoDetalleRow {
  descuento?: number | null;
  nuevoPvp?: number | null;
  nuevoMargen?: number | null;
}

export function InventarioObsoletosGestion() {
  const { blocked } = useInformesPageGuard({
    trimenuId: INFORMES_PV_TRIMENU.inventarioObsoletos,
    redirectTo: "/dashboard/informes/postventa",
  });
  const { showError, showInfo } = useToast();
  const [openModal, setOpenModal] = useState(false);
  const [, setSelectedTipo] = useState<TipoInventarioObsoleto | null>(
    null,
  );
  const [selectedTitulo, setSelectedTitulo] = useState("");
  const [rows, setRows] = useState<RowExtendido[]>([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data: resumen = [], isLoading: loadingResumen } = useQuery<
    InventarioObsoletoResumenRow[],
    Error
  >({
    queryKey: informesKeys.pv.inventarioObsoletos("resumen"),
    queryFn: () => inventarioObsoletosService.obtenerResumen(),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const abrirDetalle = async (row: InventarioObsoletoResumenRow) => {
    if (!row.habilitaDetalle) {
      showInfo("Esta categoría no supera el umbral para ver detalle.");
      return;
    }

    setSelectedTipo(row.tipo);
    setSelectedTitulo(row.descripcionTipo);
    setRows([]);
    setCurrentPage(1);
    setOpenModal(true);
    setLoadingDetalle(true);

    try {
      const data = await inventarioObsoletosService.obtenerDetalle(row.tipo);
      setRows(
        data.map((r) => ({
          ...r,
          descuento: null,
          nuevoPvp: null,
          nuevoMargen: null,
        })),
      );
    } catch {
      showError("No se pudo cargar el detalle de inventario obsoleto.");
    } finally {
      setLoadingDetalle(false);
    }
  };

  const onChangeDescuento = (row: RowExtendido, value: string) => {
    const descuento = value === "" ? null : Number(value);
    setRows((prev) =>
      prev.map((r) => {
        if (r.codigo === row.codigo && r.bodega === row.bodega) {
          if (descuento === null) {
            return { ...r, descuento: null, nuevoPvp: null, nuevoMargen: null };
          }
          const nuevoPvp = r.pvpAntesIva * (1 - descuento / 100);
          const nuevoMargen =
            ((nuevoPvp - r.costo) / (nuevoPvp === 0 ? 1 : nuevoPvp)) *
            100;
          return {
            ...r,
            descuento,
            nuevoPvp,
            nuevoMargen,
          };
        }
        return r;
      }),
    );
  };

  const totalNuevoPvp = rows.reduce(
    (acc, r) => acc + (r.nuevoPvp ?? 0) * r.stock,
    0,
  );

  const totalObsoleto = resumen.reduce((acc, r) => acc + r.obsoleto, 0);
  const totalGeneral = resumen.reduce((acc, r) => acc + r.total, 0);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, currentPage]);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  const exportarExcel = () => {
    if (rows.length === 0) {
      showInfo("No hay datos para exportar.");
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
      "Costo Total": r.costoTotal,
      Meses: r.meses,
      "Venta Antes IVA": r.pvpAntesIva,
      Margen: r.margen,
      Acumulado: r.acumulado,
      Descuento: r.descuento ?? "",
      "Nuevo PVP": r.nuevoPvp ?? "",
      "Nuevo Margen": r.nuevoMargen ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(excelRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detalle");
    XLSX.writeFile(wb, "informe-descuento-repuestos-obsoletos.xlsx");
  };

  if (blocked) return null;

  return (
    <InformesPageFrame
      title={INFORMES_COPY.inventarioObsoletos.title}
      description={INFORMES_COPY.inventarioObsoletos.description}
      backHref="/dashboard/informes/postventa"
      backLabel={INFORMES_COPY.backPv}
    >

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
        <div className="app-table-scroll">
          <table className="min-w-full text-xs md:text-sm border border-gray-100 rounded-lg">
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
                      <td className="px-3 py-2 text-right">
                        {formatCantidadCo(row.obsoleto)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {formatCantidadCo(row.total)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {formatNumeroCo(row.porcentaje, 2, 2)}%
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          disabled={!row.habilitaDetalle}
                          onClick={() => abrirDetalle(row)}
                          className="inline-flex items-center rounded-md bg-(--color-primary) px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 border-t border-gray-200">
                    <th className="px-3 py-2 text-left">Totales</th>
                    <th className="px-3 py-2 text-right">
                      {formatCantidadCo(totalObsoleto)}
                    </th>
                    <th className="px-3 py-2 text-right">
                      {formatCantidadCo(totalGeneral)}
                    </th>
                    <th className="px-3 py-2"></th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={`Detalles del inventario - ${selectedTitulo}`}
        width="min(96vw, 1400px)"
      >
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <p className="text-xs md:text-sm text-gray-500">
              Nuevo PVP total simulado:{" "}
              <span className="font-semibold">
                {formatCantidadCo(totalNuevoPvp)}
              </span>
            </p>
            <button
              type="button"
              onClick={exportarExcel}
              className="inline-flex w-full sm:w-auto justify-center items-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90"
            >
              Generar Excel
            </button>
          </div>

          {loadingDetalle ? (
            <div className="py-8 text-sm text-gray-500 flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Cargando detalle...
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-gray-500">No hay detalle para mostrar.</p>
          ) : (
            <div className="app-table-scroll max-h-[65vh]">
              <table className="min-w-[1100px] w-full divide-y divide-gray-200 text-[11px] md:text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-center font-semibold">#</th>
                  <th className="px-2 py-2 text-center font-semibold">CODIGO</th>
                  <th className="px-2 py-2 text-center font-semibold">DESCRIPCION</th>
                  <th className="px-2 py-2 text-center font-semibold">LINEA</th>
                  <th className="px-2 py-2 text-center font-semibold">BODEGA</th>
                  <th className="px-2 py-2 text-center font-semibold">COSTO</th>
                  <th className="px-2 py-2 text-center font-semibold">CANTIDAD</th>
                  <th className="px-2 py-2 text-center font-semibold">COSTO TOTAL</th>
                  <th className="px-2 py-2 text-center font-semibold">MESES</th>
                  <th className="px-2 py-2 text-center font-semibold">VENTA ANTES IVA</th>
                  <th className="px-2 py-2 text-center font-semibold">MARGEN</th>
                  <th className="px-2 py-2 text-center font-semibold">ACUMULADO</th>
                  <th className="px-2 py-2 text-center font-semibold">DESCUENTO</th>
                  <th className="px-2 py-2 text-center font-semibold">NUEVO PVP</th>
                  <th className="px-2 py-2 text-center font-semibold">NUEVO MARGEN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedRows.map((row) => (
                  <tr key={`${row.codigo}-${row.bodega}`}>
                    <td className="px-2 py-1.5 text-center">{row.rnk}</td>
                    <td className="px-2 py-1.5 text-center">{row.codigo}</td>
                    <td className="px-2 py-1.5">{row.descripcion}</td>
                    <td className="px-2 py-1.5 text-center">{row.linea}</td>
                    <td className="px-2 py-1.5 text-center">{row.bodega}</td>
                    <td className="px-2 py-1.5 text-right">
                      {formatCantidadCo(row.costo)}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {formatCantidadCo(row.stock)}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      {formatCantidadCo(row.costoTotal)}
                    </td>
                    <td className="px-2 py-1.5 text-center">{row.meses}</td>
                    <td className="px-2 py-1.5 text-right">
                      {formatCantidadCo(row.pvpAntesIva)}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      {formatNumeroCo(row.margen, 2, 2)}%
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      {formatCantidadCo(row.acumulado)}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        className="w-16 rounded-md border-gray-300 text-[11px] md:text-xs focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)"
                        value={row.descuento ?? ""}
                        onChange={(e) => onChangeDescuento(row, e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      {row.nuevoPvp !== null && row.nuevoPvp !== undefined
                        ? formatCantidadCo(row.nuevoPvp)
                        : ""}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      {row.nuevoMargen !== null && row.nuevoMargen !== undefined
                        ? `${formatNumeroCo(row.nuevoMargen, 2, 2)}%`
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <th
                    colSpan={13}
                    className="px-2 py-2 text-right font-semibold"
                  >
                    Total nuevo PVP
                  </th>
                  <th className="px-2 py-2 text-right font-semibold">
                    {formatCantidadCo(totalNuevoPvp)}
                  </th>
                  <th></th>
                </tr>
              </tfoot>
            </table>
            </div>
          )}

          {!loadingDetalle && rows.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 pt-2">
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 rounded-md border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-xs text-gray-500 min-w-[78px] text-center">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 rounded-md border border-gray-300 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </InformesPageFrame>
  );
}

