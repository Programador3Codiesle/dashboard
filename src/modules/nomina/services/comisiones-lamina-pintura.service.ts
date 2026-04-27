import { apiClient } from '@/lib/api-client';

export interface ComisionLaminaPintura {
  operario: string;
  nombres: string;
  descripcion: string;
  productividad: number;
  horasTrabajadas: number;
  horasProductivasMes: number;
  porcentajeLiquidacion: number;
  materiales: number;
  baseComisionMo: number;
  internas: number;
  comisionSinInternasMo: number;
  baseRepuestos: number;
  porcFacTotal: number;
  comisionRepuestos: number;
  pulidasLivianos: number;
  totalPulidoLivianos: number;
  pulidasPesados: number;
  totalPulidoPesados: number;
  vidrios: number;
  bonoNps: number;
  totalPagar: number;
}

export interface DetalleComisionLaminaPintura {
  factura: string;
  numeroOrden: number;
  placa: string;
  vehiculo: string;
  productividad: number;
  porcentajeLiquidacion: number;
  tiempoFacturado: number;
  baseComision: number;
  materiales: number;
  internas: number;
  comisionPagar: number;
}

export interface TotalRepuestosSede {
  sede: number;
  total: number;
}

export const comisionesLaminaPinturaService = {
  async listar(desde: string, hasta: string): Promise<ComisionLaminaPintura[]> {
    const q = new URLSearchParams();
    q.set('desde', desde);
    q.set('hasta', hasta);
    const response = await apiClient.get<ComisionLaminaPintura[]>(
      `/nomina/comisiones-lamina-pintura?${q.toString()}`,
    );
    return response.data;
  },

  async detalle(params: {
    desde: string;
    hasta: string;
    nit: string;
  }): Promise<DetalleComisionLaminaPintura[]> {
    const q = new URLSearchParams();
    q.set('desde', params.desde);
    q.set('hasta', params.hasta);
    q.set('nit', params.nit);
    const response = await apiClient.get<DetalleComisionLaminaPintura[]>(
      `/nomina/comisiones-lamina-pintura/detalle?${q.toString()}`,
    );
    return response.data;
  },

  async totalRepuestosSede(params: {
    desde: string;
    hasta: string;
    sede: 1 | 2;
  }): Promise<TotalRepuestosSede> {
    const q = new URLSearchParams();
    q.set('desde', params.desde);
    q.set('hasta', params.hasta);
    q.set('sede', String(params.sede));
    const response = await apiClient.get<TotalRepuestosSede>(
      `/nomina/comisiones-lamina-pintura/total-repuestos-sede?${q.toString()}`,
    );
    return response.data;
  },
};

