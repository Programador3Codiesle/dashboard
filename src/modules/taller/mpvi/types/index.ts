// ========== Catálogo Admin ==========

export type MpviCatalogoTipo =
  | "sistemas"
  | "subsistemas"
  | "familias-vh"
  | "vehiculos"
  | "repuestos";

export interface MpviCatalogoOption {
  id: number;
  label: string;
}

export type MpviTablaAuxiliar = 0 | 1 | 2;

export interface MpviSubirPlantillaResponse {
  filasProcesadas: number;
}

export interface MpviSubirTablasAuxResponse {
  filasInsertadas: number;
  filasRechazadas: number;
  filasProcesadas: number;
}

export interface MpviGuardarElementoPayload {
  op: number;
  data: Record<string, unknown>;
}

// ========== Técnicos ==========

export interface MpviBodegaOption {
  value: number;
  label: string;
}

export const MPVI_BODEGAS: MpviBodegaOption[] = [
  { value: 1, label: "CODIESEL PRINCIPAL" },
  { value: 6, label: "CHEVYEXPRESS BARRANCA" },
  { value: 7, label: "CHEVYEXPRESS LA ROSITA" },
  { value: 8, label: "CODIESEL VILLA DEL ROSARIO" },
  { value: 11, label: "DIESEL EXPRESS GIRON" },
  { value: 16, label: "BOCONO DIESEL EXPRESS" },
  { value: 19, label: "DIESEL EXPRESS BARRANCA" },
];

export interface MpviSubsistemaItem {
  id: number;
  subsistema: string;
}

export interface MpviItemsResponseOk {
  ok: true;
  subsistemas: MpviSubsistemaItem[];
  nombre: string;
  celular: string;
  correo: string;
  desc_vh: string;
}

export interface MpviItemsResponseError {
  ok: false;
  mensaje: string;
}

export type MpviItemsResponse = MpviItemsResponseOk | MpviItemsResponseError;

export interface MpviObtenerItemsPayload {
  placa: string;
}

export interface MpviObtenerDatosPayload {
  bod: number;
  placa: string;
  urgentes?: string;
  recomendados?: string;
  cobrables: string;
}

export interface MpviObtenerStockPayload {
  codRepuesto: string;
}

export interface MpviStockSede {
  sede: string;
  stock: number;
}

export interface MpviStockResponse {
  sedes: MpviStockSede[];
  mensaje?: string;
}

export interface MpviTablaTotales {
  repuestos: number;
  manoObra: number;
  neto: number;
}

export interface MpviTablaTecnicoFila {
  idSubsistema: number;
  descripcion: string;
  tiempo: number;
  codRepuesto: string;
  repuesto: string;
  cantidad: number;
  disponible: number;
  valorRepuesto: number;
  manoObra: number;
  autorizadoDefault: boolean;
  noDisponibleDefault: boolean;
  sufijo: "U" | "R";
}

export interface MpviTablaTecnico {
  filas: MpviTablaTecnicoFila[];
  totales: MpviTablaTotales;
  etiqueta: string;
}

export interface MpviDatosResponse {
  tablaU: MpviTablaTecnico | null;
  tablaR: MpviTablaTecnico | null;
}

export interface MpviGuardarTecnicoPayload {
  bod: number;
  placa: string;
  nombre: string;
  celular: string;
  correo: string;
  num_orden?: string;
  diasProxContacto: string;
  nota?: string;
  urgentes?: string;
  recomendados?: string;
  cobrables: string;
  disponibilidad: string;
  autorizados: string;
}

export interface MpviGuardarTecnicoResponse {
  ok: boolean;
  idCotizacion: number | null;
}

// ========== Jefe de Taller ==========

export interface MpviObtenerDatosServicioPayload {
  op: number;
  idCotizacion: number;
}

export interface MpviTablaServicioFila {
  idSubsistema: number;
  operacion: string;
  descripcion: string;
  tiempo: number;
  codRepuesto: string;
  repuesto: string;
  cantidad: number;
  disponible: boolean;
  valorRepuesto: number;
  manoObra: number;
  autorizado: boolean;
  noDisponible: boolean;
  sufijo: "U" | "R";
}

export interface MpviTablaServicio {
  filas: MpviTablaServicioFila[];
  totales: MpviTablaTotales;
  etiqueta: string;
}

export interface MpviDatosServicioResponse {
  correo: string;
  diasProxContacto: string;
  nota: string;
  tablaU: MpviTablaServicio;
  tablaR: MpviTablaServicio;
}

export interface MpviGuardarServicioPayload {
  op: number;
  opGuardar: number;
  idCotizacion: number;
  correo: string;
  diasProxContacto: string;
  nota?: string;
  totalAutorizado: string;
  operaciones: string;
  repuestos: string;
  disponibilidad: string;
  autorizaciones: string;
  subsistemas: string;
  valoresAuto: string;
  valoresDisp: string;
}

export interface MpviGuardarServicioResponse {
  ok: boolean;
}

// ========== Contact ==========

export interface MpviObtenerCotizacionesPayload {
  bod?: number;
  placa?: string;
  idCotizacion?: number;
}

export interface MpviCotizacionContact {
  id: number;
  placa: string;
  nombre: string;
  celular: string;
  correo: string;
  tecnico: string;
  nota: string;
  fechaContacto: string;
  diasRestantes: number;
}

export interface MpviCotizacionesContactResponse {
  cotizaciones: MpviCotizacionContact[];
}

export interface MpviDescartarCotizacionPayload {
  idCotizacion: number;
}

export interface MpviDescartarCotizacionResponse {
  ok: boolean;
}

// ========== Firma (público) ==========

export interface MpviValidarTokenResponse {
  idCotizacion: number;
  op: number;
}

export interface MpviFirmarPayload {
  opcion: number;
  llave: string;
  dataForm?: string;
  imgFirmaBase64?: string;
  imgFirmaFile?: File;
}

export interface MpviFirmarResponse {
  ok: boolean;
  result: number | string | null;
}

// ========== UI helpers ==========

export type MpviSubsistemaClasificacion = "U" | "R" | "N" | null;

export interface MpviSubsistemaEstado {
  id: number;
  subsistema: string;
  clasificacion: MpviSubsistemaClasificacion;
  noCobrable: boolean;
}

export interface MpviFilaTecnicoEstado {
  key: string;
  fila: MpviTablaTecnicoFila;
  autorizado: boolean;
  noDisponible: boolean;
}

export interface MpviFilaServicioEstado {
  key: string;
  fila: MpviTablaServicioFila;
  autorizado: boolean;
  noDisponible: boolean;
}

export function formatMpviCurrency(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString("es-CO", { maximumFractionDigits: 0 });
}
