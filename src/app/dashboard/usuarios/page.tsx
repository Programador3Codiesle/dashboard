'use client';

import React from 'react';
import { UsuariosTable } from '@/components/usuarios/UsuariosTable';
import { Button } from '@/components/shared/atoms/Button';
import { ReceiptText } from 'lucide-react';

const UsuariosPage: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Usuarios</h2>
      <div className="mb-4 flex justify-end">
        <Button variant="primary" className="flex items-center">
          <ReceiptText size={16} className="mr-2" />
          Registrar
        </Button>
        <Button variant="primary" className="flex items-center ml-2">
          <ReceiptText size={16} className="mr-2" />
          Jefes
        </Button>
      </div>
      <UsuariosTable />
      <p className="mt-8 text-sm text-gray-500">
        *Datos mostrados utilizando la lógica quemada (mock data) de `/modules/usuarios/hooks`.
      </p>
    </div>
  );
};

export default UsuariosPage;
