import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface TallaDotacionAPI {
  usuario_id: number;
  genero?: string | number | boolean | null;
  talla_camisa: string | null;
  talla_pantalon: string | null;
  talla_botas: string | null;
  ultima_actualizacion: string | null;
  id_empresa?: number | null;
}

/** Normaliza género: en BD puede venir 0/1 (número), true/false (boolean) o string; devolver "0" o "1". */
function normalizarGenero(g: string | number | boolean | null | undefined): string {
  if (g === false || g === 0 || g === "0") return "0";
  if (g === true || g === 1 || g === "1") return "1";
  return "";
}

export interface TallaDotacion {
  nit: string;
  genero: string;
  tallaCamisa: string;
  tallaPantalon: string;
  tallaBotas: string;
  ultimaActualizacion: string;
}

export interface ActualizarTallaDotacionDTO {
  genero: string;
  tallaCamisa: string;
  tallaPantalon: string;
  tallaBotas: string;
}

type ApiMessageResponse<T = unknown> = {
  status: boolean;
  message: string;
  data?: T;
};

export const tallasDotacionService = {
  async obtenerTallas(idEmpresa?: number): Promise<TallaDotacion> {
    const url = new URL(`${API_URL}/administracion/tallas-dotacion/mi-talla`);
    if (idEmpresa != null) url.searchParams.set("id_empresa", String(idEmpresa));
    const response = await fetchWithAuth(url.toString(), {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const data: TallaDotacionAPI = await response.json();
    return {
      nit: data.usuario_id.toString(),
      genero: normalizarGenero(data.genero),
      tallaCamisa: data.talla_camisa || "",
      tallaPantalon: data.talla_pantalon || "",
      tallaBotas: data.talla_botas || "",
      ultimaActualizacion: data.ultima_actualizacion
        ? new Date(data.ultima_actualizacion).toISOString().split("T")[0]
        : "",
    };
  },

  async actualizarTallas(dto: ActualizarTallaDotacionDTO): Promise<TallaDotacion> {
    const response = await fetchWithAuth(`${API_URL}/administracion/tallas-dotacion/mi-talla`, {
      method: "PUT",
      body: JSON.stringify({
        genero: dto.genero,
        talla_camisa: dto.tallaCamisa,
        talla_pantalon: dto.tallaPantalon,
        talla_botas: dto.tallaBotas,
        id_empresa: dto.id_empresa,
      }),
    });

    if (!response.ok) {
      throw new Error("Error al conectar con el servidor");
    }

    const result: ApiMessageResponse<TallaDotacionAPI> = await response.json();

    if (!result.status || !result.data) {
      throw new Error(result.message || "No se pudieron actualizar las tallas");
    }

    const data = result.data;
    return {
      nit: data.usuario_id.toString(),
      genero: normalizarGenero(data.genero),
      tallaCamisa: data.talla_camisa || "",
      tallaPantalon: data.talla_pantalon || "",
      tallaBotas: data.talla_botas || "",
      ultimaActualizacion: data.ultima_actualizacion
        ? new Date(data.ultima_actualizacion).toISOString().split("T")[0]
        : "",
    };
  },
};
