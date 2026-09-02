export const MANTENIMIENTO_COPY = {
  hub: {
    title: 'Mantenimiento',
    description: 'Equipos, correctivo, preventivo e informes',
  },
  backLabel: '← Volver a Mantenimiento',
  backEquipos: '← Volver a equipos',
  backCronograma: '← Volver al cronograma',
  equipos: {
    title: 'Gestión de Equipos y Mantenimiento',
    loadError: 'Error al listar equipos',
    empty: 'Sin equipos',
  },
  correctivo: {
    title: 'Solicitudes de Mantenimiento',
    loadError: 'Error al listar solicitudes',
    empty: 'Sin solicitudes',
  },
  preventivo: {
    title: 'Plan o Cronograma de Mantenimiento Preventivo',
    loadError: 'Error al cargar cronograma',
  },
  preventivoListado: {
    title: 'Listado OT preventivas pendientes',
    loadError: 'Error al cargar listado',
    empty: 'Sin pendientes',
  },
  informePreventivo: {
    title: 'Informe de mantenimiento preventivo',
    loadError: 'Error informe preventivo',
    empty: 'Sin información',
  },
  informeCorrectivo: {
    title: 'Informe de mantenimiento correctivo',
    loadError: 'Error informe correctivo',
    empty: 'Sin información',
  },
  hojaVida: {
    loadError: 'Error al cargar hoja de vida',
    empty: 'Equipo no encontrado',
  },
} as const;
