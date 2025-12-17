import { useState, useEffect, useCallback } from 'react';
import { usuariosService } from '../services/usuarios.service';
import { ISede } from '../types';
import { IErrorResponse } from '@/types/global';

export const useSedes = () => {
  const [sedes, setSedes] = useState<ISede[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<IErrorResponse | null>(null);

  useEffect(() => {
    const fetchSedes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await usuariosService.getSedes();
        setSedes(data);
      } catch (err: any) {
        setError({ 
          message: err.message || 'Error al cargar sedes', 
          code: 500 
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSedes();
  }, []);

  return { sedes, isLoading, error };
};

export const useSedesUsuario = (usuarioId: string | undefined) => {
  const [sedes, setSedes] = useState<{ id: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<IErrorResponse | null>(null);

  const fetchSedes = useCallback(async () => {
    if (!usuarioId) {
      setSedes([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await usuariosService.getSedesUsuario(usuarioId);
      setSedes(data);
    } catch (err: any) {
      setError({ 
        message: err.message || 'Error al cargar sedes del usuario', 
        code: 500 
      });
    } finally {
      setIsLoading(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    fetchSedes();
  }, [fetchSedes]);

  const refetch = useCallback(() => {
    if (usuarioId) {
      setIsLoading(true);
      usuariosService.getSedesUsuario(usuarioId)
        .then(setSedes)
        .catch((err: any) => {
          setError({ message: err.message || 'Error al cargar sedes', code: 500 });
        })
        .finally(() => setIsLoading(false));
    }
  }, [usuarioId]);

  return { sedes, isLoading, error, refetch };
};

