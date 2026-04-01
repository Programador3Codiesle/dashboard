import { apiClient } from '@/lib/api-client';

export interface EncuestaSatisfaccionResumen {
  vendedor: string;
  nombres: string;
  promP1: number;
  promP2: number;
}

export interface FiltrosEncuestaSatisfaccion {
  fi: string;
  ff: string;
  bode: string;
  tec: string;
  cli?: string;
  ot?: string;
  ns?: number;
}

export const encuestaSatisfaccionService = {
  async listar(
    filtros: FiltrosEncuestaSatisfaccion,
  ): Promise<EncuestaSatisfaccionResumen[]> {
    const params = new URLSearchParams();

    params.append('fi', filtros.fi);
    params.append('ff', filtros.ff);
    params.append('bode', filtros.bode);
    params.append('tec', filtros.tec);

    if (filtros.cli) params.append('cli', filtros.cli);
    if (filtros.ot) params.append('ot', filtros.ot);
    if (typeof filtros.ns === 'number' && filtros.ns > 0) {
      params.append('ns', filtros.ns.toString());
    }

    const { data } = await apiClient.get<EncuestaSatisfaccionResumen[]>(
      `/informes/postventa/encuesta-satisfaccion?${params.toString()}`,
    );

    return data;
  },
};

