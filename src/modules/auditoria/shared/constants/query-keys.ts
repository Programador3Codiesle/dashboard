export const auditoriaKeys = {
  all: ['auditoria'] as const,
  tecnicos: ['auditoria', 'tecnicos'] as const,
  ordenesDiarias: (fecha: string, bodega: string) =>
    ['auditoria', 'ordenes-diarias', fecha, bodega] as const,
  entregas: (ano: number, tipo: 1 | 2) =>
    ['auditoria', 'entregas', ano, tipo] as const,
  facturacionTaller: (bodega: string) =>
    ['auditoria', 'facturacion-taller', bodega] as const,
  facturacionTecnico: (bodega: string, tecnico: string) =>
    ['auditoria', 'facturacion-tecnico', bodega, tecnico] as const,
  ordenesMtto: (bodega: string) =>
    ['auditoria', 'ordenes-mtto', bodega] as const,
  ordenesTecnicos: (bodega: string, tecnico: string) =>
    ['auditoria', 'ordenes-tecnicos', bodega, tecnico] as const,
  npsSedes: (fecha: string) =>
    ['auditoria', 'nps-fabrica', 'sedes', fecha] as const,
  npsTecnicos: (fecha: string, sede: string) =>
    ['auditoria', 'nps-fabrica', 'tecnicos', fecha, sede] as const,
};
