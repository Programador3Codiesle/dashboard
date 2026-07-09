import { fetchWithAuth } from '@/utils/api';
import { getApiBaseUrl } from '@/config/public-env';

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/contact-center/informe-base-datos`;

export type TipoInformeDb = '1' | '2' | '3';

export type InformeBaseDatosResponse = {
  status: boolean;
  data: Record<string, unknown>[];
  message: string;
  title: string;
  icon: string;
};

const HEADERS_BY_TIPO: Record<TipoInformeDb, string[]> = {
  '1': [
    'Serie', 'Placa', 'Última Entrada', 'Último KM', 'Servicio', 'KM Promedio',
    'Próxima Visita', 'NIT', 'Nombre', 'Celular', 'Teléfono',
  ],
  '2': [
    'Placa', 'Última Entrada', 'Último KM', 'Servicio', 'KM Promedio',
    'Nit', 'Nombre', 'Celular', 'Teléfono', 'Fecha inicio', 'Fecha fin',
  ],
  '3': [
    'Tipo', 'Número', 'Placa', 'NIT Comprador', 'Nombre', 'Celular', 'Teléfono',
    'Fecha Entrega/Venta', 'Próxima Visita', 'Kilometraje',
  ],
};

export function getHeadersForTipo(tipo: TipoInformeDb): string[] {
  return HEADERS_BY_TIPO[tipo];
}

async function parseError(resp: Response, fallback: string): Promise<never> {
  const json = await resp.json().catch(() => ({}));
  throw new Error((json as { message?: string }).message || fallback);
}

export const informeBaseDatosService = {
  async consultar(payload: {
    tipoInfDB: TipoInformeDb;
    dateStart?: string;
    dateEnd: string;
  }): Promise<InformeBaseDatosResponse> {
    const resp = await fetchWithAuth(`${BASE}/consultar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) await parseError(resp, 'Error al consultar informe');
    return resp.json();
  },
};
