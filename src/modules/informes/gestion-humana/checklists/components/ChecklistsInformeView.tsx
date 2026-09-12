'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { getXlsx } from '@/utils/export-xlsx';
import { checklistsService, ChecklistEquipoRow, TipoChecklistEquipo } from '@/modules/informes/gestion-humana/services/checklists.service';
import { useToast } from '@/components/shared/ui/ToastContext';
import { Pagination } from '@/components/shared/ui/Pagination';
import { InformesPageFrame } from '@/modules/informes/components/InformesPageFrame';
import { INFORMES_COPY, INFORMES_GH_TRIMENU } from '@/modules/informes/constants';
import { InformesQueryError } from '@/modules/informes/shared/components/InformesQueryError';
import { informesKeys } from '@/modules/informes/shared/constants/query-keys';
import { useInformesPageGuard } from '@/modules/informes/shared/hooks/useInformesPageGuard';
import { getErrorMessage } from '@/modules/informes/shared/utils/parse-api-error';

const NOMBRES_CHECKLIST: Record<TipoChecklistEquipo, string> = {
  0: 'CheckList Trabajo en Caliente',
  1: 'CheckList Alineador',
  2: 'CheckList Elevadores',
  3: 'CheckList Tijera',
  4: 'CheckList Hidráulicos',
  5: 'CheckList Pórtico',
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
];

const RESPUESTAS = ['No Conforme', 'Conforme', 'No Aplica'];
const PAGE_SIZE = 5;

function formatDateOnly(value: unknown): string {
  if (value == null) return '-';
  const text = String(value);
  return text.length >= 10 ? text.slice(0, 10) : text;
}

function siNoAplica(value: unknown): string {
  return Number(value) === 1 ? 'Sí' : 'No Aplica';
}

function respuesta(value: unknown): string {
  const idx = Number(value);
  return RESPUESTAS[idx] ?? '';
}

function text(value: unknown): string {
  if (value == null) return '';
  return String(value);
}

