import { fetchWithAuth } from "@/utils/api";
import { getApiBaseUrl } from "@/config/public-env";

const API_URL = getApiBaseUrl();

export interface TiempoSuplementarioInformeAPI {
  id: string;
  empleado: number | null;
  nombre_jefe: string | null;
  nombre_empleado: string | null;
  sede: string | null;
  area: string | null;
  cargo: string | null;
  fecha: string | null;
  hora_ini: string | null;
  hora_fin: string | null;
  fecha_solicitud: string | null;
  descripcion: string | null;
  estado: number | null;
}

export interface TiempoSuplementarioInforme {
  id: number;
  empleado: number;
  nombreJefe: string;
  nombreEmpleado: string;
  sede: string;
  area: string;
  cargo: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  fechaSolicitud: string;
  descripcion: string;
  estado: string;
}

export interface FiltrosTiempoSuplementario {
  fechaDesde?: string;
  fechaHasta?: string;
  sede?: string;
  area?: string;
  empleado?: string;
}

function fechaInicioBogota(value: string | null): string {
  if (!value) return "";
  const fecha = new Date(value);
  if (Number.isNaN(fecha.getTime())) return value;
  return fecha.toLocaleDateString("sv-SE", { timeZone: "America/Bogota" });
}

const ESTADOS: Record<number, string> = {
  0: "Pendiente",
  1: "Aprobado",
  2: "Negado",
};

export const informeTiempoSuplementarioService = {
  async listar(filtros?: FiltrosTiempoSuplementario): Promise<TiempoSuplementarioInforme[]> {
    const params = new URLSearchParams();
    if (filtros?.fechaDesde) params.append("fecha_desde", filtros.fechaDesde);
    if (filtros?.fechaHasta) params.append("fecha_hasta", filtros.fechaHasta);
    if (filtros?.sede) params.append("sede", filtros.sede);
    if (filtros?.area) params.append("area", filtros.area);
    if (filtros?.empleado?.trim()) params.append("empleado", filtros.empleado.trim());

    const response = await fetchWithAuth(
      `${API_URL}/administracion/informe-tiempo-suplementario?${params.toString()}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const data: TiempoSuplementarioInformeAPI[] = await response.json();
    return data.map((item) => ({
      id: Number(item.id),
      empleado: item.empleado || 0,
      nombreJefe: item.nombre_jefe || "Sin nombre",
      nombreEmpleado: item.nombre_empleado || "Sin nombre",
      sede: item.sede || "N/A",
      area: item.area || "N/A",
      cargo: item.cargo || "",
      fecha: fechaInicioBogota(item.fecha),
      horaInicio: item.hora_ini || "",
      horaFin: item.hora_fin || "",
      fechaSolicitud: item.fecha_solicitud || "",
      descripcion: item.descripcion || "",
      estado:
        item.estado !== null && item.estado !== undefined
          ? (ESTADOS[item.estado] ?? "Pendiente")
          : "Pendiente",
    }));
  },

  async exportarExcel(filtros?: FiltrosTiempoSuplementario): Promise<Blob> {
    const params = new URLSearchParams();
    if (filtros?.fechaDesde) params.append("fecha_desde", filtros.fechaDesde);
    if (filtros?.fechaHasta) params.append("fecha_hasta", filtros.fechaHasta);
    if (filtros?.sede) params.append("sede", filtros.sede);
    if (filtros?.area) params.append("area", filtros.area);
    if (filtros?.empleado?.trim()) params.append("empleado", filtros.empleado.trim());

    const response = await fetchWithAuth(
      `${API_URL}/administracion/informe-tiempo-suplementario/exportar?${params.toString()}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Error al exportar a Excel");
    }

    return response.blob();
  },
};
