import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ========== Tipos de respuesta de la API ==========

export interface TipoSalida {
  id: number;
  descripcion: string;
}

export interface CrearOrdenSalidaDTO {
  fecha_salida: string;
  area: string;
  sede: string;
  jefe: number;
  tipoSalida: number;
  quienSale: string;
  placa?: string;
  conductor?: string;
  explicacion: string;
  id_empresa: number;
}

/** Tipo para una fila de orden de salida en tablas/listados */
export interface OrdenSalidaResponse {
  id: number;
  numeroOrden: string;
  bodega: string;
  placa: string;
  descripcionModelo: string;
  fecha: string;
}

type ApiMessageResponse<T = unknown> = {
  status: boolean;
  message: string;
  data?: T;
};

// ========== Servicio ==========

export const formatoOrdenSalidaService = {
  /**
   * Obtener tipos de salida permitidos para un jefe (nit).
   * Si no se envía nitJefe, el backend usa el usuario autenticado.
   */
  async obtenerTiposSalida(nitJefe?: number): Promise<TipoSalida[]> {
    const query = nitJefe ? `?nitJefe=${encodeURIComponent(nitJefe)}` : "";
    const response = await fetchWithAuth(
      `${API_URL}/administracion/formato-orden-salida/tipos-salida${query}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const result: ApiMessageResponse<TipoSalida[]> = await response.json();

    if (!result.status || !result.data) {
      return [];
    }

    return result.data;
  },

  /**
   * Crear un nuevo formato de orden de salida
   */
  async crearOrdenSalida(dto: CrearOrdenSalidaDTO): Promise<ApiMessageResponse> {
    const response = await fetchWithAuth(
      `${API_URL}/administracion/formato-orden-salida`,
      {
        method: "POST",
        body: JSON.stringify(dto),
      }
    );

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const result: ApiMessageResponse = await response.json();
    return result;
  },
};
