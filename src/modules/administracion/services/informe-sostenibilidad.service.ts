import { fetchWithAuth } from "@/utils/api";
import { getApiBaseUrl } from "@/config/public-env";

const API_URL = getApiBaseUrl();

export const informeSostenibilidadService = {
  async obtenerRutaArchivo(): Promise<string | null> {
    const response = await fetchWithAuth(`${API_URL}/administracion/informe-sostenibilidad`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const result: { ruta: string } = await response.json();
    return result.ruta || null;
  },

  async descargarInforme(): Promise<void> {
    try {
      const ruta = await this.obtenerRutaArchivo();
      if (!ruta) {
        throw new Error("No se pudo obtener la ruta del archivo");
      }

      const url = ruta.startsWith("http") ? ruta : `${API_URL}${ruta}`;
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error al descargar informe:", error);
      throw error;
    }
  },
};
