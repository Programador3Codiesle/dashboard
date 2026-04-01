import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface PausaActivaAPI {
  nit_empleado: string | null;
  nombres: string | null;
  sede: string | null;
  fecha_am: string | null;
  fecha_pm: string | null;
}

export interface PausaActiva {
  documento: string;
  nombre: string;
  sede: string;
  fechaAM: string | null;
  fechaPM: string | null;
}

export interface FiltrosPausasActivas {
  empleado?: string;
  sede?: string;
  fechaDia?: string;
  fechaMes?: string;
}

function mapItem(item: PausaActivaAPI): PausaActiva {
  const formatDateTime = (value: string | null): string | null => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toISOString().replace("T", " ").slice(0, 16);
  };

  return {
    documento: item.nit_empleado ? String(item.nit_empleado) : "N/A",
    nombre: item.nombres || "N/A",
    sede: item.sede || "N/A",
    fechaAM: formatDateTime(item.fecha_am),
    fechaPM: formatDateTime(item.fecha_pm),
  };
}

export const informePausasActivaseService = {
  async listar(filtros: FiltrosPausasActivas): Promise<PausaActiva[]> {
    const params = new URLSearchParams();
    if (filtros.empleado) params.append("empleado", filtros.empleado);
    if (filtros.sede) params.append("sede", filtros.sede);
    if (filtros.fechaDia) params.append("fechaDia", filtros.fechaDia);
    if (filtros.fechaMes) params.append("fechaMes", filtros.fechaMes);

    const response = await fetchWithAuth(
      `${API_URL}/administracion/informe-pausas-activas?${params.toString()}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error("Error al cargar el informe de pausas activas");
    }

    const data: PausaActivaAPI[] = await response.json();
    return (data || []).map(mapItem);
  },
};

