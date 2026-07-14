export type CriterioModo = 'ternario' | 'binario' | 'si_na';

export type CriterioDef = {
  field: string;
  obsField?: string;
  label: string;
  modo?: CriterioModo;
  section?: string;
};

export type FormularioChecklistConfig = {
  check: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  tituloPagina: string;
  tituloFormulario: string;
  codigoDocumento: string;
  notaCriterios?: string;
  criterios: CriterioDef[];
  incluirArea?: boolean;
  codigoNumerico?: boolean;
};

export const FORM_ALINEADOR: FormularioChecklistConfig = {
  check: 1,
  tituloPagina: 'Inspección preoperacional de elevadores de aliniador',
  tituloFormulario: 'INSPECCIÓN PREOPERACIONAL DEL ELEVADOR DEL ALINEADOR',
  codigoDocumento: 'CÓDIGO: GH- SST -F-030 | VERSIÓN: 23/09/2022 | EDICIÓN 2',
  codigoNumerico: true,
  criterios: [
    { field: 'estado_conexiones', obsField: 'observacion_estado_conexiones', label: 'Revisar estado conexiones y alimentación eléctrica.' },
    { field: 'guaya_acero', obsField: 'observacion_guaya_acero', label: 'Chequear el estado de la guaya de acero (que no este deshilachada).' },
    { field: 'rampas_acceso', obsField: 'observacion_rampas_acceso', label: 'Revisar que rampas de acceso a la plataforma no presenten fisuras y/o abolladuras y que estén fijas.' },
    { field: 'controles', obsField: 'observacion_controles', label: 'Chequear controles o accionamiento del elevador.' },
    { field: 'seguros', obsField: 'observacion_seguros', label: 'Chequear funcionamiento de los seguros mecánicos del elevador.' },
    { field: 'operacion_vacio', obsField: 'observacion_operacion_vacio', label: 'Verificación del encendido y operación del equipo en vacío “sin carga”.' },
    { field: 'elevacion_maxima', obsField: 'observacion_elevacion_maxima', label: 'Eleve el elevador a su altura máxima sin carga para circulación de aceite del equipo.' },
    { field: 'sin_fugas', obsField: 'observacion_sin_fugas', label: 'Revisar que no haya presencia de fugas o escapes de aceite hidráulico.' },
    { field: 'pines_altura', obsField: 'observacion_pines_altura', label: 'Verificar que los pines de altura máxima y mínima funcionen correctamente.' },
    { field: 'estado_general', obsField: 'observacion_estado_general', label: 'Revisión estado general de la estructura del elevador, verifique el anclaje de las columnas.' },
    { field: 'sin_ruidos', obsField: 'observacion_sin_ruidos', label: 'El equipo funciona sin ruidos anormales.' },
  ],
};

export const FORM_ELEVADORES: FormularioChecklistConfig = {
  check: 2,
  tituloPagina: 'Inspección preoperacional de elevadores de columnas',
  tituloFormulario: 'INSPECCIÓN PREOPERACIONAL DE ELEVADORES DE COLUMNA',
  codigoDocumento: 'CÓDIGO: GH- SST -F-030 | VERSIÓN: 23/09/2022 | EDICIÓN 2',
  criterios: [
    { field: 'estado_conexiones', obsField: 'observacion_estado_conexiones', label: 'Revisar estado conexiones y alimentación eléctrica' },
    { field: 'estado_cadena', obsField: 'observacion_estado_cadena', label: 'Chequear el estado de la cadena de la transmisión (alineador guaya).' },
    { field: 'brazos_elevador', obsField: 'observacion_brazos_elevador', label: 'Revisar que los brazos del elevador no presenten fisuras y/o abolladuras.' },
    { field: 'controles', obsField: 'observacion_controles', label: 'Chequear controles o accionamiento del elevador' },
    { field: 'seguros', obsField: 'observacion_seguros', label: 'Chequear funcionamiento de los seguros del elevador' },
    { field: 'operacion_vacio', obsField: 'observacion_operacion_vacio', label: 'Verificación del encendido y operación del equipo en vacío “sin carga”.' },
    { field: 'elevacion_maxima', obsField: 'observacion_elevacion_maxima', label: 'Eleve el elevador a su altura máxima sin carga para circulación de aceite del equipo.' },
    { field: 'sin_fugas', obsField: 'observacion_sin_fugas', label: 'Revisar que no haya presencia de fugas o escapes de aceite hidráulico.' },
    { field: 'pines_altura', obsField: 'observacion_pines_altura', label: 'Verificar que los pines de altura máxima y mínima funcionen correctamente.' },
    { field: 'cable_acero', obsField: 'observacion_cable_acero', label: 'Verifique que el cable de acero no presente desgaste o deshilachado.' },
    { field: 'almohadillas', obsField: 'observacion_almohadillas', label: 'Inspeccione el estado de las almohadillas de elevación.' },
    { field: 'estado_general', obsField: 'observacion_estado_general', label: 'Revisión estado general de la estructura del elevador, verifique el anclaje de las columnas.' },
  ],
};

