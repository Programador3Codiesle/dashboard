import { fetchWithAuth } from "@/utils/api";
import { getApiBaseUrl } from "@/config/public-env";
import type {
  EntradaVehiculoPanel,
  MarcarEntradaPayload,
  MarcarEntradaResponse,
  VehiculoSinCitaPayload,
  VehiculoSinCitaResponse,
  CitaEntrada,
} from "../types/entrada-vehiculo.types";

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/taller/entrada-vehiculo`;

async function parseError(resp: Response, fallback: string): Promise<never> {
  try {
    const json = (await resp.json()) as { message?: string | string[] };
    const msg = Array.isArray(json.message) ? json.message[0] : json.message;
    throw new Error(msg || fallback);
  } catch (err) {
    if (err instanceof Error && err.message !== fallback) throw err;
    throw new Error(fallback);
  }
}

export const entradaVehiculoService = {
  async obtenerPanel(placa?: string): Promise<EntradaVehiculoPanel> {
    const params = new URLSearchParams();
    if (placa?.trim()) params.set("placa", placa.trim().toUpperCase());
    const qs = params.toString();
    const resp = await fetchWithAuth(`${BASE}${qs ? `?${qs}` : ""}`, {
      method: "GET",
    });

    if (!resp.ok) {
      await parseError(resp, "No se pudo cargar el panel de entrada de vehículos");
    }

    return resp.json();
  },

  async obtenerCitasProgramadasPorFecha(fecha: string): Promise<CitaEntrada[]> {
    const params = new URLSearchParams({ fecha });
    const resp = await fetchWithAuth(`${BASE}/citas-programadas?${params.toString()}`, {
      method: "GET",
    });

    if (!resp.ok) {
      await parseError(resp, "No se pudieron buscar las citas por fecha");
    }

    return resp.json();
  },

  async marcarEntrada(payload: MarcarEntradaPayload): Promise<MarcarEntradaResponse> {
    const resp = await fetchWithAuth(`${BASE}/marcar-entrada`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      await parseError(resp, "Error al marcar la entrada del vehículo");
    }

    return resp.json();
  },

  async registrarVehiculoSinCita(
    payload: VehiculoSinCitaPayload,
  ): Promise<VehiculoSinCitaResponse> {
    const resp = await fetchWithAuth(`${BASE}/vehiculo-sin-cita`, {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        placa: payload.placa.trim().toUpperCase(),
        cliente: payload.cliente.trim().toUpperCase(),
        motivo: payload.motivo.trim(),
      }),
    });

    if (!resp.ok) {
      await parseError(resp, "No se pudo registrar el vehículo sin cita");
    }

    return resp.json();
  },
};
