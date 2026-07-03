import type { BodegaVisualConfig, BodegaVisualContext } from "../types/entrada-vehiculo.types";

const LIVIANO_FULL = new Set([1, 8]);
const CAMION_FULL = new Set([11, 16]);
const COLISION_FULL = new Set([9, 21, 14, 22]);

function configLiviano(): BodegaVisualConfig {
  return {
    variant: "liviano",
    borderClass: "border-[var(--color-primary)]",
    bgClass: "bg-white",
    iconKey: "car",
  };
}

function configCamion(): BodegaVisualConfig {
  return {
    variant: "camion",
    borderClass: "border-emerald-500",
    bgClass: "bg-white",
    iconKey: "truck",
  };
}

function configColision(): BodegaVisualConfig {
  return {
    variant: "colision",
    borderClass: "border-red-500",
    bgClass: "bg-white",
    iconKey: "carFront",
  };
}

function configDefault(): BodegaVisualConfig {
  return {
    variant: "default",
    borderClass: "brand-border-active",
    bgClass: "bg-white",
    iconKey: "car",
  };
}

export function getBodegaVisual(
  bodega: number,
  context: BodegaVisualContext = "full",
): BodegaVisualConfig {
  if (context === "fecha") {
    if (bodega === 1) return configLiviano();
    if (bodega === 11) return configCamion();
    if (bodega === 9 || bodega === 21) return configColision();
    return configDefault();
  }

  if (LIVIANO_FULL.has(bodega)) return configLiviano();
  if (CAMION_FULL.has(bodega)) return configCamion();
  if (COLISION_FULL.has(bodega)) return configColision();
  return configDefault();
}

export function parseBodegaId(value: string | number | null | undefined): number {
  if (value == null || value === "") return 0;
  const n = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(n) ? n : 0;
}
