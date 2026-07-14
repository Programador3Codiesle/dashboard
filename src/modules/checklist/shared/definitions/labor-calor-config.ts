import { CriterioDef } from './form-configs';

export const LABOR_CALOR_ANTES: CriterioDef[] = [
  { field: 'procedimiento_claro', label: 'El procedimiento de trabajo está claro y se entiende.', modo: 'si_na' },
  { field: 'disposicion_herramientas', label: 'Disposición de herramientas y equipos adecuada.', modo: 'si_na' },
  { field: 'personal_calificado', label: 'Personal calificado para la tarea.', modo: 'si_na' },
  { field: 'reunion_implicados', label: 'Reunión con implicados realizada.', modo: 'si_na' },
  { field: 'area_ejecucion', label: 'Área de ejecución adecuada.', modo: 'si_na' },
  { field: 'delimitacion_area', label: 'Delimitación del área de trabajo.', modo: 'si_na' },
];

export const LABOR_CALOR_EPP: CriterioDef[] = [
  { field: 'guantes', label: 'Guantes', modo: 'si_na' },
  { field: 'botas', label: 'Botas', modo: 'si_na' },
  { field: 'mascara', label: 'Máscara', modo: 'si_na' },
  { field: 'careta_esmerilar', label: 'Careta para esmerilar', modo: 'si_na' },
  { field: 'gafas', label: 'Gafas', modo: 'si_na' },
  { field: 'capucha', label: 'Capucha', modo: 'si_na' },
  { field: 'delantal', label: 'Delantal', modo: 'si_na' },
  { field: 'ropa_trabajo', label: 'Ropa de trabajo', modo: 'si_na' },
  { field: 'careta_soldadura', label: 'Careta de soldadura', modo: 'si_na' },
  { field: 'trabajadores_entrenados', label: 'Trabajadores entrenados', modo: 'si_na' },
  { field: 'epp_suficientes', label: 'EPP suficientes', modo: 'si_na' },
];

export const LABOR_CALOR_DURANTE: CriterioDef[] = [
  { field: 'mamparas', label: 'Mamparas instaladas', modo: 'si_na' },
  { field: 'conexion_tierra', label: 'Conexión a tierra', modo: 'si_na' },
  { field: 'disposicion_extintores', label: 'Disposición de extintores', modo: 'si_na' },
  { field: 'materiales_protegidos', label: 'Materiales protegidos', modo: 'si_na' },
  { field: 'area_libre_sustancias', label: 'Área libre de sustancias inflamables', modo: 'si_na' },
  { field: 'estado_equipos_usar', label: 'Estado de equipos a usar', modo: 'si_na' },
  { field: 'cilindros_asegurados', label: 'Cilindros asegurados', modo: 'si_na' },
  { field: 'saber_apagar_fuego', label: 'Personal sabe apagar fuego', modo: 'si_na' },
  { field: 'tuberias_aisladas', label: 'Tuberías aisladas', modo: 'si_na' },
  { field: 'precaucion_liberacion_gases', label: 'Precaución liberación de gases', modo: 'si_na' },
  { field: 'mediciones_gases', label: 'Mediciones de gases', modo: 'si_na' },
  { field: 'valvula_marcada', label: 'Válvula marcada', modo: 'si_na' },
  { field: 'estado_cables_temporales', label: 'Estado cables temporales', modo: 'si_na' },
];

export const LABOR_CALOR_DESPUES: CriterioDef[] = [
  { field: 'area_aseada_terminar', label: 'Área aseada al terminar', modo: 'si_na' },
  { field: 'entregado_equipo_terminar', label: 'Equipo entregado al terminar', modo: 'si_na' },
  { field: 'levantamiento_bloqueos', label: 'Levantamiento de bloqueos', modo: 'si_na' },
  { field: 'colocar_controles', label: 'Colocar controles', modo: 'si_na' },
  { field: 'plan_resp_emergencia', label: 'Plan respuesta emergencia', modo: 'si_na' },
  { field: 'observado_continuamente', label: 'Trabajo observado continuamente', modo: 'si_na' },
];

export const LABOR_CALOR_ALL_CRITERIOS = [
  ...LABOR_CALOR_ANTES,
  ...LABOR_CALOR_EPP,
  ...LABOR_CALOR_DURANTE,
  ...LABOR_CALOR_DESPUES,
];
