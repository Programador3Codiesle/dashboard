import { fetchWithAuth } from "@/utils/api";
import { getUser } from "@/utils/cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ========== Tipos de respuesta de la API ==========

export interface FormatoDesempenoAPI {
  id: number;
  nit_empleado: number;
  empleado: string;
  area: string;
  cargo: string;
  sede: string;
  fecha: string;
  id_empresa: number;
  trabajo_equipo_e: number;
  part_activa_e: number;
  prop_iniciativas_e: number;
  rel_interpersonales_e: number;
  comunicacion_efect_e: number;
  discrecion_e: number;
  responsabilidad_e: number;
  acatamiento_e: number;
  compromiso_e: number;
  conocimiento_pro_e: number;
  conocimiento_metas_e: number;
  adaptabilidad_e: number;
  control_estres_e: number;
  solu_conflictos_e: number;
  estrategia_e: number;
  solu_adecuadas_e: number;
  ident_cliente_e: number;
  serv_cliente_e: number;
  part_capacitacion_e: number;
  info_peligros_e: number;
  info_accidentes_e: number;
  info_salud_e: number;
  uso_epp_e: number;
  llamados_aten_e: number;
  accidentes_e: number;
  trabajo_equipo_j?: number;
  part_activa_j?: number;
  prop_iniciativas_j?: number;
  rel_interpersonales_j?: number;
  comunicacion_efect_j?: number;
  discrecion_j?: number;
  responsabilidad_j?: number;
  acatamiento_j?: number;
  compromiso_j?: number;
  conocimiento_pro_j?: number;
  conocimiento_metas_j?: number;
  adaptabilidad_j?: number;
  control_estres_j?: number;
  solu_conflictos_j?: number;
  estrategia_j?: number;
  solu_adecuadas_j?: number;
  ident_cliente_j?: number;
  serv_cliente_j?: number;
  part_capacitacion_j?: number;
  info_peligros_j?: number;
  info_accidentes_j?: number;
  info_salud_j?: number;
  uso_epp_j?: number;
  llamados_aten_j?: number;
  accidentes_j?: number;
  calificacion?: number | null;
  capacidades_entrenamiento?: string | null;
  compromisos?: string | null;
  calificado?: boolean | null;
}

export interface FormatoDesempenoDTO {
  nit_empleado: number;
  empleado: string;
  area: string;
  cargo: string;
  sede: string;
  id_empresa: number;
  trabajo_equipo_e: number;
  part_activa_e: number;
  prop_iniciativas_e: number;
  rel_interpersonales_e: number;
  comunicacion_efect_e: number;
  discrecion_e: number;
  responsabilidad_e: number;
  acatamiento_e: number;
  compromiso_e: number;
  conocimiento_pro_e: number;
  conocimiento_metas_e: number;
  adaptabilidad_e: number;
  control_estres_e: number;
  solu_conflictos_e: number;
  estrategia_e: number;
  solu_adecuadas_e: number;
  ident_cliente_e: number;
  serv_cliente_e: number;
  part_capacitacion_e: number;
  info_peligros_e: number;
  info_accidentes_e: number;
  info_salud_e: number;
  uso_epp_e: number;
  llamados_aten_e: number;
  accidentes_e: number;
}

type ApiMessageResponse<T = unknown> = {
  status: boolean;
  message: string;
  data?: T;
};

// ========== Servicio ==========

export const formatoDesempenoService = {
  /**
   * Obtener evaluación por NIT de empleado
   */
  async obtenerEvaluacion(nitEmpleado: number): Promise<FormatoDesempenoAPI | null> {
    const response = await fetchWithAuth(`${API_URL}/administracion/formato-desempeno/${nitEmpleado}`, {
      method: "GET",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("No se pudo obtener la evaluación");
    }

    const data: ApiMessageResponse<FormatoDesempenoAPI> = await response.json();

    if (!data.status || !data.data) {
      return null;
    }

    return data.data;
  },

  /**
   * Crear o actualizar evaluación
   */
  async crearActualizarEvaluacion(dto: FormatoDesempenoDTO): Promise<FormatoDesempenoAPI> {
    const response = await fetchWithAuth(`${API_URL}/administracion/formato-desempeno`, {
      method: "POST",
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      throw new Error("No se pudo guardar la evaluación");
    }

    const data: ApiMessageResponse<FormatoDesempenoAPI> = await response.json();

    if (!data.status || !data.data) {
      throw new Error(data.message || "No se pudo guardar la evaluación");
    }

    return data.data;
  },

  /**
   * Relacionar evaluación con jefe
   * @param nitUsuario - NIT del usuario (empleado)
   * @param nitJefe - NIT del jefe
   */
  async relacionarEvaluacion(nitUsuario: number, nitJefe: number): Promise<void> {
    const response = await fetchWithAuth(`${API_URL}/administracion/evaluacion-desempeno/relacionar-evaluacion`, {
      method: "POST",
      body: JSON.stringify({
        nit_usuario: nitUsuario,
        nit_jefe: nitJefe
      }),
    });

    if (!response.ok) {
      throw new Error("No se pudo relacionar la evaluación con el jefe");
    }

    // El endpoint puede retornar una respuesta con formato estándar o solo éxito
    const data: ApiMessageResponse | void = await response.json().catch(() => undefined);
    
    if (data && 'status' in data && !data.status) {
      throw new Error(data.message || "No se pudo relacionar la evaluación con el jefe");
    }
  },
};

