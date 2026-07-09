'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { ccQueryOptions } from '@/modules/contact-center/shared/constants/query-options';
import {
  btnPrimaryClass,
  btnSecondaryClass,
  btnSuccessClass,
  inputClass,
} from '@/modules/contact-center/shared/constants/ui';
import { AuditoriaFormulario } from './AuditoriaFormulario';
import { AuditoriaUploadModal } from './AuditoriaUploadModal';
import {
  auditoriaContactService,
  FormularioAuditoria,
} from '../services/auditoria-contact.service';

export function AuditoriaIndexGestion() {
  const { showError, showSuccess } = useToast();
  const [nitAgente, setNitAgente] = useState('');
  const [idAuditoria, setIdAuditoria] = useState<number | null>(null);
  const [formulario, setFormulario] = useState<FormularioAuditoria | null>(null);
  const [obsAuditor, setObsAuditor] = useState('');
  const [modalUpload, setModalUpload] = useState(false);
  const [idAuditoriaFinalizada, setIdAuditoriaFinalizada] = useState<number | null>(
    null,
  );

  const { data: agentes = [] } = useQuery({
    queryKey: ['contact-center', 'auditoria', 'agentes'],
    queryFn: () => auditoriaContactService.listarAgentes(),
    ...ccQueryOptions,
  });

  const crear = useMutation({
    mutationFn: () => auditoriaContactService.crearAuditoria(Number(nitAgente)),
    onSuccess: async (id) => {
      if (id <= 0) {
        showError('No se pudo crear la auditoría');
        return;
      }
      setIdAuditoria(id);
      const form = await auditoriaContactService.cargarFormulario();
      setFormulario(form);
      showSuccess('Auditoría iniciada');
    },
    onError: (e: Error) => showError(e.message),
  });

  const respuesta = useMutation({
    mutationFn: (payload: { item: number; opt: 1 | 2 | 3 }) => {
      if (!idAuditoria) throw new Error('Sin auditoría activa');
      return auditoriaContactService.updateRespuesta({
        idAuditoria,
        item: payload.item,
        opt: payload.opt,
      });
    },
    onError: (e: Error) => showError(e.message),
  });

  const finalizar = useMutation({
    mutationFn: () => {
      if (!idAuditoria) throw new Error('Sin auditoría activa');
      if (!obsAuditor.trim()) {
        throw new Error('Debe ingresar observaciones del auditor');
      }
      const respondidas = formulario?.indicadores.flatMap((i) => i.items) ?? [];
      const total = formulario?.cantPreguntas ?? 0;
      const contestadas = respondidas.filter((i) => i.respuesta != null).length;
      if (contestadas < total) {
        throw new Error('Debe completar todas las preguntas antes de finalizar');
      }
      return auditoriaContactService.finalizarAuditoria({
        idAuditoria,
        obsAuditor,
      });
    },
    onSuccess: (id) => {
      if (id > 0) {
        showSuccess('Auditoría finalizada');
        setIdAuditoriaFinalizada(id);
        setModalUpload(true);
        setIdAuditoria(null);
        setFormulario(null);
        setObsAuditor('');
        setNitAgente('');
      } else {
        showError('No se pudo finalizar la auditoría');
      }
    },
    onError: (e: Error) => showError(e.message),
  });

  const handleRespuesta = useCallback(
    (itemId: number, opt: 1 | 2 | 3) => {
      respuesta.mutate({ item: itemId, opt });
      setFormulario((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          indicadores: prev.indicadores.map((ind) => ({
            ...ind,
            items: ind.items.map((it) =>
              it.idItem === itemId ? { ...it, respuesta: opt } : it,
            ),
          })),
        };
      });
    },
    [respuesta],
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="text-sm font-medium text-gray-700">Seleccione el agente</label>
            <select
              className={inputClass}
              value={nitAgente}
              onChange={(e) => setNitAgente(e.target.value)}
              disabled={!!idAuditoria}
            >
              <option value="">Seleccione un agente</option>
              {agentes.map((a) => (
                <option key={a.nit} value={a.nit}>{a.nombres}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={btnSuccessClass}
              onClick={() => {
                if (!nitAgente) {
                  showError('Seleccione un asesor para iniciar la auditoría');
                  return;
                }
                crear.mutate();
              }}
              disabled={crear.isPending || !!idAuditoria}
            >
              Auditar
            </button>
            <Link href="/dashboard/contact-center/auditoria/configuracion">
              <button type="button" className={btnSecondaryClass}>
                Configuración
              </button>
            </Link>
            <Link href="/dashboard/contact-center/auditoria/listado">
              <button type="button" className={btnSecondaryClass}>
                Listado
              </button>
            </Link>
            <Link href="/dashboard/contact-center/auditoria/informe-detalle">
              <button type="button" className={btnSecondaryClass}>
                Informe detalle
              </button>
            </Link>
          </div>
        </div>
      </div>

      {formulario && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-4">
          <AuditoriaFormulario
            formulario={formulario}
            onRespuesta={handleRespuesta}
          />
          <textarea
            className={`${inputClass} min-h-[120px]`}
            rows={5}
            placeholder="Observaciones del auditor"
            value={obsAuditor}
            onChange={(e) => setObsAuditor(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            {idAuditoria && (
              <button
                type="button"
                className={btnSecondaryClass}
                onClick={() => setModalUpload(true)}
              >
                Subir evidencia
              </button>
            )}
            <button
              type="button"
              className={btnPrimaryClass}
              onClick={() => finalizar.mutate()}
              disabled={finalizar.isPending}
            >
              Finalizar auditoría
            </button>
          </div>
        </div>
      )}

      {modalUpload && (
        <AuditoriaUploadModal
          open={modalUpload}
          idAuditoria={idAuditoria ?? idAuditoriaFinalizada}
          onClose={() => {
            setModalUpload(false);
            setIdAuditoriaFinalizada(null);
          }}
        />
      )}
    </div>
  );
}
