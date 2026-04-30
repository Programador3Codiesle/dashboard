import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface RepuestoNoDisponibleRow {
  bodega: string;
  cant_codigo: number;
  codigo: string;
  descripcion: string;
  uni_disponibles: number;
}

export interface RepuestosNoDisponiblesFiltro {
  dateStart: string;
  dateEnd: string;
  bodega?: number | null;
}

export const cotizadorRepuestosNoDispService = {
  async listar(
    params: RepuestosNoDisponiblesFiltro
  ): Promise<RepuestoNoDisponibleRow[]> {
    const search = new URLSearchParams({
      dateStart: params.dateStart,
      dateEnd: params.dateEnd,
      ...(params.bodega != null && params.bodega !== undefined
        ? { bodega: String(params.bodega) }
        : {}),
    });

    const response = await fetchWithAuth(
      `${API_URL}/cotizador/repuestos-no-disponibles?${search.toString()}`,
      { method: "GET" }
    );

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(
        msg || "No se pudo cargar el listado de repuestos no disponibles."
      );
    }

    return (await response.json()) as RepuestoNoDisponibleRow[];
  },
};
