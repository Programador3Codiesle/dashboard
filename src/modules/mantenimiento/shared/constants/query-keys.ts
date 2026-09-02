export const mantenimientoKeys = {
  all: ['mantenimiento'] as const,
  catalogos: ['mantenimiento', 'catalogos'] as const,
  equipos: (params: {
    page: number;
    limit: number;
    filter: string;
    bodega: string;
    area: string;
  }) => ['mantenimiento', 'equipos', params] as const,
  hojaVida: (id: number) => ['mantenimiento', 'hoja-vida', id] as const,
  nombresFamilia: (codigo: string) =>
    ['mantenimiento', 'nombres-familia', codigo] as const,
  correctivo: ['mantenimiento', 'correctivo'] as const,
  solicitud: (id: number) => ['mantenimiento', 'solicitud', id] as const,
  preventivoEventos: ['mantenimiento', 'preventivo', 'eventos'] as const,
  preventivoListado: ['mantenimiento', 'preventivo', 'listado'] as const,
  ordenPreventivo: (id: number) =>
    ['mantenimiento', 'preventivo', 'orden', id] as const,
  informePreventivo: (estado: string, bodega: string) =>
    ['mantenimiento', 'informe-preventivo', estado, bodega] as const,
  informeCorrectivo: (estado: string, bodega: string) =>
    ['mantenimiento', 'informe-correctivo', estado, bodega] as const,
};
