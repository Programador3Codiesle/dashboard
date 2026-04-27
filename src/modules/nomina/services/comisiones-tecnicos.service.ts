import { apiClient } from '@/lib/api-client';

export interface ComisionTecnico {
  nit: string;
  tecnico: string;
  patio: string;
  cargo: string;
  ventaRepuestos: number;
  ventaManoObra: number;
  comisionRepuestos: number;
  comisionManoObra: number;
  segundaEntrega: number;
  bonoNps: number;
  instalacionAccesorios: number;
  internas: number;
  alineaciones: number;
  balanceos: number;
  total: number;
}

export interface DetalleComisionTecnico {
  factura: string;
  numeroOrden: number;
  placa: string;
  vehiculo: string;
  operacion: string;
  nombreOperacion: string;
  ventaRepuestos: number;
  ventaManoObra: number;
  segundaEntrega: number;
  instalacionAccesorios: number;
  internas: number;
}

export const comisionesTecnicosService = {
  async listar(mes: string): Promise<ComisionTecnico[]> {
    const response = await apiClient.get<ComisionTecnico[]>(
      `/nomina/comisiones-tecnicos?mes=${encodeURIComponent(mes)}`,
    );
    return response.data;
  },

  async detalle(params: {
    mes: number;
    anio: number;
    nit: string;
  }): Promise<DetalleComisionTecnico[]> {
    const q = new URLSearchParams();
    q.set('mes', String(params.mes));
    q.set('anio', String(params.anio));
    q.set('nit', params.nit);
    const response = await apiClient.get<DetalleComisionTecnico[]>(
      `/nomina/comisiones-tecnicos/detalle?${q.toString()}`,
    );
    return response.data;
  },
};

