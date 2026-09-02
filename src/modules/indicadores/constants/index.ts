export const INDICADORES_COPY = {
  hub: {
    title: 'Indicadores',
    description: 'Indicadores de posventa para Codiesel',
  },
  presupuesto: {
    title: 'Presupuesto POSVENTA',
    description: 'Avance de ventas frente a la meta del mes (actualización cada 60 s).',
  },
  sedes: {
    title: 'Presupuesto por sedes',
    description: 'Detalle de avance por sede (actualización cada 60 s).',
  },
  talleres: {
    title: 'Presupuesto por talleres',
    description: 'Totales por taller (Diesel, Gasolina, Lámina y Pintura, Mostrador).',
  },
  tipoOperaciones: {
    title: 'Tipos de operación',
    description: 'Desglose REPUESTOS, TOT y MO del taller seleccionado.',
  },
  loadError: 'Error al cargar los indicadores',
} as const;
