export const REPUESTOS_COPY = {
  hubTitle: 'Repuestos',
  hubDescription:
    'Gestión de entradas varias, inventario obsoleto y órdenes de compra',
  entradasVarias: {
    title: 'Solicitud de Entrada Varia',
    description:
      'Crear solicitudes de entrada varia asociadas a órdenes de taller.',
  },
  solicitudesEv: {
    title: 'Gestión Entradas Varias',
    description:
      'Autorización, registro de EV/SV y entrega de repuestos por solicitud.',
  },
  informeEvSv: {
    title: 'Informe EV y SV',
    description:
      'Seguimiento de solicitudes con estados de gestión de repuestos y bodega.',
  },
  inventarioObsoletos: {
    title: 'Inventario Obsoletos',
    description:
      'Resumen del inventario obsoleto por categoría con detalle y simulación de descuentos.',
  },
  informeObsoletos: {
    title: 'Informe Obsoletos',
    description: 'Consulta por rangos de meses y costo con exportación a Excel.',
  },
  ordenCompra: {
    title: 'Órdenes de Compra Repuestos',
    description: 'Gestión de autorización, presupuesto y stock por sede.',
  },
} as const;
