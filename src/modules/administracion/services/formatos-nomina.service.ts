import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ========== Tipos de respuesta de la API ==========

export interface FormatoNominaAPI {
  id: number;
  nombre: string;
  descripcion: string;
  ruta_archivo: string;
}

type ApiMessageResponse<T = unknown> = {
  status: boolean;
  message: string;
  data?: T;
};

// ========== Servicio ==========

export const formatosNominaService = {
  /**
   * Obtener todos los formatos de nómina disponibles
   */
  async obtenerFormatos(): Promise<FormatoNominaAPI[]> {
    const response = await fetchWithAuth(`${API_URL}/administracion/formatos-nomina`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const data: FormatoNominaAPI[] = await response.json();
    return data;
  },

  /**
   * Obtener ruta de archivo para descarga
   */
  async obtenerRutaArchivo(id: number): Promise<string | null> {
    const response = await fetchWithAuth(`${API_URL}/administracion/formatos-nomina/${id}/descargar`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Error al obtener la ruta del archivo");
    }

    const result: ApiMessageResponse<{ ruta: string }> = await response.json();
    return result.data?.ruta || null;
  },

  /**
   * Descargar formato de nómina
   */
  async descargarFormato(id: number, nombre: string): Promise<void> {
    try {
      const ruta = await this.obtenerRutaArchivo(id);
      if (!ruta) {
        throw new Error("No se pudo obtener la ruta del archivo");
      }

      // Construir URL completa para descarga
      const url = ruta.startsWith("http") ? ruta : `${API_URL}${ruta}`;
      
      // Abrir en nueva pestaña para descarga
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error al descargar formato:", error);
      throw error;
    }
  },
};
