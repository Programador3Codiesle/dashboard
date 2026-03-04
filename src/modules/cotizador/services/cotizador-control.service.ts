import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface FilaControlRepuesto {
  codigo: string;
  principal: number;
  barranca: number;
  rosita: number;
  villa: number;
  disp_principal: number;
  disp_barranca: number;
  disp_rosita: number;
  disp_villa: number;
  min_principal: number;
  min_barranca: number;
  min_rosita: number;
  min_villa: number;
  max_principal: number;
  max_barranca: number;
  max_rosita: number;
  max_villa: number;
}

export const cotizadorControlService = {
  async getControlRepuestos(): Promise<FilaControlRepuesto[]> {
    const response = await fetchWithAuth(`${API_URL}/cotizador/control`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("No se pudo cargar el control de repuestos.");
    }

    const data = (await response.json()) as FilaControlRepuesto[];
    return Array.isArray(data) ? data : [];
  },
};
