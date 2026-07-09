"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Pagination } from "@/components/shared/ui/Pagination";
import { usePagination } from "@/components/shared/ui/hooks/usePagination";
import type { FilaInformeTecnico } from "../types";

const PAGE_SIZE = 10;

const COMPARE_BG = "bg-[#c6edb799]";
const BOLSA_EMPLEO_BG = "bg-[#ff00002b]";

function formatInteger(value: number): string {
  return Math.round(Number(value || 0)).toLocaleString("es-CO");
}

function formatDecimal(value: number): string {
  return Number(value || 0).toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type SortKey = keyof FilaInformeTecnico;
type SortDir = "asc" | "desc";

interface TablaPygTecnicosProps {
  filas: FilaInformeTecnico[];
  yearComparar: number;
  searchTerm: string;
}

export function TablaPygTecnicos({
  filas,
  yearComparar,
  searchTerm,
}: TablaPygTecnicosProps) {
  const [sortKey, setSortKey] = useState<SortKey>("rnk");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filteredAndSorted = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let result = filas;

    if (term) {
      result = result.filter(
        (f) =>
          f.nombre.toLowerCase().includes(term) ||
          f.taller.toLowerCase().includes(term),
      );
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

  const { currentPage, totalPages, startIndex, endIndex, changePage } =
    usePagination(filteredAndSorted.length, PAGE_SIZE);

  useEffect(() => {
    changePage(1);
  }, [searchTerm, changePage]);

  useEffect(() => {
    if (filteredAndSorted.length > 0 && startIndex >= filteredAndSorted.length) {
      changePage(1);
    }
  }, [filteredAndSorted.length, startIndex, changePage]);

  const paginadas = useMemo(
    () => filteredAndSorted.slice(startIndex, endIndex),
    [filteredAndSorted, startIndex, endIndex],
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(
        key === "nombre" || key === "taller" || key === "fecha_ini"
          ? "asc"
          : "desc",
      );
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
    <div>
      <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse min-w-[1400px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-center">
            <th className={thClass} onClick={() => handleSort("rnk")}>
              RNK <SortIcon col="rnk" />
            </th>
            <th className={thClass} onClick={() => handleSort("taller")}>
              TALLER <SortIcon col="taller" />
            </th>
            <th className={thClass} onClick={() => handleSort("nombre")}>
              TÉCNICO <SortIcon col="nombre" />
            </th>
            <th className={thClass} onClick={() => handleSort("mano_obra")}>
              MANO OBRA <SortIcon col="mano_obra" />
            </th>
            <th className={thClass} onClick={() => handleSort("repuestos")}>
              REPUESTOS <SortIcon col="repuestos" />
            </th>
            <th className={thClass} onClick={() => handleSort("utilidad")}>
              UTILIDAD <SortIcon col="utilidad" />
            </th>
            <th
              className={`${thClass} ${COMPARE_BG}`}
              onClick={() => handleSort("utilidad_year")}
            >
              UTILIDAD AÑO {yearComparar}
              <SortIcon col="utilidad_year" />
            </th>
            <th className={thClass} onClick={() => handleSort("ticket_total")}>
              TICKET TOTAL <SortIcon col="ticket_total" />
            </th>
            <th className={thClass} onClick={() => handleSort("horas_cliente")}>
              HORAS CLIENTE <SortIcon col="horas_cliente" />
            </th>
            <th className={thClass} onClick={() => handleSort("horas_garantia")}>
              HORAS GARANTÍA <SortIcon col="horas_garantia" />
            </th>
            <th className={thClass} onClick={() => handleSort("horas_internas")}>
              HORAS INTERNAS <SortIcon col="horas_internas" />
            </th>
            <th className={thClass} onClick={() => handleSort("horas_servicio")}>
              HORAS SERVICIO <SortIcon col="horas_servicio" />
            </th>
            <th className={thClass} onClick={() => handleSort("total_horas")}>
              TOTAL HORAS <SortIcon col="total_horas" />
            </th>
            <th className={thClass} onClick={() => handleSort("valor_hora")}>
              VALOR HORA <SortIcon col="valor_hora" />
            </th>
            <th className={thClass} onClick={() => handleSort("fecha_ini")}>
              FECHA INICIO LABOR <SortIcon col="fecha_ini" />
            </th>
            <th className={thClass} onClick={() => handleSort("dias_vacaciones")}>
              DÍAS VACACIONES <SortIcon col="dias_vacaciones" />
            </th>
          </tr>
        </thead>
        <tbody>
          {paginadas.map((fila) => {
            const rowHighlight = fila.costo_mo === 0 ? BOLSA_EMPLEO_BG : "";
            return (
              <tr
                key={`${fila.rnk}-${fila.nombre}-${fila.taller}`}
                className={`border-b border-gray-100 hover:bg-gray-50/50 ${rowHighlight}`}
              >
                <td className="px-3 py-2 text-center">{fila.rnk}</td>
                <td className="px-3 py-2 text-center whitespace-nowrap">{fila.taller}</td>
                <td className="px-3 py-2 text-center whitespace-nowrap">{fila.nombre}</td>
                <td className="px-3 py-2 text-right">{formatInteger(fila.mano_obra)}</td>
                <td className="px-3 py-2 text-right">{formatInteger(fila.repuestos)}</td>
                <td className="px-3 py-2 text-right">{formatInteger(fila.utilidad)}</td>
                <td className={`px-3 py-2 text-right ${COMPARE_BG}`}>
                  {formatInteger(fila.utilidad_year)}
                </td>
                <td className="px-3 py-2 text-right">{formatInteger(fila.ticket_total)}</td>
                <td className="px-3 py-2 text-right">{formatDecimal(fila.horas_cliente)}</td>
                <td className="px-3 py-2 text-right">{formatDecimal(fila.horas_garantia)}</td>
                <td className="px-3 py-2 text-right">{formatDecimal(fila.horas_internas)}</td>
                <td className="px-3 py-2 text-right">{formatDecimal(fila.horas_servicio)}</td>
                <td className="px-3 py-2 text-right">{formatDecimal(fila.total_horas)}</td>
                <td className="px-3 py-2 text-right">{formatInteger(fila.valor_hora)}</td>
                <td className="px-3 py-2 text-center whitespace-nowrap">{fila.fecha_ini}</td>
                <td className="px-3 py-2 text-right">{fila.dias_vacaciones}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

      {filteredAndSorted.length > 0 && (
        <div className="flex flex-col items-center gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50/80">
          <p className="text-xs text-gray-500 text-center">
            Mostrando {startIndex + 1}–{Math.min(endIndex, filteredAndSorted.length)} de{" "}
            {filteredAndSorted.length} técnicos
          </p>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onChange={changePage}
            />
          )}
        </div>
      )}
    </div>
  );
}
