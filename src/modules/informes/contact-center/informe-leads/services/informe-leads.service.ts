import { apiClient } from '@/lib/api-client';

const BASE_PATH = '/informes/contact-center/informe-leads';

export interface InformeLead {
  fechaRegistro: string;
  nombres: string | null;
  placa: string | null;
  telefonos: string | null;
  email: string | null;
  campana: string | null;
  motivo: string | null;
  idCita: string | null;
}

export interface InformeLeadsPagina {
  items: InformeLead[];
  total: number;
  pagina: number;
  limite: number;
}

export interface FiltroInformeLeads {
  desde: string;
  hasta: string;
  pagina: number;
  limite: number;
}

export const informeLeadsService = {
  async listar(filtro: FiltroInformeLeads): Promise<InformeLeadsPagina> {
    const params = new URLSearchParams({
      desde: filtro.desde,
      hasta: filtro.hasta,
      pagina: String(filtro.pagina),
      limite: String(filtro.limite),
    });
    const { data } = await apiClient.get<InformeLeadsPagina>(
      `${BASE_PATH}?${params.toString()}`,
    );
    return data;
  },

  async exportarExcel(desde: string, hasta: string): Promise<Blob> {
    const params = new URLSearchParams({ desde, hasta });
    const { data } = await apiClient.get<Blob>(
      `${BASE_PATH}/excel?${params.toString()}`,
      { responseType: 'blob' },
    );
    return data;
  },
};
