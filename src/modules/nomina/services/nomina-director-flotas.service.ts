import { apiClient } from '@/lib/api-client';

export interface NominaDirectorFlotasPrincipal {
  item: number;
  nit: string;
  nombres: string;
  placa: string;
  venta: number;
}

export interface NominaDirectorFlotasDetalle {
  item: number;
  nit: string;
  nombres: string;
}

export const nominaDirectorFlotasService = {
  async listarPrincipal(mes: string): Promise<NominaDirectorFlotasPrincipal[]> {
    const response = await apiClient.get<NominaDirectorFlotasPrincipal[]>(
      `/nomina/nomina-director-flotas/principal?mes=${encodeURIComponent(mes)}`,
    );
    return response.data;
  },

  async listarDetalle(mes: string): Promise<NominaDirectorFlotasDetalle[]> {
    const response = await apiClient.get<NominaDirectorFlotasDetalle[]>(
      `/nomina/nomina-director-flotas/detalle?mes=${encodeURIComponent(mes)}`,
    );
    return response.data;
  },
};