export const FORM_TIJERA: FormularioChecklistConfig = {
  check: 3,
  tituloPagina: 'Inspección preoperacional de elevadores y tijera',
  tituloFormulario: 'INSPECCIÓN PREOPERACIONAL DE ELEVADORES TIJERA',
  codigoDocumento: 'CÓDIGO: GH- SST -F-030 | VERSIÓN: 23/09/2022 | EDICIÓN 2',
  criterios: [
    { field: 'estado_conexiones', obsField: 'observacion_estado_conexiones', label: 'Revisar estado conexiones y alimentación eléctrica.' },
    { field: 'ausencia_fugas', obsField: 'observacion_ausencia_fugas', label: 'Verificar estado y ausencia de fugas de cilindros y mangueras neumáticas/hidráulicas.' },
    { field: 'plataformas_elevador', obsField: 'observacion_plataformas_elevador', label: 'Revisar que las plataformas del elevador estén niveladas y sin fisuras.' },
    { field: 'controles', obsField: 'observacion_controles', label: 'Chequear controles o accionamiento del elevador, señal luminosa y parada de emergencia.' },
    { field: 'seguros_neumaticos', obsField: 'observacion_seguros_neumaticos', label: 'Chequear funcionamiento de los seguros mecánicos y/o neumáticos del elevador.' },
    { field: 'operacion_vacio', obsField: 'observacion_operacion_vacio', label: 'Verificación del encendido y operación del equipo en vacío “sin carga”.' },
    { field: 'parada_emergencia', obsField: 'observacion_parada_emergencia', label: 'Revisar funcionamiento parada de emergencia del elevador.' },
    { field: 'estado_tacos', obsField: 'observacion_estado_tacos', label: 'Inspeccione del estado de los tacos de caucho de elevación.' },
    { field: 'estado_general', obsField: 'observacion_estado_general', label: 'Revisión estado general de la estructura del elevador, verifique el anclaje del elevador.' },
    { field: 'sin_ruidos', obsField: 'observacion_sin_ruidos', label: 'El elevador no presenta ruidos anormales.' },
  ],
};

export const FORM_HIDRAULICOS: FormularioChecklistConfig = {
  check: 4,
  tituloPagina: 'Inspección preoperacional de equipos hidráulicos',
  tituloFormulario: 'INSPECCIÓN PREOPERACIONAL DE EQUIPOS HIDRÁULICOS',
  codigoDocumento: 'CÓDIGO: GH- SST -F-078 | VERSIÓN: 08/0/2022 | EDICIÓN 0',
  criterios: [
    { field: 'funcionamiento_elevacion', obsField: 'observacion_func_elevacion', label: 'Funcionamiento del mecanismo de elevación (Observar durante la operación que el sistema de elevación funcione correctamente).', section: 'ASPECTOS GENERALES ANTES DE USARLOS' },
    { field: 'fluidos_hidraulicos', obsField: 'observacion_fluidos_hidraulicos', label: 'Los componentes que canalizan los fluidos del dispositivo hidráulico están en perfecto estado, de forma que no se aprecia ningún tipo de fuga.' },
    { field: 'ruedas', obsField: 'observacion_ruedas', label: 'Las Ruedas: En buen estado y que giran libremente.' },
    { field: 'estado_palas', obsField: 'observacion_estado_palas', label: 'El estado y limpieza de las palas (Soportes) montura fija, y/o araña y otros componentes, libre de grasa.' },
    { field: 'sist_giro', obsField: 'observacion_sist_giro', label: 'El mecanismo de giro (Verificar que gire libremente, sin obstáculos).' },
    { field: 'peso_apropiado', obsField: 'observacion_peso_apropiado', label: 'Se comprueba que el peso de la carga a levantar es el adecuado para la capacidad de carga del sistema de elevación.', section: 'MEDIDAS DURANTE LA UTILIZACIÓN' },
    { field: 'carga_equilibrada', obsField: 'observacion_carga_equilibrada', label: 'Se asegura que las cargas están perfectamente equilibradas, calzadas o aseguradas.' },
    { field: 'dir_marcha', obsField: 'observacion_dir_marcha', label: 'Mira en la dirección de la marcha y conserva siempre una buena visibilidad del recorrido.' },
    { field: 'soportes_carga', obsField: 'observacion_soportes_carga', label: 'Una vez levantada la carga se encuentran instaladas torres o soportes metálicos para sostener la carga.' },
  ],
};

