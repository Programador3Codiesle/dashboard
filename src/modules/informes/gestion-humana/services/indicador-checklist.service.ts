import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface IndicadorChecklistAPI {
  sede: string;
  numRegistros: number;
}

export interface IndicadorChecklist {
  sede: string;
  numRegistros: number;
}

export interface FiltrosIndicadorChecklist {
  op: number;
  sede?: string;
  fechaIni: string;
  fechaFin: string;
}

function mapItem(item: IndicadorChecklistAPI): IndicadorChecklist {
  return {
    sede: item.sede || "N/A",
    numRegistros: item.numRegistros ?? 0,
  };
}

export const indicadorChecklistService = {
  async listar(filtros: FiltrosIndicadorChecklist): Promise<IndicadorChecklist[]> {
    const params = new URLSearchParams();
    params.append("op", String(filtros.op));
    params.append("fechaIni", filtros.fechaIni);
    params.append("fechaFin", filtros.fechaFin);
    if (filtros.sede) params.append("sede", filtros.sede);

    const response = await fetchWithAuth(
      `${API_URL}/administracion/informe-indicador-checklist?${params.toString()}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error("Error al cargar el indicador de checklist.");
    }

    const data: IndicadorChecklistAPI[] = await response.json();
    return (data || []).map(mapItem);
  },
};

