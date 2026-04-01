import { apiClient } from '@/lib/api-client';

export type TipoChecklistEquipo =
  | 0 // Trabajo en caliente
  | 1 // Alineador
  | 2 // Elevadores
  | 3 // Tijera
  | 4 // Hidráulicos
  | 5 // Pórtico
  | 6; // Cabina de pintura

export interface FiltrosChecklistEquipo {
  op: TipoChecklistEquipo;
  fechaIni: string;
  fechaFin: string;
  idCheck?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ChecklistEquipoRow = Record<string, any>;

export const checklistsService = {
  async listar(filtros: FiltrosChecklistEquipo): Promise<ChecklistEquipoRow[]> {
    const params = new URLSearchParams();

    params.append('op', String(filtros.op));
    params.append('fechaIni', filtros.fechaIni);
    params.append('fechaFin', filtros.fechaFin);

    if (filtros.idCheck !== undefined) {
      params.append('idCheck', String(filtros.idCheck));
    }

    const { data } = await apiClient.get<ChecklistEquipoRow[]>(
      `/informes/informe-checklists?${params.toString()}`,
    );

    return data;
  },
};

