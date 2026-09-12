import { apiClient } from '@/lib/api-client';

export type TipoInformeNominaAccesorios = 1 | 2 | 3 | 4 | 5;

export interface NominaAccesoriosAuxiliarRow {
  fecha: string;
  nombres: string;
  ventaPropia: number;
  ventaCompartida: number;
  comisionPropia: number;
  comisionCompartida: number;
  totalComision: number;
}

export interface NominaAccesoriosAsesorRow {
  fecha: string;
  documento: string;
  nombres: string;
  ventaPropia: number;
  ventaCompartida: number;
  vhEntregados: number;
  comisionPropia: number;
  comisionCompartida: number;
  totalComision: number;
  shareAccesorios: number | null;
}

export interface NominaAccesoriosTecnicoRow {
  fecha: string;
  nombres: string;
  totalHoras: number;
  comision: number;
}

export interface NominaAccesoriosOtrasMarcasRow {
  fecha: string;
  vendedor: string;
  ventaAccesorios: number;
  comision: number;
}

export interface NominaAccesoriosMoInternaRow {
  fecha: string;
  agencia: string;
  tiempo: number;
  total: number;
}

export interface NominaAccesoriosResultado {
  tipo: TipoInformeNominaAccesorios;
  fechaLabel: string;
  emptyMessage: string;
  auxiliar: NominaAccesoriosAuxiliarRow[];
  asesor: NominaAccesoriosAsesorRow[];
  tecnicos: NominaAccesoriosTecnicoRow[];
  otrasMarcas: NominaAccesoriosOtrasMarcasRow[];
  moInterna: NominaAccesoriosMoInternaRow[];
}

export const nominaAccesoriosService = {
  async listar(params: {
    ano: number;
    mes: number;
    perfil: TipoInformeNominaAccesorios;
  }): Promise<NominaAccesoriosResultado> {
    const query = new URLSearchParams();
    query.set('ano', String(params.ano));
    query.set('mes', String(params.mes));
    query.set('perfil', String(params.perfil));
    const response = await apiClient.get<NominaAccesoriosResultado>(
      `/nomina/nomina-accesorios?${query.toString()}`,
    );
    return response.data;
  },
};
