import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface ProximoMttoDTO {
  mttoKm: number;
  fecha: string;
}

export interface InformeMttoPreventivoDTO {
  placa: string;
  descripcion: string;
  kilometro_final: number;
  km_promedio: number;
  dias_entre_mtto: number;
  dias_proximo_mtto: number;
  proximos_mtto: ProximoMttoDTO[];
  rutina: string | null;
}

export interface InformeMttoPreventivo {
  placa: string;
  descripcion: string;
  kilometroFinal: number;
  kmPromedio: number;
  diasEntreMtto: number;
  diasProximoMtto: number;
  proximos: ProximoMttoDTO[];
  rutina: string | null;
}

function mapItem(item: InformeMttoPreventivoDTO): InformeMttoPreventivo {
  return {
    placa: item.placa,
    descripcion: item.descripcion,
    kilometroFinal: item.kilometro_final,
    kmPromedio: item.km_promedio,
    diasEntreMtto: item.dias_entre_mtto,
    diasProximoMtto: item.dias_proximo_mtto,
    proximos: item.proximos_mtto ?? [],
    rutina: item.rutina,
  };
}

export interface HistorialMtto {
  numero_orden: string;
  bodega: string;
  fecha_apertura: string;
  fecha_factura: string;
  tipo: string;
  numero: string;
  operacion: string;
  descripcion: string;
  explicacion_operacion: string;
}

export const informeMttoPreventivoVhService = {
  async listar(): Promise<InformeMttoPreventivo[]> {
    const response = await fetchWithAuth(`${API_URL}/administracion/informe-mtto-preventivo-vh`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Error al cargar el informe de mantenimiento preventivo.");
    }

    const data: InformeMttoPreventivoDTO[] = await response.json();
    return (data || []).map(mapItem);
  },

  async historial(placa: string): Promise<HistorialMtto[]> {
    const params = new URLSearchParams({ placa });
    const response = await fetchWithAuth(
      `${API_URL}/administracion/informe-mtto-preventivo-vh/historial?${params.toString()}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error("Error al cargar el historial de mantenimiento.");
    }

    const data: HistorialMtto[] = await response.json();
    return data || [];
  },
};

