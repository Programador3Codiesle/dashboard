import { nextPublicAssetSrc } from '@/config/next-base-path';

export const ADMINISTRACION_COPY = {
  hub: {
    title: 'Administración',
    description: 'Gestiona los módulos administrativos de la empresa',
  },
  backLabel: '← Volver a Administración',
  ajustesValores: {
    title: 'Ajustes Valores Contables',
    description: 'Gestión y ajuste de valores contables multiempresa',
    loadError: 'Error al obtener los valores contables',
  },
  controlVehiculos: {
    title: 'Control Ingreso y Salida de Vehículos',
    description: 'Registro y control de ingresos y salidas de vehículos',
    loadError: 'Error al cargar los registros de vehículos',
  },
  evaluacionDesempeno: {
    title: 'Evaluación Desempeño Empleado',
    description: 'Evaluación de desempeño por jefe inmediato',
    loadError: 'Error al cargar las evaluaciones pendientes',
  },
  formatoDesempeno: {
    title: 'Formato Desempeño Empleado',
    description: 'Autoevaluación de desempeño por empleado',
    loadError: 'Error al cargar la autoevaluación',
  },
  formatoOrdenSalida: {
    title: 'Formato Orden de Salida',
    description: 'Registro del formato de orden de salida (SGC-FR02)',
    loadError: 'Error al cargar el formulario de orden de salida',
  },
  formatosNomina: {
    title: 'Formatos Nómina',
    description: 'Consulta, visualiza y descarga los formatos de nómina vigentes',
    loadError: 'Error al cargar los formatos de nómina',
  },
  gestionCompras: {
    title: 'Gestión de Compras',
    description: 'Solicitudes y gestión de compras multiempresa',
    loadError: 'Error al cargar las solicitudes de compra',
  },
  inasistencia: {
    title: 'Inasistencia',
    description: 'Informe de inasistencia de empleados',
    loadError: 'Error al cargar las inasistencias',
  },
  informeAusentismo: {
    title: 'Informe Ausentismo',
    description: 'Informe detallado de ausentismo multiempresa',
    loadError: 'Error al cargar el informe de ausentismo',
  },
  informeSostenibilidad: {
    title: 'Informe de Sostenibilidad 2024',
    description: 'Visualización del informe anual de sostenibilidad',
  },
  informeTiempoSuplementario: {
    title: 'Informe Tiempo Suplementario',
    description: 'Informe de tiempo suplementario multiempresa',
    loadError: 'Error al cargar el informe de tiempo suplementario',
  },
  listaAusentismo: {
    title: 'Lista Ausentismo',
    description: 'Ausentismos del día actual',
    loadError: 'Error al cargar los ausentismos del día',
    empty: 'No hay ausentismos registrados para hoy',
  },
  listaHorasExtras: {
    title: 'Lista Horas Extras',
    description: 'Horas extras del día actual',
    loadError: 'Error al cargar las horas extras del día',
    empty: 'No hay horas extras registradas para hoy',
  },
  nuevoAusentismo: {
    title: 'Nuevo Ausentismo',
    description: 'Registro de nuevos ausentismos',
    loadError: 'Error al cargar los ausentismos',
  },
  solicitudTiempoSuplementario: {
    title: 'Solicitud Tiempo Suplementario',
    description: 'Solicitud de tiempo suplementario',
    loadError: 'Error al cargar las solicitudes',
  },
  tallasDotacion: {
    title: 'Tallas Dotación',
    description: 'Actualización de tallas para dotación',
    loadError: 'Error al cargar las tallas',
  },
  reglamentoInterno: {
    title: 'Reglamento Interno de Trabajo',
    description: 'Consulta del reglamento interno de trabajo de la empresa',
  },
} as const;

export const PDF_REGLAMENTO_INTERNO =
  '/uploads/formatos/administracion/REGLAMENTO INTERNO DE TRABAJO CODIESEL 2025.pdf';