function getChecklistDisplayValues(
  op: TipoChecklistEquipo,
  row: ChecklistEquipoRow,
): string[] {
  switch (op) {
    case 0:
      return [
        text(row.area_trabajo),
        text(row.proposito_trabajo),
        text(row.nombre_pa_1),
        text(row.cedula_pa_1),
        text(row.arl_pa_1),
        text(row.eps_pa_1),
        text(row.afp_pa_1),
        text(row.nombre_pa_2),
        text(row.cedula_pa_2),
        text(row.arl_pa_2),
        text(row.eps_pa_2),
        text(row.afp_pa_2),
        formatDateOnly(row.fecha),
        text(row.procedimiento_claro),
        siNoAplica(row.disposicion_herramientas),
        siNoAplica(row.personal_calificado),
        siNoAplica(row.reunion_implicados),
        siNoAplica(row.area_ejecucion),
        siNoAplica(row.delimitacion_area),
        siNoAplica(row.guantes),
        siNoAplica(row.botas),
        siNoAplica(row.mascara),
        siNoAplica(row.careta_esmerilar),
        siNoAplica(row.gafas),
        siNoAplica(row.capucha),
        siNoAplica(row.delantal),
        siNoAplica(row.ropa_trabajo),
        siNoAplica(row.careta_soldadura),
        siNoAplica(row.trabajadores_entrenados),
        siNoAplica(row.epp_suficientes),
        siNoAplica(row.mamparas),
        siNoAplica(row.conexion_tierra),
        siNoAplica(row.disposicion_extintores),
        siNoAplica(row.materiales_protegidos),
        siNoAplica(row.area_libre_sustancias),
        siNoAplica(row.estado_equipos_usar),
        siNoAplica(row.cilindros_asegurados),
        siNoAplica(row.saber_apagar_fuego),
        siNoAplica(row.tuberias_aisladas),
        siNoAplica(row.precaucion_liberacion_gases),
        siNoAplica(row.mediciones_gases),
        siNoAplica(row.valvula_marcada),
        siNoAplica(row.estado_cables_temporales),
        siNoAplica(row.area_aseada_terminar),
        siNoAplica(row.entregado_equipo_terminar),
        siNoAplica(row.levantamiento_bloqueos),
        siNoAplica(row.colocar_controles),
        siNoAplica(row.plan_resp_emergencia),
        siNoAplica(row.observado_continuamente),
        text(row.observacion_general),
      ];
    case 1:
      return [
        text(row.responsable),
        text(row.equipo),
        text(row.codigo),
        text(row.area),
        text(row.sede),
        formatDateOnly(row.fecha),
        respuesta(row.estado_conexiones),
        text(row.observacion_estado_conexiones),
        respuesta(row.guaya_acero),
        text(row.observacion_guaya_acero),
        respuesta(row.rampas_acceso),
        text(row.observacion_rampas_acceso),
        respuesta(row.controles),
        text(row.observacion_controles),
        respuesta(row.seguros),
        text(row.observacion_seguros),
        respuesta(row.operacion_vacio),
        text(row.observacion_operacion_vacio),
        respuesta(row.elevacion_maxima),
        text(row.observacion_elevacion_maxima),
        respuesta(row.sin_fugas),
        text(row.observacion_sin_fugas),
        respuesta(row.pines_altura),
        text(row.observacion_pines_altura),
        respuesta(row.estado_general),
        text(row.observacion_estado_general),
        respuesta(row.sin_ruidos),
        text(row.observacion_sin_ruidos),
        text(row.obs_seguimiento),
      ];
    case 2:
      return [
        text(row.responsable),
        text(row.equipo),
        text(row.codigo),
        text(row.area),
        text(row.sede),
        formatDateOnly(row.fecha),
        respuesta(row.estado_conexiones),
        text(row.observacion_estado_conexiones),
        respuesta(row.estado_cadena),
        text(row.observacion_estado_cadena),
        respuesta(row.brazos_elevador),
        text(row.observacion_brazos_elevador),
        respuesta(row.controles),
        text(row.observacion_controles),
        respuesta(row.seguros),
        text(row.observacion_seguros),
        respuesta(row.operacion_vacio),
        text(row.observacion_operacion_vacio),
        respuesta(row.elevacion_maxima),
        text(row.observacion_elevacion_maxima),
        respuesta(row.sin_fugas),
        text(row.observacion_sin_fugas),
        respuesta(row.pines_altura),
        text(row.observacion_pines_altura),
        respuesta(row.cable_acero),
        text(row.observacion_cable_acero),
        respuesta(row.almohadillas),
        text(row.observacion_almohadillas),
        respuesta(row.estado_general),
        text(row.observacion_estado_general),
        text(row.obs_seguimiento),
      ];
    case 3:
      return [
        text(row.responsable),
        text(row.equipo),
        text(row.codigo),
        text(row.area),
        text(row.sede),
        formatDateOnly(row.fecha),
        respuesta(row.estado_conexiones),
        text(row.observacion_estado_conexiones),
        respuesta(row.ausencia_fugas),
        text(row.observacion_ausencia_fugas),
        respuesta(row.plataformas_elevador),
        text(row.observacion_plataformas_elevador),
        respuesta(row.controles),
        text(row.observacion_controles),
        respuesta(row.seguros_neumaticos),
        text(row.observacion_seguros_neumaticos),
        respuesta(row.operacion_vacio),
        text(row.observacion_operacion_vacio),
        respuesta(row.parada_emergencia),
        text(row.observacion_parada_emergencia),
        respuesta(row.estado_tacos),
        text(row.observacion_estado_tacos),
        respuesta(row.estado_general),
        text(row.observacion_estado_general),
        respuesta(row.sin_ruidos),
        text(row.observacion_sin_ruidos),
        text(row.obs_seguimiento),
      ];
    case 4:
      return [
        text(row.responsable),
        text(row.equipo),
        text(row.codigo),
        text(row.area),
        text(row.sede),
        formatDateOnly(row.fecha),
        respuesta(row.funcionamiento_elevacion),
        text(row.observacion_funcionamiento_elevacion),
        respuesta(row.fluidos_hidraulicos),
        text(row.observacion_fluidos_hidraulicos),
        respuesta(row.ruedas),
        text(row.observacion_ruedas),
        respuesta(row.estado_palas),
        text(row.observacion_estado_palas),
        respuesta(row.sist_giro),
        text(row.observacion_sist_giro),
        respuesta(row.peso_apropiado),
        text(row.observacion_peso_apropiado),
        respuesta(row.carga_equilibrada),
        text(row.observacion_carga_equilibrada),
        respuesta(row.dir_marcha),
        text(row.observacion_dir_marcha),
        respuesta(row.soportes_carga),
        text(row.observacion_soportes_carga),
        text(row.obs_seguimiento),
      ];
    case 5:
      return [
        text(row.responsable),
        text(row.equipo),
        text(row.codigo),
        text(row.sede),
        formatDateOnly(row.fecha),
        respuesta(row.area_segura),
        text(row.observacion_area_segura),
        respuesta(row.porta_epp),
        text(row.observacion_porta_epp),
        respuesta(row.peso_apropiado),
        text(row.observacion_peso_apropiado),
        respuesta(row.aldaba),
        text(row.observacion_aldaba),
        respuesta(row.estado_gancho),
        text(row.observacion_estado_gancho),
        respuesta(row.sist_giro),
        text(row.observacion_sist_giro),
        respuesta(row.deformacion_eslabones),
        text(row.observacion_deformacion_eslabones),
        respuesta(row.presenta_corrosion),
        text(row.observacion_presenta_corrosion),
        respuesta(row.engranaje_funcional),
        text(row.observacion_engranaje_funcional),
        respuesta(row.frenos),
        text(row.observacion_frenos),
        respuesta(row.topes_desplazamiento),
        text(row.observacion_topes_desplazamiento),
        respuesta(row.movimiento_trolley),
        text(row.observacion_movimiento_trolley),
        respuesta(row.movilidad_llantas),
        text(row.observacion_movilidad_llantas),
        respuesta(row.libre_abolladuras),
        text(row.observacion_libre_abolladuras),
        text(row.obs_seguimiento),
      ];
    default:
      return [];
  }
}

