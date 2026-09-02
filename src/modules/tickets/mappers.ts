import { empresasDisponibles } from "./constants";
import { EstadoTicket, Prioridad } from "./types";

export function mapEmpresaCodesToNames(
  codes: string | null | undefined,
): string {
  if (!codes) return "N/A";
  const ids = codes.split(",").map((c) => c.trim()).filter(Boolean);
  if (!ids.length) return "N/A";

  const names = ids
    .map((id) => empresasDisponibles.find((e) => e.id === id)?.nombre)
    .filter(Boolean) as string[];

  return names.length ? names.join(", ") : "N/A";
}

export function mapEstadoFromApi(
  estadoApi: string | null | undefined,
): EstadoTicket {
  const value = (estadoApi || "").toLowerCase();

  if (value === "activo") {
    return "activo";
  }

  if (value === "en proceso") {
    return "en proceso";
  }

  if (value === "cerrado") {
    return "cerrado";
  }

  return "abierto";
}

export function normalizePrioridad(
  prioridad: string | null | undefined,
): Prioridad {
  const value = (prioridad || "").toLowerCase();

  if (value === "alta" || value === "alta ") return "alta";
  if (value === "baja" || value === "baja ") return "baja";

  return "media";
}