export const PDF_INFORME_SOSTENIBILIDAD =
  '/uploads/formatos/INFORME DE SOSTENIBILIDAD CODIESEL 2024.pdf';

/** PDF estático en `public/`. En prod debe ir bajo `/postventa2` o Apache (intranet.codiesel.co) responde 404. */
export function administracionPdfSrc(relativePath: string): string {
  const normalized = relativePath.startsWith('/')
    ? relativePath
    : `/${relativePath}`;
  return nextPublicAssetSrc(normalized);
}

export const FORMATOS_NOMINA = [
  {
    id: 1,
    titulo: 'Descuento de nómina Codiesel',
    descripcion:
      'Formato para solicitar descuento de nómina para colaboradores de Codiesel.',
    file: 'Descuento de nomina Codiesel.pdf',
  },
  {
    id: 2,
    titulo: 'Descuento de nómina Gente Util',
    descripcion: 'Formato de descuento de nómina para personal Gente Util.',
    file: 'Descuento de nomina Gente Util.pdf',
  },
  {
    id: 3,
    titulo: 'Formato solicitud de vacaciones',
    descripcion: 'Solicitud de vacaciones de acuerdo con la política interna.',
    file: 'Formato de Solicitud de Vacaciones.PDF',
  },
  {
    id: 4,
    titulo: 'Formato solicitud de vacaciones en dinero',
    descripcion: 'Solicitud de vacaciones en dinero según la normatividad vigente.',
    file: 'Formato solicitud de vacaciones en dinero.pdf',
  },
  {
    id: 5,
    titulo: 'Fechas de entrega de solicitud de vacaciones vs fecha de pago',
    descripcion:
      'Calendario de entrega de solicitudes de vacaciones y fechas de pago.',
    file: 'Fechas de entrega de solicitud de vacaciones vs fecha de pago.pdf',
  },
] as const;

export const AREAS_SOLICITA = [
  'Administración',
  'Contact center',
  'Central de Beneficio',
  'Vehiculos nuevos',
  'Vehiculos usados',
  'Alistamiento',
  'Mecanica gasolina',
  'Mecanica diesel',
  'Lamina y pintura',
  'Accesorios',
  'Repuestos',
  'Sistemas',
  'Negocios',
];

/** Lista histórica: usar getSedesByEmpresa(empresaId) para filtrar por empresa seleccionada */
export const SEDES = [
  'Giron',
  'Rosita',
  'Chevropartes',
  'Solochevrolet',
  'Barrancabermeja',
  'Malecon',
  'Bocono',
  'Dieselco',
  'Duitama',
  'Cucuta',
  'Tunja',
];

/** Sedes por empresa (id: 1 Codiesel, 2 Dieselco, 3 Mitsubishi, 4 BYD). */
export const SEDES_POR_EMPRESA: Record<number, string[]> = {
  1: ['Giron', 'Rosita', 'Bocono', 'Barrancabermeja', 'Chevropartes'],
  2: ['Giron', 'Duitama', 'Cucuta'],
  3: ['Cucuta', 'Tunja'],
  4: ['Cucuta', 'Tunja'],
};

export function getSedesByEmpresa(empresaId: number | undefined): string[] {
  if (empresaId == null) return [];
  return SEDES_POR_EMPRESA[empresaId] ?? [];
}

export const MOTIVOS_PERMISO = [
  'Cumpleaños',
  'Cita Medica/Odontologica DEL TRABAJADOR',
  'Licencias(Paternidad o Luto)',
  'Grave Calamidad Domestica Comprobada',
  'Reunion o capacitacion programada por la Empresa',
  'Permiso no Remunerado con descuento de nomina',
  'Personal',
  'Estudio',
  'Dia de la familia',
  'Grado o matrimonio del trabajador',
  'Jurado votacion',
];

export const AREAS_INFORME_AUSENTISMO = [
  'Administracion',
  'Administracion Servicio',
  'Central de Beneficio',
  'Vehiculos Nuevos',
  'Vehiculos Usados',
  'Repuestos',
  'Taller Gasolina',
  'Taller Diesel',
  'Lamina Y Pintura',
  'Alistamiento',
  'Contact Center',
  'Accesorios',
];

