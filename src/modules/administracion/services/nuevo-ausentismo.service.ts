import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ========== Tipos de respuesta de la API ==========

export interface AusentismoCalendarioAPI {
  id_ausen: string;
  empleado: number;
  cargo_emp: string | null;
  sede: string | null;
  area: string;
  fecha_ini: string;
  hora_ini: string | null;
  fecha_fin: string;
  hora_fin: string | null;
  descripcion: string;
  autorizacion: number;
  motivo: string | null;
  titulo: string | null;
}

export interface AusentismoCalendario {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  descripcion: string;
  estado: string;
}

export interface NuevoAusentismoDTO {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  area: string;
  cargo: string;
  sede: string;
  motivo: string;
  descripcionMotivo: string;
  id_empresa?: number;
}

type ApiMessageResponse<T = unknown> = {
  status: boolean;
  message: string;
  data?: T;
};

// Mapeo de estados de autorización
const ESTADOS_AUTORIZACION: Record<number, string> = {
  0: "Pendiente",
  1: "Aprobado",
  2: "Rechazado",
};

// ========== Servicio ==========

export const nuevoAusentismoService = {
  /**
   * Crear nuevo ausentismo
   */
  async crearAusentismo(dto: NuevoAusentismoDTO): Promise<AusentismoCalendario> {
    const response = await fetchWithAuth(`${API_URL}/administracion/nuevo-ausentismo`, {
      method: "POST",
      body: JSON.stringify({
        fecha_ini: dto.fecha,
        hora_ini: dto.horaInicio,
        hora_fin: dto.horaFin,
        area: dto.area,
        cargo_emp: dto.cargo,
        sede: dto.sede,
        motivo: dto.motivo,
        descripcion: dto.descripcionMotivo,
        id_empresa: dto.id_empresa,
      }),
    });

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const result: ApiMessageResponse<AusentismoCalendarioAPI> = await response.json();

    if (!result.status || !result.data) {
      throw new Error(result.message || "No se pudo crear el ausentismo");
    }

    const item = result.data;
    return {
      id: Number(item.id_ausen),
      fecha: new Date(item.fecha_ini).toISOString().split("T")[0],
      horaInicio: item.hora_ini || "",
      horaFin: item.hora_fin || "",
      motivo: item.motivo || "",
      descripcion: item.descripcion,
      estado: ESTADOS_AUTORIZACION[item.autorizacion] || "Pendiente",
    };
  },

  /**
   * Obtener ausentismos del calendario por mes y año
   */
  async obtenerCalendario(mes: number, anio: number): Promise<AusentismoCalendario[]> {
    const response = await fetchWithAuth(
      `${API_URL}/administracion/nuevo-ausentismo/calendario?mes=${mes}&anio=${anio}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const data: AusentismoCalendarioAPI[] = await response.json();

    return data.map((item) => ({
      id: Number(item.id_ausen),
      fecha: new Date(item.fecha_ini).toISOString().split("T")[0],
      horaInicio: item.hora_ini || "",
      horaFin: item.hora_fin || "",
      motivo: item.motivo || "",
      descripcion: item.descripcion,
      estado: ESTADOS_AUTORIZACION[item.autorizacion] || "Pendiente",
    }));
  },
};
