import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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
  empresa?: number | null;
}

export interface EnviarEmailCotizacionParams {
  tipo: TipoCotizacion;
  idCotizacion: number;
  placa: string;
  estado?: number;
  agenda?: boolean;
  /** 1=Codiesel, 2=Dieselco, 3=Mitsubishi, 4=BYD. Opcional; para colores del PDF adjunto. */
  empresa?: number;
}

export interface ActualizarEstadoCotizacionParams {
  tipo: TipoCotizacion;
  idCotizacion: number;
}

export const cotizadorInformesService = {
  async listar(tipo: TipoCotizacion, params: ListarCotizacionesParams): Promise<CotizacionResumen[]> {
    const search = new URLSearchParams({
      dateStart: params.dateStart,
      dateEnd: params.dateEnd,
    });
    if (params.empresa != null) {
      search.set("empresa", String(params.empresa));
    }

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

  async enviarEmail(params: EnviarEmailCotizacionParams): Promise<{ ok: boolean; message: string }> {
    const body = {
      origen: params.tipo,
      idCotizacion: params.idCotizacion,
      placa: params.placa,
      estado: params.estado ?? 0,
      agenda: params.agenda ?? false,
      ...(params.empresa != null && { empresa: params.empresa }),
    };

    const response = await fetchWithAuth(`${API_URL}/cotizador/informe-cotizaciones/email`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("No se pudo enviar el correo de la cotización.");
    }

    const data = (await response.json()) as { ok: boolean; message: string };
    return data;
  },

  async actualizarEstado(params: ActualizarEstadoCotizacionParams): Promise<void> {
    const body = {
      origen: params.tipo,
      idCotizacion: params.idCotizacion,
    };

    const response = await fetchWithAuth(`${API_URL}/cotizador/informe-cotizaciones/agenda`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("No se pudo actualizar el estado de la cotización.");
    }

    // No necesitamos el body de respuesta; con que no falle es suficiente.
    try {
      await response.json();
    } catch {
      // ignorar si no hay cuerpo JSON
    }
  },
};

