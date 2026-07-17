import { fetchWithAuth } from '@/utils/api';
import { getApiBaseUrl } from '@/config/public-env';

const BASE = `${getApiBaseUrl()}/ordenes-tot`;

async function parseError(resp: Response, fallback: string): Promise<never> {
  const json = await resp.json().catch(() => ({}));
  const message = (json as { message?: string | string[] }).message;
  const text = Array.isArray(message) ? message.join(', ') : message;
  throw new Error(text || fallback);
}

function asRecord(row: unknown): Record<string, unknown> {
  return row && typeof row === 'object' ? (row as Record<string, unknown>) : {};
}

function str(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = row[key];
    if (v != null && v !== '') return String(v);
  }
  return '';
}

function num(row: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const v = row[key];
    if (v != null && v !== '') {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return 0;
}

function nullableStr(
  row: Record<string, unknown>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const v = row[key];
    if (v != null && v !== '') return String(v);
  }
  return null;
}

function openPdfBlob(blob: Blob, title = 'recibo-tot.pdf') {
  const url = URL.createObjectURL(blob);
  window.open(url, title, 'status=0,title=0,height=700,width=900,scrollbars=1');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function base64ToPdfBlob(base64: string): Blob {
  const cleaned = base64.includes(',') ? base64.split(',')[1] : base64;
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: 'application/pdf' });
}

export type CrearTotResult =
  | { kind: 'pdf'; blob: Blob }
  | { kind: 'json'; data: Record<string, unknown> };

export type VehiculoPendiente = {
  id: number;
  placa: string;
  orden: string;
  fechaIngreso: string | null;
  autorizacion: string;
};

export type TotListadoItem = {
  id: number;
  orden: string;
  placa: string;
  descripcion: string;
  proveedor: string;
  contenido: string;
  fechaSalida: string | null;
  fechaReingreso: string | null;
};

export type RepuestoCandidato = {
  numero: string;
  placa: string;
  descripcion: string;
  fechaIngreso: string | null;
};

export type PorteriaItem = {
  id: number;
  placa: string;
  orden: string;
  nombres: string;
  fechaIngreso: string | null;
  fechaSalida: string | null;
  proveedor: string;
  contenido: string;
};

function mapVehiculoPendiente(row: Record<string, unknown>): VehiculoPendiente {
  return {
    id: num(row, 'id_vehiculo', 'idVehiculo', 'id'),
    placa: str(row, 'placa'),
    orden: str(row, 'orden'),
    fechaIngreso: nullableStr(row, 'fecha_ingreso', 'fechaIngreso'),
    autorizacion: str(row, 'autorizacion'),
  };
}

function mapTotListado(row: Record<string, unknown>): TotListadoItem {
  return {
    id: num(row, 'id_vehiculo', 'idVehiculo', 'id'),
    orden: str(row, 'orden'),
    placa: str(row, 'placa'),
    descripcion: str(row, 'descripcion'),
    proveedor: str(row, 'proveedor'),
    contenido: str(row, 'contenido'),
    fechaSalida: nullableStr(row, 'fecha_salida', 'fechaSalida'),
    fechaReingreso: nullableStr(row, 'fecha_reingreso', 'fechaReingreso'),
  };
}

function mapRepuesto(row: Record<string, unknown>): RepuestoCandidato {
  return {
    numero: str(row, 'numero', 'orden'),
    placa: str(row, 'placa'),
    descripcion: str(row, 'descripcion'),
    fechaIngreso: nullableStr(row, 'fecha_ingreso', 'fechaIngreso'),
  };
}

function mapPorteria(row: Record<string, unknown>): PorteriaItem {
  return {
    id: num(row, 'id_vehiculo', 'idVehiculo', 'id'),
    placa: str(row, 'placa'),
    orden: str(row, 'orden'),
    nombres: str(row, 'nombres', 'autoriza'),
    fechaIngreso: nullableStr(row, 'fecha_ingreso', 'fechaIngreso'),
    fechaSalida: nullableStr(row, 'fecha_salida', 'fechaSalida'),
    proveedor: str(row, 'proveedor'),
    contenido: str(row, 'contenido'),
  };
}

async function parseList<T>(
  resp: Response,
  map: (row: Record<string, unknown>) => T,
  fallback: string,
): Promise<T[]> {
  if (!resp.ok) await parseError(resp, fallback);
  const json = await resp.json();
  const rows = Array.isArray(json)
    ? json
    : (json.data ?? json.items ?? json.rows ?? []);
  return (Array.isArray(rows) ? rows : []).map((r) => map(asRecord(r)));
}

