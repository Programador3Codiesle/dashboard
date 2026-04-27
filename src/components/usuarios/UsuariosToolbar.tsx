'use client';

import React, { memo, useCallback, useState } from 'react';
import { ReceiptText } from 'lucide-react';
import { Button } from '@/components/shared/atoms/Button';
import AgregarUsuarioModal from '@/components/usuarios/modals/AgregarUsuarioModal';
import AgregarJefeModal from '@/components/usuarios/modals/AgregarJefeModal';
import { IPerfil } from '@/modules/usuarios/types';

interface UsuariosToolbarProps {
  perfiles: IPerfil[];
  onAgregarUsuario: (nit: string, perfilId: string) => Promise<boolean>;
}

export const UsuariosToolbar = memo(function UsuariosToolbar({
  perfiles,
  onAgregarUsuario,
}: UsuariosToolbarProps) {
  const [modalAgregarUsuario, setModalAgregarUsuario] = useState(false);
  const [modalAgregarJefe, setModalAgregarJefe] = useState(false);

  const handleOpenAgregarUsuario = useCallback(() => {
    setModalAgregarUsuario(true);
  }, []);

  const handleCloseAgregarUsuario = useCallback(() => {
    setModalAgregarUsuario(false);
  }, []);

  const handleOpenAgregarJefe = useCallback(() => {
    setModalAgregarJefe(true);
  }, []);

  const handleCloseAgregarJefe = useCallback(() => {
    setModalAgregarJefe(false);
  }, []);

  const handleGuardarUsuario = useCallback(
    async (nit: string, perfilId: string) => {
      const success = await onAgregarUsuario(nit, perfilId);
      if (success) {
        setModalAgregarUsuario(false);
      }
    },
    [onAgregarUsuario],
  );

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          variant="primary"
          className="flex items-center"
          onClick={handleOpenAgregarUsuario}
        >
          <ReceiptText size={16} className="mr-2" />
          Registrar
        </Button>
        <Button
          variant="primary"
          className="flex items-center ml-2"
          onClick={handleOpenAgregarJefe}
        >
          <ReceiptText size={16} className="mr-2" />
          Jefes
        </Button>
      </div>

      <AgregarUsuarioModal
        open={modalAgregarUsuario}
        onClose={handleCloseAgregarUsuario}
        onSave={handleGuardarUsuario}
        perfilesDisponibles={perfiles}
      />
      <AgregarJefeModal open={modalAgregarJefe} onClose={handleCloseAgregarJefe} />
    </>
  );
});
