import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface AusentismoInformeAPI {
  id_ausen: string;
  gestionado_por: string;
  colaborador: string;
  sede: string;
  area: string;
  fecha_inicio: string;
  hora_inicio: string;
  fecha_fin: string;
  hora_fin: string;
  estado: number;
  detalle: string;
}

export interface AusentismoInforme {
  id: number;
  gestionadoPor: string;
  colaborador: string;
  sede: string;
  area: string;
  fechaInicio: string;
  horaInicio: string;
  fechaFin: string;
  horaFin: string;
  estado: string;
  detalle: string;
}

export interface FiltrosAusentismo {
  fechaDesde?: string;
  fechaHasta?: string;
  sede?: string;
  area?: string;
  empleado?: string;
  pagina?: number;
  limite?: number;
}

const ESTADOS: Record<number, string> = {
  0: "Pendiente",
  1: "Autorizado",
  2: "Rechazado",
};

function mapItem(item: AusentismoInformeAPI): AusentismoInforme {
  return {
    id: Number(item.id_ausen),
    gestionadoPor: item.gestionado_por || "N/A",
    colaborador: item.colaborador || "N/A",
    sede: item.sede || "N/A",
    area: item.area || "N/A",
    fechaInicio: new Date(item.fecha_inicio).toISOString().split("T")[0],
    horaInicio: item.hora_inicio || "",
    fechaFin: new Date(item.fecha_fin).toISOString().split("T")[0],
    horaFin: item.hora_fin || "",
    estado: ESTADOS[item.estado] ?? "Pendiente",
    detalle: item.detalle || "",
  };
}

export const informeAusentismoService = {
  async listar(filtros?: FiltrosAusentismo): Promise<{ items: AusentismoInforme[]; total: number }> {
    const params = new URLSearchParams();
    if (filtros?.fechaDesde) params.append("fecha_desde", filtros.fechaDesde);
    if (filtros?.fechaHasta) params.append("fecha_hasta", filtros.fechaHasta);
    if (filtros?.sede) params.append("sede", filtros.sede);
    if (filtros?.area) params.append("area", filtros.area);
    if (filtros?.empleado?.trim()) params.append("empleado", filtros.empleado.trim());
    if (filtros?.pagina != null) params.append("pagina", String(filtros.pagina));
    if (filtros?.limite != null) params.append("limite", String(filtros.limite));

    const response = await fetchWithAuth(
      `${API_URL}/administracion/informe-ausentismo?${params.toString()}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const data: { items: AusentismoInformeAPI[]; total: number } = await response.json();
    return {
      items: (data.items || []).map(mapItem),
      total: data.total ?? 0,
    };
  },

  async obtenerDetalle(id: number): Promise<AusentismoInforme | null> {
    const response = await fetchWithAuth(`${API_URL}/administracion/informe-ausentismo/${id}/detalle`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const data: AusentismoInformeAPI = await response.json();
    return mapItem(data);
  },
};
