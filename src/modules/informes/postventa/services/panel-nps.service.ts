import { apiClient } from '@/lib/api-client';

export interface PanelNpsPunto {
  mes: number;
  nps: number;
}

export interface SedeSerieNps {
  sede: string;
  puntos: PanelNpsPunto[];
}

export interface PanelNpsTablaRow {
  sede: string;
  enc0a6: number;
  enc7a8: number;
  enc9a10: number;
  to: number;
  nps: number;
  meta: number;
}

export interface PanelNpsResponse {
  series: SedeSerieNps[];
  tabla: PanelNpsTablaRow[];
}

export interface PanelNpsDetalle {
  scope: 'tecnico' | 'sede' | 'general';
  titulo: string;
  sede: string | null;
  mesNumero: number;
  mesNombre: string;
  enc0a6: number;
  enc7a8: number;
  enc9a10: number;
}

export const panelNpsService = {
  async obtenerPanel(): Promise<PanelNpsResponse> {
    const { data } = await apiClient.get<PanelNpsResponse>(
      '/informes/postventa/panel-nps',
    );
    return data;
  },
  async obtenerDetalleTecnico(params: {
    nit: string;
    mes: number;
    sede: string;
  }): Promise<PanelNpsDetalle | null> {
    const query = new URLSearchParams();
    query.append('nit', params.nit);
    query.append('mes', String(params.mes));
    query.append('sede', params.sede);

    const { data } = await apiClient.get<PanelNpsDetalle | null>(
      `/informes/postventa/panel-nps/detalle-tecnico?${query.toString()}`,
    );
    return data;
  },
  async obtenerDetalleSede(params: {
    sede: string;
    mes: number;
  }): Promise<PanelNpsDetalle | null> {
    const query = new URLSearchParams();
    query.append('sede', params.sede);
    query.append('mes', String(params.mes));

    const { data } = await apiClient.get<PanelNpsDetalle | null>(
      `/informes/postventa/panel-nps/detalle-sede?${query.toString()}`,
    );
    return data;
  },
  async obtenerDetalleGeneral(params: {
    mes: number;
  }): Promise<PanelNpsDetalle | null> {
    const query = new URLSearchParams();
    query.append('mes', String(params.mes));

    const { data } = await apiClient.get<PanelNpsDetalle | null>(
      `/informes/postventa/panel-nps/detalle-general?${query.toString()}`,
    );
    return data;
  },
};

