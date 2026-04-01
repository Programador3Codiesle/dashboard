import { apiClient } from '@/lib/api-client';

export interface SegundaEntregaResumen {
  anio: number;
  mes: number;
  dia: number;
  entregas: number;
  agendas: number;
}

export interface SegundaEntregaDetalle {
  anio: number;
  mes: number;
  dia: number;
  vehiculo: string;
  sede: string;
  agendadoPor: string;
}

export interface SegundaEntregaRespuesta {
  resumen: SegundaEntregaResumen[];
  detalle: SegundaEntregaDetalle[];
}

export const segundaEntregaService = {
  async listar(fi: string, ff: string): Promise<SegundaEntregaRespuesta> {
    const params = new URLSearchParams();
    params.append('fi', fi);
    params.append('ff', ff);

    const { data } = await apiClient.get<SegundaEntregaRespuesta>(
      `/informes/postventa/segunda-entrega?${params.toString()}`,
    );

    return data;
  },
};

