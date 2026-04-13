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
  entradas?: number;
  ventas?: number;
}

type Ventas1a1RowApi = Partial<Ventas1a1Row> & {
  año?: number;
  nit_asesor?: string;
  venta_mano_obra?: number;
  venta_rptos?: number;
  costo_rptos?: number;
  porcentaje_conversion?: number | null;
  porcentaje?: number | null;
  entradas?: number;
  ventas?: number;
};

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

    const response = await apiClient.get<Ventas1a1RowApi[]>(
      `/informes/postventa/ventas-1a1?${params.toString()}`,
    );
    return response.data.map((row) => {
      const ventas = Number(row.ventas ?? 0);
      const entradas = Number(row.entradas ?? 0);

      let porcentajeConversion: number | null = null;
      const porcentajeRaw =
        row.porcentajeConversion ?? row.porcentaje_conversion ?? row.porcentaje;

      // Prioridad frontend como legacy: (entradas / ventas) * 100
      if (ventas > 0) {
        porcentajeConversion = (entradas / ventas) * 100;
      } else if (porcentajeRaw != null && Number.isFinite(Number(porcentajeRaw))) {
        porcentajeConversion = Number(porcentajeRaw);
      }

      return {
        anio: Number(row.anio ?? row.año ?? 0),
        nitAsesor: String(row.nitAsesor ?? row.nit_asesor ?? ""),
        asesor: String(row.asesor ?? ""),
        ventaManoObra: Number(row.ventaManoObra ?? row.venta_mano_obra ?? 0),
        ventaRepuestos: Number(row.ventaRepuestos ?? row.venta_rptos ?? 0),
        costoRepuestos: Number(row.costoRepuestos ?? row.costo_rptos ?? 0),
        utilidad: Number(row.utilidad ?? 0),
        porcentajeConversion,
        entradas: Number.isFinite(entradas) ? entradas : undefined,
        ventas: Number.isFinite(ventas) ? ventas : undefined,
      };
    });
  },
};

