export interface RazonRetorno {
  id_razon: number;
  razon: string;
  definicion: number;
}

export interface SistemaInv {
  id_sistema_inv: number;
  sistema_inv: string;
}

export interface PlanAccion {
  id_plan: number;
  plan_accion: string;
}

export interface BodegaCatalogo {
  bodega: number;
  descripcion: string;
}

export interface CatalogosPosiblesRetornos {
  razones: RazonRetorno[];
  sistemas: SistemaInv[];
  planes: PlanAccion[];
  bodegas: BodegaCatalogo[];
}

export interface AccionesFila {
  puedeVer: boolean;
  puedeSolucion: boolean;
  puedeCerrar: boolean;
}

export interface FilaPosibleRetorno {
  rn: number;
  numero: number;
  placa: string;
  des_modelo: string;
  origen: string;
  descripcion: string;
  estado: string;
  acciones: AccionesFila;
}

export interface ListarParams {
  numero?: number;
  placa?: string;
  bodega?: number;
  page: number;
  pageSize: number;
}

export interface ListarResponse {
  total: number;
  filas: FilaPosibleRetorno[];
}

export interface DetalleCliente {
  placa: string;
  des_modelo: string;
  cliente: string;
  cant_retornos: number;
}

export interface DetalleOrden {
  rnk: number;
  placa: string;
  numero: number;
  solicitud: string;
  respuesta: string;
}

export interface DetalleTecnico {
  rnk: number;
  placa: string;
  numero: number;
  tecnicos: string;
}

export interface DetallePlacaResponse {
  cliente: DetalleCliente;
  ordenes: DetalleOrden[];
  tecnicos: DetalleTecnico[];
  array_ordenes: number[];
  array_tecnicos: string[];
}

export interface GuardarDefinicionParams {
  definicion: number;
  selectRazon?: number;
  obs_razon?: string;
  select_sist_inv?: number;
  obs_sist_inv?: string;
  ordenR?: number;
  ordenR_origen: number;
  tecnicoR?: string;
  selectPlan?: number;
  obs_plan?: string;
  precio_costo_1?: number;
  precio_costo_2?: number;
  precio_costo_3?: number;
  obs_costos?: string;
}

export interface SolucionRetorno {
  numero: number | null;
  definicion: number | null;
  razon: string | null;
  obs_razon: string | null;
  sistema_inv: string | null;
  obs_sist_inv: string | null;
  plan_accion: string | null;
  obs_plan: string | null;
  repuestos: number | null;
  mano_obra: number | null;
  tot: number | null;
  obs_costo: string | null;
  tecnico: string | null;
  numero_retorno: number | null;
  fecha_creacion: string | null;
  nombres: string | null;
}

export interface FiltrosPosiblesRetornosState {
  numero: string;
  bodega: string;
  placa: string;
}

export const PAGE_SIZE_OPTIONS = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
  { value: -1, label: "Todos" },
] as const;

export const DEFAULT_PAGE_SIZE = 5;
