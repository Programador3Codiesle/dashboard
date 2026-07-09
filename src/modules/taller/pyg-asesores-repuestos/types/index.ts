export interface GenerarInformeParams {
  yearOne: number;
  monthOne: string;
  monthTwo: string;
  yearTwo: number;
}

export interface FilaInformeAsesor {
  rnk: number;
  nombres: string;
  venta_taller: number;
  costo_taller: number;
  utilidad_taller: number;
  utilidad_taller_ant: number;
  venta_mostrador: number;
  costo_mostrador: number;
  utilidad_mostrador: number;
  utilidad_mostrador_ant: number;
  utilidad_total: number;
  utilidad_total_ant: number;
  salario: number;
  fecha_ini: string;
  dias: number;
}

export interface GenerarInformeResponse {
  yearComparar: number;
  filas: FilaInformeAsesor[];
}

export interface FiltrosPygState {
  yearOne: string;
  monthOne: string;
  monthTwo: string;
  yearTwo: string;
}
