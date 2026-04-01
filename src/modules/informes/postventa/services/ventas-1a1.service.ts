import { apiClient } from "@/lib/api-client";

export interface Ventas1a1Asesor {
  nitAsesor: string;
  asesor: string;
}

export interface Ventas1a1Row {
  anio: number;
  nitAsesor: string;
  asesor: string;
  ventaManoObra: number;
  ventaRepuestos: number;
  costoRepuestos: number;
  utilidad: number;
  porcentajeConversion: number | null;
}

export const ventas1a1Service = {
  async listarAsesores(): Promise<Ventas1a1Asesor[]> {
    const response = await apiClient.get<Ventas1a1Asesor[]>(
      "/informes/postventa/ventas-1a1/asesores",
    );
    return response.data;
  },

  async obtenerInforme(
    year: number,
    asesor?: string | null,
  ): Promise<Ventas1a1Row[]> {
    const params = new URLSearchParams();
    params.set("year", String(year));
    if (asesor && asesor.trim() !== "") {
      params.set("asesor", asesor);
    }

    const response = await apiClient.get<Ventas1a1Row[]>(
      `/informes/postventa/ventas-1a1?${params.toString()}`,
    );
    return response.data;
  },
};

