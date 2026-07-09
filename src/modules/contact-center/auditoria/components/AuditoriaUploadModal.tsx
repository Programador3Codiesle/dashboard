'use client';

import { useRef, useState } from 'react';
import Modal from '@/components/shared/ui/Modal';
import { useToast } from '@/components/ui/use-toast';
import {
  btnPrimaryClass,
  btnSecondaryClass,
} from '@/modules/contact-center/shared/constants/ui';
import { auditoriaContactService } from '../services/auditoria-contact.service';

type Props = {
  open: boolean;
  idAuditoria: number | null;
  onClose: () => void;
  onUploaded?: () => void;
};

export function AuditoriaUploadModal({
  open,
  idAuditoria,
  onClose,
  onUploaded,
}: Props) {
  const { showError, showSuccess } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [archivos, setArchivos] = useState<File[]>([]);
  const [subiendo, setSubiendo] = useState(false);

  const handleClose = () => {
    setArchivos([]);
    if (inputRef.current) inputRef.current.value = '';
    onClose();
  };

  const handleSubir = async () => {
    if (!idAuditoria) return;
    if (archivos.length === 0) {
      showError('Seleccione al menos un archivo');
      return;
    }

    setSubiendo(true);
    try {
      const result = await auditoriaContactService.subirArchivos(
        idAuditoria,
        archivos,
      );
      const ok = result.cantSaveFile.length;
      const fail = result.cantNotSaveFile.length;
      if (ok > 0 && fail === 0) {
        showSuccess(`${ok} archivo(s) cargado(s) correctamente`);
      } else if (ok > 0) {
        showSuccess(`${ok} archivo(s) cargado(s); ${fail} no se registraron`);
      } else {
        showError('No se pudieron registrar los archivos');
      }
      onUploaded?.();
      handleClose();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Error al subir archivos');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Subir archivos de evidencia"
      width="min(96vw, 560px)"
    >
      <p className="text-sm text-gray-600 mb-3">
        Adjunte evidencia de la auditoría finalizada (opcional).
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2"
        onChange={(e) => setArchivos(Array.from(e.target.files ?? []))}
      />
      {archivos.length > 0 && (
        <ul className="mt-2 text-xs text-gray-500 list-disc pl-4">
          {archivos.map((f) => (
            <li key={`${f.name}-${f.size}`}>{f.name}</li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" className={btnSecondaryClass} onClick={handleClose}>
          Omitir
        </button>
        <button
          type="button"
          className={btnPrimaryClass}
          onClick={handleSubir}
          disabled={subiendo || archivos.length === 0}
        >
          {subiendo ? 'Cargando...' : 'Cargar'}
        </button>
      </div>
    </Modal>
  );
}
