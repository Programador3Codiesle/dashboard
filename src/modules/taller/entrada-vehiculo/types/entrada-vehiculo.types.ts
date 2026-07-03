export interface SedeUsuario {
  idsede: number;
  idsedeV: string;
  nombres: string;
  descripcion: string;
}

export interface CitaEntrada {
  idCita: number;
  nomBodega: string;
  bodega: number;
  descripcionEstado: string;
  fechaCita: string;
  fechaHoraIni: string;
  placa: string;
  vehiculo: string | null;
  nombreCliente: string | null;
  nombreEncargado: string | null;
  descripcionBahia: string | null;
  notas: string | null;
}

export interface VhSinOt {
  fecha: string;
  placa: string;
  bodega: number;
  cliente: string | null;
  encargado: string | null;
  bahia: string | null;
  vh: string | null;
}

export interface VhSinCita {
  placa: string;
  nombreCliente: string;
  motivoVisita: string;
  fecha: string;
  bodegas: string | null;
}

export interface EntradaVehiculoPanel {
  sedes: SedeUsuario[];
  citasProgramadas: CitaEntrada[];
  citasAtendidas: CitaEntrada[];
  citasSinOt: VhSinOt[];
  vehiculosSinCita: VhSinCita[];
}

export interface MarcarEntradaPayload {
  idCita: number;
}

export interface MarcarEntradaResponse {
  ok: boolean;
}

export interface VehiculoSinCitaPayload {
  placa: string;
  cliente: string;
  motivo: string;
  bodega: number;
}

export interface VehiculoSinCitaResponse {
  ok: boolean;
}

export type BodegaVisualContext = "full" | "fecha";

export type BodegaVisualVariant = "liviano" | "camion" | "colision" | "default";

export interface BodegaVisualConfig {
  variant: BodegaVisualVariant;
  borderClass: string;
  bgClass: string;
  iconKey: "car" | "truck" | "carFront" | "car";
}
