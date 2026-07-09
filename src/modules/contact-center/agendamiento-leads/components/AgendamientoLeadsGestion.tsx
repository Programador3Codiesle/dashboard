'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Modal from '@/components/shared/ui/Modal';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/core/auth/hooks/useAuth';
import {
  btnPrimaryClass,
  btnSecondaryClass,
  btnSuccessClass,
  inputClass,
} from '@/modules/contact-center/shared/constants/ui';
import { ccQueryOptions } from '@/modules/contact-center/shared/constants/query-options';
import {
  AGENTES_ASIGNACION,
  agendamientoLeadsService,
  LeadItem,
} from '../services/agendamiento-leads.service';

const registrosPorPagina = 10;

export function AgendamientoLeadsGestion() {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const esAdmin = user?.perfil_postventa === '1';

  const [filtros, setFiltros] = useState({
    tipoLeads: '',
    fechaIni: '',
    fechaFin: '',
  });
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    tipoLeads: '',
    fechaIni: '',
    fechaFin: '',
  });
  const [buscar, setBuscar] = useState(!esAdmin);
  const [seleccion, setSeleccion] = useState<Record<number, boolean>>({});
  const [modalAsignar, setModalAsignar] = useState(false);
  const [modalGestion, setModalGestion] = useState(false);
  const [agenteAsignar, setAgenteAsignar] = useState('');
  const [leadActivo, setLeadActivo] = useState<LeadItem | null>(null);
  const [gestionForm, setGestionForm] = useState({
    interesado: '' as '' | '0' | '1',
    idcita: '',
    motivo: '',
  });
  const [paginaActual, setPaginaActual] = useState(1);

  const { data: motivos = [] } = useQuery({
    queryKey: ['contact-center', 'agendamiento-leads', 'motivos'],
    queryFn: () => agendamientoLeadsService.listarMotivos(),
    enabled: modalGestion,
  });

  const listarQuery = useQuery({
    queryKey: ['contact-center', 'agendamiento-leads', 'listar', filtrosAplicados, esAdmin],
    queryFn: () =>
      agendamientoLeadsService.listar(
        esAdmin
          ? {
              tipoLeads: filtrosAplicados.tipoLeads || undefined,
              fechaIni: filtrosAplicados.fechaIni || undefined,
              fechaFin: filtrosAplicados.fechaFin || undefined,
            }
          : {},
      ),
    enabled: buscar,
    ...ccQueryOptions,
  });

  const items = listarQuery.data ?? [];
  const totalPaginas = Math.max(1, Math.ceil(items.length / registrosPorPagina));
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const paginatedItems = items.slice(inicio, inicio + registrosPorPagina);

  useEffect(() => {
    setPaginaActual(1);
  }, [items.length, buscar]);

  const seleccionados = useMemo(
    () => items.filter((i) => seleccion[i.idcontactlead]).map((i) => i.idcontactlead),
    [items, seleccion],
  );

  const asignar = useMutation({
    mutationFn: () =>
      agendamientoLeadsService.asignar({
        idleads: seleccionados,
        agente: Number(agenteAsignar),
      }),
    onSuccess: () => {
      showSuccess('Leads asignados');
      setModalAsignar(false);
      setSeleccion({});
      listarQuery.refetch();
    },
    onError: (e: Error) => showError(e.message),
  });

  const gestionar = useMutation({
    mutationFn: () => {
      if (!leadActivo || !gestionForm.interesado) throw new Error('Complete el formulario');
      return agendamientoLeadsService.gestionar({
        idcontactlead: leadActivo.idcontactlead,
        interesado: gestionForm.interesado,
        idcita: gestionForm.interesado === '1' ? gestionForm.idcita : undefined,
        motivo: gestionForm.interesado === '0' ? gestionForm.motivo : undefined,
      });
    },
    onSuccess: () => {
      showSuccess('Gestión registrada');
      setModalGestion(false);
      listarQuery.refetch();
    },
    onError: (e: Error) => showError(e.message),
  });

  const exportar = useMutation({
    mutationFn: () => agendamientoLeadsService.exportarExcel(),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'LEADS-POSTVENTA.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: (e: Error) => showError(e.message),
  });

  const abrirGestion = (lead: LeadItem) => {
    setLeadActivo(lead);
    setGestionForm({ interesado: '', idcita: '', motivo: '' });
    setModalGestion(true);
  };

  const mostrarColAsignar = esAdmin && filtros.tipoLeads === '1';
  const mostrarColAgente = esAdmin && filtros.tipoLeads === '0';
  const mostrarColGestionados = esAdmin && filtros.tipoLeads === '3';

  const totalColumnas =
    9 +
    (esAdmin ? 2 : 1) +
    (mostrarColAgente ? 1 : 0) +
    (mostrarColGestionados ? 3 : 0) +
    (mostrarColAsignar ? 1 : 0);

  const sinRegistros = buscar && !listarQuery.isLoading && items.length === 0;

  return (
    <div className="space-y-4">
      {esAdmin && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Tipo de LEADS</label>
              <select
                className={inputClass}
                value={filtros.tipoLeads}
                onChange={(e) => setFiltros((f) => ({ ...f, tipoLeads: e.target.value }))}
              >
                <option value="">Seleccione</option>
                <option value="0">Asignados</option>
                <option value="1">Sin Asignar</option>
                <option value="3">Gestionados</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Fecha inicial</label>
              <input
                type="date"
                className={inputClass}
                value={filtros.fechaIni}
                onChange={(e) => setFiltros((f) => ({ ...f, fechaIni: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Fecha final</label>
              <input
                type="date"
                className={inputClass}
                value={filtros.fechaFin}
                onChange={(e) => setFiltros((f) => ({ ...f, fechaFin: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                className={btnPrimaryClass}
                onClick={() => {
                  setFiltrosAplicados({ ...filtros });
                  setBuscar(true);
                  setPaginaActual(1);
                }}
              >
                Filtrar
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={btnPrimaryClass}
              onClick={() => {
                if (seleccionados.length === 0) {
                  showError('Seleccione al menos un lead');
                  return;
                }
                setModalAsignar(true);
              }}
            >
              Asignar
            </button>
            <button
              type="button"
              className={btnSuccessClass}
              onClick={() => exportar.mutate()}
              disabled={exportar.isPending}
            >
              Descargar LEADS
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm overflow-x-auto">
        {listarQuery.isLoading ? (
          <p className="text-gray-500 text-sm">Cargando...</p>
        ) : (
          <>
            <table className="min-w-full text-xs">
              <thead className="bg-gray-800 text-white">
                <tr>
                  {[
                    'Id LEAD', 'Documento', 'Nombre', 'Campaña', 'Fecha Ingreso',
                    'Ciudad', 'Teléfono', 'Correo', 'Placa',
                  ].map((h) => (
                    <th key={h} className="px-2 py-2 whitespace-nowrap">{h}</th>
                  ))}
                  {esAdmin && (
                    <>
                      <th className="px-2 py-2">LEAD</th>
                      <th className="px-2 py-2">Agencia</th>
                      {mostrarColAgente && <th className="px-2 py-2">Agente</th>}
                      {mostrarColGestionados && (
                        <>
                          <th className="px-2 py-2">Interesado</th>
                          <th className="px-2 py-2">Resultado</th>
                          <th className="px-2 py-2">Fecha Gestión</th>
                        </>
                      )}
                      {mostrarColAsignar && <th className="px-2 py-2">Asignar</th>}
                    </>
                  )}
                  {!esAdmin && <th className="px-2 py-2">Gestionar</th>}
                </tr>
              </thead>
              <tbody>
                {sinRegistros ? (
                  <tr>
                    <td
                      colSpan={totalColumnas}
                      className="px-2 py-6 text-center text-gray-500"
                    >
                      No hay leads o registros para mostrar.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((lead) => (
                  <tr key={lead.idcontactlead} className="border-t text-center">
                    <td className="px-2 py-1">{lead.idcontactlead}</td>
                    <td className="px-2 py-1">{lead.documento}</td>
                    <td className="px-2 py-1">{lead.nombres}</td>
                    <td className="px-2 py-1">{lead.vhinteres}</td>
                    <td className="px-2 py-1">{lead.fecha}</td>
                    <td className="px-2 py-1">{lead.ciudad}</td>
                    <td className="px-2 py-1">{lead.telefonos}</td>
                    <td className="px-2 py-1">{lead.email}</td>
                    <td className="px-2 py-1">{lead.placa}</td>
                    {esAdmin && (
                      <>
                        <td className="px-2 py-1">{lead.lead}</td>
                        <td className="px-2 py-1">{lead.agencia}</td>
                        {mostrarColAgente && (
                          <td className="px-2 py-1">{lead.agenteNombre}</td>
                        )}
                        {mostrarColGestionados && (
                          <>
                            <td className="px-2 py-1">
                              {lead.interesado != null ? (lead.interesado ? 'Sí' : 'No') : ''}
                            </td>
                            <td className="px-2 py-1">{lead.resultado}</td>
                            <td className="px-2 py-1">{lead.fechaGestionado}</td>
                          </>
                        )}
                        {mostrarColAsignar && (
                          <td className="px-2 py-1">
                            <input
                              type="checkbox"
                              checked={!!seleccion[lead.idcontactlead]}
                              onChange={(e) =>
                                setSeleccion((prev) => ({
                                  ...prev,
                                  [lead.idcontactlead]: e.target.checked,
                                }))
                              }
                            />
                          </td>
                        )}
                      </>
                    )}
                    {!esAdmin && (
                      <td className="px-2 py-1">
                        <button
                          type="button"
                          className="text-xs text-[var(--color-primary)]"
                          onClick={() => abrirGestion(lead)}
                        >
                          Gestionar
                        </button>
                      </td>
                    )}
                  </tr>
                  ))
                )}
              </tbody>
            </table>
            {items.length > registrosPorPagina && (
              <div className="mt-4">
                <Pagination
                  currentPage={paginaActual}
                  totalPages={totalPaginas}
                  onChange={setPaginaActual}
                />
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={modalAsignar} onClose={() => setModalAsignar(false)} title="Asignación del agente">
        <div className="space-y-4">
          <select
            className={inputClass}
            value={agenteAsignar}
            onChange={(e) => setAgenteAsignar(e.target.value)}
          >
            <option value="">Seleccione una opción</option>
            {AGENTES_ASIGNACION.map((a) => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <button type="button" className={btnSecondaryClass} onClick={() => setModalAsignar(false)}>
              Cancelar
            </button>
            <button
              type="button"
              className={btnPrimaryClass}
              onClick={() => asignar.mutate()}
              disabled={!agenteAsignar || asignar.isPending}
            >
              Asignar
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={modalGestion} onClose={() => setModalGestion(false)} title="Gestión LEAD">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">¿El cliente está interesado?</label>
            <select
              className={inputClass}
              value={gestionForm.interesado}
              onChange={(e) =>
                setGestionForm((f) => ({
                  ...f,
                  interesado: e.target.value as '' | '0' | '1',
                }))
              }
            >
              <option value="">Seleccione</option>
              <option value="1">Sí</option>
              <option value="0">No</option>
            </select>
          </div>
          {gestionForm.interesado === '1' && (
            <div>
              <label className="text-sm font-medium text-gray-700">Id Cita</label>
              <input
                className={inputClass}
                value={gestionForm.idcita}
                onChange={(e) => setGestionForm((f) => ({ ...f, idcita: e.target.value }))}
              />
            </div>
          )}
          {gestionForm.interesado === '0' && (
            <div>
              <label className="text-sm font-medium text-gray-700">Motivo</label>
              <select
                className={inputClass}
                value={gestionForm.motivo}
                onChange={(e) => setGestionForm((f) => ({ ...f, motivo: e.target.value }))}
              >
                <option value="">Seleccione</option>
                {motivos.map((m) => (
                  <option key={m.id} value={m.id}>{m.motivo}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" className={btnSecondaryClass} onClick={() => setModalGestion(false)}>
              Cancelar
            </button>
            <button
              type="button"
              className={btnPrimaryClass}
              onClick={() => gestionar.mutate()}
              disabled={gestionar.isPending}
            >
              Registrar gestión
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
