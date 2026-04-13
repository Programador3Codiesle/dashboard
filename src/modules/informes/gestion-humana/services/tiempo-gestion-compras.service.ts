import { apiClient } from '@/lib/api-client';

export interface TiempoGestionCompras {
  solicitado_por: string;
  descri_prod: string;
  area_cargar: string;
  urgencia: number;
  fecha_solicitud: string | null;
  fecha_negada: string | null;
  fecha_despacho: string | null;
  estado_actual: string;
  dias: number;
}

export interface FiltrosTiempoGestionCompras {
  fechaIni?: string;
  fechaFin?: string;
  estado?: string;
}

export const tiempoGestionComprasService = {
  async listar(filtros: FiltrosTiempoGestionCompras): Promise<TiempoGestionCompras[]> {
    const params = new URLSearchParams();

    if (filtros.fechaIni) params.append('fechaIni', filtros.fechaIni);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.estado) params.append('estado', filtros.estado);

    const { data } = await apiClient.get<TiempoGestionCompras[]>(
      `/informes/informe-tiempo-gestion-compras?${params.toString()}`,
    );

    return data;
  },
};

