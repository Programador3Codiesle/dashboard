import { useState, useEffect, useCallback } from 'react';
import { usuariosService } from '../services/usuarios.service';
import { IHorarioApi } from '../types';
import { IErrorResponse } from '@/types/global';

export const useHorarioUsuario = (nit: string | undefined) => {
  const [horario, setHorario] = useState<IHorarioApi | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<IErrorResponse | null>(null);

  const fetchHorario = useCallback(async () => {
    if (!nit) {
      setHorario(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await usuariosService.getHorario(nit);
      setHorario(data);
    } catch (err: any) {
      setError({ 
        message: err.message || 'Error al cargar horario del usuario', 
        code: 500 
      });
    } finally {
      setIsLoading(false);
    }
  }, [nit]);

  useEffect(() => {
    fetchHorario();
  }, [fetchHorario]);

  const refetch = useCallback(() => {
    if (nit) {
      setIsLoading(true);
      usuariosService.getHorario(nit)
        .then(setHorario)
        .catch((err: any) => {
          setError({ message: err.message || 'Error al cargar horario', code: 500 });
        })
        .finally(() => setIsLoading(false));
    }
  }, [nit]);

  return { horario, isLoading, error, refetch };
};

