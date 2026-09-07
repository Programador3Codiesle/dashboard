export const ENCUESTAS_COPY = {
  hub: {
    title: 'Encuestas',
    description:
      'Satisfacción, ingreso NPS Colmotores/Técnicos y encuesta QR de salida',
  },
  satisfaccion: {
    title: 'Satisfacción',
    description: 'Encuestas de satisfacción respondidas (canal email/link)',
    backLabel: '← Volver a Encuestas',
    searchPlaceholder: 'Buscar NIT, cliente, orden o placa...',
    empty: 'Sin registros',
    loadError: 'Error al cargar encuestas',
  },
  satisfaccionDetalle: {
    title: 'Detalle encuesta',
    description: 'Respuestas de la encuesta de satisfacción asociada a la orden',
    backLabel: '← Volver al listado',
    loadError: 'Error al cargar detalle',
    missingOt: 'Indique el número de orden',
    notFound: 'No se encontró la orden',
  },
  npsColmotores: {
    title: 'Ingreso NPS Colmotores',
    description: 'Registro manual de NPS por sede o por técnico',
    backLabel: '← Volver a Encuestas',
    loadError: 'Error al cargar técnicos',
    tecnicoSkipped:
      'Ya hay más de un NPS para ese técnico en esa fecha; no se modificó ningún registro',
  },
  npsTecnicos: {
    title: 'Ingreso NPS Técnicos',
    description: 'Carga masiva de encuestas NPS técnicos desde Excel GM',
    backLabel: '← Volver a Encuestas',
    uploadError: 'Error al cargar archivo',
  },
  satisfaccionQr: {
    title: 'Satisfacción QR',
    description:
      'Carga de encuesta QR por ventanilla: taller, placa y calificación',
    backLabel: '← Volver a Encuestas',
    loadError: 'Error al validar la placa',
    submitError: 'Error al Cargar La Encuesta',
    fieldsRequired: 'Error todos los Campos deden ser completado',
  },
  qr: {
    loadError: 'No se pudieron cargar las preguntas',
  },
} as const;
