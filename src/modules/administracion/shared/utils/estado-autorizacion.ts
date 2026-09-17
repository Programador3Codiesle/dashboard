/** Autorización PHP: 0 Pendiente, 1 Aprobado, 2 Rechazado. */
export type EstadoAutorizacion = "Pendiente" | "Aprobado" | "Rechazado";
export type ToneEstadoAutorizacion = "pendiente" | "aprobado" | "rechazado";

export function toneEstadoAutorizacion(valor: unknown): ToneEstadoAutorizacion {
  const raw = String(valor ?? "")
    .trim()
    .toLowerCase();
  const n = Number(valor);
  if (raw === "aprobado" || raw === "autorizado" || n === 1) return "aprobado";
  if (raw === "rechazado" || raw === "negado" || n === 2) return "rechazado";
  return "pendiente";
}

export function etiquetaEstadoAutorizacion(valor: unknown): EstadoAutorizacion {
  const tone = toneEstadoAutorizacion(valor);
  if (tone === "aprobado") return "Aprobado";
  if (tone === "rechazado") return "Rechazado";
  return "Pendiente";
}

/** Chip de evento en calendarios (texto sobre color sólido). */
export function claseChipEstadoCalendario(estado: unknown): string {
  const tone = toneEstadoAutorizacion(estado);
  if (tone === "aprobado") {
    return "bg-[var(--color-success)] text-white hover:opacity-90";
  }
  if (tone === "rechazado") {
    return "bg-[var(--color-danger)] text-white hover:opacity-90";
  }
  return "bg-[var(--color-warning)] text-gray-900 hover:opacity-90";
}

/** Badge compacto en detalle / tablas. */
export function claseBadgeEstadoAutorizacion(estado: unknown): string {
  const tone = toneEstadoAutorizacion(estado);
  if (tone === "aprobado") {
    return "bg-[var(--color-success-soft)] text-[var(--color-success)]";
  }
  if (tone === "rechazado") {
    return "bg-[var(--color-danger-soft)] text-[var(--color-danger)]";
  }
  return "bg-[var(--color-warning-soft)] text-gray-800";
}
