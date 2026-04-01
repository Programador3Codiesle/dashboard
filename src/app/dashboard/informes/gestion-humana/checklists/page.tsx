'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { checklistsService, ChecklistEquipoRow, TipoChecklistEquipo } from '@/modules/informes/gestion-humana/services/checklists.service';
import { useToast } from '@/components/shared/ui/ToastContext';
import { Pagination } from '@/components/shared/ui/Pagination';

const NOMBRES_CHECKLIST: Record<TipoChecklistEquipo, string> = {
  0: 'CheckList Trabajo en Caliente',
  1: 'CheckList Alineador',
  2: 'CheckList Elevadores',
  3: 'CheckList Tijera',
  4: 'CheckList Hidráulicos',
  5: 'CheckList Pórtico',
  6: 'CheckList Cabina de Pintura',
};

const CABECERAS: string[][] = [
  [
    'Area donde se va a realizar el trabajo',
    'Propósito del trabajo',
    'Nombres y Apellidos',
    'Cédula',
    'ARL',
    'EPS',
    'AFP',
    'Nombres y Apellidos 2',
    'Cédula 2',
    'ARL 2',
    'EPS 2',
    'AFP 2',
    'FECHA',
    'PROCEDIMIENTO CLARO',
    'DISPOSICIÓN ELEMENTOS PARA TRABAJAR',
    'PERSONAL CALIFICADO',
    'REUNION ARO E IMPLICADOS',
    'AREA OPTIMA PARA LA LABOR',
    'SEÑALIZACIÓN AREA DE LA LABOR',
    'GUANTES MANGA LARGA',
    'BOTAS TIPO SOLDADOR',
    'MÁSCARA CON FILTRO PARA HUMOS METÁLICOS',
    'CARETA PARA ESMERILAR',
    'GAFAS DE SEGURIDAD',
    'CAPUCHA TIPO SOLDADOR',
    'DELANTAL DE CUERO',
    'ROPA DE TRABAJO',
    'CARETA SOLDADOR',
    'TRABAJADORES AUTORIZADOS CON EPP',
    'CUENTAN CON EPP',
    'INSTALACIÓN MAMPARAS',
    'CONEXIÓN A TIERRA DE EQUIPOS',
    'DISPOSICIÓN DE EXTINTORES',
    'PROTECCIÓN DE EQUIPOS AL FUEGO',
    'AISLAMIENTO DEL SITIO DE TRABAJO',
    'BUEN ESTADO DE LAS CONEXIONES DE LOS EQUIPOS',
    'CILINDROS CORRECTAMENTE ASEGURADOS',
    'LOS TRABAJADORES SABEN COMO ACTUAR EN CASO DE INCENDIO',
    'TUBERÍAS AISLADAS',
    'PRECAUCIONES AIRE INFLAMABLE',
    'MEDICIONES AIRES INFLAMABLES',
    'VÁLVULAS MARCADAS EN LOS CILINDROS',
    'CABLES EN BUEN ESTADO Y SEGUROS',
    'AREA ASEADA Y ORDENADA AL TERMINAR',
    'ENTREGA DEL EQUIPO Y EL TRABAJO REALIZADO',
    'RETIRO DE LAS ETIQUETAS Y/O BLOQUEOS',
    'VOLVER A ORGANIZAR LAS GUARDAS Y CONTROLES DE SEGURIDAD',
    'CONOCIMIENTO PLAN DE EMERGENCIA',
    'RECIBE OBSERVACIÓN CONTINUA',
    'OBSERVACIÓN GENERAL',
  ],
  [
    'RESPONSABLE',
    'EQUIPO',
    'CÓDIGO',
    'AREA',
    'SEDE',
    'FECHA',
    'ESTADO CONEXIONES',
    'OBS ESTADO CONEXIONES',
    'ESTADO DE LA GUAYA',
    'OBS ESTADO DE LA GUAYA',
    'ESTADO RAMPAS DE ACCESO',
    'OBS ESTADO RAMPAS DE ACCESO',
    'CONTROLES / ACCIONAMIENTO ELEVADOR',
    'OBS CONTROLES / ACCIONAMIENTO ELEVADOR',
    'FUNCMNTO SEGUROS MECÁNICOS',
    'OBS FUNCMNTO SEGUROS MECÁNICOS',
    'OPERACIÓN EQUIPO SIN CARGA',
    'OBS OPERACIÓN EQUIPO SIN CARGA',
    'ELEVADOR ALTURA MAXIMA',
    'OBS ELEVADOR ALTURA MAXIMA',
    'PRESENCIA DE FUGAS',
    'OBS PRESENCIA DE FUGAS',
    'PINES DE MAXIMA Y MINIMA ALTURA',
    'OBS PINES DE MAXIMA Y MINIMA ALTURA',
    'ESTADO GENERAL',
    'OBS ESTADO GENERAL',
    'FUNCIONAMIENTO SIN RUIDOS ANORMALES',
    'OBS FUNCIONAMIENTO SIN RUIDOS ANORMALES',
    'OBSERVACIÓN SEGUIMIENTO',
  ],
  [
    'RESPONSABLE',
    'EQUIPO',
    'CÓDIGO',
    'AREA',
    'SEDE',
    'FECHA',
    'ESTADO CONEXIONES',
    'OBS ESTADO CONEXIONES',
    'ESTADO CADENA DE LA TRANSMISIÓN',
    'OBS ESTADO CADENA DE LA TRANSMISIÓN',
    'BRAZOS DEL ELEVADOR (FISURAS Y/O ABOLLADURAS)',
    'OBS BRAZOS DEL ELEVADOR (FISURAS Y/O ABOLLADURAS)',
    'CONTROLES / ACCIONAMIENTO ELEVADOR',
    'OBS CONTROLES / ACCIONAMIENTO ELEVADOR',
    'FUNCMNTO SEGUROS ELEVADOR',
    'OBS FUNCMNTO SEGUROS ELEVADOR',
    'OPERACIÓN EQUIPO SIN CARGA',
    'OBS OPERACIÓN EQUIPO SIN CARGA',
    'ELEVADOR ALTURA MAXIMA',
    'OBS ELEVADOR ALTURA MAXIMA',
    'PRESENCIA DE FUGAS',
    'OBS PRESENCIA DE FUGAS',
    'PINES DE MAXIMA Y MINIMA ALTURA',
    'OBS PINES DE MAXIMA Y MINIMA ALTURA',
    'ESTADO CABLE ACERO',
    'OBS ESTADO CABLE ACERO',
    'ESTADO ALMOHADILLAS DE ELEVACIÓN',
    'OBS ESTADO ALMOHADILLAS DE ELEVACIÓN',
    'ESTADO GENERAL',
    'OBS ESTADO GENERAL',
    'OBSERVACIÓN SEGUIMIENTO',
  ],
  [
    'RESPONSABLE',
    'EQUIPO',
    'CÓDIGO',
    'AREA',
    'SEDE',
    'FECHA',
    'ESTADO CONEXIONES',
    'OBS ESTADO CONEXIONES',
    'ESTADO Y AUSENCIA DE FUGAS EN CILINDROS Y MANGUERAS',
    'OBS ESTADO Y AUSENCIA DE FUGAS EN CILINDROS Y MANGUERAS',
    'PLATAFORMAS DEL ELEVADOR NIVELADAS Y SIN FISURAS',
    'OBS PLATAFORMAS DEL ELEVADOR NIVELADAS Y SIN FISURAS',
    'CONTROLES / ACCIONAMIENTO ELEVADOR PARADA EMERGENCIA',
    'OBS CONTROLES / ACCIONAMIENTO ELEVADOR PARADA EMERGENCIA',
    'FUNCMNTO SEGUROS ELEVADOR',
    'OBS FUNCMNTO SEGUROS ELEVADOR',
    'OPERACIÓN EQUIPO SIN CARGA',
    'OBS OPERACIÓN EQUIPO SIN CARGA',
    'FUNCMNTO PARADA EMERGENCIA',
    'OBS FUNCMNTO PARADA EMERGENCIA',
    'ESTADO TACOS DE CAUCHO DE ELEVACIÓN',
    'OBS ESTADO TACOS DE CAUCHO DE ELEVACIÓN',
    'ESTADO GENERAL',
    'OBS ESTADO GENERAL',
    'FUNCIONAMIENTO SIN RUIDOS ANORMALES',
    'OBS FUNCIONAMIENTO SIN RUIDOS ANORMALES',
    'OBSERVACIÓN SEGUIMIENTO',
  ],
  [
    'RESPONSABLE',
    'EQUIPO',
    'CÓDIGO',
    'AREA',
    'SEDE',
    'FECHA',
    'FUNCMNTO MECANISMO DE ELEVACIÓN',
    'OBS FUNCMNTO MECANISMO DE ELEVACIÓN',
    'SIN FUGA CANALIZACIÓN FLUIDOS',
    'OBS SIN FUGA CANALIZACIÓN FLUIDOS',
    'ESTADO RUEDAS',
    'OBS ESTADO RUEDAS',
    'ESTADO Y LIMPIEZA DE LAS PALAS',
    'OBS ESTADO Y LIMPIEZA DE LAS PALAS',
    'MECANISMO DE GIRO',
    'OBS MECANISMO DE GIRO',
    'PESO A CAPACIDAD DE CARGA DEL SIST DE ELEVACIÓN',
    'OBS PESO A CAPACIDAD DE CARGA DEL SIST DE ELEVACIÓN',
    'CARGAS ASEGURADAS / NIVELADAS',
    'OBS CARGAS ASEGURADAS / NIVELADAS',
    'DIR MARCHA Y BUENA VISIBILIDAD',
    'OBS DIR MARCHA Y BUENA VISIBILIDAD',
    'TORRES INSTALADAS PARA CARGA',
    'OBS TORRES INSTALADAS PARA CARGA',
    'OBSERVACIÓN SEGUIMIENTO',
  ],
  [
    'RESPONSABLE',
    'EQUIPO',
    'CÓDIGO',
    'SEDE',
    'FECHA',
    'AREA LIBRE Y SEGURA',
    'OBS AREA LIBRE Y SEGURA',
    'CUENTA CON EPP ASIGNADOS',
    'OBS CUENTA CON EPP ASIGNADOS',
    'PESO APROPIADO A CAPACIDAD',
    'OBS PESO APROPIADO A CAPACIDAD',
    'ESTADO LENGÜETA O ALDABA',
    'OBS ESTADO LENGÜETA O ALDABA',
    'GANCHO SIN FISURAS O DESGASTE',
    'OBS GANCHO SIN FISURAS O DESGASTE',
    'SIST DE GIRO FUNCIONAL',
    'OBS SIST DE GIRO FUNCIONAL',
    'ESLABONES BUEN ESTADO',
    'OBS ESLABONES BUEN ESTADO',
    'PRESENTA CORROSIÓN',
    'OBS PRESENTA CORROSIÓN',
    'ENGRANAJE FUNCIONAL',
    'OBS ENGRANAJE FUNCIONAL',
    'FRENO Y TENSADO FUNCIONALES',
    'OBS FRENO Y TENSADO FUNCIONALES',
    'TOPES DE DESPLAZAMIENTO DEL TROLLEY',
    'OBS TOPES DE DESPLAZAMIENTO DEL TROLLEY',
    'MOVIMIENTO TROLLEY ES FLUIDO SIN ATASCOS',
    'OBS MOVIMIENTO TROLLEY ES FLUIDO SIN ATASCOS',
    'FACILIDAD MOVIMIENTO LLANTAS PORTICO',
    'OBS FACILIDAD MOVIMIENTO LLANTAS PORTICO',
    'ESTABILIDAD PORTICO',
    'OBS ESTABILIDAD PORTICO',
    'OBSERVACIÓN SEGUIMIENTO',
  ],
  [
    'RESPONSABLE',
    'EQUIPO',
    'CÓDIGO',
    'SEDE',
    'FECHA',
    'SISTEMA DE MANDOS',
    'OBS SISTEMA DE MANDOS',
    'SISTEMA VENTILACIÓN Y EXTRACCIÓN',
    'OBS SISTEMA VENTILACIÓN Y EXTRACCIÓN',
    'ESTADO FILTROS DE CABINA',
    'OBS ESTADO FILTROS DE CABINA',
    'LAMPARAS Y SU PROTECCIÓN',
    'OBS LAMPARAS Y SU PROTECCIÓN',
    'CABINA SIN RUIDOS EXTRAÑOS',
    'OBS CABINA SIN RUIDOS EXTRAÑOS',
    'PUERTAS CIERRE HERMÉTICAMENTE',
    'OBS PUERTAS CIERRE HERMÉTICAMENTE',
    'SISTEMA ENCENDIDO SIN FUGAS',
    'OBS SISTEMA ENCENDIDO SIN FUGAS',
    'REJILLAS FIJAS',
    'OBS REJILLAS FIJAS',
    'AUSENCIA FUGAS NEUMÁTICO Y PRESIÓN',
    'OBS AUSENCIA FUGAS NEUMÁTICO Y PRESIÓN',
    'OBSERVACIÓN SEGUIMIENTO',
  ],
];

