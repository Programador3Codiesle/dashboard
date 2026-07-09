"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { FilaInformeAsesor } from "../types";

const COMPARE_BG = "bg-[#c6edb799]";

function formatNumber(value: number): string {
  return Math.round(Number(value || 0)).toLocaleString("es-CO");
}

type SortKey = keyof FilaInformeAsesor;
type SortDir = "asc" | "desc";

interface TablaPygAsesoresProps {
  filas: FilaInformeAsesor[];
  yearComparar: number;
  searchTerm: string;
}

export function TablaPygAsesores({
  filas,
  yearComparar,
  searchTerm,
}: TablaPygAsesoresProps) {
  const [sortKey, setSortKey] = useState<SortKey>("rnk");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filteredAndSorted = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let result = filas;

    if (term) {
      result = result.filter((f) => f.nombres.toLowerCase().includes(term));
    }

    result = [...result].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal ?? "");
      const bStr = String(bVal ?? "");
      return sortDir === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    return result;
  }, [filas, searchTerm, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "nombres" ? "asc" : "desc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? (
      <ChevronUp size={14} className="inline ml-1" />
    ) : (
      <ChevronDown size={14} className="inline ml-1" />
    );
  };

  const thClass =
    "px-3 py-2 text-xs font-semibold text-gray-700 whitespace-nowrap cursor-pointer select-none hover:bg-gray-100";

  if (!filas.length) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse min-w-[1200px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-center">
            <th className={thClass} onClick={() => handleSort("rnk")}>
              RNK <SortIcon col="rnk" />
            </th>
            <th className={thClass} onClick={() => handleSort("nombres")}>
              ASESOR DE REPUESTOS <SortIcon col="nombres" />
            </th>
            <th className={thClass} onClick={() => handleSort("venta_taller")}>
              VENTA TALLER <SortIcon col="venta_taller" />
            </th>
            <th className={thClass} onClick={() => handleSort("costo_taller")}>
              COSTO TALLER <SortIcon col="costo_taller" />
            </th>
            <th className={thClass} onClick={() => handleSort("utilidad_taller")}>
              UTILIDAD TALLER <SortIcon col="utilidad_taller" />
            </th>
            <th
              className={`${thClass} ${COMPARE_BG}`}
              onClick={() => handleSort("utilidad_taller_ant")}
            >
              UTILIDAD TALLER {yearComparar}
              <SortIcon col="utilidad_taller_ant" />
            </th>
            <th className={thClass} onClick={() => handleSort("venta_mostrador")}>
              VENTA MOSTRADOR <SortIcon col="venta_mostrador" />
            </th>
            <th className={thClass} onClick={() => handleSort("costo_mostrador")}>
              COSTO MOSTRADOR <SortIcon col="costo_mostrador" />
            </th>
            <th className={thClass} onClick={() => handleSort("utilidad_mostrador")}>
              UTILIDAD MOSTRADOR <SortIcon col="utilidad_mostrador" />
            </th>
            <th
              className={`${thClass} ${COMPARE_BG}`}
              onClick={() => handleSort("utilidad_mostrador_ant")}
            >
              UTILIDAD MOSTRADOR {yearComparar}
              <SortIcon col="utilidad_mostrador_ant" />
            </th>
            <th className={thClass} onClick={() => handleSort("utilidad_total")}>
              UTILIDAD TOTAL <SortIcon col="utilidad_total" />
            </th>
            <th
              className={`${thClass} ${COMPARE_BG}`}
              onClick={() => handleSort("utilidad_total_ant")}
            >
              UTILIDAD TOTAL {yearComparar}
              <SortIcon col="utilidad_total_ant" />
            </th>
            <th className={thClass} onClick={() => handleSort("salario")}>
              SALARIO <SortIcon col="salario" />
            </th>
            <th className={thClass} onClick={() => handleSort("fecha_ini")}>
              FECHA INICIO LABOR <SortIcon col="fecha_ini" />
            </th>
            <th className={thClass} onClick={() => handleSort("dias")}>
              DÍAS VACACIONES <SortIcon col="dias" />
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSorted.map((fila) => (
            <tr
              key={`${fila.rnk}-${fila.nombres}`}
              className="border-b border-gray-100 hover:bg-gray-50/50"
            >
              <td className="px-3 py-2 text-center">{fila.rnk}</td>
              <td className="px-3 py-2 text-center whitespace-nowrap">{fila.nombres}</td>
              <td className="px-3 py-2 text-right">{formatNumber(fila.venta_taller)}</td>
              <td className="px-3 py-2 text-right">{formatNumber(fila.costo_taller)}</td>
              <td className="px-3 py-2 text-right">{formatNumber(fila.utilidad_taller)}</td>
              <td className={`px-3 py-2 text-right ${COMPARE_BG}`}>
                {formatNumber(fila.utilidad_taller_ant)}
              </td>
              <td className="px-3 py-2 text-right">{formatNumber(fila.venta_mostrador)}</td>
              <td className="px-3 py-2 text-right">{formatNumber(fila.costo_mostrador)}</td>
              <td className="px-3 py-2 text-right">{formatNumber(fila.utilidad_mostrador)}</td>
              <td className={`px-3 py-2 text-right ${COMPARE_BG}`}>
                {formatNumber(fila.utilidad_mostrador_ant)}
              </td>
              <td className="px-3 py-2 text-right">{formatNumber(fila.utilidad_total)}</td>
              <td className={`px-3 py-2 text-right ${COMPARE_BG}`}>
                {formatNumber(fila.utilidad_total_ant)}
              </td>
              <td className="px-3 py-2 text-center">{formatNumber(fila.salario)}</td>
              <td className="px-3 py-2 text-center whitespace-nowrap">{fila.fecha_ini}</td>
              <td className="px-3 py-2 text-right">{fila.dias}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
