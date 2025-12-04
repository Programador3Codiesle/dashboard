'use client';

import React, { useState } from 'react';
import { UsuariosTable } from '@/components/usuarios/UsuariosTable';
import { Button } from '@/components/shared/atoms/Button';
import { ReceiptText } from 'lucide-react';
import  AgregarUsuarioModal  from '@/components/usuarios/modals/AgregarUsuarioModal';
import { jefesDisponibles, perfilesDisponibles } from '@/modules/usuarios/constants';
   
import AgregarJefeModal from '@/components/usuarios/modals/AgregarJefeModal';

const UsuariosPage: React.FC = () => {
    const  [modalAgregarUsuario, setModalAgregarUsuario] = useState(false);
    const  [modalAgregarJefe, setModalAgregarJefe] = useState(false);

    const handleAgregarUsuario = async () => {
      console.log('Aca se hace el llamado a la api');
    };

    const handleAgregarJefe = async () => {
      console.log('Aca se hace el llamado a la api');
    };

    return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Usuarios</h2>
      <div className="mb-4 flex justify-end">
        <Button variant="primary" className="flex items-center" onClick={() => setModalAgregarUsuario(true)}>
          <ReceiptText size={16} className="mr-2" />
          Registrar
        </Button>
        <Button variant="primary" className="flex items-center ml-2" onClick={() => setModalAgregarJefe(true)}>
          <ReceiptText size={16} className="mr-2" />
          Jefes
        </Button>
      </div>
      <UsuariosTable />
      <p className="mt-8 text-sm text-gray-500">
        *Datos mostrados utilizando la lógica quemada (mock data) de `/modules/usuarios/hooks`.
      </p>

      <AgregarUsuarioModal
                      open={modalAgregarUsuario}
                      usuario={null}
                      onClose={() => setModalAgregarUsuario(false)}
                      onSave={handleAgregarUsuario}
                      perfilesDisponibles={perfilesDisponibles}
      />
      <AgregarJefeModal
                      open={modalAgregarJefe}
                      usuario={null}
                      onClose={() => setModalAgregarJefe(false)}
                      onSave={handleAgregarJefe}
                      jefesDisponibles={jefesDisponibles}
      />
    </div>






  );
};

export default UsuariosPage;
