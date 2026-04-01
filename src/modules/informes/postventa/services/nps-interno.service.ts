import { apiClient } from '@/lib/api-client';

export interface NpsInternoMesTecnico {
  tecnicoNit: string;
  tecnicoNombre: string;
  sedeDescripcion: string;
  mes: number;
  enc0a6: number;
  enc7a8: number;
  enc9a10: number;
  totalEncuestas: number;
  nps: number;
}

export interface NpsInternoTecnicoResumen {
  tecnicoNit: string;
  tecnicoNombre: string;
  sedes: string;
  meses: NpsInternoMesTecnico[];
}

export const npsInternoService = {
  async obtenerResumen(params: {
    year: number;
  }): Promise<NpsInternoTecnicoResumen[]> {
    const query = new URLSearchParams();
    query.append('year', String(params.year));

    const { data } = await apiClient.get<NpsInternoTecnicoResumen[]>(
      `/informes/postventa/nps-interno?${query.toString()}`,
    );
    return data;
  },
};

