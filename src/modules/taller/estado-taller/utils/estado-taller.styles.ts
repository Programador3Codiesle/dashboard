export const ET_CARD =
  "bg-white brand-card-surface brand-card-elevated rounded-xl border brand-border-active";

export const ET_INPUT =
  "rounded-lg border brand-border-active bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

export function formatMonto(value: number | null | undefined): string {
  if (value == null) return "0";
  return Math.round(value).toLocaleString("es-CO");
}

export function rowToneClass(tone: "danger" | "warning" | "success" | null): string {
  if (tone === "danger") return "bg-red-50";
  if (tone === "warning") return "bg-amber-50";
  if (tone === "success") return "bg-emerald-50";
  return "bg-white";
}

export function rowBorderClass(borderEspera: boolean): string {
  return borderEspera ? "ring-2 ring-inset ring-red-500" : "";
}

export const ET_COL_ESTADO = "bg-gray-100";
export const ET_COL_FACTURA = "bg-yellow-100/70";
