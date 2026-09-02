export const indicadoresKeys = {
  all: ['indicadores'] as const,
  presupuesto: ['indicadores', 'presupuesto-posventa'] as const,
  sedes: ['indicadores', 'presupuesto-posventa', 'sedes'] as const,
  talleres: (sede: string) =>
    ['indicadores', 'presupuesto-posventa', 'talleres', sede] as const,
  tipoOp: (bodega: string) =>
    ['indicadores', 'presupuesto-posventa', 'tipo-op', bodega] as const,
};
