import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface EntradaSalidaAPI {
  id_reg_ingreso: number;
  empleado: string;
  nombres: string;
  sede: string;
  accion: string;
  fechas: string;
  horas: string;
}

export interface EntradaSalida {
  id: number;
  documento: string;
  nombres: string;
  sede: string;
  accion: string;
  fecha: string;
  hora: string;
}

export interface FiltrosEntradasSalidas {
  sede: string;
  fechaIni: string;
  fechaFin: string;
  empleado?: string;
}

function mapItem(item: EntradaSalidaAPI): EntradaSalida {
  const fecha = item.fechas;
  return {
    id: Number(item.id_reg_ingreso),
    documento: item.empleado ? String(item.empleado) : "N/A",
    nombres: item.nombres || "N/A",
    sede: item.sede || "N/A",
    accion: item.accion || "",
    fecha,
    hora: item.horas || "",
  };
}

export const informeEntradasSalidasService = {
  async listar(filtros: FiltrosEntradasSalidas): Promise<EntradaSalida[]> {
    const params = new URLSearchParams();
    params.append("sede", filtros.sede);
    params.append("fechaIni", filtros.fechaIni);
    params.append("fechaFin", filtros.fechaFin);
    if (filtros.empleado) params.append("empleado", filtros.empleado);

    const response = await fetchWithAuth(
      `${API_URL}/administracion/informe-entradas-salidas?${params.toString()}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error("Error al cargar el informe de entradas y salidas.");
    }

    const data: EntradaSalidaAPI[] = await response.json();
    return (data || []).map(mapItem);
  },
};

