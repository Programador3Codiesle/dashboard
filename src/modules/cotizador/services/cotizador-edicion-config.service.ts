import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type TablaKeyEdicion =
  | "livianos_repuesto"
  | "livianos_mano_adicional"
  | "livianos_mano_trabajos"
  | "pesados_repuesto"
  | "pesados_mano_adicional"
  | "pesados_mano_trabajos";

export interface TablaConfigEntry {
  key: TablaKeyEdicion;
  tabla: string;
  columna_clase: string;
  filtros: string[];
  excluir: string[];
  columnas_editables: string[];
}

export interface EdicionClaseOption {
  clase: string;
  descripcion: string | null;
}

export interface AplicarEdicionResult {
  affectedRows: number;
}

export const cotizadorEdicionConfigService = {
  async getTablas(): Promise<TablaConfigEntry[]> {
    const resp = await fetchWithAuth(
      `${API_URL}/cotizador/editar-repuesto-mano-obra/tablas`,
      { method: "GET" }
    );
    if (!resp.ok) {
      throw new Error("No se pudo cargar la configuración de tablas.");
    }
    return (await resp.json()) as TablaConfigEntry[];
  },

  async getClases(tablaKey: TablaKeyEdicion): Promise<EdicionClaseOption[]> {
    const url = `${API_URL}/cotizador/editar-repuesto-mano-obra/clases?tablaKey=${tablaKey}`;
    const resp = await fetchWithAuth(url, { method: "GET" });
    if (!resp.ok) {
      throw new Error("No se pudieron cargar las clases.");
    }
    return (await resp.json()) as EdicionClaseOption[];
  },

  async getFiltroOpciones(payload: {
    tablaKey: TablaKeyEdicion;
    filtro: string;
    whereParcial: Record<string, string | number | null | undefined>;
  }): Promise<string[]> {
    const resp = await fetchWithAuth(
      `${API_URL}/cotizador/editar-repuesto-mano-obra/filtro-opciones`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    if (!resp.ok) {
      throw new Error("No se pudieron cargar las opciones de filtro.");
    }
    return (await resp.json()) as string[];
  },

  async aplicarEdicion(payload: {
    tablaKey: TablaKeyEdicion;
    filtros: Record<string, string | number>;
    campos: Record<string, string | number>;
  }): Promise<AplicarEdicionResult> {
    const resp = await fetchWithAuth(
      `${API_URL}/cotizador/editar-repuesto-mano-obra/aplicar`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    const text = await resp.text();
    if (!resp.ok) {
      throw new Error(text || "No se pudo aplicar la edición.");
    }
    try {
      return JSON.parse(text) as AplicarEdicionResult;
    } catch {
      return { affectedRows: 0 };
    }
  },
};

