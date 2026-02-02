// ========== AJUSTES VALORES CONTABLES ==========
export interface ValorContable {
  id: string;
  concepto: string;
  retencionFuente: number;
  reteIVA: number;
  reteICA: number;
  iva: number;
  avisosTableros: number;
  sobretasaBomberil: number;
  valorAplicado: number;
  valorTotal: number;
}

export interface AjusteValoresDTO {
  tipo: string;
  numero: string;
}

// Tipos de respuesta de la API para Ajuste Valores
export interface AjusteValoresResponse {
  sw: number;
  tipo: string;
  numero: number;
  tipo_cruce: string | null;
  numero_cruce: number | null;
  retencion: number;
  retencion_iva: number;
  retencion_ica: number;
  iva: number;
  Retencion_estampilla2: number | null;
  Retencion_estampilla1: number | null;
  valor_aplicado: number | null;
  valor_total: number;
  forma_pago: number | null;
  valor: number | null;
  ano: number;
  mes: number;
}

export interface DocumentosCerradosResponse {
  cerrado: boolean;
}

export interface ValoresCruce {
  sw: number;
  tipo: string;
  numero: number;
  tipo_cruce: string; // tipo aplica
  numero_cruce: number; // numero aplica
  retencion: number | null;
  retencion_iva: number | null;
  retencion_ica: number | null;
  iva: number | null;
  Retencion_estampilla2: number | null;
  Retencion_estampilla1: number | null;
  valor_aplicado: number | null;
  valor_total: number | null;
  forma_pago: number | null;
  valor: number | null;
  ano: number | null;
  mes: number | null;
}

export interface Valores2Response {
  sw: number;
  tipo: string;
  numero: number;
  tipo_cruce: string | null;
  numero_cruce: number | null;
  retencion: number | null;
  retencion_iva: number | null;
  retencion_ica: number | null;
  iva: number | null;
  Retencion_estampilla2: number | null;
  Retencion_estampilla1: number | null;
  valor_aplicado: number | null;
  valor_total: number | null;
  forma_pago: number;
  valor: number;
  ano: number;
  mes: number;
}

export interface ActualizarValoresDTO {
  retencion?: number;
  retencion_iva?: number;
  retencion_ica?: number;
  iva?: number;
  Retencion_estampilla2?: number;
  Retencion_estampilla1?: number;
  valor_aplicado?: number;
  valor_total?: number;
}

export interface ActualizarValoresCruceDTO {
  valor_aplicado2: number;
}

export interface ActualizarValores2DTO {
  forma_pago: number;
  valor: number;
}

// Tipos de respuesta de la API para Evaluación de Desempeño (Jefe)
export interface EmpleadoPendiente {
  id_empleado: number;
  nit: number;
  nombre: string;
  tiene_evaluacion: boolean;
  id_evaluacion: number;
}

