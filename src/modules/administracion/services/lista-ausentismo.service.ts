import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface AusentismoDiaActualAPI {
  id: string;
  empleado: number;
  nombre: string;
  fecha: string;
  motivo: string;
}

export interface AusentismoDiaActual {
  id: number;
  empleado: number;
  nombre: string;
  fecha: string;
  motivo: string;
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
    }));
  },
};
