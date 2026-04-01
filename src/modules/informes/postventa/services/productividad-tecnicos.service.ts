import { apiClient } from '@/lib/api-client';

export interface ProductividadTecnicoRow {
  nit: string;
  nombres: string;
  patio: number;
  horasCliente: number;
  horasGarantia: number;
  horasServicio: number;
  horasInterno: number;
  totalHoras: number;
  horasDisponibles: number;
  productividad: number;
}

export interface ProductividadTecnicosResponse {
  actual: ProductividadTecnicoRow[];
  consolidado: ProductividadTecnicoRow[];
}

export const productividadTecnicosService = {
  async obtener(params: {
    year: number;
    month: number;
    patios: number[];
  }): Promise<ProductividadTecnicosResponse> {
    const query = new URLSearchParams();
    query.append('year', String(params.year));
    query.append('month', String(params.month));
    if (params.patios.length) {
      query.append('patios', params.patios.join(','));
    }

    const { data } = await apiClient.get<ProductividadTecnicosResponse>(
      `/informes/postventa/productividad-tecnicos?${query.toString()}`,
    );
    return data;
  },
};

