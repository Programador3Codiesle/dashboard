import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface VehiculoCotizacionPesados {
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

export interface ClaseDescripcionPesados {
  clase: string;
  descripcion: string;
}

export interface RevisionPesados {
  revision: number;
}

export interface RepuestoMantenimientoPesados {
  seq: number;
  codigo: string;
  descripcion: string;
  categoria: string;
  cantidad: number;
  grupo: string;
  ano_inicio: number;
  ano_fin: number;
  valor: number;
  unidades_disponibles: number;
  kit: number;
}

export interface ManoObraMantenimientoPesados {
  seq: number;
  operacion: string;
  descrpcion: string;
  horas: number;
  valor: number;
}

export interface GrupoMantenimientoPesados {
  grupo: string;
  repuestos: RepuestoMantenimientoPesados[];
  manoObra: ManoObraMantenimientoPesados[];
}

export interface MantenimientoPesadosResponse {
  grupos: GrupoMantenimientoPesados[];
}

export interface PesadosInitData {
  clases: ClaseDescripcionPesados[];
}

export interface PesadosInfoClientResponse {
  vehiculo: VehiculoCotizacionPesados;
  revisiones: RevisionPesados[];
}

export interface CrearCotizacionPesadosGeneralPayload {
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

export interface RepuestoCotizacionPesadosPayload {
  codigo: string;
  descripcion: string;
  cantidad: number;
  categoria?: string | null;
  uni_disponibles: number;
  valor: number;
  estado: number;
  grupo: string;
}

export interface ManoObraCotizacionPesadosPayload {
  mtto: string;
  valor: number;
  estado: number;
  cant_horas: number | null;
  grupo: string;
}

export interface CrearCotizacionPesadosPayload {
  general: CrearCotizacionPesadosGeneralPayload;
  repuestos: RepuestoCotizacionPesadosPayload[];
  manoObra: ManoObraCotizacionPesadosPayload[];
}

export const cotizadorPesadosService = {
  async getInitData(): Promise<PesadosInitData> {
    const response = await fetchWithAuth(`${API_URL}/cotizador/pesados`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("No se pudo cargar la configuración inicial del cotizador de pesados.");
    }

    const data = (await response.json()) as PesadosInitData;
    return data;
  },

  async getInfoClient(placa: string): Promise<PesadosInfoClientResponse> {
    const params = new URLSearchParams({ placa });

    const response = await fetchWithAuth(`${API_URL}/cotizador/pesados/vehiculo?${params.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(msg || "No se pudo obtener la información del vehículo.");
    }

    const data = (await response.json()) as PesadosInfoClientResponse;
    return data;
  },

  async getMantenimiento(params: {
    clase: string;
    revision: number;
    bodega: number;
    yearModel: number;
  }): Promise<MantenimientoPesadosResponse> {
    const search = new URLSearchParams({
      clase: params.clase,
      revision: String(params.revision),
      bodega: String(params.bodega),
      yearModel: String(params.yearModel),
    });

    const response = await fetchWithAuth(`${API_URL}/cotizador/pesados/mantenimiento?${search.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("No se pudo cargar el mantenimiento de la revisión seleccionada.");
    }

    const data = (await response.json()) as MantenimientoPesadosResponse;
    return data;
  },

  async crearCotizacion(payload: CrearCotizacionPesadosPayload): Promise<{ idCotizacion: number }> {
    const response = await fetchWithAuth(`${API_URL}/cotizador/pesados/cotizacion`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(msg || "No se pudo guardar la cotización de pesados.");
    }

    const data = (await response.json()) as { idCotizacion: number };
    return data;
  },
};