export const GENEROS_TALLA_DOTACION = [
  { value: '0', label: 'Mujer' },
  { value: '1', label: 'Hombre' },
];

export const TALLAS_CAMISA = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const TALLAS_PANTALON = ['28', '30', '32', '34', '36', '38', '40', '42'];
export const TALLAS_BOTAS = [
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  '45',
];

export const COMPETENCIAS_TEMPLATE = [
  {
    categoria: 'Trabajo en Equipo',
    items: [
      'labora espontáneamente a los demás miembros del grupo de trabajo',
      'Participa activamente en la consecución de una meta común de la empresa',
      'Propone iniciativas que favorezcan el cumplimiento de metas establecidas para el proceso en el que participa',
    ],
  },
  {
    categoria: 'Relaciones Interpersonales',
    items: [
      'Establece y mantiene relaciones interpersonales cordiales y armoniosas con sus compañeros y sus superiores',
      'Escucha, hace preguntas y expresa conceptos e ideas de forma efectiva.',
      'Mantiene la discreción y confidencialidad en el manejo de la información',
    ],
  },
  {
    categoria: 'Responsabilidad',
    items: [
      'Efectividad, precisión y excelencia en el cumplimiento de sus responsabilidades, funciones y tareas',
      'Sigue a cabalidad las instrucciones establecidas para la ejecución de las tareas',
    ],
  },
  {
    categoria: 'Compromiso y Sentido de Pertenencia',
    items: [
      'Muestra y expresa orgullo, gusto y compromiso por ser parte de la empresa',
      'Conoce los procesos que hacen parte de la empresa y entiende su participación y aporte a los mismos',
      'Conoce las metas estratégicas de la empresa y se esfuerza en facilitar que sean alcanzadas desde el cumplimiento de sus responsabilidades',
    ],
  },
  {
    categoria: 'Adaptabilidad al Cambio',
    items: [
      'Se ajusta con facilidad, rapidez y actitud positiva a nuevas situaciones',
      'Ante situaciones bajo presión, se adapta, controla el estrés y es productivo',
    ],
  },
  {
    categoria: 'Solución de Conflictos',
    items: [
      'Escucha activamente teniendo en cuenta los aspectos importantes, aclarando dudas y analizando lo comprendido.',
      'Formula estrategias de forma ágil y eficiente para superar los conflictos presentados con la organización',
      'Identifica e implementa soluciones adecuadas y viables para afrontar con éxito problemas en su propia labor.',
    ],
  },
  {
    categoria: 'Servicio al Cliente',
    items: [
      'Identifica con claridad quien es el cliente y le ofrece un trato cordial',
      'Se esfuerza en brindar una excelente experiencia de atención al usuario y/o servicio al cliente, de forma individual o colectiva de acuerdo a las necesidades de cada uno de ellos',
    ],
  },
  {
    categoria: 'SG - SST',
    items: [
      'Participa activamente en las actividades de capacitación',
      'Informa oportunamente de los peligros y riesgos latentes en el sitio de trabajo',
      'Reporta inmediatamente todo incidente o accidente que ocurra',
      'Suministra información clara, veraz y completa del estado de salud',
      'Usa adecuadamente el equipo, herramientas y elementos de seguridad necesarios para el desarrollo de sus funciones.',
      'En su desempeño laboral en el último año, ha presentado suspensión y/o llamados de atención por no atender las reglas internas de la empresa. (0 eventos = 5 ; 1 evento = 4; 2 eventos = 3; 3 eventos = 2; mayor a 3 eventos = 1)',
      'Ha sufrido accidentes de trabajo en el último año ( 0 AT= 5; 1 AT= 4 ; 2 AT= 3; 3 AT= 2; mayor a 3 AT= 1)',
    ],
  },
];
