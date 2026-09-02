'use client';

import { useCallback, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Modal from '@/components/shared/ui/Modal';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useToast } from '@/components/ui/use-toast';
import { catalogQueryOptions } from '@/core/query/catalog-query-options';
import { ContactCenterPageFrame } from '@/modules/contact-center/components/ContactCenterPageFrame';
import { CONTACT_CENTER_COPY } from '@/modules/contact-center/constants';
import {
  btnPrimaryClass,
  btnSecondaryClass,
  inputClass,
} from '@/modules/contact-center/shared/constants/ui';
import { useContactCenterPageGuard } from '@/modules/contact-center/shared/hooks/useContactCenterPageGuard';
import { CcQueryError } from '@/modules/contact-center/shared/components/CcQueryError';
import { getErrorMessage } from '@/modules/contact-center/shared/utils/get-error-message';
import { AUDITORIA_CC_SUBMENU_ID } from '@/utils/constants';
import { AuditoriaBreadcrumb } from './AuditoriaBreadcrumb';
import { AuditoriaFormulario } from './AuditoriaFormulario';
import { auditoriaContactService } from '../services/auditoria-contact.service';

const registrosPorPagina = 10;

const estadoLabel: Record<string, string> = {
  finalizada: 'Finalizada',
  pendiente_compromiso: 'Pendiente compromiso',
  en_progreso: 'En progreso',
};