const RESPUESTAS = ['No Conforme', 'Conforme', 'No Aplica'];
const PAGE_SIZE = 5;

function formatDateOnly(value: unknown): string {
  if (value == null) return '-';
  const text = String(value);
  return text.length >= 10 ? text.slice(0, 10) : text;
}

function renderFila(op: TipoChecklistEquipo, row: ChecklistEquipoRow) {
  switch (op) {
    case 0:
      return (
        <>
          <td className="px-2 py-1">{row.area_trabajo}</td>
          <td className="px-2 py-1">{row.proposito_trabajo}</td>
          <td className="px-2 py-1">{row.nombre_pa_1}</td>
          <td className="px-2 py-1">{row.cedula_pa_1}</td>
          <td className="px-2 py-1">{row.arl_pa_1}</td>
          <td className="px-2 py-1">{row.eps_pa_1}</td>
          <td className="px-2 py-1">{row.afp_pa_1}</td>
          <td className="px-2 py-1">{row.nombre_pa_2}</td>
          <td className="px-2 py-1">{row.cedula_pa_2}</td>
          <td className="px-2 py-1">{row.arl_pa_2}</td>
          <td className="px-2 py-1">{row.eps_pa_2}</td>
          <td className="px-2 py-1">{row.afp_pa_2}</td>
          <td className="px-2 py-1">{formatDateOnly(row.fecha)}</td>
          <td className="px-2 py-1">{row.procedimiento_claro}</td>
          <td className="px-2 py-1">{row.disposicion_herramientas === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.personal_calificado === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.reunion_implicados === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.area_ejecucion === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.delimitacion_area === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.guantes === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.botas === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.mascara === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.careta_esmerilar === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.gafas === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.capucha === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.delantal === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.ropa_trabajo === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.careta_soldadura === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.trabajadores_entrenados === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.epp_suficientes === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.mamparas === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.conexion_tierra === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.disposicion_extintores === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.materiales_protegidos === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.area_libre_sustancias === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.estado_equipos_usar === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.cilindros_asegurados === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.saber_apagar_fuego === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.tuberias_aisladas === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.precaucion_liberacion_gases === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.mediciones_gases === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.valvula_marcada === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.estado_cables_temporales === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.area_aseada_terminar === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.entregado_equipo_terminar === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.levantamiento_bloqueos === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.colocar_controles === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.plan_resp_emergencia === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.observado_continuamente === 1 ? 'Sí' : 'No Aplica'}</td>
          <td className="px-2 py-1">{row.observacion_general}</td>
        </>
      );
    case 1:
      return (
        <>
          <td className="px-2 py-1">{row.responsable}</td>
          <td className="px-2 py-1">{row.equipo}</td>
          <td className="px-2 py-1">{row.codigo}</td>
          <td className="px-2 py-1">{row.area}</td>
          <td className="px-2 py-1">{row.sede}</td>
          <td className="px-2 py-1">{formatDateOnly(row.fecha)}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.estado_conexiones]}</td>
          <td className="px-2 py-1">{row.observacion_estado_conexiones}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.guaya_acero]}</td>
          <td className="px-2 py-1">{row.observacion_guaya_acero}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.rampas_acceso]}</td>
          <td className="px-2 py-1">{row.observacion_rampas_acceso}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.controles]}</td>
          <td className="px-2 py-1">{row.observacion_controles}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.seguros]}</td>
          <td className="px-2 py-1">{row.observacion_seguros}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.operacion_vacio]}</td>
          <td className="px-2 py-1">{row.observacion_operacion_vacio}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.elevacion_maxima]}</td>
          <td className="px-2 py-1">{row.observacion_elevacion_maxima}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.sin_fugas]}</td>
          <td className="px-2 py-1">{row.observacion_sin_fugas}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.pines_altura]}</td>
          <td className="px-2 py-1">{row.observacion_pines_altura}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.estado_general]}</td>
          <td className="px-2 py-1">{row.observacion_estado_general}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.sin_ruidos]}</td>
          <td className="px-2 py-1">{row.observacion_sin_ruidos}</td>
          <td className="px-2 py-1">{row.obs_seguimiento}</td>
        </>
      );
    case 2:
      return (
        <>
          <td className="px-2 py-1">{row.responsable}</td>
          <td className="px-2 py-1">{row.equipo}</td>
          <td className="px-2 py-1">{row.codigo}</td>
          <td className="px-2 py-1">{row.area}</td>
          <td className="px-2 py-1">{row.sede}</td>
          <td className="px-2 py-1">{formatDateOnly(row.fecha)}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.estado_conexiones]}</td>
          <td className="px-2 py-1">{row.observacion_estado_conexiones}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.estado_cadena]}</td>
          <td className="px-2 py-1">{row.observacion_estado_cadena}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.brazos_elevador]}</td>
          <td className="px-2 py-1">{row.observacion_brazos_elevador}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.controles]}</td>
          <td className="px-2 py-1">{row.observacion_controles}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.seguros]}</td>
          <td className="px-2 py-1">{row.observacion_seguros}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.operacion_vacio]}</td>
          <td className="px-2 py-1">{row.observacion_operacion_vacio}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.elevacion_maxima]}</td>
          <td className="px-2 py-1">{row.observacion_elevacion_maxima}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.sin_fugas]}</td>
          <td className="px-2 py-1">{row.observacion_sin_fugas}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.pines_altura]}</td>
          <td className="px-2 py-1">{row.observacion_pines_altura}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.cable_acero]}</td>
          <td className="px-2 py-1">{row.observacion_cable_acero}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.almohadillas]}</td>
          <td className="px-2 py-1">{row.observacion_almohadillas}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.estado_general]}</td>
          <td className="px-2 py-1">{row.observacion_estado_general}</td>
          <td className="px-2 py-1">{row.obs_seguimiento}</td>
        </>
      );
    case 3:
      return (
        <>
          <td className="px-2 py-1">{row.responsable}</td>
          <td className="px-2 py-1">{row.equipo}</td>
          <td className="px-2 py-1">{row.codigo}</td>
          <td className="px-2 py-1">{row.area}</td>
          <td className="px-2 py-1">{row.sede}</td>
          <td className="px-2 py-1">{formatDateOnly(row.fecha)}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.estado_conexiones]}</td>
          <td className="px-2 py-1">{row.observacion_estado_conexiones}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.ausencia_fugas]}</td>
          <td className="px-2 py-1">{row.observacion_ausencia_fugas}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.plataformas_elevador]}</td>
          <td className="px-2 py-1">{row.observacion_plataformas_elevador}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.controles]}</td>
          <td className="px-2 py-1">{row.observacion_controles}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.seguros_neumaticos]}</td>
          <td className="px-2 py-1">{row.observacion_seguros_neumaticos}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.operacion_vacio]}</td>
          <td className="px-2 py-1">{row.observacion_operacion_vacio}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.parada_emergencia]}</td>
          <td className="px-2 py-1">{row.observacion_parada_emergencia}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.estado_tacos]}</td>
          <td className="px-2 py-1">{row.observacion_estado_tacos}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.estado_general]}</td>
          <td className="px-2 py-1">{row.observacion_estado_general}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.sin_ruidos]}</td>
          <td className="px-2 py-1">{row.observacion_sin_ruidos}</td>
          <td className="px-2 py-1">{row.obs_seguimiento}</td>
        </>
      );
    case 4:
      return (
        <>
          <td className="px-2 py-1">{row.responsable}</td>
          <td className="px-2 py-1">{row.equipo}</td>
          <td className="px-2 py-1">{row.codigo}</td>
          <td className="px-2 py-1">{row.area}</td>
          <td className="px-2 py-1">{row.sede}</td>
          <td className="px-2 py-1">{formatDateOnly(row.fecha)}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.funcionamiento_elevacion]}</td>
          <td className="px-2 py-1">{row.observacion_funcionamiento_elevacion}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.fluidos_hidraulicos]}</td>
          <td className="px-2 py-1">{row.observacion_fluidos_hidraulicos}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.ruedas]}</td>
          <td className="px-2 py-1">{row.observacion_ruedas}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.estado_palas]}</td>
          <td className="px-2 py-1">{row.observacion_estado_palas}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.sist_giro]}</td>
          <td className="px-2 py-1">{row.observacion_sist_giro}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.peso_apropiado]}</td>
          <td className="px-2 py-1">{row.observacion_peso_apropiado}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.carga_equilibrada]}</td>
          <td className="px-2 py-1">{row.observacion_carga_equilibrada}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.dir_marcha]}</td>
          <td className="px-2 py-1">{row.observacion_dir_marcha}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.soportes_carga]}</td>
          <td className="px-2 py-1">{row.observacion_soportes_carga}</td>
          <td className="px-2 py-1">{row.obs_seguimiento}</td>
        </>
      );
    case 5:
      return (
        <>
          <td className="px-2 py-1">{row.responsable}</td>
          <td className="px-2 py-1">{row.equipo}</td>
          <td className="px-2 py-1">{row.codigo}</td>
          <td className="px-2 py-1">{row.sede}</td>
          <td className="px-2 py-1">{formatDateOnly(row.fecha)}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.area_segura]}</td>
          <td className="px-2 py-1">{row.observacion_area_segura}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.porta_epp]}</td>
          <td className="px-2 py-1">{row.observacion_porta_epp}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.peso_apropiado]}</td>
          <td className="px-2 py-1">{row.observacion_peso_apropiado}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.aldaba]}</td>
          <td className="px-2 py-1">{row.observacion_aldaba}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.estado_gancho]}</td>
          <td className="px-2 py-1">{row.observacion_estado_gancho}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.sist_giro]}</td>
          <td className="px-2 py-1">{row.observacion_sist_giro}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.deformacion_eslabones]}</td>
          <td className="px-2 py-1">{row.observacion_deformacion_eslabones}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.presenta_corrosion]}</td>
          <td className="px-2 py-1">{row.observacion_presenta_corrosion}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.engranaje_funcional]}</td>
          <td className="px-2 py-1">{row.observacion_engranaje_funcional}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.frenos]}</td>
          <td className="px-2 py-1">{row.observacion_frenos}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.topes_desplazamiento]}</td>
          <td className="px-2 py-1">{row.observacion_topes_desplazamiento}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.movimiento_trolley]}</td>
          <td className="px-2 py-1">{row.observacion_movimiento_trolley}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.movilidad_llantas]}</td>
          <td className="px-2 py-1">{row.observacion_movilidad_llantas}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.libre_abolladuras]}</td>
          <td className="px-2 py-1">{row.observacion_libre_abolladuras}</td>
          <td className="px-2 py-1">{row.obs_seguimiento}</td>
        </>
      );
    case 6:
      return (
        <>
          <td className="px-2 py-1">{row.responsable}</td>
          <td className="px-2 py-1">{row.equipo}</td>
          <td className="px-2 py-1">{row.codigo}</td>
          <td className="px-2 py-1">{row.sede}</td>
          <td className="px-2 py-1">{formatDateOnly(row.fecha)}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.sistema_mandos]}</td>
          <td className="px-2 py-1">{row.observacion_sistema_mandos}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.sistema_ventilacion]}</td>
          <td className="px-2 py-1">{row.observacion_sistema_ventilacion}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.estado_filtros]}</td>
          <td className="px-2 py-1">{row.observacion_estado_filtros}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.lamparas]}</td>
          <td className="px-2 py-1">{row.observacion_lamparas}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.ruidos_extranos]}</td>
          <td className="px-2 py-1">{row.observacion_ruidos_extranos}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.cierre_hermetico]}</td>
          <td className="px-2 py-1">{row.observacion_cierre_hermetico}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.fuga_gas]}</td>
          <td className="px-2 py-1">{row.observacion_fuga_gas}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.rejillas]}</td>
          <td className="px-2 py-1">{row.observacion_rejillas}</td>
          <td className="px-2 py-1">{RESPUESTAS[row.sistema_neumatico]}</td>
          <td className="px-2 py-1">{row.observacion_sistema_neumatico}</td>
          <td className="px-2 py-1">{row.obs_seguimiento}</td>
        </>
      );
    default:
      return null;
  }
}

