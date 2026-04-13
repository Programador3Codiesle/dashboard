import { apiClient } from '@/lib/api-client';

export interface Retencion720Row {
  tipoVh: string;
  p0_12: number;
  e0_12: number;
  p13_24: number;
  e13_24: number;
  p25_36: number;
  e25_36: number;
  p37_48: number;
  e37_48: number;
  p49_60: number;
  e49_60: number;
  p61_72: number;
  e61_72: number;
}

export interface Retencion720FiltroRow extends Retencion720Row {
  tipo?: string;
  segmento?: string;
  familiaVh?: string;
}

export interface Retencion720VehiculoRow {
  placa: string | null;
  serie: string | null;
  codigo: string | null;
  familia: string | null;
  tipoVh: string | null;
  cumpleRetencion: string;
}

export interface Retencion720Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type ModoComparacion = 'autos' | 'byc';

export interface ResumenComparacion {
  principal: Retencion720FiltroRow[];
  comparacion: Retencion720FiltroRow[] | Retencion720Row[];
  etiquetaComparacion: string;
}

export const retencion720Service = {
  async obtener(): Promise<Retencion720Row[]> {
    const { data } = await apiClient.get<Retencion720Row[]>(
      '/informes/postventa/retencion-72-0',
    );
    return data;
  },

  async listarSegmentosAutos(): Promise<string[]> {
    const { data } = await apiClient.get<string[]>(
      '/informes/postventa/retencion-72-0/segmentos/autos',
    );
    return data;
  },

  async listarSegmentosByC(): Promise<string[]> {
    const { data } = await apiClient.get<string[]>(
      '/informes/postventa/retencion-72-0/segmentos/byc',
    );
    return data;
  },

  async obtenerFiltroAutos(filtro: string): Promise<Retencion720FiltroRow[]> {
    const { data } = await apiClient.get<Retencion720FiltroRow[]>(
      '/informes/postventa/retencion-72-0/filtro/autos',
      { params: { filtro } },
    );
    return data;
  },

  async obtenerFiltroByC(filtro: string): Promise<Retencion720FiltroRow[]> {
    const { data } = await apiClient.get<Retencion720FiltroRow[]>(
      '/informes/postventa/retencion-72-0/filtro/byc',
      { params: { filtro } },
    );
    return data;
  },

  async listarFamilias(segmento: string): Promise<string[]> {
    const { data } = await apiClient.get<string[]>(
      '/informes/postventa/retencion-72-0/familias',
      { params: { segmento } },
    );
    return data;
  },

  async obtenerFiltroFamilia(
    segmento: string,
    familias: string[],
  ): Promise<Retencion720FiltroRow[]> {
    const { data } = await apiClient.post<Retencion720FiltroRow[]>(
      '/informes/postventa/retencion-72-0/filtro/familia',
      { segmento, familias },
    );
    return data;
  },

  async obtenerComparacion(
    modo: ModoComparacion,
    filtro: string,
  ): Promise<ResumenComparacion> {
    const { data } = await apiClient.get<ResumenComparacion>(
      '/informes/postventa/retencion-72-0/comparacion',
      { params: { modo, filtro } },
    );
    return data;
  },

  async obtenerVehiculos12Meses(
    page = 1,
    pageSize = 1000,
  ): Promise<Retencion720Paginated<Retencion720VehiculoRow>> {
    const { data } = await apiClient.get<Retencion720Paginated<Retencion720VehiculoRow>>(
      '/informes/postventa/retencion-72-0/vehiculos/12-meses',
      { params: { page, pageSize } },
    );
    return data;
  },

  async obtenerVehiculosAnoActual(
    page = 1,
    pageSize = 1000,
  ): Promise<Retencion720Paginated<Retencion720VehiculoRow>> {
    const { data } = await apiClient.get<Retencion720Paginated<Retencion720VehiculoRow>>(
      '/informes/postventa/retencion-72-0/vehiculos/ano-actual',
      { params: { page, pageSize } },
    );
    return data;
  },

  async obtenerTablaGeneral(
    page = 1,
    pageSize = 500,
  ): Promise<Retencion720Paginated<Record<string, unknown>>> {
    const { data } = await apiClient.get<Retencion720Paginated<Record<string, unknown>>>(
      '/informes/postventa/retencion-72-0/tabla-general',
      { params: { page, pageSize } },
    );
    return data;
  },

  async obtenerVsGeneral(): Promise<Retencion720FiltroRow[]> {
    const { data } = await apiClient.get<Retencion720FiltroRow[]>(
      '/informes/postventa/retencion-72-0/vs/general',
    );
    return data;
  },

  async obtenerVsAutosByC(filtro: string): Promise<Retencion720FiltroRow[]> {
    const { data } = await apiClient.get<Retencion720FiltroRow[]>(
      '/informes/postventa/retencion-72-0/vs/autos-byc',
      { params: { filtro } },
    );
    return data;
  },
};

