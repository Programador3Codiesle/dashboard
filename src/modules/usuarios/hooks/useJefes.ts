import { useState, useEffect, useCallback } from 'react';
import { usuariosService } from '../services/usuarios.service';
import { IJefe } from '../types';
import { IErrorResponse } from '@/types/global';

export const useJefes = () => {
  const [jefes, setJefes] = useState<IJefe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<IErrorResponse | null>(null);

  useEffect(() => {
    const fetchJefes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await usuariosService.getJefes();
        setJefes(data);
      } catch (err: any) {
        setError({ 
          message: err.message || 'Error al cargar jefes', 
          code: 500 
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchJefes();
  }, []);

  return { jefes, isLoading, error };
};

export const useJefesUsuario = (idEmpleado: string | undefined) => {
  const [jefes, setJefes] = useState<IJefe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<IErrorResponse | null>(null);

  const fetchJefes = useCallback(async () => {
    if (!idEmpleado) {
      setJefes([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await usuariosService.getJefesUsuario(idEmpleado);
      setJefes(data);
    } catch (err: any) {
      setError({ 
        message: err.message || 'Error al cargar jefes del usuario', 
        code: 500 
      });
    } finally {
      setIsLoading(false);
    }
  }, [idEmpleado]);

  useEffect(() => {
    fetchJefes();
  }, [fetchJefes]);

  const refetch = useCallback(() => {
    if (idEmpleado) {
      setIsLoading(true);
      usuariosService.getJefesUsuario(idEmpleado)
        .then(setJefes)
        .catch((err: any) => {
          setError({ message: err.message || 'Error al cargar jefes', code: 500 });
        })
        .finally(() => setIsLoading(false));
    }
  }, [idEmpleado]);

  return { jefes, isLoading, error, refetch };
};

