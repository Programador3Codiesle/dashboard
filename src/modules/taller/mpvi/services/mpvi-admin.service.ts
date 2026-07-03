import { fetchWithAuth } from "@/utils/api";
import { getApiBaseUrl } from "@/config/public-env";
import type {
  MpviCatalogoOption,
  MpviCatalogoTipo,
  MpviGuardarElementoPayload,
  MpviSubirPlantillaResponse,
  MpviSubirTablasAuxResponse,
  MpviTablaAuxiliar,
} from "../types";

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/taller/mpvi/admin`;

async function parseError(resp: Response, fallback: string): Promise<never> {
  try {
    const json = (await resp.json()) as { message?: string };
    throw new Error(json.message || fallback);
  } catch (err) {
    if (err instanceof Error && err.message !== fallback) throw err;
    throw new Error(fallback);
  }
}

export const mpviAdminService = {
  async subirPlantilla(archivo: File): Promise<MpviSubirPlantillaResponse> {
    const formData = new FormData();
    formData.append("archivo", archivo);

    const resp = await fetchWithAuth(`${BASE}/plantilla`, {
      method: "POST",
      body: formData,
    });

    if (!resp.ok) {
      await parseError(resp, "No se pudo subir la plantilla MPVI");
    }

    return resp.json();
  },

  async subirTablasAuxiliares(
    archivo: File,
    tabla: MpviTablaAuxiliar,
  ): Promise<MpviSubirTablasAuxResponse> {
    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("tabla", String(tabla));

    const resp = await fetchWithAuth(`${BASE}/tablas-auxiliares`, {
      method: "POST",
      body: formData,
    });

    if (!resp.ok) {
      await parseError(resp, "No se pudo subir el archivo de tablas auxiliares");
    }

    return resp.json();
  },

  async listarCatalogo(tipo: MpviCatalogoTipo): Promise<MpviCatalogoOption[]> {
    const resp = await fetchWithAuth(`${BASE}/catalogo/${tipo}`, {
      method: "GET",
    });

    if (!resp.ok) {
      await parseError(resp, "No se pudo cargar el catálogo");
    }

    return resp.json();
  },

  async guardarElemento(payload: MpviGuardarElementoPayload): Promise<boolean | number> {
    const resp = await fetchWithAuth(`${BASE}/catalogo/elemento`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      await parseError(resp, "No se pudo guardar el elemento del catálogo");
    }

    return resp.json();
  },
};
