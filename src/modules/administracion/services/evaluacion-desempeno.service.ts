import { getAuthHeaders } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ========== Tipos de respuesta de la API ==========

export interface EmpleadoPendienteAPI {
  id_empleado: number;
  nit: number;
  nombre: string;
  tiene_evaluacion: boolean;
  id_evaluacion: number;
}

export interface EvaluacionCompletaAPI {
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

export interface CalificarDTO {
  trabajo_equipo_j: number;
  part_activa_j: number;
  prop_iniciativas_j: number;
  rel_interpersonales_j: number;
  comunicacion_efect_j: number;
  discrecion_j: number;
  responsabilidad_j: number;
  acatamiento_j: number;
  compromiso_j: number;
  conocimiento_pro_j: number;
  conocimiento_metas_j: number;
  adaptabilidad_j: number;
  control_estres_j: number;
  solu_conflictos_j: number;
  estrategia_j: number;
  solu_adecuadas_j: number;
  ident_cliente_j: number;
  serv_cliente_j: number;
  part_capacitacion_j: number;
  info_peligros_j: number;
  info_accidentes_j: number;
  info_salud_j: number;
  uso_epp_j: number;
  llamados_aten_j: number;
  accidentes_j: number;
  calificacion: number;
  capacidades_entrenamiento: string;
  compromisos: string;
}

type ApiMessageResponse<T = unknown> = {
  status: boolean;
  message: string;
  data?: T;
};

interface IdJefeResponse {
  jefe: number;
}

// ========== Servicio ==========

export const evaluacionDesempenoService = {
  /**
   * Obtener el ID del jefe a partir de su cédula
   */
  async obtenerIdJefe(cedula: number): Promise<number> {
    const response = await fetch(`${API_URL}/administracion/evaluacion-desempeno/obtener-id-jefe/${cedula}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("No se pudo obtener el ID del jefe");
    }

    const data: IdJefeResponse = await response.json();
    return data.jefe;
  },

  /**
   * Obtener empleados pendientes por calificar para un jefe usando su ID
   */
  async obtenerEmpleadosPendientes(idJefe: number): Promise<EmpleadoPendienteAPI[]> {
    const response = await fetch(`${API_URL}/administracion/evaluacion-desempeno/jefe/${idJefe}/empleados-pendientes`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("No se pudieron cargar los empleados pendientes");
    }

    const data: EmpleadoPendienteAPI[] = await response.json();
    return data;
  },

  /**
   * Obtener empleados pendientes por calificar usando la cédula del jefe
   * Este método obtiene automáticamente el idJefe y luego los empleados pendientes
   */
  async obtenerEmpleadosPendientesPorCedula(cedula: number): Promise<EmpleadoPendienteAPI[]> {
    const idJefe = await this.obtenerIdJefe(cedula);
    return this.obtenerEmpleadosPendientes(idJefe);
  },

  /**
   * Obtener evaluación completa por ID de evaluación
   */
  async obtenerEvaluacion(idEvaluacion: number): Promise<EvaluacionCompletaAPI> {
    const response = await fetch(`${API_URL}/administracion/evaluacion-desempeno/empleado/${idEvaluacion}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("No se pudo obtener la evaluación");
    }

    const data: ApiMessageResponse<EvaluacionCompletaAPI> = await response.json();

    if (!data.status || !data.data) {
      throw new Error(data.message || "No se pudo obtener la evaluación");
    }

    return data.data;
  },

  /**
   * Calificar evaluación (actualizar campos del jefe)
   */
  async calificar(idEvaluacion: number, dto: CalificarDTO): Promise<EvaluacionCompletaAPI> {
    const response = await fetch(`${API_URL}/administracion/evaluacion-desempeno/${idEvaluacion}/calificar`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      throw new Error("No se pudo calificar la evaluación");
    }

    const data: ApiMessageResponse<EvaluacionCompletaAPI> = await response.json();

    if (!data.status || !data.data) {
      throw new Error(data.message || "No se pudo calificar la evaluación");
    }

    return data.data;
  },
};

