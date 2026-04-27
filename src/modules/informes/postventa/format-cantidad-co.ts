const cantidadFormatter = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Cantidades y montos en español (Colombia), sin decimales: miles con punto,
 * redondeo al entero (ej. 140589,698 → "140.590").
 */
export function formatCantidadCo(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return cantidadFormatter.format(Math.round(Number(value)));
}

/**
 * Número en es-CO con decimales fijos (coma decimal, punto miles), redondeado.
 */
export function formatNumeroCo(
  value: number | null | undefined,
  minimumFractionDigits: number,
  maximumFractionDigits: number,
): string {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  const d = maximumFractionDigits;
  const factor = 10 ** d;
  const rounded = Math.round(Number(value) * factor) / factor;
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(rounded);
}
