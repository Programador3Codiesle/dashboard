import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface HorasExtrasDiaActualAPI {
  id: string;
  empleado: number;
  nombre_empleado: string;
  fecha: string;
  hora_ini: string;
  hora_fin: string;
  descripcion: string;
}

export interface HorasExtrasDiaActual {
  id: number;
  empleado: number;
  nombreEmpleado: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  descripcion: string;
}

export const listaHorasExtrasService = {
  async obtenerDiaActual(): Promise<HorasExtrasDiaActual[]> {
    const response = await fetchWithAuth(`${API_URL}/administracion/lista-horas-extras/dia-actual`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const data: HorasExtrasDiaActualAPI[] = await response.json();
    return data.map((item) => ({
      id: Number(item.id),
      empleado: item.empleado,
      nombreEmpleado: item.nombre_empleado || "Sin nombre",
      fecha: new Date(item.fecha).toISOString().split("T")[0],
      horaInicio: item.hora_ini || "",
      horaFin: item.hora_fin || "",
      descripcion: item.descripcion || "",
    }));
  },
};
