export type DashboardVariant =
  | "jefe_taller"
  | "tecnicos"
  | "admin"
  | "agente_cc"
  | "gerencia"
  | "asesor_rep"
  | "compras"
  | "informe_mto";

export interface DashboardBase {
  variant: DashboardVariant;
  fecha_actual: string;
  dia_festivo: number;
  id_usu?: string;
  img_user?: string;
}

/** Punto para gráficos (label + valor). */
export interface DataPoint {
  label: string;
  y: number;
}

/** Datos por sede para tabs y gráficos del dashboard jefe de taller. */
export interface JefeTallerSedeItem {
  sede: string;
  totalVenta: number;
  totalVentaManoObra: number;
  totalVentaRepuesto: number;
  totalVentaTot: number;
  totalHoras: number;
  objectiveNpsIntCurrent: number;
  objectiveNpsGMIntCurrent: number;
  dataPoints1: DataPoint[];
  dataPoints2: DataPoint[];
  dataPoints3: DataPoint[];
  dataPoints4: DataPoint[];
  dataPoints5: DataPoint[];
  dataPoints6: DataPoint[];
  dataPoints7: DataPoint[];
  objetiveNps: DataPoint[];
  objetiveNpsGM: DataPoint[];
}

export interface DashboardJefeTaller extends DashboardBase {
  variant: "jefe_taller";
  nps_int: number;
  total_ventas: number;
  nps_col: number;
  horas_fac: number;
  mo: number;
  rep: number;
  tot: number;
  bod: string;
  data_bodegas: Array<{
    operario: string;
    tecnico: string;
    numero_orden: number;
    cliente: string;
    rptos: number;
    MO: number;
    horas_facturadas: number;
  }>;
  /** Por sede: totales y series para tabs y 4 gráficos. */
  sedes?: JefeTallerSedeItem[];
}

export interface DashboardTecnicos extends DashboardBase {
  variant: "tecnicos";
  nps_int: number;
  total_ventas: number;
  nps_col: number;
  horas_fac: number;
  mo: number;
  rep: number;
  bod_usu: string;
  ranking_talleres: { ran_vendido: number; ran_nps: number };
  ranking_sedes: { ran_vendido: number; ran_nps: number };
  ranking_presupuesto: Array<{
    operario: number;
    tecnico: string;
    rptos: number;
    MO: number;
    suma_todo: number;
  }> | null;
  tope_ran_pres: number;
  ventas_mensuales?: Array<{
    mes: string;
    mo: number;
    repuestos: number;
    total: number;
  }>;
  horas_mensuales?: Array<{
    mes: string;
    horas: number;
  }>;
  nps_interno_mensual?: Array<{
    mes: string;
    nps: number;
  }>;
  nps_gm_mensual?: Array<{
    mes: string;
    nps: number;
  }>;
}

export interface AdminSedePresupuesto {
  /** Clave interna de sede, ej: giron, rosita, barranca, bocono, solochevrolet, chevropartes. */
  key: string;
  /** Nombre legible de la sede. */
  sede: string;
  /** Presupuesto mensual de la sede. */
  presupuesto: number;
  /** Total vendido acumulado en el mes. */
  total: number;
  /** Porcentaje de cumplimiento frente al presupuesto (0–∞). */
  porcentaje: number;
  /** true si porcentaje >= 100 (meta cumplida). */
  metaCumplida: boolean;
}

export interface AdminTallerDetalle {
  nombre: string;
  /** Meta (presupuesto) del taller para el mes. */
  presupuesto: number;
  total: number;
  porcentaje: number;
  metaCumplida: boolean;
  mo?: number;
  tot?: number;
  rep?: number;
}

export interface AdminSedeTalleres {
  key: string;
  sede: string;
  talleres: AdminTallerDetalle[];
}

export interface DashboardAdmin extends DashboardBase {
  variant: "admin";
  graf_sedes?: Array<{ total: number; sede: string }>;
  porcen_giron?: number;
  porcen_rosita?: number;
  porcen_barranca?: number;
  porcen_bocono?: number;
  porcen_soloc?: number;
  porcen_chev?: number;
  to_posv?: number;
  cal_pac?: { Calificacion?: number };
  to_inv?: number;
  nps_int?: number;
  pendientes?: number;
  proceso?: number;
  finalizadas?: number;
  pendientesPre?: number;
  procesoPre?: number;
  finalizadasPre?: number;
  data_estado?: Array<{ estado: string }>;
  sedes_presupuesto?: AdminSedePresupuesto[];
  sedes_talleres?: AdminSedeTalleres[];
}

export interface DashboardAgenteCC extends DashboardBase {
  variant: "agente_cc";
  data_estado?: Array<{ estado: string }>;
}

export interface DashboardGerencia extends DashboardBase {
  variant: "gerencia";
  graf_sedes?: Array<{ total: number; sede: string }>;
  porcen_giron?: number;
  porcen_rosita?: number;
  porcen_barranca?: number;
  porcen_bocono?: number;
  porcen_soloc?: number;
  porcen_chev?: number;
  to_posv?: number;
  cal_pac?: { Calificacion?: number };
  to_inv?: number;
  nps_int?: number;
}

export interface DashboardCompras extends DashboardBase {
  variant: "compras";
  solicitudes_pendientes: number;
  solicitudes_proceso: number;
  solicitudes_finalizadas: number;
}

export interface DashboardAsesorRep extends DashboardBase {
  variant: "asesor_rep";
  sedes?: Array<{ idsede: number; idsede_v: string; descripcion: string }>;
  presupuestos_sede?: Array<{ sede: string; presupuesto: number }>;
  resumen_actual?: Array<{
    nombre: string;
    sede: string;
    sede_label2?: string;
    venta_neta: number;
    margen_bruto: number;
    utilidad_bruta: number;
    comision: number;
    valor_comision: number;
    comision_variable?: number;
    valor_comision_variable?: number;
    total_comision: number;
  }>;
  total_vendido_global?: number;
}

export interface DashboardInformeMto extends DashboardBase {
  variant: "informe_mto";
  pendientes: number;
  proceso: number;
  finalizadas: number;
  pendientesPre: number;
  procesoPre: number;
  finalizadasPre: number;
}

export type DashboardData =
  | DashboardJefeTaller
  | DashboardTecnicos
  | DashboardAdmin
  | DashboardAgenteCC
  | DashboardGerencia
  | DashboardCompras
  | DashboardAsesorRep
  | DashboardInformeMto;
