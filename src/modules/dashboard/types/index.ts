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
