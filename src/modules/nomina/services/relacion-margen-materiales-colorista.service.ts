import { apiClient } from '@/lib/api-client';

export type SedeRelacionMargen = 'giron' | 'cucuta';

export interface RelacionMargenMaterialColoristaRow {
  ano: number;
  mes: number;
  nombreMes: string;
  bodega: number;
  numeroOrden: number;
  valor: number;
  costo: number;
  margen: number;
}

export interface RelacionMargenMaterialColoristaResumen {
  totalValor: number;
  totalCosto: number;
  margenTotal: number;
  bono: number;
}

export interface RelacionMargenMaterialColoristaResponse {
  rows: RelacionMargenMaterialColoristaRow[];
  resumen: RelacionMargenMaterialColoristaResumen;
}

export const relacionMargenMaterialesColoristaService = {
  async listar(
    mes: string,
    sede: SedeRelacionMargen,
  ): Promise<RelacionMargenMaterialColoristaResponse> {
    const query = new URLSearchParams();
    query.set('mes', mes);
    query.set('sede', sede);
    const response = await apiClient.get<RelacionMargenMaterialColoristaResponse>(
      `/nomina/relacion-margen-materiales-colorista?${query.toString()}`,
    );
    return response.data;
  },
};

