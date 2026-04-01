import { apiClient } from "@/lib/api-client";

export interface TiempoEntrevistaConsultivaResumenRow {
  bodega: number;
  registrosCitas: number;
  citasMarcadas: number;
  citasNoMarcadas: number;
  citasCumplidas: number;
  citasNoCumplidas: number;
  noAsistieron: number;
  otAbiertas: number;
  tiempoEntrevistaConsultiva: number | null;
}

export interface TiempoEntrevistaConsultivaDetalleRow {
  idCita: number;
  placa: string;
  fechaCita: string;
  bodega: number;
  horaLlegada: string | null;
  numeroOrdenTaller: number | null;
  horaOrden: string | null;
  tiempoOrden: number | null;
}

export interface FiltrosTiempoEntrevistaConsultiva {
  startDate: string;
  endDate: string;
}

export const tiempoEntrevistaConsultivaService = {
  async obtenerResumen(
    filtros: FiltrosTiempoEntrevistaConsultiva,
  ): Promise<TiempoEntrevistaConsultivaResumenRow[]> {
    const params = new URLSearchParams();
    params.set("startDate", filtros.startDate);
    params.set("endDate", filtros.endDate);

    const response = await apiClient.get<TiempoEntrevistaConsultivaResumenRow[]>(
      `/informes/postventa/tiempo-entrevista-consultiva?${params.toString()}`,
    );
    return response.data;
  },

  async obtenerDetalle(
    bodega: number,
    filtros: FiltrosTiempoEntrevistaConsultiva,
  ): Promise<TiempoEntrevistaConsultivaDetalleRow[]> {
    const params = new URLSearchParams();
    params.set("bodega", String(bodega));
    params.set("startDate", filtros.startDate);
    params.set("endDate", filtros.endDate);

    const response = await apiClient.get<TiempoEntrevistaConsultivaDetalleRow[]>(
      `/informes/postventa/tiempo-entrevista-consultiva/detalle?${params.toString()}`,
    );
    return response.data;
  },
};

