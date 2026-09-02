import { getApiBaseUrl } from '@/config/public-env';
import { parseError } from '@/modules/repuestos/shared/utils/parse-api-error';
import { fetchWithAuth } from '@/utils/api';

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/repuestos/informe-ev-sv`;

export type InformeEvSvItem = {
  id: number;
  nOrden: number;
  placa: string | null;
  bodega: string | null;
  solicitadoPor: string | null;
  autorizadoPor: string | null;
  gestionRepuestos: Array<{
    ev: string;
    sv: string;
    otSv: string;
    pendiente: boolean;
  }>;
  gestionBodega: Array<{
    nOrden: number;
    entregados: number;
    noEntregados: number;
    pendiente: boolean;
  }>;
  colorEstado: 'amarillo' | 'morado' | 'rojo' | 'verde';
};

export const informeEvSvService = {
  async listarBodegas(): Promise<Array<{ bodega: number; descripcion: string }>> {
    const resp = await fetchWithAuth(`${BASE}/bodegas`);
    if (!resp.ok) await parseError(resp, 'No se pudieron cargar bodegas');
    return resp.json();
  },

  async listar(filtros: Record<string, unknown>): Promise<InformeEvSvItem[]> {
    const resp = await fetchWithAuth(`${BASE}/listar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filtros),
    });
    if (!resp.ok) await parseError(resp, 'No se pudo cargar el informe');
    return resp.json();
  },
};
