import { getApiBaseUrl } from '@/config/public-env';
import { parseError } from '@/modules/repuestos/shared/utils/parse-api-error';
import { fetchWithAuth } from '@/utils/api';

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/repuestos/pedidos-repuestos`;

export type PedidoRepuestoItem = {
  numero: number;
  nitCliente: string;
  cliente: string;
  nitVendedor: string;
  vendedor: string;
  bodega: string;
  valorTotal: number;
  fechaHora: string | null;
};

export const pedidosRepuestosService = {
  async listar(q?: string): Promise<PedidoRepuestoItem[]> {
    const termino = q?.trim() ?? '';
    const url = termino
      ? `${BASE}?${new URLSearchParams({ q: termino.slice(0, 80) })}`
      : BASE;
    const resp = await fetchWithAuth(url, { method: 'GET' });
    if (!resp.ok) await parseError(resp, 'No se pudieron cargar los pedidos');
    return resp.json() as Promise<PedidoRepuestoItem[]>;
  },
};
