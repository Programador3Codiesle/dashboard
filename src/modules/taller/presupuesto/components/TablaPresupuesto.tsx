"use client";

import { Pencil } from "lucide-react";
import { MESES_PRESUPUESTO } from "../constants/meses";
import type {
  CeldaEditable,
  FilaTablaPresupuesto,
  ModalActualizarTipo,
  TablaPresupuesto,
} from "../types";

interface TablaPresupuestoProps {
  tabla: TablaPresupuesto;
  mesActualIndex: number;
  puedeEditar: boolean;
  onEditar: (tipo: ModalActualizarTipo, celda: CeldaEditable, valorActual: number | string | null) => void;
}

function formatCelda(valor: number | string | null | undefined): string {
  if (valor === null || valor === undefined || valor === "") return "";
  return String(valor);
}

const cellBorder = "border border-gray-200/50";

export function TablaPresupuesto({
  tabla,
  mesActualIndex,
  puedeEditar,
  onEditar,
}: TablaPresupuestoProps) {
  const mostrarEdicion = puedeEditar && tabla.editable;

  const renderPresupuestoCell = (fila: FilaTablaPresupuesto) => {
    const valor = fila.presupuesto;
    const editable = mostrarEdicion && fila.celdaPresupuestoEditable;

    if (editable) {
      return (
        <td className={`px-2 py-1.5 text-right whitespace-nowrap ${cellBorder}`}>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center w-7 h-7 rounded bg-amber-400 hover:bg-amber-500 text-white shrink-0"
              title="Editar presupuesto"
              onClick={() =>
                onEditar("presupuesto", fila.celdaPresupuestoEditable!, valor)
              }
            >
              <Pencil size={12} />
            </button>
            <span>{formatCelda(valor)}</span>
          </div>
        </td>
      );
    }

    return (
      <td className={`px-2 py-1.5 text-right whitespace-nowrap ${cellBorder}`}>
        {formatCelda(valor)}
      </td>
    );
  };

  const renderMesCell = (fila: FilaTablaPresupuesto, mes: string, mesIndex: number) => {
    const valor = fila.celdas[mes];
    const esMesActual = mesIndex === mesActualIndex;
    const bgClass = esMesActual ? "bg-[#80808047]" : "";
    const esCeldaSaldo =
      mostrarEdicion &&
      fila.celdaSaldoEditable &&
      fila.etiqueta === mes;

    if (esCeldaSaldo) {
      return (
        <td
          key={mes}
          className={`px-2 py-1.5 text-right whitespace-nowrap ${cellBorder} ${bgClass}`}
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center w-7 h-7 rounded bg-red-500 hover:bg-red-600 text-white shrink-0"
              title="Editar saldo"
              onClick={() =>
                onEditar("saldo", fila.celdaSaldoEditable!, valor ?? null)
              }
            >
              <Pencil size={12} />
            </button>
            <span>{formatCelda(valor)}</span>
          </div>
        </td>
      );
    }

    return (
      <td
        key={mes}
        className={`px-2 py-1.5 text-right whitespace-nowrap ${cellBorder} ${bgClass}`}
      >
        {formatCelda(valor)}
      </td>
    );
  };

  return (
    <div className="overflow-x-auto mb-6">
      <table className={`w-full min-w-[900px] text-sm border-collapse ${cellBorder}`}>
        <thead>
          <tr className="bg-gray-50 text-center">
            <th className={`px-2 py-2 ${cellBorder} font-semibold text-left`}>
              {tabla.titulo}
            </th>
            <th className={`px-2 py-2 ${cellBorder} font-semibold`}>
              Presupuesto
            </th>
            {MESES_PRESUPUESTO.map((mes, idx) => (
              <th
                key={mes}
                className={`px-2 py-2 ${cellBorder} font-semibold text-right ${
                  idx === mesActualIndex ? "bg-[#80808047]" : ""
                }`}
              >
                {mes}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tabla.filas.map((fila, rowIdx) => (
            <tr key={`${tabla.titulo}-${fila.etiqueta}-${rowIdx}`}>
              <td className={`px-2 py-1.5 ${cellBorder} whitespace-nowrap`}>
                {fila.etiqueta}
              </td>
              {renderPresupuestoCell(fila)}
              {MESES_PRESUPUESTO.map((mes, mesIdx) =>
                renderMesCell(fila, mes, mesIdx),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <hr className="border-gray-200/50" />
    </div>
  );
}
