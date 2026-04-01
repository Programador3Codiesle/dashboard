'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  inventarioObsoletosService,
  InventarioObsoletoRow,
} from "@/modules/informes/postventa/services/inventario-obsoletos.service";
import { useToast } from "@/components/ui/use-toast";

type CategoriaFiltro = 1 | 2; // 1: >=, 2: <=

interface FilaFiltroState {
  filtro: CategoriaFiltro | null;
  rango: number | null;
}

interface RowExtendido extends InventarioObsoletoRow {
  descuento?: number | null;
  nuevoPvp?: number | null;
  nuevoMargen?: number | null;
}

export default function InventarioObsoletosPage() {
  const { showError } = useToast();

  const [filtros, setFiltros] = useState<Record<number, FilaFiltroState>>({
    1: { filtro: null, rango: null },
    2: { filtro: null, rango: null },
    3: { filtro: null, rango: null },
    4: { filtro: null, rango: null },
  });

  const [rows, setRows] = useState<RowExtendido[]>([]);

  const { isFetching } = useQuery<InventarioObsoletoRow[], Error>({
    queryKey: ["informes", "postventa", "inventario-obsoletos"],
    queryFn: async () => [],
    enabled: false,
  });

  const actualizarFiltro = (
    opcion: number,
    campo: "filtro" | "rango",
    valor: string,
  ) => {
    setFiltros((prev) => ({
      ...prev,
      [opcion]: {
        ...prev[opcion],
        [campo]:
          campo === "filtro"
            ? (Number(valor) as CategoriaFiltro)
            : valor === ""
            ? null
            : Number(valor),
      },
    }));
  };

  const ejecutarConsulta = async (opcion: number) => {
    const { filtro, rango } = filtros[opcion];
    if (!filtro || rango === null) {
      showError("Debes seleccionar filtro y rango para esta categoría.");
      return;
    }
    try {
      const data = await inventarioObsoletosService.obtener({
        opcion,
        categoria: filtro,
        rango,
      });
      setRows(
        data.map((r) => ({
          ...r,
          descuento: null,
          nuevoPvp: null,
          nuevoMargen: null,
        })),
      );
    } catch {
      showError(
        "No se pudo cargar el informe de inventario obsoletos. Verifica los filtros e inténtalo nuevamente.",
      );
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
          const nuevoPvp = r.pvp * (1 - descuento / 100);
          const nuevoMargen =
            ((nuevoPvp - r.costoUnitario) / (nuevoPvp === 0 ? 1 : nuevoPvp)) *
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">
          Informe Inventario Obsoletos
        </h1>
        <p className="text-gray-500 mt-1">
          Filtra repuestos obsoletos por meses y rango de costo, y simula
          descuentos para ajustar PVP y margen.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs md:text-sm border border-gray-100 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-center font-semibold">
                  Categoría (meses)
                </th>
                <th className="px-3 py-2 text-center font-semibold">Filtro</th>
                <th className="px-3 py-2 text-center font-semibold">Rango</th>
                <th className="px-3 py-2 text-center font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {[
                { opcion: 1, label: "0 - 12" },
                { opcion: 2, label: "9 - 12" },
                { opcion: 3, label: "12 - 24" },
                { opcion: 4, label: "> 24" },
              ].map(({ opcion, label }) => (
                <tr key={opcion} className="border-t border-gray-100">
                  <td className="px-3 py-2 text-center">{label}</td>
                  <td className="px-3 py-2">
                    <select
                      className="form-select w-full rounded-md border-gray-300 text-xs md:text-sm focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)"
                      value={filtros[opcion].filtro ?? ""}
                      onChange={(e) =>
                        actualizarFiltro(opcion, "filtro", e.target.value)
                      }
                    >
                      <option value="">SELECCIONE UNA OPCIÓN</option>
                      <option value="1">MAYOR QUE {"(>)"}</option>
                      <option value="2">MENOR QUE {"(<)"}</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      className="form-input w-full rounded-md border-gray-300 text-xs md:text-sm focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)"
                      value={filtros[opcion].rango ?? ""}
                      onChange={(e) =>
                        actualizarFiltro(opcion, "rango", e.target.value)
                      }
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      disabled={isFetching}
                      onClick={() => ejecutarConsulta(opcion)}
                      className="inline-flex items-center rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-60"
                    >
                      Ejecutar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm md:text-base font-semibold brand-text">
            Detalle de repuestos obsoletos
          </h2>
          <p className="text-xs md:text-sm text-gray-500">
            Nuevo PVP total simulado:{" "}
            <span className="font-semibold">
              {totalNuevoPvp.toLocaleString("es-CO")}
            </span>
          </p>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay datos para los filtros seleccionados. Ejecuta alguna de las
            categorías.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200 text-[11px] md:text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-center font-semibold">
                    CÓDIGO
                  </th>
                  <th className="px-2 py-2 text-center font-semibold">
                    DESCRIPCIÓN
                  </th>
                  <th className="px-2 py-2 text-center font-semibold">
                    CANTIDAD
                  </th>
                  <th className="px-2 py-2 text-center font-semibold">
                    BODEGA
                  </th>
                  <th className="px-2 py-2 text-center font-semibold">
                    COSTO UNITARIO
                  </th>
                  <th className="px-2 py-2 text-center font-semibold">
                    COSTO PROMEDIO
                  </th>
                  <th className="px-2 py-2 text-center font-semibold">
                    VENTA ANTES DE IVA
                  </th>
                  <th className="px-2 py-2 text-center font-semibold">
                    MARGEN
                  </th>
                  <th className="px-2 py-2 text-center font-semibold">
                    MESES
                  </th>
                  <th className="px-2 py-2 text-center font-semibold">
                    DESCUENTO (%)
                  </th>
                  <th className="px-2 py-2 text-center font-semibold">
                    NUEVO PVP
                  </th>
                  <th className="px-2 py-2 text-center font-semibold">
                    NUEVO MARGEN
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={`${row.codigo}-${row.bodega}`}>
                    <td className="px-2 py-1.5 text-center">{row.codigo}</td>
                    <td className="px-2 py-1.5">{row.descripcion}</td>
                    <td className="px-2 py-1.5 text-center">
                      {row.stock.toLocaleString("es-CO")}
                    </td>
                    <td className="px-2 py-1.5 text-center">{row.bodega}</td>
                    <td className="px-2 py-1.5 text-right">
                      {row.costoUnitario.toFixed(2)}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      {row.costoPromedio.toFixed(2)}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      {row.pvp.toFixed(2)}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      {row.margen.toFixed(2)}%
                    </td>
                    <td className="px-2 py-1.5 text-center">{row.meses}</td>
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
                        ? row.nuevoPvp.toFixed(2)
                        : ""}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      {row.nuevoMargen !== null && row.nuevoMargen !== undefined
                        ? `${row.nuevoMargen.toFixed(2)}%`
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <th
                    colSpan={10}
                    className="px-2 py-2 text-right font-semibold"
                  >
                    Total nuevo PVP
                  </th>
                  <th className="px-2 py-2 text-right font-semibold">
                    {totalNuevoPvp.toLocaleString("es-CO")}
                  </th>
                  <th></th>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

