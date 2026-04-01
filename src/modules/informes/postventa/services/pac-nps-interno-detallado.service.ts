import { apiClient } from '@/lib/api-client';

export interface PacNpsInternoBodega {
  bodega: number;
  descripcion: string;
  ordenesFinalizadas: number;
  encuestas: number;
  nps: number;
}

export interface PacNpsInternoDetalladoResponse {
  bodegas: PacNpsInternoBodega[];
  cantOrdenes: number;
  cantEncuestas: number;
}

export const pacNpsInternoDetalladoService = {
  async listar(fecha: string): Promise<PacNpsInternoDetalladoResponse> {
    const params = new URLSearchParams();
    params.append('fecha', fecha);

    const { data } = await apiClient.get<PacNpsInternoDetalladoResponse>(
      `/informes/postventa/pac-nps-interno-detallado?${params.toString()}`,
    );

    return data;
  },
};

