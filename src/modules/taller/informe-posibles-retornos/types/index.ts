export interface TecnicoCatalogo {
  nit_usuario: string;
  nombres: string;
}

export interface BodegaCatalogo {
  bodega: number;
  descripcion: string;
}

export interface CatalogosInforme {
  tecnicos: TecnicoCatalogo[];
  bodegas: BodegaCatalogo[];
}

export interface GraficoDataPoint {
  label: string;
  y: number;
}

export interface GraficoSuccessResponse {
  response: "success";
  entradas: GraficoDataPoint[];
  retornos: GraficoDataPoint[];
  posibles: GraficoDataPoint[];
}

export interface GraficoErrorResponse {
  response: "error";
}

export type GraficoResponse = GraficoSuccessResponse | GraficoErrorResponse;

export interface GetGraficoParams {
  year: number;
  tecnico?: string;
  sede?: number;
}

export interface GraficoChartPoint {
  mes: string;
  entradas: number;
  retornos: number;
  posibles: number;
}
