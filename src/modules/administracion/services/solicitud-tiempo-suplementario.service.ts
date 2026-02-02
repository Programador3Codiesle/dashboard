import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface TiempoSuplementarioCalendarioAPI {
  id: string;
  empleado: number;
  nombre_empleado: string | null;
  cargo_emp: string | null;
  sede: string | null;
  area: string;
  fecha_ini: string;
  hora_ini: string;
  hora_fin: string;
  descripcion: string;
  estado: number;
}

export interface TiempoSuplementarioCalendario {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  descripcion: string;
  estado: string;
  area?: string;
  cargo?: string | null;
  sede?: string | null;
  empleado?: number;
  nombreEmpleado?: string | null;
}

export interface NuevaSolicitudTiempoSuplementarioDTO {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  area: string;
  cargo: string;
  sede: string;
  descripcion: string;
  id_empresa?: number;
  empleado?: number;
}

const ESTADOS: Record<number, string> = {
  0: "Pendiente",
  1: "Aprobado",
  2: "Rechazado",
};

export const solicitudTiempoSuplementarioService = {
  async crearSolicitud(dto: NuevaSolicitudTiempoSuplementarioDTO): Promise<TiempoSuplementarioCalendario> {
    const response = await fetchWithAuth(`${API_URL}/administracion/solicitud-tiempo-suplementario`, {
      method: "POST",
      body: JSON.stringify({
        fecha_ini: dto.fecha,
        hora_ini: dto.horaInicio,
        hora_fin: dto.horaFin,
        area: dto.area,
        cargo_emp: dto.cargo,
        sede: dto.sede,
        descripcion: dto.descripcion,
        id_empresa: dto.id_empresa,
        empleado: dto.empleado,
      }),
    });

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const result: { status: boolean; message: string; data?: TiempoSuplementarioCalendarioAPI } =
      await response.json();

    if (!result.status || !result.data) {
      throw new Error(result.message || "No se pudo crear la solicitud");
    }

    const item = result.data;
    return {
      id: Number(item.id),
      fecha: new Date(item.fecha_ini).toISOString().split("T")[0],
      horaInicio: item.hora_ini || "",
      horaFin: item.hora_fin || "",
      descripcion: item.descripcion,
      estado: ESTADOS[item.estado] || "Pendiente",
    };
  },

  async obtenerCalendario(mes: number, anio: number): Promise<TiempoSuplementarioCalendario[]> {
    const response = await fetchWithAuth(
      `${API_URL}/administracion/solicitud-tiempo-suplementario/calendario?mes=${mes}&anio=${anio}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const data: TiempoSuplementarioCalendarioAPI[] = await response.json();
    return data.map((item) => ({
      id: Number(item.id),
      fecha: new Date(item.fecha_ini).toISOString().split("T")[0],
      horaInicio: item.hora_ini || "",
      horaFin: item.hora_fin || "",
      descripcion: item.descripcion,
      estado: ESTADOS[item.estado] || "Pendiente",
      area: item.area,
      cargo: item.cargo_emp,
      sede: item.sede,
      empleado: item.empleado,
      nombreEmpleado: item.nombre_empleado ?? null,
    }));
  },
};
