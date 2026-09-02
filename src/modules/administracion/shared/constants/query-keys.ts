export const administracionKeys = {
  all: ['administracion'] as const,
  listaAusentismo: ['administracion', 'lista-ausentismo'] as const,
  listaHorasExtras: ['administracion', 'lista-horas-extras'] as const,
  formatosNomina: ['administracion', 'formatos-nomina'] as const,
  inasistencia: (inicio: string, fin: string, empleado: string) =>
    ['administracion', 'inasistencia', inicio, fin, empleado] as const,
  gestionCompras: ['administracion', 'gestion-compras'] as const,
  controlVehiculos: ['administracion', 'control-vehiculos'] as const,
  modelosVehiculo: ['administracion', 'control-vehiculos', 'modelos'] as const,
  tallasDotacion: (empresaId: number) =>
    ['administracion', 'tallas-dotacion', empresaId] as const,
  nuevoAusentismo: (year: number, month: number) =>
    ['administracion', 'nuevo-ausentismo', year, month] as const,
  solicitudTiempo: (year: number, month: number) =>
    ['administracion', 'solicitud-tiempo', year, month] as const,
  informeAusentismo: (params: string) =>
    ['administracion', 'informe-ausentismo', params] as const,
  informeTiempo: (params: string) =>
    ['administracion', 'informe-tiempo', params] as const,
  evaluacionPendientes: ['administracion', 'evaluacion-pendientes'] as const,
  formatoDesempeno: ['administracion', 'formato-desempeno'] as const,
  formatoOrdenSalida: (placa: string, empresa: number) =>
    ['administracion', 'formato-orden-salida', placa, empresa] as const,
} as const;
