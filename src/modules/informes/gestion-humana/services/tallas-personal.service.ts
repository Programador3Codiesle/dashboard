import { apiClient } from '@/lib/api-client';

export interface TallaPersonal {
  nit: number;
  nombre: string;
  genero: number;
  talla_camisa: string | null;
  talla_pantalon: string | null;
  talla_botas: number | null;
}

export const tallasPersonalService = {
  async listar(): Promise<TallaPersonal[]> {
    const { data } = await apiClient.get<TallaPersonal[]>(
      '/administracion/informe-tallas-personal',
    );
    return data;
  },
};

