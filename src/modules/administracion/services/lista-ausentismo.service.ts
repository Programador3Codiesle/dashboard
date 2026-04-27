import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface AusentismoDiaActualAPI {
  id: string;
  empleado: number;
  nombre: string;
  fecha: string;
  motivo: string;
  horaInicio?: string | null;
  horaFin?: string | null;
  autorizacion?: number | null;
}

export interface AusentismoDiaActual {
  id: number;
  empleado: number;
  nombre: string;
  fecha: string;
  motivo: string;
  horaInicio: string;
  horaFin: string;
  estado: "Pendiente" | "Aprobado" | "Rechazado";
}

export const listaAusentismoService = {
  async obtenerDiaActual(): Promise<AusentismoDiaActual[]> {
    const response = await fetchWithAuth(`${API_URL}/administracion/lista-ausentismo/dia-actual`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const data: AusentismoDiaActualAPI[] = await response.json();
    return data.map((item) => ({
      id: Number(item.id),
      empleado: item.empleado,
      nombre: item.nombre || "Sin nombre",
      fecha: new Date(item.fecha).toISOString().split("T")[0],
      motivo: item.motivo || "Sin motivo",
      horaInicio: item.horaInicio || "-",
      horaFin: item.horaFin || "-",
      estado:
        item.autorizacion === 1
          ? "Aprobado"
          : item.autorizacion === 2
            ? "Rechazado"
            : "Pendiente",
    }));
  },
};
