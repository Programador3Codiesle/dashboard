import { apiClient } from "@/lib/api-client";

export interface TicketPromedioTecnicoRow {
  operario: string;
  tecnico: string;
  sede: string;
  anio: number;
  mes: number;
  ventaRepuestos: number;
  ventaManoObra: number;
  ventaTotal: number;
  ordenesRepuestos: number;
  ordenesManoObra: number;
  totalOrdenes: number;
  promedioRepuestos: number;
  promedioManoObra: number;
  promedioTotal: number;
}

export interface FiltrosTicketPromedioTecnico {
  year: number;
  month: number;
  patio: string; // 'all' o id numérico en string
}

export const ticketPromedioTecnicoService = {
  async listar(
    filtros: FiltrosTicketPromedioTecnico,
  ): Promise<TicketPromedioTecnicoRow[]> {
    const params = new URLSearchParams();
    params.set("year", String(filtros.year));
    params.set("month", String(filtros.month));
    params.set("patio", filtros.patio);

    const response = await apiClient.get<TicketPromedioTecnicoRow[]>(
      `/informes/postventa/ticket-promedio-tecnico?${params.toString()}`,
    );
    return response.data;
  },
};

