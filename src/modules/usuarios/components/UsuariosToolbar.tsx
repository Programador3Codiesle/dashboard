"use client";

import { memo, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { ReceiptText } from "lucide-react";
import { Button } from "@/components/shared/atoms/Button";
import { usePerfiles } from "../hooks/usePerfiles";
import { useUsuarioActions } from "../hooks/useUsuarioActions";

const AgregarUsuarioModal = dynamic(() => import("./modals/AgregarUsuarioModal"), {
  ssr: false,
});
const AgregarJefeModal = dynamic(() => import("./modals/AgregarJefeModal"), {
  ssr: false,
});

export const UsuariosToolbar = memo(function UsuariosToolbar() {
  const [modalAgregarUsuario, setModalAgregarUsuario] = useState(false);
  const [modalAgregarJefe, setModalAgregarJefe] = useState(false);
  const { perfiles } = usePerfiles({ enabled: modalAgregarUsuario });
  const { crearUsuario } = useUsuarioActions();

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
      const success = await crearUsuario(nit, perfilId);
      if (success) {
        setModalAgregarUsuario(false);
      }
    },
    [crearUsuario],
  );

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="primary"
          className="flex w-full sm:w-auto items-center justify-center"
          onClick={handleOpenAgregarUsuario}
        >
          <ReceiptText size={16} className="mr-2" />
          Registrar
        </Button>
        <Button
          variant="primary"
          className="flex w-full sm:w-auto items-center justify-center"
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
