import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface EjecucionResumen {
  total_cotizaciones: number;
  env_sin_agenda: number;
  env_agendadas: number;
  asistidas: number;
}

export interface TotalesEjecucion {
  total_agendado: number;
  total_facturado: number;
  items_cotizados: number;
  items_facturados: number;
}

export interface EjecucionResumenResponse {
  resumen: EjecucionResumen;
  totales: TotalesEjecucion;
}

export interface FilaCotizacionToFacturado {
  id_cotizacion: number;
  numero: number;
  codigo: string;
  valor_cotizado: number;
  operacion: string;
  valor_facturado: number;
}

export interface FilaFacturadoToCotizacion {
  id_cotizacion: number;
  numero: number;
  operacion: string;
  valor_facturado: number;
  codigo: string;
  valor_cotizado: number;
}

export interface EjecucionFiltro {
  dateStart: string;
  dateEnd: string;
  bodega?: number | null;
}

export const cotizadorEjecucionService = {
  async getResumen(params: EjecucionFiltro): Promise<EjecucionResumenResponse> {
    const search = new URLSearchParams({
      dateStart: params.dateStart,
      dateEnd: params.dateEnd,
      ...(params.bodega ? { bodega: String(params.bodega) } : {}),
    });

    const response = await fetchWithAuth(
      `${API_URL}/cotizador/ejecucion-cotizado-vs-facturado?${search.toString()}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error("No se pudo cargar el resumen de ejecución.");
    }

    return (await response.json()) as EjecucionResumenResponse;
  },

  async getCotizacionToFacturado(params: EjecucionFiltro): Promise<FilaCotizacionToFacturado[]> {
    const search = new URLSearchParams({
      dateStart: params.dateStart,
      dateEnd: params.dateEnd,
      ...(params.bodega ? { bodega: String(params.bodega) } : {}),
    });

    const response = await fetchWithAuth(
      `${API_URL}/cotizador/ejecucion-cotizado-vs-facturado/cotizacion-to-facturado?${search.toString()}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error("No se pudo cargar la tabla Cotizado a Facturado.");
    }

    return (await response.json()) as FilaCotizacionToFacturado[];
  },

  async getFacturadoToCotizacion(params: EjecucionFiltro): Promise<FilaFacturadoToCotizacion[]> {
    const search = new URLSearchParams({
      dateStart: params.dateStart,
      dateEnd: params.dateEnd,
      ...(params.bodega ? { bodega: String(params.bodega) } : {}),
    });

    const response = await fetchWithAuth(
      `${API_URL}/cotizador/ejecucion-cotizado-vs-facturado/facturado-to-cotizacion?${search.toString()}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error("No se pudo cargar la tabla Facturado a Cotizado.");
    }

    return (await response.json()) as FilaFacturadoToCotizacion[];
  },
};

