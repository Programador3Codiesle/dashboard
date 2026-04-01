import { apiClient } from '@/lib/api-client';

export type OrigenNpsTecnicos = 'nps_int' | 'nps_col';

export type SedeNpsTecnicos = 'todas' | 'giron' | 'rosita' | 'bocono' | 'barranca';

export interface NpsTecnicoRow {
  origen: OrigenNpsTecnicos;
  sede: string;
  tecnico: string;
  nps: number;
  enc0a6: number;
  enc7a8: number;
  enc9a10: number;
  mesNumero: number | null;
  mesNombre: string;
}

export const npsTecnicosService = {
  async listar(params: {
    origen: OrigenNpsTecnicos;
    sede: SedeNpsTecnicos;
    mes: number;
  }): Promise<NpsTecnicoRow[]> {
    const query = new URLSearchParams();
    query.append('origen', params.origen);
    query.append('sede', params.sede);
    query.append('mes', String(params.mes));

    const { data } = await apiClient.get<NpsTecnicoRow[]>(
      `/informes/postventa/nps-tecnicos?${query.toString()}`,
    );
    return data;
  },
};

