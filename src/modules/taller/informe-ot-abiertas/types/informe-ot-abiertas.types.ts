export interface OrdenAbiertaInforme {
  numero: number;
  bodega: string;
  cliente: string;
  asesor: string;
  fecha: string | null;
  vehiculo: string;
}

export interface TotalSede {
  sede: string;
  label: string;
  total: number;
}

export interface TotalBodega {
  bodegaId: number;
  descripcion: string;
  total: number;
}

export interface AsesorOtCount {
  nombres: string;
  total: number;
}

export interface InformeGeneral {
  totalesSedes: TotalSede[];
  totalGeneral: number;
  ordenes: OrdenAbiertaInforme[];
}

export interface InformePorSede {
  sede: string;
  sedeLabel: string;
  totalesBodegas: TotalBodega[];
  ordenes: OrdenAbiertaInforme[];
}

export interface InformePorTaller {
  bodegaId: number;
  asesores: AsesorOtCount[];
}

export type SedeKey = "giron" | "rosita" | "barranca" | "bocono";

export const SEDE_KEYS: SedeKey[] = ["giron", "rosita", "barranca", "bocono"];

export function isSedeKey(value: string): value is SedeKey {
  return (SEDE_KEYS as string[]).includes(value);
}
