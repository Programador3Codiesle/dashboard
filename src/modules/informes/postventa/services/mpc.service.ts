import { apiClient } from '@/lib/api-client';

export interface MpcRow {
  fechaRegistro: string;
  placa: string;
  desModelo: string;
  planVendido: string;
  valorMpc: number;
  valorRedimido: number;
  saldoMpc: number;
  vendidoPor: string;
  estadoCasoEspecial: 0 | 1 | null;
}

export const mpcService = {
  async listar(): Promise<MpcRow[]> {
    const { data } = await apiClient.get<MpcRow[]>('/informes/postventa/mpc');
    return data;
  },

  async cambiarEstadoCasoEspecial(
    placa: string,
    estado: number,
  ): Promise<void> {
    await apiClient.post('/informes/postventa/mpc/cambiar-estado-caso-especial', {
      placa,
      estado,
    });
  },
};

