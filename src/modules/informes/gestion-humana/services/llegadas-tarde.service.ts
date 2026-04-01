import { apiClient } from '@/lib/api-client';

export interface LlegadaTarde {
  empleado: number;
  nombres: string;
  sede: string;
  fecha: string;
  llegada_am: string | null;
  llegada_pm: string | null;
  inicio_ausentismo: string | null;
  fin_ausentismo: string | null;
  dif_entrada_am: number;
  dif_entrada_pm: number;
}

export interface ResumenLlegadasTarde {
  nit: number;
  nombres: string;
  totalMinutosTarde: number;
}

export interface FiltrosLlegadasTarde {
  sede?: string;
  empleado?: number;
  fechaInicio: string;
  fechaFin: string;
}

export const llegadasTardeService = {
  async listar(filtros: FiltrosLlegadasTarde): Promise<LlegadaTarde[]> {
    const params = new URLSearchParams();
    params.append('fechaInicio', filtros.fechaInicio);
    params.append('fechaFin', filtros.fechaFin);
    if (filtros.sede) params.append('sede', filtros.sede);
    if (filtros.empleado) params.append('empleado', String(filtros.empleado));

    const { data } = await apiClient.get<LlegadaTarde[]>(
      `/administracion/informe-llegadas-tarde?${params.toString()}`,
    );

    return data;
  },

  async listarResumen(
    fechaInicio: string,
    fechaFin: string,
  ): Promise<ResumenLlegadasTarde[]> {
    const params = new URLSearchParams();
    params.append('fechaInicio', fechaInicio);
    params.append('fechaFin', fechaFin);

    const { data } = await apiClient.get<ResumenLlegadasTarde[]>(
      `/administracion/informe-llegadas-tarde/resumen?${params.toString()}`,
    );

    return data;
  },
};