export interface EvaluacionCompleta {
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

// ========== CONTROL INGRESO Y SALIDA VEHÍCULOS ==========
export interface VehiculoSalida {
  id: number;
  placa: string;
  fechaSalida: string;
  horaSalida: string;
  kmSalida: number;
  tipoVehiculo: string;
  modelo: string;
  conductor: string;
  pasajeros: string;
  quienAutorizo: string;
  vehiculoRemolcado: boolean;
  taller: string;
  empresaNombre: string;
  fechaIngreso?: string;
  horaIngreso?: string;
  kmIngreso?: number;
  observacion?: string;
}

// Tipos de respuesta de la API para Control de Vehículos
export interface VehiculoSalidaAPI {
  id: number;
  fecha_salida: string;
  hora_salida: string;
  km_salida: number;
  placa: string;
  tipo_vehiculo: string;
  modelo: string;
  conductor: string;
  pasajeros: string;
  persona_autorizo: string;
  fecha_llegada: string | null;
  hora_llegada: string | null;
  km_llegada: number | null;
  observacion: string | null;
  placa_vh_remolcado: string | null;
  taller: string;
  empresa_nombre: string;
}

export interface ModeloVehiculo {
  id: number;
  descripcion: string;
}

export interface RegistrarSalidaDTO {
  placa: string;
  km_salida: number;
  tipo_vehiculo: string;
  modelo: number;
  taller: string;
  conductor: string;
  persona_autorizo: string;
  pasajeros: string;
  porteria?: number;
  id_empresa?: number;
  otra_marca?: string;
  placa_vh_remolcado?: string;
}

export interface RegistrarLlegadaDTO {
  km_llegada: number;
  observacion: string;
}

// ========== EVALUACIÓN DESEMPEÑO ==========
export type EscalaDesempeño = 1 | 2 | 3 | 4 | 5;

export interface Competencia {
  id: string;
  categoria: string;
  descripcion: string;
  autoEvaluacion?: EscalaDesempeño;
  jefeEvaluacion?: EscalaDesempeño;
}

export interface EvaluacionDesempeño {
  id?: number;
  nombreEmpleado: string;
  area: string;
  cargo: string;
  sede: string;
  fecha: string;
  competencias: Competencia[];
  necesidadesCapacitacion?: string;
  compromisosTrabajador?: string;
  esAutoEvaluacion: boolean;
}

// Tipos de respuesta de la API para Formato Desempeño
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

// ========== GESTIÓN DE COMPRAS ==========
export type NivelUrgencia = 1 | 2 | 3;

export interface SolicitudCompra {
  id: number;
  numero: number;
  descripcion: string;
  mensajes: string;
  conFactura: boolean;
  estado: string;
  estadoAutorizacion: string;
  usuarioSolicita: string;
  gerenteAutoriza: string;
  fechaSolicitud: string;
  fechaAutorizacion?: string;
  gestionDias: number;
  urgencia: NivelUrgencia;
  areaSolicita: string;
  sede: string;
  proveedoresSugeridos?: string;
  areaCarga: string;
}

export interface NuevaSolicitudCompraDTO {
  areaSolicita: string;
  sede: string;
  nombrePersona: string;
  cargoPersona: string;
  gerenteAutoriza: string;
  proveedoresSugeridos?: string;
  nivelUrgencia: NivelUrgencia;
  areaCarga: string;
  descripcion: string;
  fechaTentativa: string;
}

// ========== INASISTENCIA ==========
export interface Inasistencia {
  id: number;
  documento: string;
  nombre: string;
  fecha: string;
}

// ========== AUSENTISMO ==========
export interface Ausentismo {
  id: number;
  gestionadoPor: string;
  colaborador: string;
  sede: string;
  area: string;
  fechaInicio: string;
  horaInicio: string;
  fechaFin: string;
  horaFin: string;
  estado: string;
  detalle: string;
  motivo?: string;
  cargo?: string;
}

export interface NuevoAusentismoDTO {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  area: string;
  cargo: string;
  sede: string;
  motivo: string;
  descripcionMotivo: string;
  id_empresa?: number;
}

// ========== TIEMPO SUPLEMENTARIO ==========
export interface TiempoSuplementario {
  id: number;
  nombreJefe: string;
  nombreEmpleado: string;
  sede: string;
  area: string;
  cargo: string;
  fechaInicio: string;
  horaInicio: string;
  fechaSolicitud: string;
  descripcion: string;
  autorizacion: string;
}

export interface SolicitudTiempoSuplementarioDTO {
  fechaInicio: string;
  horaInicio: string;
  horaFin: string;
  area: string;
  cargo: string;
  sede: string;
  descripcionMotivo: string;
  id_empresa?: number;
  empleado?: number;
}

// ========== TALLAS DOTACIÓN ==========
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
  id_empresa?: number;
}

// ========== ORDEN DE SALIDA ==========
export interface OrdenSalida {
  id: number;
  numeroOrden: string;
  bodega: string;
  placa: string;
  descripcionModelo: string;
  fecha: string;
}

