import { apiClient } from "@/lib/api-client";

export interface InventarioObsoletoRow {
  codigo: string;
  descripcion: string;
  stock: number;
  bodega: number;
  costoUnitario: number;
  costoPromedio: number;
  pvp: number;
  margen: number;
  meses: number;
}

export interface FiltrosInventarioObsoletos {
  opcion: number;
  categoria: number;
  rango: number;
}

export const inventarioObsoletosService = {
  async obtener(
    filtros: FiltrosInventarioObsoletos,
  ): Promise<InventarioObsoletoRow[]> {
    const params = new URLSearchParams();
    params.set("opcion", String(filtros.opcion));
    params.set("categoria", String(filtros.categoria));
    params.set("rango", String(filtros.rango));

    const response = await apiClient.get<InventarioObsoletoRow[]>(
      `/informes/postventa/inventario-obsoletos?${params.toString()}`,
    );
    return response.data;
  },
};

