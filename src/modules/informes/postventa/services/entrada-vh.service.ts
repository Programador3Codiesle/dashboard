import { apiClient } from "@/lib/api-client";

export interface InformeEntradaVhResumen {
  anio: number;
  mes: number;
  citasAgendadas: number;
  citasAsistidas: number;
  porcentajeCitasCumplidas: number;
  cantidadTemprano: number;
  cantidadAtiempo: number;
  cantidadTarde: number;
  porcentajeTemprano: number;
  porcentajeAtiempo: number;
  porcentajeTarde: number;
  vhSinCita: number;
  totalIngresos: number;
  porcentajeVhAgendados: number;
}

export const informeEntradaVhService = {
  async obtenerResumen(year: number, month: number): Promise<InformeEntradaVhResumen> {
    const params = new URLSearchParams();
    params.set("year", String(year));
    params.set("month", String(month));

    const response = await apiClient.get<InformeEntradaVhResumen>(
      `/informes/postventa/entrada-vh?${params.toString()}`,
    );
    return response.data;
  },
};

