import { getApiBaseUrl } from '@/config/public-env';

const BASE = `${getApiBaseUrl()}/encuestas/qr`;

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const resp = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const json = await resp.json().catch(() => ({}));
    const message = (json as { message?: string | string[] }).message;
    const text = Array.isArray(message) ? message.join(', ') : message;
    throw new Error(text || 'Error en la solicitud');
  }
  return resp.json();
}

export type PreguntaQr = {
  id: number;
  pregunta: string;
  tipo: string;
};

export type VehiculoQr = {
  response: 'success' | 'error';
  numero?: string;
  bodega?: string | number | null;
  placa?: string;
  marca?: string | null;
  des_modelo?: string | null;
  color?: string | null;
  nit_comprador?: string | null;
  nombres?: string | null;
  mail?: string | null;
  celular?: string | null;
};

export const encuestaQrService = {
  async listarPreguntas(): Promise<PreguntaQr[]> {
    const resp = await fetch(`${BASE}/preguntas`);
    if (!resp.ok) throw new Error('Error al cargar preguntas');
    return resp.json();
  },

  buscarPlaca(placa: string) {
    return postJson<VehiculoQr>('/buscar-placa', { placa });
  },

  buscarNit(nit_cc: string, placa: string) {
    return postJson<{
      response: 'success' | 'error';
      nit?: string;
      nombres?: string | null;
      telefono?: string | null;
      mail?: string | null;
    }>('/buscar-nit', { nit_cc, placa });
  },

  registrarUsuario(body: {
    user_nit_comprador_up: string;
    user_nombres_up: string;
    user_celular_up: string;
    user_email_up: string;
    inputPlacaOrden: string;
    opcion: number;
  }) {
    return postJson<{ response: 'success' | 'error'; opcion?: string }>(
      '/registrar-usuario',
      body,
    );
  },

  actualizarTercero(body: {
    fieldNit: string;
    fieldMailUpdate: string;
    fieldPhoneUpdate: string;
  }) {
    return postJson<{ response: 'success' | 'error' }>(
      '/actualizar-tercero',
      body,
    );
  },

  responder(body: Record<string, string>) {
    return postJson<{ response: 'success' | 'error' }>('/responder', body);
  },

  sinEncuesta(body: { numero: string; propietario: string; nit: string }) {
    return postJson<{ response: 'success' | 'error' }>('/sin-encuesta', body);
  },
};
