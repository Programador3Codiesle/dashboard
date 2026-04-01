import { apiClient } from '@/lib/api-client';

export interface OrdenSalida {
  id: number;
  area: string | null;
  sede: string | null;
  jefe: number;
  tipoSalida: number;
  explicacion: string;
  fecha_salida: string;
  placa: string | null;
  conductor: string | null;
  quienSale: string | null;
  observacion: string | null;
  fecha_reg_obs: string | null;
  jefeNombre: string;
  tipoSalidaNombre: string;
  tieneObservacion: boolean;
}

export interface FiltrosOrdenSalida {
  fechaIni?: string;
  fechaFin?: string;
  jefe?: string;
  area?: string;
  sede?: string;
  tipoSalida?: number;
}

export const ordenesSalidaService = {
  async listar(filtros: FiltrosOrdenSalida): Promise<OrdenSalida[]> {
    const params = new URLSearchParams();

    if (filtros.fechaIni) params.append('fechaIni', filtros.fechaIni);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.jefe) params.append('jefe', filtros.jefe);
    if (filtros.area) params.append('area', filtros.area);
    if (filtros.sede) params.append('sede', filtros.sede);
    if (filtros.tipoSalida != null) params.append('tipoSalida', String(filtros.tipoSalida));

    const { data } = await apiClient.get<OrdenSalida[]>(
      `/informes/informe-ordenes-salida?${params.toString()}`,
    );

    return data;
  },

  async guardarObservacion(id: number, observacion: string): Promise<void> {
    await apiClient.patch(`/informes/informe-ordenes-salida/${id}/observacion`, {
      observacion,
    });
  },
};

