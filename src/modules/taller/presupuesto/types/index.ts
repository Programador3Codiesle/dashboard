import type { MesPresupuesto } from "../constants/meses";

export interface SedePresupuesto {
  id: number;
  nombre: string;
}

export interface TipoPresupuesto {
  id: number;
  nombre: string;
}

export interface CatalogosPresupuesto {
  sedes: SedePresupuesto[];
  tipos: TipoPresupuesto[];
}

export interface FiltrosPresupuestoState {
  idCategoria: string;
  idSede: string;
  idTipo: string;
}

export interface ConsultarPresupuestoParams {
  idCategoria: number;
  idSede: number;
  idTipo?: number;
}

export interface CeldaEditable {
  mes: number;
  mesLabel: string;
  anio: number;
  sedeId: number;
  tipoId: number;
  tipoVh: number;
}

export interface FilaTablaPresupuesto {
  etiqueta: string;
  presupuesto: number | string | null;
  celdas: Record<MesPresupuesto | string, number | string | null>;
  celdaPresupuestoEditable?: CeldaEditable;
  celdaSaldoEditable?: CeldaEditable;
}

export interface TablaPresupuesto {
  titulo: string;
  editable: boolean;
  filtros: {
    anio: number;
    sedeId: number;
    tipoVh: number;
    tipoId?: number;
  };
  filas: FilaTablaPresupuesto[];
}

export interface ConsultarPresupuestoResponse {
  puedeEditar: boolean;
  mesActualIndex: number;
  tablas: TablaPresupuesto[];
}

export interface ActualizarPresupuestoParams {
  anio: number;
  mes: number;
  sedeId: number;
  tipoId: number;
  tipoVh: number;
  campo: "presupuesto" | "saldo";
  valor: number;
}

export type ModalActualizarTipo = "presupuesto" | "saldo";

export interface ModalActualizarState {
  tipo: ModalActualizarTipo;
  valorActual: number | string | null;
  celda: CeldaEditable;
}
