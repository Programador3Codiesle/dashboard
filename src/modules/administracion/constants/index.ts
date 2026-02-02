import {
  ValorContable,
  VehiculoSalida,
  SolicitudCompra,
  Inasistencia,
  Ausentismo,
  TiempoSuplementario,
  TallaDotacion,
  OrdenSalida,
  NivelUrgencia,
} from "../types";

// ========== AJUSTES VALORES CONTABLES ==========
export const MOCK_VALORES_CONTABLES: ValorContable[] = [
  {
    id: "1",
    concepto: "Factura 001",
    retencionFuente: 100000,
    reteIVA: 50000,
    reteICA: 30000,
    iva: 200000,
    avisosTableros: 15000,
    sobretasaBomberil: 10000,
    valorAplicado: 405000,
    valorTotal: 405000,
  },
];



export const TIPOS_VEHICULO = ["Automóvil", "Camioneta", "Motocicleta", "Bus"];
export const TALLERES = ["Taller Central", "Taller Norte", "Taller Sur", "Taller Este"];

// ========== GESTIÓN DE COMPRAS ==========
export const MOCK_SOLICITUDES_COMPRA: SolicitudCompra[] = [
  {
    id: 1,
    numero: 1001,
    descripcion: "Compra de materiales de oficina",
    mensajes: "Pendiente aprobación",
    conFactura: true,
    estado: "Pendiente",
    estadoAutorizacion: "En revisión",
    usuarioSolicita: "María González",
    gerenteAutoriza: "Carlos Rodríguez",
    fechaSolicitud: "2025-01-10",
    fechaAutorizacion: "2025-01-12",
    gestionDias: 2,
    urgencia: 2,
    areaSolicita: "Administración",
    sede: "Sede Principal",
    proveedoresSugeridos: "Papelería ABC",
    areaCarga: "Administración 100%",
  },
  {
    id: 2,
    numero: 1002,
    descripcion: "Servicio de mantenimiento",
    mensajes: "Aprobado",
    conFactura: false,
    estado: "Aprobado",
    estadoAutorizacion: "Autorizado",
    usuarioSolicita: "Juan Pérez",
    gerenteAutoriza: "Ana Martínez",
    fechaSolicitud: "2025-01-08",
    fechaAutorizacion: "2025-01-09",
    gestionDias: 1,
    urgencia: 3,
    areaSolicita: "Taller",
    sede: "Sede Norte",
    areaCarga: "Taller 100%",
  },
];

export const AREAS_SOLICITA = [
  "Administración",
  "Contact center",
  "Central de Beneficio",
  "Vehiculos nuevos",
  "Vehiculos usados",
  "Alistamiento",
  "Mecanica gasolina",
  "Mecanica diesel",
  "Lamina y pintura",
  "Accesorios",
  "Repuestos",
  "Sistemas",
  "Negocios",
];

export const SEDES = [
  "Giron",
  "Rosita",
  "Chevropartes",
  "Solochevrolet",
  "Barrancabermeja",
  "Malecon",
  "Bocono",
  "Dieselco",
  "Duitama",
];

export const MOTIVOS_PERMISO = [
  "Cumpleaños",
  "Cita Medica/Odontologica DEL TRABAJADOR",
  "Licencias(Paternidad o Luto)",
  "Grave Calamidad Domestica Comprobada",
  "Reunion o capacitacion programada por la Empresa",
  "Permiso no Remunerado con descuento de nomina",
  "Personal",
  "Estudio",
  "Dia de la familia",
  "Grado o matrimonio del trabajador",
  "Jurado votacion",
];

export const GERENTES_AUTORIZA = ["Carlos Rodríguez", "Ana Martínez", "Luis Sánchez", "Patricia Gómez"];

// ========== INASISTENCIA ==========
export const MOCK_INASISTENCIAS: Inasistencia[] = [
  { id: 1, documento: "1096219894", nombre: "Carlos Andrés Gómez Rubio", fecha: "2025-01-15" },
  { id: 2, documento: "1095944273", nombre: "Cristhian Alberto Sánchez Murillo", fecha: "2025-01-16" },
  { id: 3, documento: "1102368016", nombre: "Edwin Manuel Ramírez Tami", fecha: "2025-01-17" },
];

// ========== AUSENTISMO ==========
export const MOCK_AUSENTISMOS: Ausentismo[] = [
  {
    id: 1,
    gestionadoPor: "María González",
    colaborador: "Juan Pérez",
    sede: "Sede Principal",
    area: "Administración",
    fechaInicio: "2025-01-15",
    horaInicio: "08:00",
    fechaFin: "2025-01-15",
    horaFin: "12:00",
    estado: "Aprobado",
    detalle: "Permiso médico",
    motivo: "Cita médica",
    cargo: "Administrador",
  },
  {
    id: 2,
    gestionadoPor: "Carlos Rodríguez",
    colaborador: "Ana Martínez",
    sede: "Sede Norte",
    area: "Taller",
    fechaInicio: "2025-01-16",
    horaInicio: "14:00",
    fechaFin: "2025-01-16",
    horaFin: "17:00",
    estado: "Pendiente",
    detalle: "Permiso personal",
    motivo: "Asuntos personales",
    cargo: "Técnico",
  },
];

export const CENTRALES_BENEFICIOS = ["Central 1", "Central 2", "Central 3"];

export const AREAS_INFORME_AUSENTISMO = [
  "Administracion",
  "Administracion Servicio",
  "Central de Beneficio",
  "Vehiculos Nuevos",
  "Vehiculos Usados",
  "Repuestos",
  "Taller Gasolina",
  "Taller Diesel",
  "Lamina Y Pintura",
  "Alistamiento",
  "Contact Center",
  "Accesorios",
];

