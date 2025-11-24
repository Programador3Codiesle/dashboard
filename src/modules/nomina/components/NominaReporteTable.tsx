import React from 'react';
import { INominaReporte } from '../types';
import { IErrorResponse } from '@/types/global';

interface NominaTableProps {
  reportes: INominaReporte[];
  isLoading: boolean;
  error: IErrorResponse | null;
}

export const NominaReporteTable: React.FC<NominaTableProps> = ({ reportes, isLoading, error }) => {
  if (isLoading) return (
    <div className="text-center py-10">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Cargando reportes de nómina...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Error:</strong>
      <span className="block sm:inline"> {error.message} (Código: {error.code})</span>
    </div>
  );

  if (reportes.length === 0) return <p className="text-center py-10 text-gray-500">No hay reportes de nómina disponibles.</p>;

  const formatCurrency = (amount: number) => `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  const getStatusClasses = (estado: INominaReporte['estado']) => {
    switch (estado) {
      case 'Pagado': return 'bg-green-100 text-green-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Revisión': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto shadow-xl rounded-xl">
      <table className="min-w-full bg-white">
        <thead className="bg-indigo-500 text-white">
          <tr>
            <th className="py-3 px-6 text-left">Período</th>
            <th className="py-3 px-6 text-left">Base</th>
            <th className="py-3 px-6 text-left">Deducciones</th>
            <th className="py-3 px-6 text-left">Bonos</th>
            <th className="py-3 px-6 text-left">Neto</th>
            <th className="py-3 px-6 text-center">Estado</th>
          </tr>
        </thead>
        <tbody>
          {reportes.map((reporte) => (
            <tr key={reporte.id} className="border-b hover:bg-gray-50 transition duration-150">
              <td className="py-3 px-6 text-sm text-gray-900">{reporte.periodo}</td>
              <td className="py-3 px-6 text-sm text-gray-700">{formatCurrency(reporte.montoBase)}</td>
              <td className="py-3 px-6 text-sm text-red-500">{formatCurrency(reporte.deducciones)}</td>
              <td className="py-3 px-6 text-sm text-green-500">{formatCurrency(reporte.bonos)}</td>
              <td className="py-3 px-6 text-sm font-semibold text-indigo-600">{formatCurrency(reporte.montoNeto)}</td>
              <td className="py-3 px-6 text-center">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusClasses(reporte.estado)}`}>
                  {reporte.estado}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
