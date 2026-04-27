import { apiClient } from '@/lib/api-client';

export interface ComisionJefe {
  nit: string;
  nombres: string;
  sede: string;
  facturacionPosventa: number;
  internas: number;
  comisionPorFacturacion: number;
  utilidadSede: number;
  bonoUtilidad: number;
  utilidadRepuestos: number;
  comisionUtilidadBruta: number;
  bonoNps: number;
  bonoNpsInterno: number;
  total: number;
}

export interface DetalleComisionJefe {
  nit: string;
  nombres: string;
  sede: string;
  repuestos: number;
  manoDeObra: number;
}

export interface JefePorSede {
  nit: string;
  nombres: string;
}

export interface CheckValoresResponse {
  status: boolean;
  title: string;
  icon: string;
  message: string;
  data: Array<{
    bonoNps: number;
    bonoNpsInterno: number;
    bonoUtilidad: number;
    utilidadSede: number;
  }>;
  bono: Array<{
    'BONO NPS': number;
    'NPS INTERNO': number;
    'BONO UTILIDAD': number;
  }> | null;
}

export const comisionesJefesService = {
  async listar(mes: string): Promise<ComisionJefe[]> {
    const response = await apiClient.get<ComisionJefe[]>(
      `/nomina/comisiones-jefes?mes=${encodeURIComponent(mes)}`,
    );
    return response.data;
  },

  async obtenerDetalle(params: {
    mes: number;
    anio: number;
    nit: string;
    sede: string;
  }): Promise<DetalleComisionJefe[]> {
    const query = new URLSearchParams();
    query.set('mes', String(params.mes));
    query.set('anio', String(params.anio));
    query.set('nit', params.nit);
    query.set('sede', params.sede);
    const response = await apiClient.get<DetalleComisionJefe[]>(
      `/nomina/comisiones-jefes/detalle?${query.toString()}`,
    );
    return response.data;
  },

  async obtenerJefesPorSede(sede: string): Promise<JefePorSede[]> {
    const response = await apiClient.get<{ status: boolean; data: JefePorSede[] }>(
      `/nomina/comisiones-jefes/jefes-por-sede?sede=${encodeURIComponent(sede)}`,
    );
    return response.data.data ?? [];
  },

  async checkValores(comboJefes: string, sede: string): Promise<CheckValoresResponse> {
    const response = await apiClient.post<CheckValoresResponse>(
      '/nomina/comisiones-jefes/check-valores',
      { combo_jefes: comboJefes, sede },
    );
    return response.data;
  },

  async actualizarValores(payload: {
    comboJefes: string;
    sede: string;
    utilidadSede?: number;
    bonoNps: boolean;
    bonoUtilidad: boolean;
    bonoNpsInt: boolean;
  }) {
    const response = await apiClient.post<{
      status: boolean;
      title: string;
      icon: string;
      message: string;
    }>('/nomina/comisiones-jefes/actualizar-valores', {
      combo_jefes: payload.comboJefes,
      sede: payload.sede,
      utilidad_sede: payload.utilidadSede ?? null,
      bono_nps: payload.bonoNps ? '1' : '0',
      bono_utilidad: payload.bonoUtilidad ? '1' : '0',
      bono_nps_int: payload.bonoNpsInt ? '1' : '0',
    });
    return response.data;
  },
};