function mapChecklistRowToExcel(
  op: TipoChecklistEquipo,
  row: ChecklistEquipoRow,
): Record<string, string> {
  const headers = CABECERAS[op];
  const values = getChecklistDisplayValues(op, row);
  const excelRow: Record<string, string> = {};
  headers.forEach((header, index) => {
    excelRow[header] = values[index] ?? '';
  });
  return excelRow;
}

function renderFila(op: TipoChecklistEquipo, row: ChecklistEquipoRow) {
  return getChecklistDisplayValues(op, row).map((value, index) => (
    <td key={index} className="px-2 py-1">
      {value}
    </td>
  ));
}

export function ChecklistsInformeView() {
  const { blocked } = useInformesPageGuard({
    trimenuId: INFORMES_GH_TRIMENU.checklists,
    redirectTo: '/dashboard/informes/gestion-humana',
  });
  const { showError, showInfo } = useToast();
  const [fechaIni, setFechaIni] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [op, setOp] = useState<TipoChecklistEquipo>(0);
  const [appliedOp, setAppliedOp] = useState<TipoChecklistEquipo>(0);
  const [filtrosAplicados, setFiltrosAplicados] = useState<{
    op: TipoChecklistEquipo;
    fechaIni: string;
    fechaFin: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingExport, setLoadingExport] = useState(false);
  const inputClass =
    'border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white w-full';

  const {
    data = [],
    isFetching,
    isError,
    error,
    isFetched,
  } = useQuery<ChecklistEquipoRow[]>({
    queryKey: informesKeys.gh.checklists(
      filtrosAplicados ? JSON.stringify(filtrosAplicados) : '',
    ),
    queryFn: () => checklistsService.listar(filtrosAplicados!),
    enabled: filtrosAplicados != null,
    retry: false,
    staleTime: 60 * 1000,
  });

  const handleFiltrar = () => {
    if (!fechaIni || !fechaFin) {
      showError('Debe seleccionar fecha inicial y fecha final');
      return;
    }
    if (isFetching) return;
    setCurrentPage(1);
    setAppliedOp(op);
    setFiltrosAplicados({
      op,
      fechaIni,
      fechaFin,
    });
  };

  useEffect(() => {
    if (!isFetched || isFetching || filtrosAplicados == null) return;
    if (data.length === 0) {
      showInfo(
        'Con los filtros seleccionados no se encontraron registros para este informe.',
      );
    }
  }, [isFetched, isFetching, filtrosAplicados, data.length, showInfo]);

  const consultaSinResultados = isFetched && data.length === 0;
  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, safeCurrentPage]);
  const columnas = CABECERAS[appliedOp];

  const handleExportar = useCallback(async () => {
    if (data.length === 0) {
      showError('No hay datos para exportar');
      return;
    }
    setLoadingExport(true);
    try {
      const rows = data.map((row) => mapChecklistRowToExcel(appliedOp, row));
      const XLSX = await getXlsx();
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Informe CheckList');
      XLSX.writeFile(workbook, 'Informe CheckList.xlsx');
    } catch {
      showError('No se pudo exportar el informe');
    } finally {
      setLoadingExport(false);
    }
  }, [data, appliedOp, showError]);

  if (blocked) return null;

  return (
    <InformesPageFrame
      title={INFORMES_COPY.checklists.title}
      description={INFORMES_COPY.checklists.description}
      backHref="/dashboard/informes/gestion-humana"
      backLabel={INFORMES_COPY.backGh}
    >
      {isError ? (
        <InformesQueryError
          message={getErrorMessage(error, INFORMES_COPY.checklists.loadError)}
        />
      ) : null}

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6 space-y-4">
        <div className="app-form-grid-3">
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
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={handleFiltrar}
            disabled={isFetching || !fechaIni || !fechaFin}
            className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isFetching && <Loader2 size={16} className="animate-spin" />}
            <span>{isFetching ? 'Consultando...' : 'Filtrar'}</span>
          </button>
          <button
            type="button"
            onClick={handleExportar}
            disabled={loadingExport || isFetching || data.length === 0}
            className={`inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
              data.length > 0
                ? 'bg-(--color-success) text-white hover:opacity-90'
                : 'border border-gray-300 text-gray-700 bg-white'
            }`}
          >
            {loadingExport && <Loader2 size={16} className="animate-spin" />}
            <FileSpreadsheet size={16} />
            <span>Exportar a Excel</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">
            {NOMBRES_CHECKLIST[appliedOp]}
          </h2>
        </div>
        <div className="app-table-scroll">
          <table className="min-w-[800px] w-full text-xs" id="tabladatos">
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
              {!isFetching && data.length === 0 && consultaSinResultados && (
                <tr>
                  <td
                    colSpan={columnas.length}
                    className="px-2 py-4 text-center text-gray-500"
                  >
                    No se encontraron registros con los filtros seleccionados.
                  </td>
                </tr>
              )}
              {!isFetching && data.length === 0 && !consultaSinResultados && (
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
        {!isFetching && totalItems > 0 && (
          <div className="p-4 border-t border-gray-200 flex justify-start">
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </InformesPageFrame>
  );
}

