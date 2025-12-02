'use client';

import React from 'react';
import { useNominaReportes } from '@/modules/nomina/hooks/useNominaReportes';
import { NominaReporteTable } from '@/components/nomina/NominaReporteTable';
import { Button } from '@/components/shared/atoms/Button';
import { ReceiptText } from 'lucide-react';

const NominaPage: React.FC = () => {
  const { reportes, isLoading, error } = useNominaReportes();

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Reportes de Pago</h2>
      <div className="mb-4 flex justify-end">
        <Button variant="primary" className="flex items-center">
          <ReceiptText size={16} className="mr-2" />
          Generar Nuevo Reporte
        </Button>
      </div>
      <NominaReporteTable reportes={reportes} isLoading={isLoading} error={error} />
      <p className="mt-8 text-sm text-gray-500">
        *Datos mostrados utilizando la lógica quemada (mock data) de `/modules/nomina/hooks`.
      </p>
    </div>
  );
};

export default NominaPage;
