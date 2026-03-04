import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface VehiculoCotizacionLivianos {
  nit: string | number;
  cliente: string;
  mail: string | null;
  celular: string | null;
  placa: string;
  clase: string;
  descripcion: string;
  year: number;
  des_modelo: string;
  kilometraje: number;
  uetd_entrada: string | null;
  km_promedio: number | null;
  km_estimado: number | null;
  n_carac: number;
  caract_10: string | null;
}

export interface LivianosInitData {
  clases: any[];
  bodegas: any[];
  adicionales: any[];
  tiposRetorno: any[];
}

export interface RevisionOption {
  revision: number;
}

export interface RepuestoRevisionDetalle {
  seq: number;
  codigo: string;
  descripcion: string;
  categoria: string;
  cantidad: number;
  valor: number;
  unidades_disponibles: number;
}

export interface ManoObraMttoDetalle {
  descripcion_operacion: string;
  valor_unitario: number;
  operacion: string;
  valor_mas_5anos: number;
  cant_horas: number;
}

export interface CotizacionRevisionDetalle {
  repuestos: RepuestoRevisionDetalle[];
  manoObra: ManoObraMttoDetalle[];
}

export interface CrearCotizacionGeneralPayload {
  nombreCliente: string;
  nitCliente: string | number;
  telfCliente: string | null;
  placa: string;
  clase: string;
  descripcion: string;
  des_modelo: string;
  kilometraje_actual: number;
  kilometraje_estimado: number | null;
  kilometraje_cliente: number;
  bodega: number;
  revision: number;
  emailCliente: string | null;
  usuario: string | number;
  observaciones?: string | null;
  estado: number;
}

export interface RepuestoCotizacionPayload {
  codigo: string;
  descripcion: string;
  cantidad: number;
  categoria?: string | null;
  uni_disponibles: number;
  valor: number;
  estado: number;
  adicional?: string | null;
}

export interface ManoObraCotizacionPayload {
  mtto: string;
  valor: number;
  estado: number;
  cant_horas: number | null;
  adicional?: string | null;
}

export interface CrearCotizacionLivianosPayload {
  general: CrearCotizacionGeneralPayload;
  repuestos: RepuestoCotizacionPayload[];
  manoObra: ManoObraCotizacionPayload[];
}

export const cotizadorLivianosService = {
  async getInitData(): Promise<LivianosInitData> {
    const response = await fetchWithAuth(`${API_URL}/cotizador/livianos`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("No se pudo cargar la configuración inicial del cotizador de livianos.");
    }

    const data = (await response.json()) as LivianosInitData;
    return data;
  },

  async getVehiculoPorPlaca(placa: string): Promise<VehiculoCotizacionLivianos> {
    const params = new URLSearchParams({ placa });

    const response = await fetchWithAuth(`${API_URL}/cotizador/livianos/vehiculo?${params.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(msg || "No se pudo obtener la información del vehículo.");
    }

    const data = (await response.json()) as VehiculoCotizacionLivianos;
    return data;
  },

  async getRevisiones(clase: string): Promise<RevisionOption[]> {
    const params = new URLSearchParams({ clase });

    const response = await fetchWithAuth(`${API_URL}/cotizador/livianos/revisiones?${params.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("No se pudieron obtener las revisiones de mantenimiento.");
    }

    const data = (await response.json()) as RevisionOption[];
    return data;
  },

  async getRevisionDetalle(params: { bodega: number; clase: string; revision: number }): Promise<CotizacionRevisionDetalle> {
    const search = new URLSearchParams({
      bodega: String(params.bodega),
      clase: params.clase,
      revision: String(params.revision),
    });

    const response = await fetchWithAuth(`${API_URL}/cotizador/livianos/detalle?${search.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("No se pudo cargar el detalle de la cotización.");
    }

    const data = (await response.json()) as CotizacionRevisionDetalle;
    return data;
  },

  async crearCotizacion(payload: CrearCotizacionLivianosPayload): Promise<{ idCotizacion: number }> {
    const response = await fetchWithAuth(`${API_URL}/cotizador/livianos/cotizacion`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(msg || "No se pudo guardar la cotización.");
    }

    const data = (await response.json()) as { idCotizacion: number };
    return data;
  },
};
