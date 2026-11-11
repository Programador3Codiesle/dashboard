'use client';

import { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Modal from '@/components/shared/ui/Modal';
import { Pagination } from '@/components/shared/ui/Pagination';
import { catalogQueryOptions } from '@/core/query/catalog-query-options';
import { ContactCenterPageFrame } from '@/modules/contact-center/components/ContactCenterPageFrame';
import { CONTACT_CENTER_COPY } from '@/modules/contact-center/constants';
import {
  btnPrimaryClass,
  btnSecondaryClass,
  btnSuccessClass,
  inputClass,
} from '@/modules/contact-center/shared/constants/ui';
import { CcQueryError } from '@/modules/contact-center/shared/components/CcQueryError';
import { getErrorMessage } from '@/modules/contact-center/shared/utils/get-error-message';
import { useAuditoriaAdminGate } from '../hooks/useAuditoriaAdminGate';
import { AuditoriaBreadcrumb } from './AuditoriaBreadcrumb';
import { AuditoriaFormulario } from './AuditoriaFormulario';
import { auditoriaContactService } from '../services/auditoria-contact.service';

const registrosPorPagina = 10;
const AGENTE_TODOS = 'todos';

export function AuditoriaInformeDetalleGestion() {
  const { user, blocked } = useAuditoriaAdminGate();
  const [nitAgente, setNitAgente] = useState('');
  const [mes, setMes] = useState('');
  const [filtrosAplicados, setFiltrosAplicados] = useState({ nitAgente: '', mes: '' });
  const [buscar, setBuscar] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [modalVer, setModalVer] = useState(false);
  const [idVer, setIdVer] = useState<number | null>(null);

  const { data: agentes = [] } = useQuery({
    queryKey: ['contact-center', 'auditoria', 'agentes'],
    queryFn: () => auditoriaContactService.listarAgentes(),
    enabled: !!user && !blocked,
    ...catalogQueryOptions,
  });

  const informeQuery = useQuery({
    queryKey: [
      'contact-center',
      'auditoria',
      'informe-detalle',
      filtrosAplicados.nitAgente,
      filtrosAplicados.mes,
      buscar,
    ],
    queryFn: () =>
      auditoriaContactService.informeDetalle({
        nitAgente:
          filtrosAplicados.nitAgente === AGENTE_TODOS
            ? null
            : Number(filtrosAplicados.nitAgente),
        mes: filtrosAplicados.mes,
      }),
    enabled:
      !!user &&
      !blocked &&
      buscar &&
      !!filtrosAplicados.nitAgente &&
      !!filtrosAplicados.mes,
  });

  const verQuery = useQuery({
    queryKey: ['contact-center', 'auditoria', 'ver', idVer],
    queryFn: () => auditoriaContactService.verAuditoria(idVer!, 'admin'),
    enabled: modalVer && idVer != null,
  });

  const items = informeQuery.data?.filas ?? [];
  const esTodos = filtrosAplicados.nitAgente === AGENTE_TODOS;
  const mostrarTabla = buscar && !!filtrosAplicados.nitAgente && !esTodos;
  const cantidad = informeQuery.data?.cantidad ?? items.length;
  const mostrarCards = Boolean(
    informeQuery.data && !informeQuery.data.mensaje && cantidad > 0,
  );
  const totalPaginas = Math.max(1, Math.ceil(items.length / registrosPorPagina));
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const inicio = (paginaSegura - 1) * registrosPorPagina;
  const paginatedItems = items.slice(inicio, inicio + registrosPorPagina);
  const puedeExportarTodos = esTodos && mostrarCards;

  const onExportExcel = async () => {
    const porAgente = informeQuery.data?.porAgente ?? [];
    if (!puedeExportarTodos || porAgente.length === 0) return;
    const XLSX = await import('xlsx');
    const filas = [
      ...porAgente.map((agente) => ({
        Agente: agente.nombres,
        Auditorías: agente.cantidad,
        'Suma puntos': agente.sumaPuntos,
        Promedio: agente.promedio,
      })),
      {
        Agente: 'Totales',
        Auditorías: cantidad,
        'Suma puntos': informeQuery.data?.sumaPuntos ?? 0,
        Promedio: informeQuery.data?.promedio ?? 0,
      },
    ];
    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Informe');
    XLSX.writeFile(
      libro,
      `informe-auditoria-todos-${filtrosAplicados.mes || 'sin-mes'}.xlsx`,
    );
  };

  if (blocked) return null;

  return (
    <ContactCenterPageFrame
      title={CONTACT_CENTER_COPY.auditoriaInformeDetalle.title}
      description={CONTACT_CENTER_COPY.auditoriaInformeDetalle.description}
    >
    <div className="space-y-4">
      <AuditoriaBreadcrumb current="Informe detallado" />

      <div className="app-section-card w-full min-w-0">
        <div className="app-form-grid-3 items-end">
          <div>
            <label htmlFor="cc-informe-agente" className="text-sm font-medium text-gray-700">Seleccione el agente</label>
            <select
              id="cc-informe-agente"
              className={inputClass}
              value={nitAgente}
              onChange={(e) => setNitAgente(e.target.value)}
            >
              <option value="">Seleccione</option>
              <option value={AGENTE_TODOS}>Todos</option>
              {agentes.map((a) => (
                <option key={a.nit} value={a.nit}>{a.nombres}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cc-informe-mes" className="text-sm font-medium text-gray-700">Seleccione un mes</label>
            <input
              id="cc-informe-mes"
              type="month"
              className={inputClass}
              value={mes}
              onChange={(e) => setMes(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <button
              type="button"
              className={btnPrimaryClass}
              onClick={() => {
                setFiltrosAplicados({ nitAgente, mes });
                setBuscar(true);
                setPaginaActual(1);
              }}
            >
              Buscar
            </button>
            {(nitAgente === AGENTE_TODOS || esTodos) && (
              <button
                type="button"
                className={btnSuccessClass}
                disabled={!puedeExportarTodos}
                onClick={() => void onExportExcel()}
              >
                <FileSpreadsheet size={16} className="mr-2" />
                Exportar Excel
              </button>
            )}
          </div>
        </div>
      </div>

      {informeQuery.data?.mensaje && items.length === 0 && buscar && !informeQuery.isLoading && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
          {informeQuery.data.mensaje}
        </p>
      )}

      {esTodos && informeQuery.isLoading && (
        <p className="text-gray-500 text-sm">Cargando...</p>
      )}
      {esTodos && informeQuery.isError && (
        <CcQueryError
          message={getErrorMessage(
            informeQuery.error,
            'Error al cargar el informe detalle',
          )}
        />
      )}

      {mostrarCards && informeQuery.data && !esTodos && (
        <div className="app-kpi-grid-3">
          <div className="bg-white rounded-xl border p-3 text-center">
            <p className="text-xs text-gray-500">Auditorías</p>
            <p className="text-lg font-semibold">{cantidad}</p>
          </div>
          <div className="bg-white rounded-xl border p-3 text-center">
            <p className="text-xs text-gray-500">Suma puntos</p>
            <p className="text-lg font-semibold">{informeQuery.data.sumaPuntos ?? '-'}</p>
          </div>
          <div className="bg-white rounded-xl border p-3 text-center">
            <p className="text-xs text-gray-500">Promedio</p>
            <p className="text-lg font-semibold">{informeQuery.data.promedio ?? '-'}</p>
          </div>
        </div>
      )}

      {mostrarCards && informeQuery.data && esTodos && (
        <div className="space-y-3">
          <div className="hidden md:grid md:grid-cols-[minmax(12rem,16rem)_1fr_1fr_1fr] md:gap-3">
            <div aria-hidden="true" />
            <p className="text-center text-xs text-gray-500">Auditorías</p>
            <p className="text-center text-xs text-gray-500">Suma puntos</p>
            <p className="text-center text-xs text-gray-500">Promedio</p>
          </div>
          {(informeQuery.data.porAgente ?? []).map((agente) => (
            <div
              key={agente.nit}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-[minmax(12rem,16rem)_1fr_1fr_1fr] md:items-center"
            >
              <p className="text-sm font-medium text-gray-800 sm:col-span-2 md:col-span-1">
                {agente.nombres}
              </p>
              <div className="bg-white rounded-xl border p-3 text-center">
                <p className="text-xs text-gray-500 md:sr-only">Auditorías</p>
                <p className="text-lg font-semibold">{agente.cantidad}</p>
              </div>
              <div className="bg-white rounded-xl border p-3 text-center">
                <p className="text-xs text-gray-500 md:sr-only">Suma puntos</p>
                <p className="text-lg font-semibold">{agente.sumaPuntos}</p>
              </div>
              <div className="bg-white rounded-xl border p-3 text-center">
                <p className="text-xs text-gray-500 md:sr-only">Promedio</p>
                <p className="text-lg font-semibold">{agente.promedio}</p>
              </div>
            </div>
          ))}
          <div className="grid grid-cols-1 gap-3 border-t border-gray-200 pt-3 sm:grid-cols-2 md:grid-cols-[minmax(12rem,16rem)_1fr_1fr_1fr] md:items-center">
            <p className="text-sm font-semibold text-gray-900 sm:col-span-2 md:col-span-1">
              Totales
            </p>
            <div className="bg-white rounded-xl border p-3 text-center">
              <p className="sr-only">Auditorías</p>
              <p className="text-lg font-semibold">{cantidad}</p>
            </div>
            <div className="bg-white rounded-xl border p-3 text-center">
              <p className="sr-only">Suma puntos</p>
              <p className="text-lg font-semibold">{informeQuery.data.sumaPuntos ?? '-'}</p>
            </div>
            <div className="bg-white rounded-xl border p-3 text-center">
              <p className="sr-only">Promedio</p>
              <p className="text-lg font-semibold">{informeQuery.data.promedio ?? '-'}</p>
            </div>
          </div>
        </div>
      )}

      {mostrarTabla && (
      <div className="app-section-card w-full min-w-0">
        {informeQuery.isLoading ? (
          <p className="text-gray-500 text-sm">Cargando...</p>
        ) : informeQuery.isError ? (
          <CcQueryError
            message={getErrorMessage(
              informeQuery.error,
              'Error al cargar el informe detalle',
            )}
          />
        ) : (
          <>
            <div className="app-table-scroll">
            <table className="w-full min-w-[420px] text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Fecha', 'Puntos', 'Opción'].map((h) => (
                    <th key={h} className="px-3 py-2 text-center">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((r) => (
                  <tr key={r.idAuditoria} className="border-t text-center">
                    <td className="px-3 py-2">{r.fecha}</td>
                    <td className="px-3 py-2">{r.puntos ?? '-'}</td>
                    <td className="px-3 py-2">
                      {r.puedeVer && (
                        <button
                          type="button"
                          className="text-xs text-[var(--color-primary)]"
                          onClick={() => { setIdVer(r.idAuditoria); setModalVer(true); }}
                        >
                          Ver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {items.length > registrosPorPagina && (
              <div className="mt-4">
                <Pagination
                  currentPage={paginaSegura}
                  totalPages={totalPaginas}
                  onChange={setPaginaActual}
                />
              </div>
            )}
          </>
        )}
      </div>
      )}

      <Modal
        open={modalVer}
        onClose={() => setModalVer(false)}
        title={`Auditoría #${idVer}`}
        width="min(96vw, 1200px)"
      >
        {verQuery.isError ? (
          <CcQueryError
            message={getErrorMessage(verQuery.error, 'Error al cargar la auditoría')}
          />
        ) : verQuery.data ? (
          <AuditoriaFormulario formulario={verQuery.data} readonly />
        ) : (
          <p className="text-gray-500 text-sm">Cargando...</p>
        )}
        <div className="mt-4 flex justify-end">
          <button type="button" className={btnSecondaryClass} onClick={() => setModalVer(false)}>
            Cerrar
          </button>
        </div>
      </Modal>
    </div>
    </ContactCenterPageFrame>
  );
}
