'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import {
  ordenesSalidaService,
  OrdenSalida,
  FiltrosOrdenSalida,
} from '@/modules/informes/gestion-humana/services/ordenes-salida.service';
import { useToast } from '@/components/shared/ui/ToastContext';
import { Pagination } from '@/components/shared/ui/Pagination';
import { InformesPageFrame } from '@/modules/informes/components/InformesPageFrame';
import { INFORMES_COPY, INFORMES_GH_TRIMENU } from '@/modules/informes/constants';
import { InformesQueryError } from '@/modules/informes/shared/components/InformesQueryError';
import { InformesSinPermiso } from '@/modules/informes/shared/components/InformesSinPermiso';
import { informesKeys } from '@/modules/informes/shared/constants/query-keys';
import { useInformesPageGuard } from '@/modules/informes/shared/hooks/useInformesPageGuard';
import {
  getErrorMessage,
  isForbiddenError,
} from '@/modules/informes/shared/utils/parse-api-error';
import {
  AREAS_FILTRO_ORDEN_SALIDA,
  colorFondoFilaOrdenSalida,
  IDS_MODO_OBSERVACION,
  JEFES_FILTRO_ORDEN_SALIDA,
  NITS_FILTROS_EXTRA,
  NITS_VIGILANTE_ORDEN_SALIDA,
  SEDES_FILTRO_ORDEN_SALIDA,
  TIPOS_FILTRO_ORDEN_SALIDA,
} from '../constants';

const PAGE_SIZE = 10;

function nitTieneFiltrosExtra(nit: number | undefined | null): boolean {
  return nit != null && (NITS_FILTROS_EXTRA as readonly number[]).includes(nit);
}

