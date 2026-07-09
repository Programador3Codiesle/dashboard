import * as XLSX from "xlsx";
import type { FilaInformeTecnico } from "../types";

function formatInteger(value: number): string {
  return Math.round(Number(value || 0)).toLocaleString("es-CO");
}

function formatDecimal(value: number): string {
  return Number(value || 0).toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function exportPygTecnicosExcel(
  filas: FilaInformeTecnico[],
  yearComparar: number,
): void {
  const headers = [
    "RNK",
    "TALLER",
    "TÉCNICO",
    "MANO OBRA",
    "REPUESTOS",
    "UTILIDAD",
    `UTILIDAD AÑO ${yearComparar}`,
    "TICKET TOTAL",
    "HORAS CLIENTE",
    "HORAS GARANTÍA",
    "HORAS INTERNAS",
    "HORAS SERVICIO",
    "TOTAL HORAS",
    "VALOR HORA",
    "FECHA INICIO LABOR",
    "DÍAS VACACIONES",
  ];

  const rows = filas.map((f) => [
    f.rnk,
    f.taller,
    f.nombre,
    formatInteger(f.mano_obra),
    formatInteger(f.repuestos),
    formatInteger(f.utilidad),
    formatInteger(f.utilidad_year),
    formatInteger(f.ticket_total),
    formatDecimal(f.horas_cliente),
    formatDecimal(f.horas_garantia),
    formatDecimal(f.horas_internas),
    formatDecimal(f.horas_servicio),
    formatDecimal(f.total_horas),
    formatInteger(f.valor_hora),
    f.fecha_ini,
    f.dias_vacaciones,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Informe");
  XLSX.writeFile(wb, "P&G Técnicos.xlsx");
}
