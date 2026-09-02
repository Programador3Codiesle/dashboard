import { fetchWithAuth } from "@/utils/api";
import { getApiBaseUrl } from "@/config/public-env";
import { parseError } from "@/modules/taller/shared/utils/parse-api-error";
import type {
  MpviCotizacionesContactResponse,
  MpviDescartarCotizacionPayload,
  MpviDescartarCotizacionResponse,
  MpviObtenerCotizacionesPayload,
} from "../types";

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/taller/mpvi/contact`;

export const mpviContactService = {
  async obtenerCotizaciones(
    payload: MpviObtenerCotizacionesPayload = {},
  ): Promise<MpviCotizacionesContactResponse> {
    const resp = await fetchWithAuth(`${BASE}/cotizaciones`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      await parseError(resp, "No se pudieron cargar las cotizaciones");
    }

    return resp.json();
  },

  async descartarCotizacion(
    payload: MpviDescartarCotizacionPayload,
  ): Promise<MpviDescartarCotizacionResponse> {
    const resp = await fetchWithAuth(`${BASE}/descartar`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      await parseError(resp, "No se pudo descartar la cotización");
    }

    return resp.json();
  },
};