export function OrdenesSalidaGestion() {
  const { user, blocked: sinTrimenu } = useInformesPageGuard({
    trimenuId: INFORMES_GH_TRIMENU.ordenesSalida,
    redirectOnDenied: false,
  });
  const { showError, showSuccess, showInfo } = useToast();
  const cargaInicialRef = useRef(false);
  const queryClient = useQueryClient();
  const [fechaIni, setFechaIni] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [jefe, setJefe] = useState('');
  const [area, setArea] = useState('');
  const [sede, setSede] = useState('');
  const [tipoSalida, setTipoSalida] = useState('');
  const [filtrosAplicados, setFiltrosAplicados] =
    useState<FiltrosOrdenSalida | null>(null);
  const [paging, setPaging] = useState({ empresaId: 0, page: 1 });
  const [observaciones, setObservaciones] = useState<Record<number, string>>({});
  const empresaId = user?.empresa ?? 0;
  const currentPage = paging.empresaId === empresaId ? paging.page : 1;
  const idUsuario = user?.id ? Number(user.id) : null;
  const nitUsuario =
    user?.nit_usuario != null ? Number(user.nit_usuario) : NaN;
  const esModoObservacion =
    idUsuario != null && IDS_MODO_OBSERVACION.has(idUsuario);
  const esCuentaVigilante =
    esModoObservacion || NITS_VIGILANTE_ORDEN_SALIDA.has(nitUsuario);
  const mostrarFiltros = !esModoObservacion;
  const esFiltrosExtra = nitTieneFiltrosExtra(nitUsuario);
  const sesionLista = !!user && !sinTrimenu && empresaId > 0;
  const inputClass =
    'border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white w-full';

  const {
    isPending: verificandoPermiso,
    isError: errorPermiso,
    error: errorPermisoDetalle,
  } = useQuery({
    queryKey: informesKeys.gh.ordenesSalida(empresaId, '__permiso__'),
    queryFn: () => ordenesSalidaService.listar({}),
    enabled: sesionLista,
    retry: false,
    staleTime: 60 * 1000,
  });

  const {
    data = [],
    isFetching: listando,
    isError: errorListado,
    error: errorListadoDetalle,
    isFetched,
  } = useQuery<OrdenSalida[]>({
    queryKey: informesKeys.gh.ordenesSalida(
      empresaId,
      filtrosAplicados ? JSON.stringify(filtrosAplicados) : '',
    ),
    queryFn: () => ordenesSalidaService.listar(filtrosAplicados ?? {}),
    enabled: sesionLista && (esModoObservacion || filtrosAplicados != null),
    retry: false,
    staleTime: 60 * 1000,
  });

  const guardarObsMutation = useMutation({
    mutationFn: async ({ id, observacion }: { id: number; observacion: string }) => {
      await ordenesSalidaService.guardarObservacion(id, observacion);
    },
    onSuccess: async () => {
      showSuccess('Observación guardada correctamente.');
      await queryClient.invalidateQueries({
        queryKey: informesKeys.gh.ordenesSalida(empresaId, '').slice(0, 4),
      });
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, 'Error guardando observación');
      showError(message);
    },
  });

  const handleFiltrar = () => {
    if (mostrarFiltros && (!fechaIni || !fechaFin)) {
      showError('Debe seleccionar fecha inicial y fecha final');
      return;
    }
    if (listando) return;
    setPaging({ empresaId, page: 1 });
    setFiltrosAplicados({
      fechaIni: fechaIni || undefined,
      fechaFin: fechaFin || undefined,
      ...(esFiltrosExtra
        ? {
            jefe: jefe || undefined,
            area: area || undefined,
            sede: sede || undefined,
            tipoSalida: tipoSalida ? Number(tipoSalida) : undefined,
          }
        : {}),
    });
  };

  const sinPermiso =
    sinTrimenu ||
    isForbiddenError(errorPermisoDetalle) ||
    isForbiddenError(errorListadoDetalle);

  useEffect(() => {
    if (sinPermiso) return;
    if (!esModoObservacion || cargaInicialRef.current) return;
    cargaInicialRef.current = true;
    setFiltrosAplicados({
      fechaIni: undefined,
      fechaFin: undefined,
    });
  }, [esModoObservacion, sinPermiso]);

  useEffect(() => {
    if (!isFetched || listando || errorListado) return;
    if (data.length === 0) {
      showInfo('No hay registros para el rango de fechas seleccionado.');
    }
  }, [isFetched, listando, errorListado, data.length, showInfo]);

  const consultaSinResultados = isFetched && data.length === 0;
  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, currentPage]);
  /** PHP vigilante: SQL sin LIMIT; el AJAX pinta el tbody completo (sin paginar). */
  const filasVisibles = esCuentaVigilante ? data : paginatedData;
  const showInitialLoader = listando && data.length === 0;
  const showUpdating = listando && data.length > 0;

  useEffect(() => {
    if (currentPage > totalPages) {
      setPaging({ empresaId, page: totalPages });
    }
  }, [currentPage, totalPages, empresaId]);

  const handleChangeObs = (id: number, value: string) => {
    setObservaciones((prev) => ({ ...prev, [id]: value }));
  };

  const handleGuardarObs = (row: OrdenSalida) => {
    if (!esModoObservacion) return;
    const obs = (observaciones[row.id] ?? '').trim();
    if (!obs) {
      showError('Por favor ingrese una observación');
      return;
    }
    guardarObsMutation.mutate({ id: row.id, observacion: obs });
  };

  const formatDateOnly = (value?: string | null) => (value ? value.slice(0, 10) : '');

  const handleExportCsv = async () => {
    if (!data.length) return;
    const XLSX = await import('xlsx');
    const rows = data.map((r) => ({
      Área: r.area ?? '',
      Sede: r.sede ?? '',
      'Jefe Autorizó': r.jefeNombre,
      'Tipo Salida': r.tipoSalidaNombre,
      Explicación: r.explicacion,
      'Fecha Orden': formatDateOnly(r.fecha_reg),
      Placa: r.placa ?? '',
      Conductor: r.conductor ?? '',
      'Persona salió': r.quienSale ?? '',
      Observación: r.observacion ?? '',
      'Fecha Observación': formatDateOnly(r.fecha_reg_obs),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'OrdenesSalida');
    XLSX.writeFile(workbook, 'informe-ordenes-salida.xlsx');
  };

  if (sinPermiso) {
    return (
      <InformesPageFrame
        title={INFORMES_COPY.ordenesSalida.title}
        description={INFORMES_COPY.ordenesSalida.description}
        backHref="/dashboard/informes/gestion-humana"
        backLabel={INFORMES_COPY.backGh}
      >
        <InformesSinPermiso
          backHref="/dashboard/informes/gestion-humana"
          backLabel={INFORMES_COPY.backGh}
        />
      </InformesPageFrame>
    );
  }

  if (verificandoPermiso) {
    return (
      <InformesPageFrame
        title={INFORMES_COPY.ordenesSalida.title}
        description={INFORMES_COPY.ordenesSalida.description}
        backHref="/dashboard/informes/gestion-humana"
        backLabel={INFORMES_COPY.backGh}
      >
        <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          <span>Verificando permiso...</span>
        </div>
      </InformesPageFrame>
    );
  }

  return (
    <InformesPageFrame
      title={INFORMES_COPY.ordenesSalida.title}
      description={INFORMES_COPY.ordenesSalida.description}
      backHref="/dashboard/informes/gestion-humana"
      backLabel={INFORMES_COPY.backGh}
    >
      {errorListado || (errorPermiso && !isForbiddenError(errorPermisoDetalle)) ? (
        <InformesQueryError
          message={getErrorMessage(
            errorListadoDetalle ?? errorPermisoDetalle,
            INFORMES_COPY.ordenesSalida.loadError,
          )}
        />
      ) : null}

      {mostrarFiltros && (
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label htmlFor="fecha-ini-orden-salida" className="text-xs font-medium text-gray-600 mb-1">
                Fecha inicial
              </label>
              <input
                id="fecha-ini-orden-salida"
                type="date"
                value={fechaIni}
                onChange={(e) => setFechaIni(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="fecha-fin-orden-salida" className="text-xs font-medium text-gray-600 mb-1">
                Fecha final
              </label>
              <input
                id="fecha-fin-orden-salida"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className={inputClass}
              />
            </div>
            {esFiltrosExtra ? (
              <div className="flex flex-col">
                <label htmlFor="jefe-orden-salida" className="text-xs font-medium text-gray-600 mb-1">
                  Jefe
                </label>
                <select
                  id="jefe-orden-salida"
                  value={jefe}
                  onChange={(e) => setJefe(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Seleccione una opción</option>
                  {JEFES_FILTRO_ORDEN_SALIDA.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {esFiltrosExtra ? (
              <>
                <div className="flex flex-col">
                  <label htmlFor="area-orden-salida" className="text-xs font-medium text-gray-600 mb-1">
                    Área
                  </label>
                  <select
                    id="area-orden-salida"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Seleccione una opción</option>
                    {AREAS_FILTRO_ORDEN_SALIDA.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="sede-orden-salida" className="text-xs font-medium text-gray-600 mb-1">
                    Sede
                  </label>
                  <select
                    id="sede-orden-salida"
                    value={sede}
                    onChange={(e) => setSede(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Seleccione una opción</option>
                    {SEDES_FILTRO_ORDEN_SALIDA.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="tipo-orden-salida" className="text-xs font-medium text-gray-600 mb-1">
                    Tipo salida
                  </label>
                  <select
                    id="tipo-orden-salida"
                    value={tipoSalida}
                    onChange={(e) => setTipoSalida(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Seleccione una opción</option>
                    {TIPOS_FILTRO_ORDEN_SALIDA.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={handleFiltrar}
              disabled={listando || !fechaIni || !fechaFin}
              className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {listando && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
              <span>{listando ? 'Consultando...' : 'Filtrar'}</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={!data.length}
              className="inline-flex w-full sm:w-auto justify-center items-center px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium shadow-sm hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Exportar a Excel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-gray-800">Resultados</span>
          <div className="flex items-center gap-3">
            {!listando && totalItems > 0 && (
              <span className="text-xs text-gray-500">
                {totalItems} registro{totalItems === 1 ? '' : 's'}
              </span>
            )}
            {showUpdating && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                Actualizando...
              </div>
            )}
          </div>
        </div>
        <div className="app-table-scroll">
          <table className="min-w-[800px] w-full text-xs" id="tabladatos">
            <thead className="bg-(--color-primary) text-white">
              <tr>
                {!esModoObservacion && <th className="px-2 py-1 text-left">Área</th>}
                {!esModoObservacion && <th className="px-2 py-1 text-left">Sede</th>}
                <th className="px-2 py-1 text-left">Jefe autorizó</th>
                <th className="px-2 py-1 text-left">Tipo salida</th>
                <th className="px-2 py-1 text-left">Explicación</th>
                <th className="px-2 py-1 text-left">Fecha orden</th>
                <th className="px-2 py-1 text-left">Placa</th>
                <th className="px-2 py-1 text-left">Conductor</th>
                <th className="px-2 py-1 text-left">Persona salió</th>
                <th className="px-2 py-1 text-left">Observación</th>
                {!esModoObservacion && (
                  <th className="px-2 py-1 text-left">Fecha observación</th>
                )}
                {esModoObservacion && <th className="px-2 py-1 text-left">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {showInitialLoader && (
                <tr>
                  <td colSpan={esModoObservacion ? 9 : 11} className="px-2 py-6 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                      <span>Cargando datos...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!listando && data.length === 0 && consultaSinResultados && (
                <tr>
                  <td
                    colSpan={esModoObservacion ? 9 : 11}
                    className="px-2 py-4 text-center text-gray-500"
                  >
                    No se encontraron registros con los filtros seleccionados.
                  </td>
                </tr>
              )}
              {!listando && data.length === 0 && !consultaSinResultados && (
                <tr>
                  <td
                    colSpan={esModoObservacion ? 9 : 11}
                    className="px-2 py-4 text-center text-gray-500"
                  >
                    No hay datos para mostrar. Seleccione fechas y pulse Filtrar.
                  </td>
                </tr>
              )}
              {filasVisibles.map((row) => {
                const sinObservacion = row.observacion == null;
                return (
                  <tr
                    key={row.id}
                    className="border-t text-[11px]"
                    style={{
                      backgroundColor: colorFondoFilaOrdenSalida(row.observacion),
                    }}
                  >
                    {!esModoObservacion && <td className="px-2 py-1">{row.area}</td>}
                    {!esModoObservacion && <td className="px-2 py-1">{row.sede}</td>}
                    <td className="px-2 py-1">{row.jefeNombre}</td>
                    <td className="px-2 py-1">{row.tipoSalidaNombre}</td>
                    <td className="px-2 py-1">{row.explicacion}</td>
                    <td className="px-2 py-1">{formatDateOnly(row.fecha_reg)}</td>
                    <td className="px-2 py-1">{row.placa}</td>
                    <td className="px-2 py-1">{row.conductor}</td>
                    <td className="px-2 py-1">{row.quienSale}</td>
                    <td className="px-2 py-1 align-top">
                      {!sinObservacion || !esModoObservacion ? (
                        row.observacion
                      ) : (
                        <textarea
                          className="border rounded-md px-2 py-1 text-xs w-56 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                          value={observaciones[row.id] ?? ''}
                          onChange={(e) => handleChangeObs(row.id, e.target.value)}
                          aria-label={`Observación orden ${row.id}`}
                        />
                      )}
                    </td>
                    {!esModoObservacion && (
                      <td className="px-2 py-1">{formatDateOnly(row.fecha_reg_obs)}</td>
                    )}
                    {esModoObservacion && (
                      <td className="px-2 py-1">
                        {sinObservacion && (
                        <button
                          type="button"
                          onClick={() => handleGuardarObs(row)}
                          disabled={guardarObsMutation.isPending}
                          className="inline-flex items-center px-3 py-1 rounded-md bg-(--color-primary) text-white text-[11px] font-medium shadow hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Guardar
                        </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!esCuentaVigilante && !listando && totalItems > 0 && (
          <div className="p-4 border-t border-gray-200 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onChange={(page) => setPaging({ empresaId, page })}
            />
          </div>
        )}
      </div>
    </InformesPageFrame>
  );
}