export default function ChecklistsPage() {
  const { showError, showInfo } = useToast();
  const [fechaIni, setFechaIni] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [op, setOp] = useState<TipoChecklistEquipo>(0);
  const [appliedOp, setAppliedOp] = useState<TipoChecklistEquipo>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const inputClass =
    'border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white w-full';

  const mutation = useMutation({
    mutationFn: async (variables: { op: TipoChecklistEquipo }) => {
      if (!fechaIni || !fechaFin) {
        throw new Error('Debe seleccionar fecha inicial y fecha final');
      }
      return checklistsService.listar({
        op: variables.op,
        fechaIni,
        fechaFin,
      });
    },
    onSuccess: (result) => {
      if (result.length === 0) {
        showInfo(
          'Con los filtros seleccionados no se encontraron registros para este informe.',
        );
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Error consultando informe de CheckLists';
      showError(message);
    },
  });

  const handleFiltrar = () => {
    setCurrentPage(1);
    setAppliedOp(op);
    mutation.mutate({ op });
  };

  const data = mutation.data ?? [];
  const consultaSinResultados =
    mutation.isSuccess &&
    Array.isArray(mutation.data) &&
    mutation.data.length === 0;
  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  const columnas = CABECERAS[appliedOp];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">
            Informe Checklists
          </h1>
          <p className="text-gray-500 mt-1">
            Consulte los resultados por tipo de checklist en el rango de fechas seleccionado.
          </p>
        </div>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Fecha inicial
            </label>
            <input
              type="date"
              value={fechaIni}
              onChange={(e) => setFechaIni(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Fecha final
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Informe</label>
            <select
              className={inputClass}
              value={op}
              onChange={(e) => setOp(Number(e.target.value) as TipoChecklistEquipo)}
            >
              <option value={0}>CheckList Trabajo en Caliente</option>
              <option value={1}>CheckList Alineador</option>
              <option value={2}>CheckList Elevadores</option>
              <option value={3}>CheckList Tijera</option>
              <option value={4}>CheckList Hidráulicos</option>
              <option value={5}>CheckList Pórtico</option>
              <option value={6}>CheckList Cabina de Pintura</option>
            </select>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleFiltrar}
            disabled={mutation.isPending || !fechaIni || !fechaFin}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
            <span>{mutation.isPending ? 'Consultando...' : 'Filtrar'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">
            {NOMBRES_CHECKLIST[appliedOp]}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs" id="tabladatos">
            <thead className="bg-(--color-primary) text-white">
              <tr>
                {columnas.map((col) => (
                  <th key={col} className="px-2 py-1 text-left">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!mutation.isPending && data.length === 0 && consultaSinResultados && (
                <tr>
                  <td
                    colSpan={columnas.length}
                    className="px-2 py-4 text-center text-gray-500"
                  >
                    No se encontraron registros con los filtros seleccionados.
                  </td>
                </tr>
              )}
              {!mutation.isPending && data.length === 0 && !consultaSinResultados && (
                <tr>
                  <td
                    colSpan={columnas.length}
                    className="px-2 py-4 text-center text-gray-500"
                  >
                    No hay datos para mostrar. Seleccione fechas y pulse Filtrar.
                  </td>
                </tr>
              )}
              {paginatedData.map((row, idx) => (
                <tr key={idx} className="border-t text-[11px]">
                  {renderFila(appliedOp, row)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!mutation.isPending && totalItems > 0 && (
          <div className="p-4 border-t border-gray-200 flex justify-start">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

