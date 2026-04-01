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

export const retencion720Service = {
  async obtener(): Promise<Retencion720Row[]> {
    const { data } = await apiClient.get<Retencion720Row[]>(
      '/informes/postventa/retencion-72-0',
    );
    return data;
  },
};

