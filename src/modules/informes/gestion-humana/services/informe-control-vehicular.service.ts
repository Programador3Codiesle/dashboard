import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface ControlVehicularAPI {
  id: number;
  fecha_salida: string | null;
  hora_salida: string | null;
  km_salida: number | null;
  porteria: string | null;
  placa: string | null;
  tipo_vehiculo: string | null;
  modelo: string | null;
  conductor: string | null;
  pasajeros: string | null;
  persona_autorizo: string | null;
  fecha_llegada: string | null;
  hora_llegada: string | null;
  km_llegada: number | null;
  taller: string | null;
  observacion: string | null;
  placa_vh_remolcado: string | null;
}

export interface ControlVehicular extends ControlVehicularAPI {
  id: number;
}

export interface PaginadoControlVehicular {
  items: ControlVehicular[];
  total: number;
  page: number;
  limit: number;
}

export interface FiltrosControlVehicular {
  page: number;
  limit: number;
  buscador?: string;
  fechaIni?: string;
  fechaFin?: string;
  porteria?: string;
}

function mapItem(item: ControlVehicularAPI): ControlVehicular {
  return {
    ...item,
    id: Number(item.id),
  };
}

export const informeControlVehicularService = {
  async listar(filtros: FiltrosControlVehicular): Promise<PaginadoControlVehicular> {
    const params = new URLSearchParams();
    params.append("page", String(filtros.page));
    params.append("limit", String(filtros.limit));
    if (filtros.buscador) params.append("buscador", filtros.buscador);
    if (filtros.fechaIni) params.append("fechaIni", filtros.fechaIni);
    if (filtros.fechaFin) params.append("fechaFin", filtros.fechaFin);
    if (filtros.porteria) params.append("porteria", filtros.porteria);

    const response = await fetchWithAuth(
      `${API_URL}/administracion/informe-control-vehicular?${params.toString()}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error("Error al cargar el informe de control vehicular.");
    }

    const json = await response.json();

    const data: ControlVehicularAPI[] = json.data || [];
    const items = data.map(mapItem);

    return {
      items,
      total: json.total ?? items.length,
      page: json.page ?? filtros.page,
      limit: json.limit ?? filtros.limit,
    };
  },

  async detalle(id: number): Promise<ControlVehicular | null> {
    const params = new URLSearchParams({ id: String(id) });
    const response = await fetchWithAuth(
      `${API_URL}/administracion/informe-control-vehicular/detalle?${params.toString()}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error("Error al cargar el detalle de control vehicular.");
    }

    const json = await response.json();
    if (!json.status || !json.data) return null;

    return mapItem(json.data as ControlVehicularAPI);
  },
};

