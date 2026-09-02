import { getApiBaseUrl } from '@/config/public-env';
import { parseError } from '@/modules/repuestos/shared/utils/parse-api-error';
import { fetchWithAuth } from '@/utils/api';

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/repuestos/informe-obsoletos`;

export type ObsoletoFiltroRow = {
  codigo: string;
  descripcion: string;
  bodega: number;
  stock: number;
  costoUnitario: number;
  costoPromedio: number;
  meses: number;
  pvp: number;
  margen: number;
};

export const informeObsoletosService = {
  async consultar(payload: {
    opcion: 1 | 2 | 3 | 4;
    categoria: 1 | 2;
    rango: number;
  }): Promise<ObsoletoFiltroRow[]> {
    const resp = await fetchWithAuth(`${BASE}/consultar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) await parseError(resp, 'Error al consultar');
    return resp.json();
  },
};
