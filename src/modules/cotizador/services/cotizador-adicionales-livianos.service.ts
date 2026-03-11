import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface ClaseAdicionalLiviano {
  clase: string;
  descripcion: string;
}

export interface AdicionalNombreLiviano {
  id: number;
  adicional: string;
  estado: number;
}

export interface AdicionalesLivianosInitResponse {
  clases: ClaseAdicionalLiviano[];
  adicionales: AdicionalNombreLiviano[];
}

export interface BulkRepuestoAdicionalLivianoInput {
  codigo: string;
  descripcion: string;
  cantidad: number;
  yearStart: number;
  yearEnd: number;
  descuento?: number | null;
}

export interface BulkManoObraAdicionalLivianoInput {
  operacion: string;
  tiempo: number;
  valorMenos5: number;
  valorMas5: number;
  descuento?: number | null;
}

export interface BulkResultAdicionalLiviano {
  repuestos_add: number;
  repuestos_fail: number;
  mano_add: number;
  mano_fail: number;
}

export interface AdicionalRepuestoLiviano {
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

export interface AdicionalManoObraLiviano {
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

export interface ListarAdicionalesLivianosResponse {
  repuestos: AdicionalRepuestoLiviano[];
  manoObra: AdicionalManoObraLiviano[];
}

export interface CodigoRepuestoValidationResponse {
  response: 'success' | 'error';
  codigo?: string;
  alterno?: string | null;
}

export const cotizadorAdicionalesLivianosService = {
  async getInit(): Promise<AdicionalesLivianosInitResponse> {
    const resp = await fetchWithAuth(
      `${API_URL}/cotizador/adicionales-livianos`,
      { method: "GET" }
    );

    if (!resp.ok) {
      throw new Error("No se pudo cargar la configuración de adicionales livianos.");
    }

    return (await resp.json()) as AdicionalesLivianosInitResponse;
  },

  async crearAdicional(nombre: string): Promise<void> {
    const resp = await fetchWithAuth(
      `${API_URL}/cotizador/adicionales-livianos/adicional`,
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

  async updateAdicionalEstado(id: number, estado: number): Promise<void> {
    const resp = await fetchWithAuth(
      `${API_URL}/cotizador/adicionales-livianos/adicional/estado`,
      {
        method: "POST",
        body: JSON.stringify({ id, estado }),
      }
    );

    if (!resp.ok) {
      const msg = await resp.text();
      throw new Error(msg || "No se pudo actualizar el estado del adicional.");
    }
  },

  async cargarItems(payload: {
    adicionalId: number;
    clases: string[];
    repuestos: BulkRepuestoAdicionalLivianoInput[];
    manoObra: BulkManoObraAdicionalLivianoInput[];
  }): Promise<BulkResultAdicionalLiviano> {
    const resp = await fetchWithAuth(
      `${API_URL}/cotizador/adicionales-livianos/items`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    if (!resp.ok) {
      const msg = await resp.text();
      throw new Error(msg || "No se pudo cargar los adicionales.");
    }

    return (await resp.json()) as BulkResultAdicionalLiviano;
  },

  async listar(params: {
    adicionalId?: number;
    clases?: string[];
  }): Promise<ListarAdicionalesLivianosResponse> {
    const search = new URLSearchParams();
    if (params.adicionalId) search.set("adicionalId", String(params.adicionalId));
    if (params.clases && params.clases.length) {
      search.set("clases", params.clases.join(","));
    }

    const url = `${API_URL}/cotizador/adicionales-livianos/items?${search.toString()}`;
    const resp = await fetchWithAuth(url, { method: "GET" });

    if (!resp.ok) {
      const msg = await resp.text();
      throw new Error(msg || "No se pudo listar los adicionales.");
    }

    return (await resp.json()) as ListarAdicionalesLivianosResponse;
  },

  async validarCodigoRepuesto(
    codigo: string
  ): Promise<CodigoRepuestoValidationResponse> {
    const resp = await fetchWithAuth(
      `${API_URL}/cotizador/repuestos/validar-codigo`,
      {
        method: "POST",
        body: JSON.stringify({ codigo }),
      }
    );

    if (!resp.ok) {
      const msg = await resp.text();
      throw new Error(msg || "No se pudo validar el código del repuesto.");
    }

    return (await resp.json()) as CodigoRepuestoValidationResponse;
  },

  async updateRepuestoAdicional(payload: {
    seq: number;
    descripcion: string;
    cantidad: number;
    yearStart: number;
    yearEnd: number;
    descuento?: number | null;
  }): Promise<void> {
    const resp = await fetchWithAuth(
      `${API_URL}/cotizador/adicionales-livianos/items/repuesto`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );

    if (!resp.ok) {
      const msg = await resp.text();
      throw new Error(
        msg || "No se pudo actualizar el repuesto del adicional."
      );
    }
  },

  async updateManoObraAdicional(payload: {
    id: number;
    operacion: string;
    tiempo: number;
    valorMenos5: number;
    valorMas5: number;
    descuento?: number | null;
  }): Promise<void> {
    const resp = await fetchWithAuth(
      `${API_URL}/cotizador/adicionales-livianos/items/mano-obra`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );

    if (!resp.ok) {
      const msg = await resp.text();
      throw new Error(
        msg || "No se pudo actualizar la mano de obra del adicional."
      );
    }
  },

  async deleteRepuestoAdicional(payload: {
    seq: number;
    codigo: string;
    adicionalId: number;
  }): Promise<void> {
    const resp = await fetchWithAuth(
      `${API_URL}/cotizador/adicionales-livianos/items/repuesto`,
      {
        method: "DELETE",
        body: JSON.stringify(payload),
      }
    );

    if (!resp.ok) {
      const msg = await resp.text();
      throw new Error(
        msg || "No se pudo eliminar el repuesto del adicional."
      );
    }
  },

  async deleteManoObraAdicional(payload: {
    id: number;
    operacion: string;
    adicionalId: number;
  }): Promise<void> {
    const resp = await fetchWithAuth(
      `${API_URL}/cotizador/adicionales-livianos/items/mano-obra`,
      {
        method: "DELETE",
        body: JSON.stringify(payload),
      }
    );

    if (!resp.ok) {
      const msg = await resp.text();
      throw new Error(
        msg || "No se pudo eliminar la mano de obra del adicional."
      );
    }
  },
};

