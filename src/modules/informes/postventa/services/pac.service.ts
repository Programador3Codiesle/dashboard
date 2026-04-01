import { apiClient } from '@/lib/api-client';

export interface PacResumen {
  calificacionPac: number;
  npsCompany: number;
  enc06: number;
  enc78: number;
  enc910: number;
  porcen06: number;
  porcen78: number;
  porcen910: number;
  toDia: number;
  toMes: number;
  porcenHoy: number;
  porcenHoyRes: number;
  porcenMes: number;
  porcenMesRes: number;
  valTotalInventario: number;
}

export const pacService = {
  async obtenerResumen(): Promise<PacResumen> {
    const { data } = await apiClient.get<PacResumen>('/informes/postventa/pac');
    return data;
  },
};

