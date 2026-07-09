'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Modal from '@/components/shared/ui/Modal';
import { Pagination } from '@/components/shared/ui/Pagination';
import {
  btnPrimaryClass,
  btnSecondaryClass,
  inputClass,
} from '@/modules/contact-center/shared/constants/ui';
import { AuditoriaFormulario } from './AuditoriaFormulario';
import { auditoriaContactService } from '../services/auditoria-contact.service';

const registrosPorPagina = 10;

export function AuditoriaInformeDetalleGestion() {
  const [nitAgente, setNitAgente] = useState('');
  const [mes, setMes] = useState('');
  const [buscar, setBuscar] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [modalVer, setModalVer] = useState(false);
  const [idVer, setIdVer] = useState<number | null>(null);

  const { data: agentes = [] } = useQuery({
    queryKey: ['contact-center', 'auditoria', 'agentes'],
    queryFn: () => auditoriaContactService.listarAgentes(),
  });

  const informeQuery = useQuery({
    queryKey: ['contact-center', 'auditoria', 'informe-detalle', nitAgente, mes, buscar],
    queryFn: () =>
      auditoriaContactService.informeDetalle({
        nitAgente: Number(nitAgente),
        mes,
      }),
    enabled: buscar && !!nitAgente && !!mes,
  });

  const verQuery = useQuery({
    queryKey: ['contact-center', 'auditoria', 'ver', idVer],
    queryFn: () => auditoriaContactService.verAuditoria(idVer!, 'admin'),
    enabled: modalVer && idVer != null,
  });

  const items = informeQuery.data?.filas ?? [];
  const totalPaginas = Math.max(1, Math.ceil(items.length / registrosPorPagina));
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const paginatedItems = items.slice(inicio, inicio + registrosPorPagina);

  return (
    <div className="space-y-4">
      <nav className="text-sm text-gray-500">
        <Link href="/dashboard/contact-center/auditoria" className="hover:underline">
          Auditoría
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">Informe detallado</span>
      </nav>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-sm font-medium text-gray-700">Seleccione el agente</label>
            <select
              className={inputClass}
              value={nitAgente}
              onChange={(e) => setNitAgente(e.target.value)}
            >
              <option value="">Seleccione</option>
              {agentes.map((a) => (
                <option key={a.nit} value={a.nit}>{a.nombres}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Seleccione un mes</label>
            <input
              type="month"
              className={inputClass}
              value={mes}
              onChange={(e) => setMes(e.target.value)}
            />
          </div>
          <button
            type="button"
            className={btnPrimaryClass}
            onClick={() => { setBuscar(true); setPaginaActual(1); }}
          >
            Buscar
          </button>
        </div>
      </div>

      {informeQuery.data?.mensaje && items.length === 0 && buscar && !informeQuery.isLoading && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
          {informeQuery.data.mensaje}
        </p>
      )}

      {informeQuery.data && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border p-3 text-center">
            <p className="text-xs text-gray-500">Auditorías</p>
            <p className="text-lg font-semibold">{informeQuery.data.cantidad ?? items.length}</p>
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

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm overflow-x-auto">
        {informeQuery.isLoading ? (
          <p className="text-gray-500 text-sm">Cargando...</p>
        ) : (
          <>
            <table className="min-w-full text-sm">
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

      <Modal
        open={modalVer}
        onClose={() => setModalVer(false)}
        title={`Auditoría #${idVer}`}
        width="min(96vw, 1200px)"
      >
        {verQuery.data ? (
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
  );
}
