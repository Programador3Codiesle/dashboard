import { getApiBaseUrl } from "@/config/public-env";
import type {
  MpviFirmarPayload,
  MpviFirmarResponse,
  MpviValidarTokenResponse,
} from "../types";

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/taller/mpvi/firma`;

async function parseError(resp: Response, fallback: string): Promise<never> {
  try {
    const json = (await resp.json()) as { message?: string };
    throw new Error(json.message || fallback);
  } catch (err) {
    if (err instanceof Error && err.message !== fallback) throw err;
    throw new Error(fallback);
  }
}

/** Rutas públicas — sin fetchWithAuth */
export const mpviFirmaService = {
  async validarToken(token: string): Promise<MpviValidarTokenResponse> {
    const params = new URLSearchParams({ token });
    const resp = await fetch(`${BASE}/validar-token?${params}`);

    if (!resp.ok) {
      await parseError(resp, "Token inválido o expirado");
    }

    return resp.json();
  },

  async firmar(payload: MpviFirmarPayload): Promise<MpviFirmarResponse> {
    const formData = new FormData();
    formData.append("opcion", String(payload.opcion));
    formData.append("llave", payload.llave);

    if (payload.dataForm) {
      formData.append("dataForm", payload.dataForm);
    }

    if (payload.opcion === 2 && payload.imgFirmaFile) {
      formData.append("img_firma_user", payload.imgFirmaFile);
    } else if (payload.opcion === 1 && payload.imgFirmaBase64) {
      formData.append("img_firma_user", payload.imgFirmaBase64);
    }

    const resp = await fetch(`${BASE}/firmar`, {
      method: "POST",
      body: formData,
    });

    if (!resp.ok) {
      await parseError(resp, "No se pudo guardar la firma");
    }

    return resp.json();
  },

  getPdfUrl(token: string): string {
    const params = new URLSearchParams({ token });
    return `${BASE}/pdf?${params}`;
  },
};
