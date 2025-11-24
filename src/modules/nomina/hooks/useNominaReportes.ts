import { useState, useEffect } from 'react';
import { INominaReporte } from '../types';
import { IErrorResponse } from '@/types/global';

const MOCK_NOMINA_DATA: INominaReporte[] = [
  { id: 1, periodo: '2025-05-15', montoBase: 2500, deducciones: 300, bonos: 150, montoNeto: 2350, estado: 'Pagado' },
  { id: 2, periodo: '2025-05-30', montoBase: 2500, deducciones: 300, bonos: 0, montoNeto: 2200, estado: 'Pendiente' },
  { id: 3, periodo: '2025-06-15', montoBase: 2600, deducciones: 320, bonos: 200, montoNeto: 2480, estado: 'Revisión' },
];

export const useNominaReportes = () => {
  const [reportes, setReportes] = useState<INominaReporte[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<IErrorResponse | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setReportes(MOCK_NOMINA_DATA);
      } catch {
        setError({ message: 'Error al cargar reportes de nómina', code: 500 });
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  return { reportes, isLoading, error };
};