// ========== TIEMPO SUPLEMENTARIO ==========
export const MOCK_TIEMPO_SUPLEMENTARIO: TiempoSuplementario[] = [
  {
    id: 1,
    nombreJefe: "Carlos Rodríguez",
    nombreEmpleado: "Juan Pérez",
    sede: "Sede Principal",
    area: "Administración",
    cargo: "Administrador",
    fechaInicio: new Date().toISOString().split("T")[0],
    horaInicio: "18:00",
    fechaSolicitud: new Date().toISOString().split("T")[0],
    descripcion: "Trabajo adicional requerido",
    autorizacion: "Autorizado",
  },
];

// ========== TALLAS DOTACIÓN ==========
export const MOCK_TALLA_DOTACION: TallaDotacion = {
  nit: "1096219894",
  genero: "Masculino",
  tallaCamisa: "L",
  tallaPantalon: "36",
  tallaBotas: "42",
  ultimaActualizacion: "2025-09-05",
};

export const GENEROS = ["Masculino", "Femenino", "Otro"];

/** Opciones de género para tallas dotación (igual que Postventa: 0 = Mujer, 1 = Hombre) */
export const GENEROS_TALLA_DOTACION = [
  { value: "0", label: "Mujer" },
  { value: "1", label: "Hombre" },
];

export const TALLAS_CAMISA = ["XS", "S", "M", "L", "XL", "XXL"];
export const TALLAS_PANTALON = ["28", "30", "32", "34", "36", "38", "40", "42"];
export const TALLAS_BOTAS = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];

// ========== ORDEN DE SALIDA ==========
export const MOCK_ORDENES_SALIDA: OrdenSalida[] = [
  {
    id: 1,
    numeroOrden: "ORD-001",
    bodega: "Bodega Central",
    placa: "ABC123",
    descripcionModelo: "Toyota Hilux 2020",
    fecha: "2025-01-15",
  },
  {
    id: 2,
    numeroOrden: "ORD-002",
    bodega: "Bodega Norte",
    placa: "XYZ789",
    descripcionModelo: "Chevrolet Spark 2021",
    fecha: "2025-01-16",
  },
];

// ========== COMPETENCIAS EVALUACIÓN DESEMPEÑO ==========
export const COMPETENCIAS_TEMPLATE = [
  {
    categoria: "Trabajo en Equipo",
    items: [
      "labora espontáneamente a los demás miembros del grupo de trabajo",
      "Participa activamente en la consecución de una meta común de la empresa",
      "Propone iniciativas que favorezcan el cumplimiento de metas establecidas para el proceso en el que participa",
    ],
  },
  {
    categoria: "Relaciones Interpersonales",
    items: [
      "Establece y mantiene relaciones interpersonales cordiales y armoniosas con sus compañeros y sus superiores",
      "Escucha, hace preguntas y expresa conceptos e ideas de forma efectiva.",
      "Mantiene la discreción y confidencialidad en el manejo de la información",
    ],
  },
  {
    categoria: "Responsabilidad",
    items: [
      "Efectividad, precisión y excelencia en el cumplimiento de sus responsabilidades, funciones y tareas",
      "Sigue a cabalidad las instrucciones establecidas para la ejecución de las tareas",
    ],
  },
  {
    categoria: "Compromiso y Sentido de Pertenencia",
    items: [
      "Muestra y expresa orgullo, gusto y compromiso por ser parte de la empresa",
      "Conoce los procesos que hacen parte de la empresa y entiende su participación y aporte a los mismos",
      "Conoce las metas estratégicas de la empresa y se esfuerza en facilitar que sean alcanzadas desde el cumplimiento de sus responsabilidades",
    ],
  },
  {
    categoria: "Adaptabilidad al Cambio",
    items: [
      "Se ajusta con facilidad, rapidez y actitud positiva a nuevas situaciones",
      "Ante situaciones bajo presión, se adapta, controla el estrés y es productivo",
    ],
  },
  {
    categoria: "Solución de Conflictos",
    items: [
      "Escucha activamente teniendo en cuenta los aspectos importantes, aclarando dudas y analizando lo comprendido.",
      "Formula estrategias de forma ágil y eficiente para superar los conflictos presentados con la organización",
      "Identifica e implementa soluciones adecuadas y viables para afrontar con éxito problemas en su propia labor.",
    ],
  },
  {
    categoria: "Servicio al Cliente",
    items: [
      "Identifica con claridad quien es el cliente y le ofrece un trato cordial",
      "Se esfuerza en brindar una excelente experiencia de atención al usuario y/o servicio al cliente, de forma individual o colectiva de acuerdo a las necesidades de cada uno de ellos",
    ],
  },
  {
    categoria: "SG - SST",
    items: [
      "Participa activamente en las actividades de capacitación",
      "Informa oportunamente de los peligros y riesgos latentes en el sitio de trabajo",
      "Reporta inmediatamente todo incidente o accidente que ocurra",
      "Suministra información clara, veraz y completa del estado de salud",
      "Usa adecuadamente el equipo, herramientas y elementos de seguridad necesarios para el desarrollo de sus funciones.",
      "En su desempeño laboral en el último año, ha presentado suspensión y/o llamados de atención por no atender las reglas internas de la empresa. (0 eventos = 5 ; 1 evento = 4; 2 eventos = 3; 3 eventos = 2; mayor a 3 eventos = 1)",
      "Ha sufrido accidentes de trabajo en el último año ( 0 AT= 5; 1 AT= 4 ; 2 AT= 3; 3 AT= 2; mayor a 3 AT= 1)",
    ],
  },
];

