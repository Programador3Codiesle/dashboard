export interface GenerarInformeParams {
  yearOne: number;
  monthOne: string;
  monthTwo: string;
  yearTwo: number;
}

export interface FilaInformeTecnico {
  rnk: number;
  taller: string;
  nombre: string;
  mano_obra: number;
  repuestos: number;
  utilidad: number;
  utilidad_year: number;
  ticket_total: number;
  horas_cliente: number;
  horas_garantia: number;
  horas_internas: number;
  horas_servicio: number;
  total_horas: number;
  valor_hora: number;
  fecha_ini: string;
  dias_vacaciones: number;
  costo_mo: number;
}

export interface GenerarInformeResponse {
  yearComparar: number;
  filas: FilaInformeTecnico[];
}

export interface FiltrosPygState {
  yearOne: string;
  monthOne: string;
  monthTwo: string;
  yearTwo: string;
}
