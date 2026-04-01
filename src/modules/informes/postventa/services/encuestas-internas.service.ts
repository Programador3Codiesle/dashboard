import { apiClient } from "@/lib/api-client";

export interface EncuestaInternaRow {
  numeroOrden: number;
  bodega: string;
  fechaOt: string;
  horaOt: string;
  placa: string;
  nit: string;
  cliente: string;
  celular: string | null;
  telefono1: string | null;
  telefono2: string | null;
  correo: string | null;
  fechaEncuesta: string;
  calificacion: string;
}

export interface FiltrosEncuestasInternas {
  fechaInicio: string;
  fechaFin: string;
}

export const encuestasInternasService = {
  async obtener(
    filtros: FiltrosEncuestasInternas,
  ): Promise<EncuestaInternaRow[]> {
    const params = new URLSearchParams();
    params.set("fechaInicio", filtros.fechaInicio);
    params.set("fechaFin", filtros.fechaFin);

    const response = await apiClient.get<EncuestaInternaRow[]>(
      `/informes/postventa/encuestas-internas?${params.toString()}`,
    );
    return response.data;
  },
};

