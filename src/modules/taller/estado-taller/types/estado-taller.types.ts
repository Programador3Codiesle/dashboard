export interface SedeUsuario {
  idsede: number;
  idsedeV: string;
  nombres: string;
  descripcion: string;
}

export interface OrdenTallerAbierta {
  bodega: string;
  numero: number;
  razon2: number | null;
  razon2Label: string;
  fechaHoraEntregaReal: string | null;
  notas: string;
  estado: string;
  proceso: string;
  fechaPromEnt: string | null;
  aseguradora: string;
  cliente: string;
  fecha: string | null;
  asesor: string;
  kilometraje: number | null;
  descripcionVehiculo: string;
  placa: string;
  diasOtAbierta: number;
  ventaManoObra: number;
  ventaRptos: number;
  ventaTot: number;
  vManoObraEst: number | null;
  vRptoEst: number | null;
  vTotEst: number | null;
  mesFactEst: number | null;
  mesFacturaActual: string;
  diffDiasPromesa: number | null;
  rowTone: "danger" | "warning" | "success" | null;
  borderEspera: boolean;
  cotizacionesSacyr: number[];
}

export interface EstadoOtCatalogo {
  idEstado: number;
  estado: string;
}

export interface HistorialOt {
  numero: number;
  asesor: string;
  estado: string;
  notas: string | null;
  fechaHist: string | null;
}

export interface EstadoTallerPanel {
  sedes: SedeUsuario[];
  ordenes: OrdenTallerAbierta[];
  totalAbiertas: number;
}

export interface MutationResult {
  ok: boolean;
  title: string;
  message: string;
  icon: "success" | "error" | "warning";
}

export interface AgregarEventoPayload {
  ot: number;
  estado: string;
  notas: string;
  fecPromesaEntrega?: string;
}

export interface FacturaMesActualPayload {
  numeroOrden: number;
  estado: 0 | 1;
}

export interface ValoresEstimadosPayload {
  inputNumeroOr: number;
  inputMO: number;
  inputRpto: number;
  inputToT: number;
}
