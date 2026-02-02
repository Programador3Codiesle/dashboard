import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const reglamentoInternoService = {
  async obtenerRutaArchivo(): Promise<string | null> {
    const response = await fetchWithAuth(`${API_URL}/administracion/reglamento-interno`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const result: { ruta: string } = await response.json();
    return result.ruta || null;
  },

  async descargarReglamento(): Promise<void> {
    try {
      const ruta = await this.obtenerRutaArchivo();
      if (!ruta) {
        throw new Error("No se pudo obtener la ruta del archivo");
      }

      const url = ruta.startsWith("http") ? ruta : `${API_URL}${ruta}`;
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error al descargar reglamento:", error);
      throw error;
    }
  },
};
