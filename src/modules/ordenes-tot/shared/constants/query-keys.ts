export const ordenesTotKeys = {
  all: ['ordenes-tot'] as const,
  porteria: ['ordenes-tot', 'porteria'] as const,
  porteriaVehiculos: ['ordenes-tot', 'porteria', 'vehiculos'] as const,
  porteriaTot: ['ordenes-tot', 'porteria', 'tot'] as const,
  porteriaOrdenes: ['ordenes-tot', 'porteria', 'ordenes-generales'] as const,
  vehiculosPendientes: ['ordenes-tot', 'vehiculos-pendientes'] as const,
  listadoTot: (estado: 1 | 2, page: number) =>
    ['ordenes-tot', 'listado-tot', estado, page] as const,
  listadoTotAll: ['ordenes-tot', 'listado-tot'] as const,
  repuestosCandidatos: ['ordenes-tot', 'repuestos-candidatos'] as const,
  ordenesGeneralesPendientes: ['ordenes-tot', 'ordenes-generales-pendientes'] as const,
  validarOrden: (orden: string) => ['ordenes-tot', 'validar-orden', orden] as const,
};