export function AuditoriaListadoGestion() {
  const { user, blocked } = useContactCenterPageGuard(AUDITORIA_CC_SUBMENU_ID);
  const { showError, showSuccess } = useToast();
  const [nitAgente, setNitAgente] = useState('');
  const [nitAgenteAplicado, setNitAgenteAplicado] = useState('');
  const [buscar, setBuscar] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [modalVer, setModalVer] = useState(false);
  const [modoModal, setModoModal] = useState<'ver' | 'editar'>('ver');
  const [idVer, setIdVer] = useState<number | null>(null);
  const [compromisoDraft, setCompromisoDraft] = useState<string | null>(null);

  const contextoQuery = useQuery({
    queryKey: ['contact-center', 'auditoria', 'contexto'],
    queryFn: () => auditoriaContactService.obtenerContexto(),
    enabled: !!user && !blocked,
    ...catalogQueryOptions,
  });

  const esAdmin = contextoQuery.data?.esAdmin ?? false;

  const { data: agentes = [] } = useQuery({
    queryKey: ['contact-center', 'auditoria', 'agentes'],
    queryFn: () => auditoriaContactService.listarAgentes(),
    enabled: !!user && !blocked && contextoQuery.isSuccess && esAdmin,
    ...catalogQueryOptions,
  });

  const listadoQuery = useQuery({
    queryKey: ['contact-center', 'auditoria', 'listado', esAdmin, nitAgenteAplicado],
    queryFn: () =>
      auditoriaContactService.listarAuditorias(
        esAdmin,
        nitAgenteAplicado ? Number(nitAgenteAplicado) : undefined,
      ),
    enabled: !!user && !blocked && buscar && contextoQuery.isSuccess,
  });

  const verQuery = useQuery({
    queryKey: ['contact-center', 'auditoria', 'ver', idVer, modoModal, esAdmin],
    queryFn: () =>
      auditoriaContactService.verAuditoria(
        idVer!,
        modoModal === 'editar' ? 'editar' : esAdmin ? 'admin' : 'agente',
      ),
    enabled: modalVer && idVer != null,
  });

  const compromisoServidor = verQuery.data?.compromiso ?? '';
  const compromiso = compromisoDraft ?? compromisoServidor;

  const enviarEmail = useMutation({
    mutationFn: (idAuditoria: number) =>
      auditoriaContactService.enviarEmail(idAuditoria),
    onSuccess: () => showSuccess('Email enviado'),
    onError: (e: unknown) => showError(getErrorMessage(e, 'Error en la operación')),
  });

  const guardarCompromiso = useMutation({
    mutationFn: () => {
      if (!idVer) throw new Error('Sin auditoría seleccionada');
      if (!compromiso.trim()) throw new Error('Ingrese el compromiso');
      return auditoriaContactService.guardarCompromiso({
        idAuditoria: idVer,
        compromisos: compromiso.trim(),
      });
    },
    onSuccess: () => {
      showSuccess('Compromiso guardado');
      verQuery.refetch();
      listadoQuery.refetch();
    },
    onError: (e: unknown) => showError(getErrorMessage(e, 'Error en la operación')),
  });

  const respuesta = useMutation({
    mutationFn: (payload: { item: number; opt: 1 | 2 | 3 }) => {
      if (!idVer) throw new Error('Sin auditoría activa');
      return auditoriaContactService.updateRespuesta({
        idAuditoria: idVer,
        item: payload.item,
        opt: payload.opt,
      });
    },
    onSuccess: () => verQuery.refetch(),
    onError: (e: unknown) => showError(getErrorMessage(e, 'Error en la operación')),
  });

  const handleRespuesta = useCallback(
    (itemId: number, opt: 1 | 2 | 3) => {
      respuesta.mutate({ item: itemId, opt });
    },
    [respuesta],
  );

  const abrirModal = (id: number, modo: 'ver' | 'editar') => {
    setIdVer(id);
    setModoModal(modo);
    setCompromisoDraft(null);
    setModalVer(true);
  };

  const items = listadoQuery.data ?? [];
  const totalPaginas = Math.max(1, Math.ceil(items.length / registrosPorPagina));
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const inicio = (paginaSegura - 1) * registrosPorPagina;
  const paginatedItems = items.slice(inicio, inicio + registrosPorPagina);

  if (blocked) return null;

  return (
    <ContactCenterPageFrame
      title={CONTACT_CENTER_COPY.auditoriaListado.title}
      description={CONTACT_CENTER_COPY.auditoriaListado.description}
    >
    <div className="space-y-4">
      <AuditoriaBreadcrumb current="Informe de auditoría" />

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {esAdmin && (
            <div>
              <label htmlFor="cc-listado-agente" className="text-sm font-medium text-gray-700">Seleccione el agente</label>
              <select
                id="cc-listado-agente"
                className={inputClass}
                value={nitAgente}
                onChange={(e) => setNitAgente(e.target.value)}
              >
                <option value="">Todos</option>
                {agentes.map((a) => (
                  <option key={a.nit} value={a.nit}>{a.nombres}</option>
                ))}
              </select>
            </div>
          )}
          <button
            type="button"
            className={btnPrimaryClass}
            onClick={() => {
              setNitAgenteAplicado(nitAgente);
              setBuscar(true);
              setPaginaActual(1);
            }}
          >
            Buscar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm overflow-x-auto">
        {listadoQuery.isLoading ? (
          <p className="text-gray-500 text-sm">Cargando...</p>
        ) : listadoQuery.isError || contextoQuery.isError ? (
          <CcQueryError
            message={getErrorMessage(
              listadoQuery.error ?? contextoQuery.error,
              'Error al cargar el listado de auditorías',
            )}
          />
        ) : (
          <>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    'ID',
                    'NIT',
                    'Nombre',
                    'Puntuación / 100',
                    'Fecha creación',
                    'Fecha finalización',
                    'Estado',
                    'Opción',
                    ...(esAdmin ? ['Email'] : []),
                  ].map((h) => (
                    <th key={h} className="px-3 py-2 text-center whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((a) => (
                  <tr key={a.idAuditoria} className="border-t text-center">
                    <td className="px-3 py-2">{a.idAuditoria}</td>
                    <td className="px-3 py-2">{a.nit}</td>
                    <td className="px-3 py-2">{a.nombre}</td>
                    <td className="px-3 py-2">{a.puntuacion}</td>
                    <td className="px-3 py-2">{a.fechaCreacion}</td>
                    <td className="px-3 py-2">{a.fechaFinalizacion ?? '-'}</td>
                    <td className="px-3 py-2">{estadoLabel[a.estado] ?? a.estado}</td>
                    <td className="px-3 py-2 space-x-2">
                      {a.puedeEditar && (
                        <button
                          type="button"
                          className="text-xs text-amber-600"
                          onClick={() => abrirModal(a.idAuditoria, 'editar')}
                        >
                          Editar
                        </button>
                      )}
                      {a.puedeVer && (
                        <button
                          type="button"
                          className="text-xs text-[var(--color-primary)]"
                          onClick={() => abrirModal(a.idAuditoria, 'ver')}
                        >
                          Ver
                        </button>
                      )}
                    </td>
                    {esAdmin && (
                      <td className="px-3 py-2">
                        {a.puedeEnviarEmail && (
                          <button
                            type="button"
                            className="text-xs text-green-600"
                            onClick={() => enviarEmail.mutate(a.idAuditoria)}
                            disabled={enviarEmail.isPending}
                          >
                            Enviar
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
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

      {modalVer && idVer != null && (
      <Modal
        open={modalVer}
        onClose={() => setModalVer(false)}
        title={`Auditoría #${idVer}${modoModal === 'editar' ? ' (edición)' : ''}`}
        width="min(96vw, 1200px)"
      >
        {verQuery.isError ? (
          <CcQueryError
            message={getErrorMessage(verQuery.error, 'Error al cargar la auditoría')}
          />
        ) : verQuery.data ? (
          <div className="space-y-4">
            <AuditoriaFormulario
              formulario={verQuery.data}
              readonly={modoModal === 'ver'}
              onRespuesta={modoModal === 'editar' ? handleRespuesta : undefined}
            />
            {verQuery.data.observaciones && (
              <div className="rounded-lg bg-gray-50 p-3 text-sm">
                <p className="font-medium text-gray-700">Observaciones del auditor</p>
                <p className="text-gray-600 whitespace-pre-wrap">{verQuery.data.observaciones}</p>
              </div>
            )}
            {verQuery.data.archivos.length > 0 && (
              <div className="text-sm">
                <p className="font-medium text-gray-700 mb-1">Archivos adjuntos</p>
                <ul className="list-disc pl-4 space-y-1">
                  {verQuery.data.archivos.map((f, i) => (
                    <li key={`${f.nombre}-${i}`}>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        {f.nombre}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {verQuery.data.puedeAgregarCompromiso && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Compromiso del agente</label>
                <textarea
                  className={`${inputClass} min-h-[100px]`}
                  value={compromiso}
                  onChange={(e) => setCompromisoDraft(e.target.value)}
                  placeholder="Describa el compromiso asumido"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    className={btnPrimaryClass}
                    onClick={() => guardarCompromiso.mutate()}
                    disabled={guardarCompromiso.isPending}
                  >
                    Guardar compromiso
                  </button>
                </div>
              </div>
            )}
            {verQuery.data.compromiso && !verQuery.data.puedeAgregarCompromiso && (
              <div className="rounded-lg bg-green-50 p-3 text-sm">
                <p className="font-medium text-gray-700">Compromiso registrado</p>
                <p className="text-gray-600 whitespace-pre-wrap">{verQuery.data.compromiso}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Cargando...</p>
        )}
        <div className="mt-4 flex justify-end">
          <button type="button" className={btnSecondaryClass} onClick={() => setModalVer(false)}>
            Cerrar
          </button>
        </div>
      </Modal>
      )}
    </div>
    </ContactCenterPageFrame>
  );
}
