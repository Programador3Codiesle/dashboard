'use client';

import { useEffect, useRef, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { checklistMotoService } from '@/modules/informes/gestion-humana/services/checklist-moto.service';
import { useToast } from '@/components/shared/ui/ToastContext';
import { Pagination } from '@/components/shared/ui/Pagination';

const SEDES = [
  { value: '', label: 'Seleccione una opción' },
  { value: 'Giron', label: 'Girón' },
  { value: 'Rosita', label: 'Rosita' },
  { value: 'Bocono', label: 'Bocono' },
  { value: 'Malecon', label: 'Malecon' },
  { value: 'Barranca', label: 'Barranca' },
  { value: 'Otra', label: 'Otra' },
];

function formatDateOnly(value: string | null | undefined): string {
  if (value == null || String(value).trim() === '') return '';
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return s;
}

export default function ChecklistMotoPage() {
  const PAGE_SIZE = 10;
  const TABLE_COL_COUNT = 93;
  const { showError, showInfo } = useToast();
  const [fechaIni, setFechaIni] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [sede, setSede] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const lastEmptyToastKeyRef = useRef<string>('');

  const [appliedFechaIni, setAppliedFechaIni] = useState<string>('');
  const [appliedFechaFin, setAppliedFechaFin] = useState<string>('');
  const [appliedSede, setAppliedSede] = useState<string>('');

  const hasAppliedSearch = Boolean(appliedFechaIni || appliedFechaFin || appliedSede);

  const handleFiltrar = () => {
    if (!fechaIni && !fechaFin && !sede) {
      showError('Por favor seleccione al menos fechas o sede para filtrar.');
      return;
    }
    setAppliedFechaIni(fechaIni);
    setAppliedFechaFin(fechaFin);
    setAppliedSede(sede);
    setCurrentPage(1);
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['informes', 'checklist-moto', appliedFechaIni, appliedFechaFin, appliedSede, currentPage],
    enabled: hasAppliedSearch,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        return await checklistMotoService.listar({
          fechaIni: appliedFechaIni || undefined,
          fechaFin: appliedFechaFin || undefined,
          sede: appliedSede || undefined,
          pagina: currentPage,
          limite: PAGE_SIZE,
        });
      } catch (error: any) {
        showError(error?.response?.data?.message || 'Error consultando checklist de motos');
        throw error;
      }
    },
  });
  const rows = data?.items ?? [];
  const totalItems = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const showInitialLoader = hasAppliedSearch && isLoading && rows.length === 0;
  const showUpdating = hasAppliedSearch && isFetching && rows.length > 0;
  const renderSiNo = (value: number | null | undefined) => (Number(value) === 1 ? 'Sí' : 'No');
  const th = 'px-2 py-1 text-center whitespace-normal break-words leading-tight min-w-[120px]';
  const td = 'px-2 py-1 text-center align-middle whitespace-nowrap';
  const tdObs = 'px-2 py-1 text-left align-middle break-words whitespace-normal min-w-[180px]';

  useEffect(() => {
    if (!hasAppliedSearch || isFetching || currentPage !== 1) return;
    if (!data || data.items.length > 0) return;

    const key = `${appliedFechaIni}|${appliedFechaFin}|${appliedSede}`;
    if (lastEmptyToastKeyRef.current === key) return;

    lastEmptyToastKeyRef.current = key;
    showInfo('No se encontraron registros con los filtros seleccionados.');
  }, [
    hasAppliedSearch,
    isFetching,
    currentPage,
    data,
    appliedFechaIni,
    appliedFechaFin,
    appliedSede,
    showInfo,
  ]);

  return (
    <div className="space-y-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Fecha inicial</label>
            <input
              type="date"
              value={fechaIni}
              onChange={(e) => setFechaIni(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Fecha final</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Sede</label>
            <select
              value={sede}
              onChange={(e) => setSede(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white"
            >
              {SEDES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={handleFiltrar}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isFetching && <Loader2 size={16} className="animate-spin" />}
            <span>Filtrar</span>
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 gap-2 flex-wrap">
          <h2 className="text-base font-semibold text-gray-900">Resultados checklist motos</h2>
          <div className="flex items-center gap-3">
            {hasAppliedSearch && totalItems > 0 && (
              <span className="text-xs text-gray-500">
                {totalItems} registro{totalItems === 1 ? '' : 's'}
              </span>
            )}
            {showUpdating && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 className="animate-spin" size={14} />
                Actualizando...
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[9000px] w-full text-xs">
            <thead className="bg-(--color-primary) text-white">
              <tr>
                <th className={th}>Tipo</th>
                <th className={th}>Doc. Propietario</th>
                <th className={th}>Fecha Vencimiento SOAT</th>
                <th className={th}>Fecha Vencimiento Cert. Gases</th>
                <th className={th}>Sede</th>
                <th className={th}>Placa</th>
                <th className={th}>Modelo</th>
                <th className={th}>Marca</th>
                <th className={th}>Línea</th>
                <th className={th}>Conductor</th>
                <th className={th}>Doc. Conductor</th>
                <th className={th}>Categoría Licencia</th>
                <th className={th}>Fecha Vencimiento Licencia</th>
                <th className={th}>Porta Documentos</th>
                <th className={th}>Observación Documentos</th>
                <th className={th}>Fecha</th>
                <th className={th}>Kilometraje</th>
                <th className={th}>Fugas Lubricantes</th>
                <th className={th}>Observación Fugas Lubricantes</th>
                <th className={th}>Fugas Combustible</th>
                <th className={th}>Observación Fugas Combustible</th>
                <th className={th}>Exosto</th>
                <th className={th}>Observación Exosto</th>
                <th className={th}>Estado Cadena</th>
                <th className={th}>Observación Estado Cadena</th>
                <th className={th}>Estado Piñones</th>
                <th className={th}>Observación Estado Piñones</th>
                <th className={th}>Estado Otro Tipo Transmisión</th>
                <th className={th}>Observación Estado Otro Tipo Transmisión</th>
                <th className={th}>Amortiguadores</th>
                <th className={th}>Observación Amortiguadores</th>
                <th className={th}>Barra Estabilizadora</th>
                <th className={th}>Observación Barra Estabilizadora</th>
                <th className={th}>Fugas Frenos</th>
                <th className={th}>Observación Fugas Frenos</th>
                <th className={th}>Estado Deposito</th>
                <th className={th}>Observación Estado Deposito</th>
                <th className={th}>Estado Pastillas</th>
                <th className={th}>Observación Estado Pastillas</th>
                <th className={th}>Estado Guayas</th>
                <th className={th}>Observación Estado Guayas</th>
                <th className={th}>Estado Farola Principal</th>
                <th className={th}>Observación Estado Farola Principal</th>
                <th className={th}>Luces Direccionales</th>
                <th className={th}>Observación Luces Direccionales</th>
                <th className={th}>Pito</th>
                <th className={th}>Observación Pito</th>
                <th className={th}>Luz Tacometro</th>
                <th className={th}>Observación Luz Tacometro</th>
                <th className={th}>Indicador Velocímetro</th>
                <th className={th}>Observación Indicador Velocímetro</th>
                <th className={th}>Indicador Combustible</th>
                <th className={th}>Observación Indicador Combustible</th>
                <th className={th}>Testigo</th>
                <th className={th}>Observación Testigo</th>
                <th className={th}>Llanta Delantera</th>
                <th className={th}>Observación Llanta Delantera</th>
                <th className={th}>Llanta Trasera</th>
                <th className={th}>Observación Llanta Trasera</th>
                <th className={th}>Presión Aire</th>
                <th className={th}>Observación Presión Aire</th>
                <th className={th}>Cojinería</th>
                <th className={th}>Observación Cojinería</th>
                <th className={th}>Guarda Barros</th>
                <th className={th}>Observación Guarda Barros</th>
                <th className={th}>Manubrios</th>
                <th className={th}>Observación Manubrios</th>
                <th className={th}>Parrilla</th>
                <th className={th}>Observación Parrilla</th>
                <th className={th}>Retrovisores</th>
                <th className={th}>Observación Retrovisores</th>
                <th className={th}>Latoneria</th>
                <th className={th}>Observación Latoneria</th>
                <th className={th}>Kit Herramientas</th>
                <th className={th}>Observación Kit Herramientas</th>
                <th className={th}>Casco</th>
                <th className={th}>Observación Casco</th>
                <th className={th}>Chaleco</th>
                <th className={th}>Observación Chaleco</th>
                <th className={th}>Rodilleras</th>
                <th className={th}>Observación Rodilleras</th>
                <th className={th}>Impermeable</th>
                <th className={th}>Observación Impermeable</th>
                <th className={th}>Botas de Seguridad</th>
                <th className={th}>Observación Botas de Seguridad</th>
                <th className={th}>Hallazgo 1</th>
                <th className={th}>Plan de Acción 1</th>
                <th className={th}>Fecha 1</th>
                <th className={th}>Evidencia 1</th>
                <th className={th}>Hallazgo 2</th>
                <th className={th}>Plan de Acción 2</th>
                <th className={th}>Fecha 2</th>
                <th className={th}>Evidencia 2</th>
              </tr>
            </thead>
            <tbody>
              {!hasAppliedSearch && (
                <tr>
                  <td colSpan={TABLE_COL_COUNT} className="px-2 py-4 text-center text-gray-500">
                    No hay datos para mostrar. Ingrese filtros y pulse Filtrar.
                  </td>
                </tr>
              )}
              {showInitialLoader && (
                <tr>
                  <td colSpan={TABLE_COL_COUNT} className="px-2 py-4 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              )}
              {hasAppliedSearch && !showInitialLoader && rows.length === 0 && (
                <tr>
                  <td colSpan={TABLE_COL_COUNT} className="px-2 py-4 text-center text-gray-500">
                    No se encontraron registros.
                  </td>
                </tr>
              )}
              {hasAppliedSearch &&
                rows.map((row) => (
                  <tr key={row.id} className="border-t text-[11px]">
                    <td className={td}>{row.tipo ?? ''}</td>
                    <td className={td}>{row.doc_propietario ?? ''}</td>
                    <td className={td}>{formatDateOnly(row.fec_vence_seguro)}</td>
                    <td className={td}>{formatDateOnly(row.fec_vence_cert_gases)}</td>
                    <td className={td}>{row.sede ?? ''}</td>
                    <td className={td}>{row.placa ?? ''}</td>
                    <td className={td}>{row.modelo ?? ''}</td>
                    <td className={td}>{row.marca ?? ''}</td>
                    <td className={td}>{row.linea ?? ''}</td>
                    <td className={td}>{row.conductor ?? ''}</td>
                    <td className={td}>{row.doc_conductor ?? ''}</td>
                    <td className={td}>{row.categoria_lic ?? ''}</td>
                    <td className={td}>{formatDateOnly(row.fec_vence_lic_conductor)}</td>
                    <td className={td}>{renderSiNo(row.porta_documentos)}</td>
                    <td className={tdObs}>{row.observacion_documentos ?? ''}</td>
                    <td className={td}>{formatDateOnly(row.fecha)}</td>
                    <td className={td}>
                      {row.kilometraje != null ? row.kilometraje.toLocaleString('es-CO') : ''}
                    </td>
                    <td className={td}>{renderSiNo(row.fugas_lubricantes)}</td>
                    <td className={tdObs}>{row.observacion_fugas_lubricantes ?? ''}</td>
                    <td className={td}>{renderSiNo(row.fugas_combustible)}</td>
                    <td className={tdObs}>{row.observacion_fugas_combustible ?? ''}</td>
                    <td className={td}>{renderSiNo(row.exosto)}</td>
                    <td className={tdObs}>{row.observacion_exosto ?? ''}</td>
                    <td className={td}>{renderSiNo(row.estado_cadena)}</td>
                    <td className={tdObs}>{row.observacion_estado_cadena ?? ''}</td>
                    <td className={td}>{renderSiNo(row.estado_pinones)}</td>
                    <td className={tdObs}>{row.observacion_estado_pinones ?? ''}</td>
                    <td className={td}>{renderSiNo(row.estado_otra_trans)}</td>
                    <td className={tdObs}>{row.observacion_estado_otra_trans ?? ''}</td>
                    <td className={td}>{renderSiNo(row.amortiguadores)}</td>
                    <td className={tdObs}>{row.observacion_amortiguadores ?? ''}</td>
                    <td className={td}>{renderSiNo(row.barra_estab)}</td>
                    <td className={tdObs}>{row.observacion_barra_estab ?? ''}</td>
                    <td className={td}>{renderSiNo(row.fugas_frenos)}</td>
                    <td className={tdObs}>{row.observacion_fugas_frenos ?? ''}</td>
                    <td className={td}>{renderSiNo(row.estado_depo)}</td>
                    <td className={tdObs}>{row.observacion_estado_depo ?? ''}</td>
                    <td className={td}>{renderSiNo(row.estado_pastillas)}</td>
                    <td className={tdObs}>{row.observacion_estado_pastillas ?? ''}</td>
                    <td className={td}>{renderSiNo(row.estado_guayas)}</td>
                    <td className={tdObs}>{row.observacion_estado_guayas ?? ''}</td>
                    <td className={td}>{renderSiNo(row.estado_farola_princ)}</td>
                    <td className={tdObs}>{row.observacion_estado_farola_princ ?? ''}</td>
                    <td className={td}>{renderSiNo(row.luces_direccionales)}</td>
                    <td className={tdObs}>{row.observacion_luces_direccionales ?? ''}</td>
                    <td className={td}>{renderSiNo(row.pito)}</td>
                    <td className={tdObs}>{row.observacion_pito ?? ''}</td>
                    <td className={td}>{renderSiNo(row.luz_tacometro)}</td>
                    <td className={tdObs}>{row.observacion_luz_tacometro ?? ''}</td>
                    <td className={td}>{renderSiNo(row.indicador_velocimetro)}</td>
                    <td className={tdObs}>{row.observacion_indicador_velocimetro ?? ''}</td>
                    <td className={td}>{renderSiNo(row.indicador_combustible)}</td>
                    <td className={tdObs}>{row.observacion_indicador_combustible ?? ''}</td>
                    <td className={td}>{renderSiNo(row.testigo)}</td>
                    <td className={tdObs}>{row.observacion_testigo ?? ''}</td>
                    <td className={td}>{renderSiNo(row.llanta_del)}</td>
                    <td className={tdObs}>{row.observacion_llanta_del ?? ''}</td>
                    <td className={td}>{renderSiNo(row.llantas_tra)}</td>
                    <td className={tdObs}>{row.observacion_llantas_tra ?? ''}</td>
                    <td className={td}>{renderSiNo(row.presion_aire)}</td>
                    <td className={tdObs}>{row.observacion_presion_aire ?? ''}</td>
                    <td className={td}>{renderSiNo(row.cojineria)}</td>
                    <td className={tdObs}>{row.observacion_cojineria ?? ''}</td>
                    <td className={td}>{renderSiNo(row.guarda_barros)}</td>
                    <td className={tdObs}>{row.observacion_guarda_barros ?? ''}</td>
                    <td className={td}>{renderSiNo(row.manubrios)}</td>
                    <td className={tdObs}>{row.observacion_manubrios ?? ''}</td>
                    <td className={td}>{renderSiNo(row.parrilla)}</td>
                    <td className={tdObs}>{row.observacion_parrilla ?? ''}</td>
                    <td className={td}>{renderSiNo(row.retrovisores)}</td>
                    <td className={tdObs}>{row.observacion_retrovisores ?? ''}</td>
                    <td className={td}>{renderSiNo(row.latoneria)}</td>
                    <td className={tdObs}>{row.observacion_latoneria ?? ''}</td>
                    <td className={td}>{renderSiNo(row.kit_herramientas)}</td>
                    <td className={tdObs}>{row.observacion_kit_herramientas ?? ''}</td>
                    <td className={td}>{renderSiNo(row.casco)}</td>
                    <td className={tdObs}>{row.observacion_casco ?? ''}</td>
                    <td className={td}>{renderSiNo(row.chaleco)}</td>
                    <td className={tdObs}>{row.observacion_chaleco ?? ''}</td>
                    <td className={td}>{renderSiNo(row.rodilleras)}</td>
                    <td className={tdObs}>{row.observacion_rodilleras ?? ''}</td>
                    <td className={td}>{renderSiNo(row.impermeable)}</td>
                    <td className={tdObs}>{row.observacion_impermeable ?? ''}</td>
                    <td className={td}>{renderSiNo(row.botas_seg)}</td>
                    <td className={tdObs}>{row.observacion_botas_seg ?? ''}</td>
                    <td className={tdObs}>{row.hallazgo_1 ?? ''}</td>
                    <td className={tdObs}>{row.plan_accion_1 ?? ''}</td>
                    <td className={td}>{formatDateOnly(row.fecha_1)}</td>
                    <td className={tdObs}>{row.evidencia_1 ?? ''}</td>
                    <td className={tdObs}>{row.hallazgo_2 ?? ''}</td>
                    <td className={tdObs}>{row.plan_accion_2 ?? ''}</td>
                    <td className={td}>{formatDateOnly(row.fecha_2)}</td>
                    <td className={tdObs}>{row.evidencia_2 ?? ''}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {hasAppliedSearch && totalItems > 0 && (
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

