import { apiClient } from "@/lib/api-client";

export type TipoInventarioObsoleto =
  | "detalleRepLiv"
  | "detalleRepPes"
  | "detalleAccLiv"
  | "detalleAccPes";

export interface InventarioObsoletoResumenRow {
  tipo: TipoInventarioObsoleto;
  descripcionTipo: string;
  obsoleto: number;
  total: number;
  porcentaje: number;
  habilitaDetalle: boolean;
}

export interface InventarioObsoletoDetalleRow {
  rnk: number;
  codigo: string;
  descripcion: string;
  linea: string;
  stock: number;
  bodega: number;
  costo: number;
  costoTotal: number;
  pvpAntesIva: number;
  margen: number;
  meses: number;
  acumulado: number;
}

export const inventarioObsoletosService = {
  async obtenerResumen(): Promise<InventarioObsoletoResumenRow[]> {
    const response = await apiClient.get<InventarioObsoletoResumenRow[]>(
      "/informes/postventa/inventario-obsoletos/resumen",
    );
    return response.data;
  },

  async obtenerDetalle(
    tipo: TipoInventarioObsoleto,
  ): Promise<InventarioObsoletoDetalleRow[]> {
    const params = new URLSearchParams();
    params.set("tipo", tipo);
    const response = await apiClient.get<InventarioObsoletoDetalleRow[]>(
      `/informes/postventa/inventario-obsoletos/detalle?${params.toString()}`,
    );
    return response.data;
  },
};

