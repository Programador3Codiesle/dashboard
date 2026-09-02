export const encuestasKeys = {
  all: ['encuestas'] as const,
  satisfaccion: (q: string, page: number) =>
    ['encuestas', 'satisfaccion', q, page] as const,
  satisfaccionDetalle: (ot: string) =>
    ['encuestas', 'satisfaccion', 'detalle', ot] as const,
  tecnicosNps: ['encuestas', 'nps-colmotores', 'tecnicos'] as const,
  preguntasQr: ['encuestas', 'qr', 'preguntas'] as const,
};
