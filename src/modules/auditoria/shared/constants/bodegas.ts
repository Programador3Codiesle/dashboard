export type BodegaOption = { value: string; label: string };

/** Bodegas Control órdenes diarias / mtto / órdenes técnicos */
export const BODEGAS_AUDITORIA_BASE: BodegaOption[] = [
  { value: '1', label: 'CODIESEL PRINCIPAL' },
  { value: '6', label: 'CHEVYEXPRESS BARRANCA' },
  { value: '7', label: 'CHEVYEXPRESS LA ROSITA' },
  { value: '8', label: 'CODIESEL VILLA DEL ROSARIO' },
  { value: '9', label: 'LAMINA Y PINTURA AUTOMOVILES-GIRON' },
  { value: '11', label: 'DIESEL EXPRESS GIRON' },
  { value: '14', label: 'LAMINA Y PINTURA AUTOMOVILES-BOCONO' },
  { value: '16', label: 'BOCONO DIESEL EXPRESS' },
];

/** Bodegas facturación taller (incluye 19, sin LyP) */
export const BODEGAS_FACTURACION_TALLER: BodegaOption[] = [
  { value: '1', label: 'CODIESEL PRINCIPAL' },
  { value: '6', label: 'CHEVYEXPRESS BARRANCA' },
  { value: '7', label: 'CHEVYEXPRESS LA ROSITA' },
  { value: '8', label: 'CODIESEL VILLA DEL ROSARIO' },
  { value: '11', label: 'DIESEL EXPRESS GIRON' },
  { value: '16', label: 'BOCONO DIESEL EXPRESS' },
  { value: '19', label: 'DIESEL EXPRESS BARRANCA' },
];

/** Bodegas facturación técnico (con LyP, sin 19) */
export const BODEGAS_FACTURACION_TECNICO: BodegaOption[] = [
  ...BODEGAS_AUDITORIA_BASE,
];

export function cumplimientoPct(venta: number, presupuesto: number): number {
  if (!venta) return 0;
  const den = presupuesto === 0 ? venta : presupuesto;
  return (venta / den) * 100;
}
