import * as XLSX from "xlsx";
import type { FilaInformeAsesor } from "../types";

function formatNumber(value: number): string {
  return Math.round(Number(value || 0)).toLocaleString("es-CO");
}

export function exportPygAsesoresExcel(
  filas: FilaInformeAsesor[],
  yearComparar: number,
): void {
  const headers = [
    "RNK",
    "ASESOR DE REPUESTOS",
    "VENTA TALLER",
    "COSTO TALLER",
    "UTILIDAD TALLER",
    `UTILIDAD TALLER ${yearComparar}`,
    "VENTA MOSTRADOR",
    "COSTO MOSTRADOR",
    "UTILIDAD MOSTRADOR",
    `UTILIDAD MOSTRADOR ${yearComparar}`,
    "UTILIDAD TOTAL",
    `UTILIDAD TOTAL ${yearComparar}`,
    "SALARIO",
    "FECHA INICIO LABOR",
    "DÍAS VACACIONES",
  ];

  const rows = filas.map((f) => [
    f.rnk,
    f.nombres,
    formatNumber(f.venta_taller),
    formatNumber(f.costo_taller),
    formatNumber(f.utilidad_taller),
    formatNumber(f.utilidad_taller_ant),
    formatNumber(f.venta_mostrador),
    formatNumber(f.costo_mostrador),
    formatNumber(f.utilidad_mostrador),
    formatNumber(f.utilidad_mostrador_ant),
    formatNumber(f.utilidad_total),
    formatNumber(f.utilidad_total_ant),
    formatNumber(f.salario),
    f.fecha_ini,
    f.dias,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Informe");
  XLSX.writeFile(wb, "P&G Técnicos.xlsx");
}
