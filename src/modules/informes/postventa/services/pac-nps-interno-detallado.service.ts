import { apiClient } from '@/lib/api-client';

const BASE_PATH = '/informes/postventa/pac-nps-interno-detallado';

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

export interface PacNpsTecnicoBodega {
  tecnico: string;
  bodega: number;
  ordenes: number;
  encuestas: number;
}

export interface PacNpsEncuestaTecnico {
  numero: number;
  nombres: string | null;
  pregunta1: number | null;
  pregunta2: number | null;
  pregunta3: string | null;
  pregunta4: string | null;
  pregunta5: string | null;
}

export const pacNpsInternoDetalladoService = {
  async listar(fecha: string): Promise<PacNpsInternoDetalladoResponse> {
    const params = new URLSearchParams();
    params.append('fecha', fecha);

    const { data } = await apiClient.get<PacNpsInternoDetalladoResponse>(
      `${BASE_PATH}?${params.toString()}`,
    );

    return data;
  },

  async listarTecnicos(fecha: string, bodega: number): Promise<PacNpsTecnicoBodega[]> {
    const params = new URLSearchParams();
    params.append('fecha', fecha);
    params.append('bodega', String(bodega));

    const { data } = await apiClient.get<PacNpsTecnicoBodega[]>(
      `${BASE_PATH}/tecnicos?${params.toString()}`,
    );

    return data;
  },

  async listarEncuestasTecnico(
    fecha: string,
    nombre: string,
  ): Promise<PacNpsEncuestaTecnico[]> {
    const params = new URLSearchParams();
    params.append('fecha', fecha);
    params.append('nombre', nombre);

    const { data } = await apiClient.get<PacNpsEncuestaTecnico[]>(
      `${BASE_PATH}/encuestas-tecnico?${params.toString()}`,
    );

    return data;
  },

  async exportarDetalleTecnico(fecha: string, nombre: string): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('fecha', fecha);
    params.append('nombre', nombre);
    const res = await apiClient.get<Blob>(
      `${BASE_PATH}/exportar/detalle-tecnico?${params.toString()}`,
      { responseType: 'blob' },
    );
    if (res.status >= 400) {
      throw new Error('Error al descargar el Excel del técnico.');
    }
    return res.data;
  },

  async exportarTodos(fecha: string, bodega?: number): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('fecha', fecha);
    if (bodega != null && bodega > 0) {
      params.append('bodega', String(bodega));
    }
    const res = await apiClient.get<Blob>(
      `${BASE_PATH}/exportar/todos?${params.toString()}`,
      { responseType: 'blob' },
    );
    if (res.status >= 400) {
      throw new Error('Error al descargar el Excel de todos los técnicos.');
    }
    return res.data;
  },
};
