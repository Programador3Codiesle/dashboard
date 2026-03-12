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
  prepagado: string | null;
  marca?: string | null;
  marcaDescripcion?: string | null;
  empresaMarcaId?: number | null;
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
  tipoMantenimiento?: number | null;
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

export interface EnviarEmailCotizacionLivianosPayload {
  idCotizacion: number;
  placa: string;
  estado: number;
}

export interface CrearPosibleRetornoPayload {
  placa: string;
  tipo_retorno: number;
  observacion: string;
  bodega: number | null;
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

  async getVehiculoPorPlaca(placa: string, empresa?: string): Promise<VehiculoCotizacionLivianos> {
    const params = new URLSearchParams({ placa });
    if (empresa != null && empresa !== "") {
      params.set("empresa", empresa);
    }

    const response = await fetchWithAuth(
      `${API_URL}/cotizador/livianos/vehiculo?${params.toString()}`,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      let msg: string | undefined;
      try {
        const data = await response.json();
        if (typeof data?.message === "string") {
          msg = data.message;
        } else if (Array.isArray(data?.message) && data.message.length > 0) {
          msg = String(data.message[0]);
        }
      } catch {
        // Si no es JSON, intentamos como texto plano
        try {
          msg = await response.text();
        } catch {
          msg = undefined;
        }
      }
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

  async getRevisionDetalle(params: {
    bodega: number;
    clase: string;
    revision: number;
    yearModel: number;
  }): Promise<CotizacionRevisionDetalle> {
    const search = new URLSearchParams({
        bodega: String(params.bodega),
        clase: params.clase,
        revision: String(params.revision),
        yearModel: String(params.yearModel),
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

  async enviarEmailCotizacion(
    payload: EnviarEmailCotizacionLivianosPayload,
  ): Promise<{ ok: boolean; message: string }> {
    const response = await fetchWithAuth(`${API_URL}/cotizador/livianos/cotizacion/email`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(msg || "No se pudo enviar el correo de la cotización.");
    }

    const data = (await response.json()) as { ok: boolean; message: string };
    return data;
  },

  async getAdicionalesModal(params: {
    clase: string;
    bodega: number;
    adicional: number;
    year: number;
  }): Promise<{ soloManoObra: boolean; repuestos: any[]; manoObra: any[] }> {
    const search = new URLSearchParams({
      clase: params.clase,
      bodega: String(params.bodega),
      adicional: String(params.adicional),
      year: String(params.year),
    });
    const response = await fetchWithAuth(
      `${API_URL}/cotizador/livianos/adicionales-modal?${search.toString()}`,
      { method: "GET" },
    );
    if (!response.ok) {
      const msg = await response.text();
      throw new Error(msg || "No se pudieron cargar los datos del adicional.");
    }
    return response.json();
  },

  async crearPosibleRetorno(payload: CrearPosibleRetornoPayload): Promise<{ idRetorno: number }> {
    const response = await fetchWithAuth(`${API_URL}/cotizador/livianos/posible-retorno`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(msg || "No se pudo crear el posible retorno.");
    }

    const data = (await response.json()) as { idRetorno: number };
    return data;
  },
};
