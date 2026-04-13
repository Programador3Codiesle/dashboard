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

/** Detalle de encuesta (legacy Informe NPS / buscar_nps) */
export interface NpsInternoEncuestaDetalle {
  nit: string;
  nombres: string;
  pregunta1: string;
  pregunta2: string;
  pregunta3: string;
  pregunta4: string;
  pregunta5: string;
  fecha: string;
  nOrden: string;
  bodega?: string | null;
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

  /**
   * Sin filtros: equivalente a encuesta_nps() (sin WHERE).
   * Con sede/mes: equivalente a buscar_nps (bodegas + mes).
   */
  async listarEncuestas(
    filtros?: { sede: string; mes: number },
  ): Promise<NpsInternoEncuestaDetalle[]> {
    if (!filtros) {
      const { data } = await apiClient.get<NpsInternoEncuestaDetalle[]>(
        '/informes/postventa/nps-interno/encuestas',
      );
      return data;
    }
    const query = new URLSearchParams();
    query.append('sede', filtros.sede);
    query.append('mes', String(filtros.mes));
    const { data } = await apiClient.get<NpsInternoEncuestaDetalle[]>(
      `/informes/postventa/nps-interno/encuestas?${query.toString()}`,
    );
    return data;
  },
};

