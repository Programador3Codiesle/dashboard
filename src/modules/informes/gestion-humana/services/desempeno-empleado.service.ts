import { apiClient } from '@/lib/api-client';

export interface DesempenoEmpleado {
  id: number;
  nitEmpleado: number;
  empleado: string;
  area: string;
  cargo: string;
  sede: string;
  fecha: string;
  calificado: number;
  jefe: string;
  calificacionEmpleado: number;
  calificacionJefe: number;
  calificacionFinal: number;
  capacidadesEntrenamiento: string | null;
  compromisos: string | null;
}

export interface CompetenciaDesempenoDetalle {
  key: string;
  label: string;
  empleado: number;
  jefe: number;
}

export interface DesempenoEmpleadoDetalle extends DesempenoEmpleado {
  competencias: CompetenciaDesempenoDetalle[];
}

export interface FiltrosDesempenoEmpleado {
  anio: number;
  sede?: string;
  pagina?: number;
  limite?: number;
}

export const desempenoEmpleadoService = {
  async listar(
    filtros: FiltrosDesempenoEmpleado,
  ): Promise<{ items: DesempenoEmpleado[]; total: number }> {
    const params = new URLSearchParams();
    params.append('anio', String(filtros.anio));
    if (filtros.sede) params.append('sede', filtros.sede);
    if (filtros.pagina != null) params.append('pagina', String(filtros.pagina));
    if (filtros.limite != null) params.append('limite', String(filtros.limite));

    const { data } = await apiClient.get<{ items: DesempenoEmpleado[]; total: number }>(
      `/informes/informe-desempeno-empleado?${params.toString()}`,
    );

    return {
      items: data.items ?? [],
      total: data.total ?? 0,
    };
  },

  async obtenerDetalle(id: number): Promise<DesempenoEmpleadoDetalle> {
    const { data } = await apiClient.get<DesempenoEmpleadoDetalle>(
      `/informes/informe-desempeno-empleado/${id}`,
    );
    return data;
  },
};