export const FORM_PORTICO: FormularioChecklistConfig = {
  check: 5,
  tituloPagina: 'Inspección preoperacional de pórtico',
  tituloFormulario: 'INSPECCIÓN PREOPERACIONAL DE PORTICO CON DIFERENCIAL',
  codigoDocumento: 'CÓDIGO: GH- SST -F-030 | VERSIÓN: 23/09/2022 | EDICIÓN 2',
  incluirArea: false,
  criterios: [
    { field: 'area_segura', obsField: 'observacion_area_segura', label: 'Área de trabajo segura y delimitada.' },
    { field: 'porta_epp', obsField: 'observacion_porta_epp', label: 'Personal porta EPP adecuado.' },
    { field: 'peso_apropiado', obsField: 'observacion_peso_apropiado', label: 'Peso de carga apropiado.' },
    { field: 'aldaba', obsField: 'observacion_aldaba', label: 'Estado de aldaba.' },
    { field: 'estado_gancho', obsField: 'observacion_estado_gancho', label: 'Estado del gancho.' },
    { field: 'sist_giro', obsField: 'observacion_sist_giro', label: 'Sistema de giro.' },
    { field: 'deformacion_eslabones', obsField: 'observacion_deformacion_eslabones', label: 'Sin deformación en eslabones.' },
    { field: 'presenta_corrosion', obsField: 'observacion_presenta_corrosion', label: 'Sin corrosión.' },
    { field: 'engranaje_funcional', obsField: 'observacion_engranaje_funcional', label: 'Engranaje funcional.' },
    { field: 'frenos', obsField: 'observacion_frenos', label: 'Frenos en buen estado.' },
    { field: 'topes_desplazamiento', obsField: 'observacion_topes_desplazamiento', label: 'Topes de desplazamiento.' },
    { field: 'movimiento_trolley', obsField: 'observacion_movimiento_trolley', label: 'Movimiento del trolley.' },
    { field: 'movilidad_llantas', obsField: 'observacion_movilidad_llantas', label: 'Movilidad de llantas.' },
    { field: 'libre_abolladuras', obsField: 'observacion_libre_abolladuras', label: 'Libre de abolladuras.' },
  ],
};

export const FORM_CABINA: FormularioChecklistConfig = {
  check: 6,
  tituloPagina: 'Inspección preoperacional de cabina de pintura',
  tituloFormulario: 'INSPECCIÓN PREOPERACIONAL DE CABINA DE PINTURA',
  codigoDocumento: 'CÓDIGO: GH-SST-F-085 | VERSIÓN: 07/03/2023 | EDICIÓN 0',
  notaCriterios: 'CONDICIÓN INICIAL',
  criterios: [
    { field: 'sistema_mandos', obsField: 'observacion_sistema_mandos', label: 'Revisión sistema de mandos de la cabina (Encendido y apagado).', modo: 'binario' },
    { field: 'sistema_ventilacion', obsField: 'observacion_sistema_ventilacion', label: 'Verificar sistema de ventilación y extracción.', modo: 'binario' },
    { field: 'estado_filtros', obsField: 'observacion_estado_filtros', label: 'Verificar manómetros, presiones adecuadas.', modo: 'binario' },
    { field: 'lamparas', obsField: 'observacion_lamparas', label: 'Verificar sistema de iluminación de la cabina.', modo: 'binario' },
    { field: 'ruidos_extranos', obsField: 'observacion_ruidos_extranos', label: 'Verificar que el piso esté limpio y sin residuos inflamables.', modo: 'binario' },
    { field: 'cierre_hermetico', obsField: 'observacion_cierre_hermetico', label: 'Verificar que las pistolas funcionen correctamente.', modo: 'binario' },
    { field: 'fuga_gas', obsField: 'observacion_fuga_gas', label: 'Verificar que los filtros estén limpios.', modo: 'binario' },
    { field: 'rejillas', obsField: 'observacion_rejillas', label: 'Verificar que el sistema de alarmas esté operativo.', modo: 'binario' },
    { field: 'sistema_neumatico', obsField: 'observacion_sistema_neumatico', label: 'Verificar sistema neumático.', modo: 'binario' },
  ],
};
