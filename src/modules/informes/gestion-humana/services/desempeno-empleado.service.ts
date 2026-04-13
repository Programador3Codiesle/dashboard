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

export interface FiltrosDesempenoEmpleado {
  anio: number;
  sede?: string;
}

export const desempenoEmpleadoService = {
  async listar(filtros: FiltrosDesempenoEmpleado): Promise<DesempenoEmpleado[]> {
    const params = new URLSearchParams();
    params.append('anio', String(filtros.anio));
    if (filtros.sede) params.append('sede', filtros.sede);

    const { data } = await apiClient.get<DesempenoEmpleado[]>(
      `/informes/informe-desempeno-empleado?${params.toString()}`,
    );

    return data;
  },
};

