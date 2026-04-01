import { apiClient } from '@/lib/api-client';

export interface PqrNpsItem {
  fuente: string;
  id: number;
  sede: string;
  area: string;
  fecha: string;
  placa: string;
  cliente: string;
  modeloVh: string;
  orden: string;
  mail: string;
  telefono: string;
  servicio: number | null;
  satisfaccionConcesionario: number | null;
  satisfaccionTrabajo: number | null;
  vhReparadoOk: number | null;
  recomendacionMarca: number | null;
  comentarios: string | null;
  tecnico: string;
  tipificacionEncuesta: string | null;
  contactoCliente: string | null;
  estadoCaso: string | null;
  comentariosFinalCaso: string | null;
  tipificacionCierre: string | null;
}

export type EstadoPqr = 'abiertos' | 'cerrados' | 'todos';

export const pqrNpsService = {
  async listar(estado: EstadoPqr = 'abiertos'): Promise<PqrNpsItem[]> {
    const params = new URLSearchParams();
    params.append('estado', estado);

    const { data } = await apiClient.get<PqrNpsItem[]>(
      `/informes/postventa/pqr-nps?${params.toString()}`,
    );

    return data;
  },
};

