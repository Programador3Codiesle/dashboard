export const COTIZAR_COPY = {
  hubTitle: "Cotizar",
  hubDescription:
    "Livianos, informes, control de repuestos y configuración de adicionales.",
} as const;

function formatYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Rango por defecto: hoy y hace N meses (misma lógica que las pantallas actuales). */
export function defaultDateRangeMonthsBack(monthsBack: number): {
  start: string;
  end: string;
} {
  const today = new Date();
  const from = new Date();
  from.setMonth(today.getMonth() - monthsBack);
  return { start: formatYmd(from), end: formatYmd(today) };
}

/** Rango por defecto: hoy y hace N días. */
export function defaultDateRangeDaysBack(daysBack: number): {
  start: string;
  end: string;
} {
  const today = new Date();
  const from = new Date();
  from.setDate(today.getDate() - daysBack);
  return { start: formatYmd(from), end: formatYmd(today) };
}