export const ordenesTotService = {
  async crearVehiculo(payload: { placa: string; orden: string }) {
    const resp = await fetchWithAuth(`${BASE}/vehiculos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) await parseError(resp, 'No se pudo registrar el vehículo');
    return resp.json();
  },

  async crearTot(payload: {
    orden: string;
    proveedor: string;
    contenido: string;
    placa?: string;
  }): Promise<CrearTotResult> {
    const resp = await fetchWithAuth(`${BASE}/tot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orden: payload.orden,
        proveedor: payload.proveedor,
        contenido: payload.contenido,
        placa: payload.placa ?? '0',
      }),
    });
    if (!resp.ok) await parseError(resp, 'No se pudo registrar el TOT');

    const contentType = resp.headers.get('content-type') || '';
    if (contentType.includes('application/pdf')) {
      return { kind: 'pdf', blob: await resp.blob() };
    }

    const data = (await resp.json().catch(() => ({}))) as Record<string, unknown>;
    if (typeof data.pdfBase64 === 'string' && data.pdfBase64) {
      return { kind: 'pdf', blob: base64ToPdfBlob(data.pdfBase64) };
    }
    return { kind: 'json', data };
  },

  async crearRepuesto(payload: { placa: string; orden: string }) {
    const resp = await fetchWithAuth(`${BASE}/repuestos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) await parseError(resp, 'No se pudo registrar el repuesto');
    return resp.json();
  },

  async listadoTot(estado: 1 | 2): Promise<TotListadoItem[]> {
    const resp = await fetchWithAuth(`${BASE}/tot/listado?estado=${estado}`);
    return parseList(resp, mapTotListado, 'Error al cargar listado TOT');
  },

  async reingresoTot(id: number) {
    const resp = await fetchWithAuth(`${BASE}/tot/${id}/reingreso`, {
      method: 'POST',
    });
    if (!resp.ok) await parseError(resp, 'Error al marcar reingreso');
    return resp.json();
  },

  async porteriaVehiculos(): Promise<PorteriaItem[]> {
    const resp = await fetchWithAuth(`${BASE}/porteria/vehiculos`);
    return parseList(resp, mapPorteria, 'Error al cargar vehículos de portería');
  },

  async porteriaTot(): Promise<PorteriaItem[]> {
    const resp = await fetchWithAuth(`${BASE}/porteria/tot`);
    return parseList(resp, mapPorteria, 'Error al cargar TOT de portería');
  },

  async porteriaOrdenesGenerales(): Promise<PorteriaItem[]> {
    const resp = await fetchWithAuth(`${BASE}/porteria/ordenes-generales`);
    return parseList(
      resp,
      mapPorteria,
      'Error al cargar órdenes generales de portería',
    );
  },

  async confirmarSalida(id: number) {
    const resp = await fetchWithAuth(`${BASE}/porteria/${id}/confirmar-salida`, {
      method: 'POST',
    });
    if (!resp.ok) await parseError(resp, 'Error al confirmar salida');
    return resp.json();
  },

  async validarOrden(orden: string): Promise<{ abierta: boolean }> {
    const params = new URLSearchParams({ orden });
    const resp = await fetchWithAuth(`${BASE}/validar-orden?${params}`);
    if (!resp.ok) await parseError(resp, 'Error al validar la orden');
    const json = await resp.json();
    return { abierta: Boolean(json.abierta) };
  },

  async reciboTot(id: number): Promise<Blob> {
    const resp = await fetchWithAuth(`${BASE}/tot/${id}/recibo`);
    if (!resp.ok) await parseError(resp, 'No se pudo generar el recibo');
    return resp.blob();
  },

  async vehiculosPendientes(): Promise<VehiculoPendiente[]> {
    const resp = await fetchWithAuth(`${BASE}/vehiculos/pendientes`);
    return parseList(
      resp,
      mapVehiculoPendiente,
      'Error al cargar vehículos pendientes',
    );
  },

  async repuestosCandidatos(): Promise<RepuestoCandidato[]> {
    const resp = await fetchWithAuth(`${BASE}/repuestos/candidatos`);
    return parseList(resp, mapRepuesto, 'Error al cargar candidatos de repuestos');
  },

  openPdfBlob,
};
