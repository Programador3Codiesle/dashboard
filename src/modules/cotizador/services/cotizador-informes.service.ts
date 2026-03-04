import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export type TipoCotizacion = "livianos" | "pesados";

export interface CotizacionResumen {
  id_cotizacion: number;
  placa: string;
  clase: string;
  des_modelo: string;
  kilometraje_cliente: number | null;
  revision: number | null;
  bodega: number | null;
  NomBodega: string | null;
  asesor: string | null;
  correo: string | null;
  estado: number;
  fecha_creacion: string;
  caducidad: string | null;
  origen: TipoCotizacion;
}

export interface ListarCotizacionesParams {
  dateStart: string;
  dateEnd: string;
}

export const cotizadorInformesService = {
  async listar(tipo: TipoCotizacion, params: ListarCotizacionesParams): Promise<CotizacionResumen[]> {
    const search = new URLSearchParams({
      dateStart: params.dateStart,
      dateEnd: params.dateEnd,
    });

    const path =
      tipo === "livianos"
        ? "/cotizador/informe-cotizaciones/livianos"
        : "/cotizador/informe-cotizaciones/pesados";

    const response = await fetchWithAuth(`${API_URL}${path}?${search.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("No se pudo cargar el informe de cotizaciones.");
    }

    const data = (await response.json()) as CotizacionResumen[];
    return data;
  },
};

