export interface INominaReporte {
  id: number;
  periodo: string;
  montoBase: number;
  deducciones: number;
  bonos: number;
  montoNeto: number;
  estado: 'Pagado' | 'Pendiente' | 'Revisión';
}
