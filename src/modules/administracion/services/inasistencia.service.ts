import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ========== Tipos de respuesta de la API ==========

export interface InasistenciaAPI {
  documento: number;
  nombre: string;
  fecha: string;
}

export interface Inasistencia {
  id: number;
  documento: string;
  nombre: string;
  fecha: string;
}

export interface FiltrosInasistencia {
  empleado?: string;
  fechaInicio?: string;
  fechaFinal?: string;
}

// ========== Servicio ==========

export const inasistenciaService = {
  /**
   * Obtener lista de inasistencias con filtros
   */
  async listarInasistencias(filtros?: FiltrosInasistencia): Promise<Inasistencia[]> {
    const params = new URLSearchParams();
    if (filtros?.empleado) params.append("empleado", filtros.empleado.toString());
    if (filtros?.fechaInicio) params.append("fecha_inicio", filtros.fechaInicio);
    if (filtros?.fechaFinal) params.append("fecha_final", filtros.fechaFinal);

    const response = await fetchWithAuth(
      `${API_URL}/administracion/inasistencia?${params.toString()}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const data: InasistenciaAPI[] = await response.json();

    // Mapear respuesta del API al formato del frontend
    return data.map((item, index) => ({
      id: index + 1,
      documento: item.documento?.toString() || "",
      nombre: item.nombre || "Sin nombre",
      fecha: new Date(item.fecha).toISOString().split("T")[0],
    }));
  },

  /**
   * Exportar inasistencias a Excel
   */
  async exportarExcel(filtros?: FiltrosInasistencia): Promise<Blob> {
    const params = new URLSearchParams();
    if (filtros?.empleado) params.append("empleado", filtros.empleado);
    if (filtros?.fechaInicio) params.append("fecha_inicio", filtros.fechaInicio);
    if (filtros?.fechaFinal) params.append("fecha_final", filtros.fechaFinal);

    const response = await fetchWithAuth(
      `${API_URL}/administracion/inasistencia/exportar?${params.toString()}`,
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
