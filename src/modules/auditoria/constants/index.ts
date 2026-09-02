export const AUDITORIA_COPY = {
  hub: {
    title: 'Auditoría',
    description:
      'Control de órdenes, facturación, NPS fábrica, PQR y entregas',
  },
  backLabel: '← Volver a Auditoría',
  ordenesDiarias: {
    title: 'Control de Órdenes Diarias',
    description: 'Tipificación de órdenes por bodega y fecha',
    loadError: 'Error al cargar órdenes diarias',
    empty: 'Sin registros. Use los filtros para consultar.',
  },
  entregas: {
    title: 'Entregas por tipo de vehículos',
    description: 'Entregas y segunda entrega por tipo de vehículo',
    loadError: 'Error al cargar entregas',
    empty: 'No se encontraron registros. Use los filtros de consulta.',
    livianos: 'Vehículos livianos',
    pesados: 'Vehículos pesados',
  },
  facturacionTaller: {
    title: 'Facturación total taller vs presupuesto',
    description: 'Ventas vs presupuesto por sede (últimos meses)',
    loadError: 'Error al cargar facturación taller',
    empty: 'Sin información',
  },
  facturacionTecnico: {
    title: 'Facturación total técnico vs presupuesto',
    description: 'Ventas vs presupuesto por técnico',
    loadError: 'Error al cargar facturación técnico',
    empty: 'Sin información',
    tecnicosError: 'Error al cargar técnicos',
  },
  ordenesMtto: {
    title: 'Órdenes de mantenimiento preventivo vs presupuestos',
    description: 'Cumplimiento de OT preventivas vs presupuesto',
    loadError: 'Error al cargar órdenes mtto',
    empty: 'Sin información',
  },
  ordenesTecnicos: {
    title: 'Órdenes técnicos vs presupuesto últimos 6 meses',
    description: 'Cantidad de órdenes vs presupuesto por técnico',
    loadError: 'Error al cargar órdenes técnicos',
    empty: 'Sin información',
    tecnicosError: 'Error al cargar técnicos',
  },
  npsFabrica: {
    title: 'NPS Fábrica',
    description: 'Informe NPS Colmotores por sede y técnico',
    loadError: 'Error al consultar NPS',
  },
  pqr: {
    title: 'PQR',
    description: 'Gestión de PQR y NPS de distintas fuentes',
  },
  rankingNps: {
    title: 'Ranking NPS Técnicos',
    description: 'Órdenes finalizadas vs encuestas realizadas',
  },
  retornos: {
    title: 'Retornos por Sede',
    description: 'Comparativo mensual de entradas, retornos y posibles retornos',
  },
} as const;
