import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface ClaseAdicionalPesado {
  clase: string;
  descripcion: string;
}

export interface AdicionalNombrePesado {
  id: number;
  adicional: string;
  estado: number;
}

export interface AdicionalesPesadosInitResponse {
  clases: ClaseAdicionalPesado[];
  adicionales: AdicionalNombrePesado[];
}

export interface BulkRepuestoAdicionalPesadoInput {
  codigo: string;
  descripcion: string;
  cantidad: number;
  yearStart: number;
  yearEnd: number;
  descuento?: number | null;
}

export interface BulkManoObraAdicionalPesadoInput {
  operacion: string;
  tiempo: number;
  valorMenos5: number;
  valorMas5: number;
  descuento?: number | null;
}

export interface BulkResultAdicionalPesado {
  repuestos_add: number;
  repuestos_fail: number;
  mano_add: number;
  mano_fail: number;
}

export interface AdicionalRepuestoPesado {
  seq: number;
  clase: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  year_start: number;
  year_end: number;
  descuento: number | null;
  adicionalId: number;
  adicionalNombre: string;
  estado: number;
}

export interface AdicionalManoObraPesado {
  id: number;
  clase: string;
  operacion: string;
  tiempo: number;
  valor_menos_5anos: number;
  valor_mas_5anos: number;
  descuento: number | null;
  adicionalId: number;
  adicionalNombre: string;
  estado: number;
}

export interface ListarAdicionalesPesadosResponse {
  repuestos: AdicionalRepuestoPesado[];
  manoObra: AdicionalManoObraPesado[];
}

export const cotizadorAdicionalesPesadosService = {
  async getInit(): Promise<AdicionalesPesadosInitResponse> {
    const resp = await fetchWithAuth(
      `${API_URL}/cotizador/adicionales-pesados`,
      { method: "GET" }
    );

    if (!resp.ok) {
      throw new Error("No se pudo cargar la configuración de adicionales pesados.");
    }

    return (await resp.json()) as AdicionalesPesadosInitResponse;
  },

  async crearAdicional(nombre: string): Promise<void> {
    const resp = await fetchWithAuth(
      `${API_URL}/cotizador/adicionales-pesados/adicional`,
      {
        method: "POST",
        body: JSON.stringify({ nombre }),
      }
    );

    if (!resp.ok) {
      const msg = await resp.text();
      throw new Error(msg || "No se pudo crear el adicional.");
    }
  },

  async cargarItems(payload: {
    adicionalId: number;
    clases: string[];
    repuestos: BulkRepuestoAdicionalPesadoInput[];
    manoObra: BulkManoObraAdicionalPesadoInput[];
  }): Promise<BulkResultAdicionalPesado> {
    const resp = await fetchWithAuth(
      `${API_URL}/cotizador/adicionales-pesados/items`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    if (!resp.ok) {
      const msg = await resp.text();
      throw new Error(msg || "No se pudo cargar los adicionales.");
    }

    return (await resp.json()) as BulkResultAdicionalPesado;
  },

  async listar(params: {
    adicionalId?: number;
    clases?: string[];
  }): Promise<ListarAdicionalesPesadosResponse> {
    const search = new URLSearchParams();
    if (params.adicionalId) search.set("adicionalId", String(params.adicionalId));
    if (params.clases && params.clases.length) {
      search.set("clases", params.clases.join(","));
    }

    const url = `${API_URL}/cotizador/adicionales-pesados/items?${search.toString()}`;
    const resp = await fetchWithAuth(url, { method: "GET" });

    if (!resp.ok) {
      const msg = await resp.text();
      throw new Error(msg || "No se pudo listar los adicionales.");
    }

    return (await resp.json()) as ListarAdicionalesPesadosResponse;
  },
};

