import { apiClient } from '@/lib/api-client';

export type TipoChecklistPesv = 'carro' | 'moto';

export interface ChecklistPesv {
  placa: string;
  numRegistros: number;
}

export interface FiltrosChecklistPesv {
  tipo: TipoChecklistPesv;
  placa?: string;
  fechaIni: string;
  fechaFin: string;
}

export const checklistPesvService = {
  async listar(filtros: FiltrosChecklistPesv): Promise<ChecklistPesv[]> {
    const params = new URLSearchParams();

    params.append('tipo', filtros.tipo);
    params.append('fechaIni', filtros.fechaIni);
    params.append('fechaFin', filtros.fechaFin);

    if (filtros.placa) params.append('placa', filtros.placa);

    const { data } = await apiClient.get<ChecklistPesv[]>(
      `/informes/informe-checklist-pesv?${params.toString()}`,
    );

    return data;
  },
};

