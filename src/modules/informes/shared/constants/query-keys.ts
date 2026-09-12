export const informesKeys = {
  all: ['informes'] as const,
  gh: {
    infAusentismos: (params: string) =>
      ['informes', 'gh', 'inf-ausentismos', params] as const,
    checklistCarro: (params: string) =>
      ['informes', 'gh', 'checklist-carro', params] as const,
    checklistMoto: (params: string) =>
      ['informes', 'gh', 'checklist-moto', params] as const,
    controlCompras: (orden: number | null, page: number) =>
      ['informes', 'gh', 'control-compras', orden, page] as const,
    indicadorChecklist: (params: string) =>
      ['informes', 'gh', 'indicador-checklist', params] as const,
    indicadorPesv: (params: string) =>
      ['informes', 'gh', 'indicador-pesv', params] as const,
    checklists: (params: string) =>
      ['informes', 'gh', 'checklists', params] as const,
    ordenesSalida: (params: string) =>
      ['informes', 'gh', 'ordenes-salida', params] as const,
    tallasPersonal: (params: string) =>
      ['informes', 'gh', 'tallas-personal', params] as const,
    desempenoEmpleado: (params: string) =>
      ['informes', 'gh', 'desempeno-empleado', params] as const,
    desempenoDetalle: (id: string) =>
      ['informes', 'gh', 'desempeno-empleado', 'detalle', id] as const,
    tiempoGestionCompras: (params: string) =>
      ['informes', 'gh', 'tiempo-gestion-compras', params] as const,
    llegadasTarde: (params: string) =>
      ['informes', 'gh', 'llegadas-tarde', params] as const,
    controlVehicular: (params: string) =>
      ['informes', 'gh', 'control-vehicular', params] as const,
    mttoPreventivoVh: (params: string) =>
      ['informes', 'gh', 'mtto-preventivo-vh', params] as const,
    entradasSalidas: (params: string) =>
      ['informes', 'gh', 'entradas-salidas', params] as const,
    ingresoEmpleados: (params: string) =>
      ['informes', 'gh', 'ingreso-empleados', params] as const,
    pausasActivas: (params: string) =>
      ['informes', 'gh', 'pausas-activas', params] as const,
  },
  pv: {
    llegadaVehiculos: (params: string) =>
      ['informes', 'pv', 'llegada-vehiculos', params] as const,
    ventas1a1: (params: string) =>
      ['informes', 'pv', 'ventas-1a1', params] as const,
    tiempoEntrevista: (params: string) =>
      ['informes', 'pv', 'tiempo-entrevista', params] as const,
    inventarioObsoletos: (params: string) =>
      ['informes', 'pv', 'inventario-obsoletos', params] as const,
    ticketPromedio: (params: string) =>
      ['informes', 'pv', 'ticket-promedio', params] as const,
    kpi: ['informes', 'pv', 'kpi'] as const,
    segundaEntrega: (params: string) =>
      ['informes', 'pv', 'segunda-entrega', params] as const,
    retencion72: (params: string) =>
      ['informes', 'pv', 'retencion-72-0', params] as const,
    npsInterno: (params: string) =>
      ['informes', 'pv', 'nps-interno', params] as const,
    productividad: (params: string) =>
      ['informes', 'pv', 'productividad-tecnicos', params] as const,
    npsTecnicos: (params: string) =>
      ['informes', 'pv', 'nps-tecnicos', params] as const,
    mpc: ['informes', 'pv', 'mpc'] as const,
    encuestaSatisfaccion: (params: string) =>
      ['informes', 'pv', 'encuesta-satisfaccion', params] as const,
    encuestaSatisfaccionBodegas: (empresaId: number) =>
      ['informes', 'pv', 'encuesta-satisfaccion', 'bodegas', empresaId] as const,
    encuestaSatisfaccionTecnicos: (bode: string) =>
      ['informes', 'pv', 'encuesta-satisfaccion', 'tecnicos', bode] as const,
    pqrNps: (params: string) => ['informes', 'pv', 'pqr-nps', params] as const,
    pacNpsDetallado: (params: string) =>
      ['informes', 'pv', 'pac-nps-detallado', params] as const,
    panelNps: (params: string) =>
      ['informes', 'pv', 'panel-nps', params] as const,
    encuestasInternas: (params: string) =>
      ['informes', 'pv', 'encuestas-internas', params] as const,
    pac: ['informes', 'pv', 'pac'] as const,
  },
} as const;
