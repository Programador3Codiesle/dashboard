import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ========== Tipos de respuesta de la API ==========

export interface AjusteValoresResponse {
  sw: number;
  tipo: string;
  numero: number;
  tipo_cruce: string | null;
  numero_cruce: number | null;
  retencion: number;
  retencion_iva: number;
  retencion_ica: number;
  iva: number;
  Retencion_estampilla2: number | null;
  Retencion_estampilla1: number | null;
  valor_aplicado: number | null;
  valor_total: number;
  forma_pago: number | null;
  valor: number | null;
  ano: number;
  mes: number;
}

export interface ValoresCruceResponse {
  sw: number;
  tipo: string;
  numero: number;
  tipo_cruce: string; // tipo aplica
  numero_cruce: number; // numero aplica
  retencion: number | null;
  retencion_iva: number | null;
  retencion_ica: number | null;
  iva: number | null;
  Retencion_estampilla2: number | null;
  Retencion_estampilla1: number | null;
  valor_aplicado: number | null;
  valor_total: number | null;
  forma_pago: number | null;
  valor: number | null;
  ano: number | null;
  mes: number | null;
}

export interface Valores2Response {
  sw: number;
  tipo: string;
  numero: number;
  tipo_cruce: string | null;
  numero_cruce: number | null;
  retencion: number | null;
  retencion_iva: number | null;
  retencion_ica: number | null;
  iva: number | null;
  Retencion_estampilla2: number | null;
  Retencion_estampilla1: number | null;
  valor_aplicado: number | null;
  valor_total: number | null;
  forma_pago: number;
  valor: number;
  ano: number;
  mes: number;
}

export interface ActualizarValoresDTO {
  retencion?: number;
  retencion_iva?: number;
  retencion_ica?: number;
  iva?: number;
  Retencion_estampilla2?: number;
  Retencion_estampilla1?: number;
  valor_aplicado?: number;
  valor_total?: number;
}

export interface ActualizarValoresCruceDTO {
  valor_aplicado2: number;
}

export interface ActualizarValores2DTO {
  forma_pago: number;
  valor: number;
}

type ApiMessageResponse<T = unknown> = {
  status: boolean;
  message: string;
  data?: T;
};

// ========== Servicio ==========

export const ajusteValoresService = {
  /**
   * Obtener valores contables por tipo y número
   */
  async obtenerValores(tipo: string, numero: number): Promise<AjusteValoresResponse | null> {
    const response = await fetchWithAuth(`${API_URL}/administracion/ajuste-valores?tipo=${tipo}&numero=${numero}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const result: ApiMessageResponse<AjusteValoresResponse> = await response.json();

    if (!result.status || !result.data) {
      // Si no encontró datos, retornar null en lugar de lanzar error
      return null;
    }

    return result.data;
  },

  /**
   * Validar si los documentos están cerrados
   */
  async validarDocumentosCerrados(ano: number, mes: number): Promise<boolean> {
    const response = await fetchWithAuth(`${API_URL}/administracion/ajuste-valores/documentos-cerrados?ano=${ano}&mes=${mes}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const result: ApiMessageResponse<{ cerrado: boolean }> = await response.json();

    if (!result.status) {
      throw new Error(result.message || "No se pudo validar el estado de los documentos");
    }

    return result.data?.cerrado ?? false;
  },

  /**
   * Actualizar valores contables
   */
  async actualizarValores(numero: number, tipo: string, dto: ActualizarValoresDTO): Promise<AjusteValoresResponse> {
    const response = await fetchWithAuth(`${API_URL}/administracion/ajuste-valores/${numero}?tipo=${tipo}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const result: ApiMessageResponse<AjusteValoresResponse> = await response.json();

    if (!result.status || !result.data) {
      throw new Error(result.message || "No se pudieron actualizar los valores");
    }

    return result.data;
  },

  /**
   * Obtener valores de cruce
   */
  async obtenerValoresCruce(tipo: string, numero: number): Promise<ValoresCruceResponse | null> {
    const response = await fetchWithAuth(`${API_URL}/administracion/ajuste-valores/valores-cruce?tipo=${tipo}&numero=${numero}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const result: ApiMessageResponse<ValoresCruceResponse> = await response.json();

    if (!result.status || !result.data) {
      // Si no encontró datos, retornar null en lugar de lanzar error
      return null;
    }

    return result.data;
  },

  /**
   * Actualizar valor aplicado 2 (valor cruce)
   */
  async actualizarValorCruce(numero: number, tipo: string, dto: ActualizarValoresCruceDTO): Promise<ValoresCruceResponse> {
    const response = await fetchWithAuth(`${API_URL}/administracion/ajuste-valores/${numero}?tipo=${tipo}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const result: ApiMessageResponse<ValoresCruceResponse> = await response.json();

    if (!result.status || !result.data) {
      throw new Error(result.message || "No se pudo actualizar el valor de cruce");
    }

    return result.data;
  },

  /**
   * Obtener valores2 (forma de pago)
   */
  async obtenerValores2(tipo: string, numero: number): Promise<Valores2Response | null> {
    const response = await fetchWithAuth(`${API_URL}/administracion/ajuste-valores/valores2?tipo=${tipo}&numero=${numero}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const result: ApiMessageResponse<Valores2Response> = await response.json();

    if (!result.status || !result.data) {
      // Si no encontró datos, retornar null en lugar de lanzar error
      return null;
    }

    return result.data;
  },

  /**
   * Actualizar valores2 (forma de pago)
   */
  async actualizarValores2(numero: number, tipo: string, dto: ActualizarValores2DTO): Promise<Valores2Response> {
    const response = await fetchWithAuth(`${API_URL}/administracion/ajuste-valores/${numero}?tipo=${tipo}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const result: ApiMessageResponse<Valores2Response> = await response.json();

    if (!result.status || !result.data) {
      throw new Error(result.message || "No se pudieron actualizar los valores de pago");
    }

    return result.data;
  },
};

