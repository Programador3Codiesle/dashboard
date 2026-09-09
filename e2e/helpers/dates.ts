export function fechaHoyIso(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function inicioMesIso(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

/** Misma convención UTC `YYYY-MM-DD` que `COTIZAR_COPY` defaultDateRangeMonthsBack. */
export function fechaIsoUtc(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function rangoMesesAtras(monthsBack: number, now = new Date()) {
  const from = new Date(now);
  from.setMonth(now.getMonth() - monthsBack);
  return { start: fechaIsoUtc(from), end: fechaIsoUtc(now) };
}

/** Mes calendario anterior (local). Nómina no consulta el mes actual en asesores. */
export function mesAnterior(now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const ano = d.getFullYear();
  const mes = d.getMonth() + 1;
  const ym = `${ano}-${String(mes).padStart(2, "0")}`;
  const start = fechaHoyIso(d);
  const end = fechaHoyIso(new Date(ano, mes, 0));
  return { ano, mes, ym, start, end };
}

