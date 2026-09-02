export const ORDENES_TOT_COPY = {
  hub: {
    title: 'Órdenes & TOT',
    description: 'Salida de vehículos y TOT, portería y candidatos de repuestos',
  },
  buscarOrdenes: {
    title: 'Buscar Órdenes',
    description: 'Confirmación de salidas y reingresos en portería.',
  },
  darSalidaVehiculos: {
    title: 'Dar salida vehículos',
    description: 'Registro de salida de vehículos pendientes de confirmación en portería.',
  },
  darSalidaTot: {
    title: 'Dar salida TOT',
    description: 'Registro de TOT, generación de recibo PDF y marcado de reingreso.',
  },
  ingresoRepuestos: {
    title: 'Ingreso Repuestos',
    description: 'Candidatos a salida de repuestos y registro (paridad con legacy).',
  },
  saveError: 'Error al guardar',
  loadError: 'Error al cargar los datos',
} as const;
