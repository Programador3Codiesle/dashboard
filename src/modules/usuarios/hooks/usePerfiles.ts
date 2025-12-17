import { useState, useEffect, useCallback } from 'react';
import { usuariosService } from '../services/usuarios.service';
import { IPerfil } from '../types';
import { IErrorResponse } from '@/types/global';

export const usePerfiles = () => {
  const [perfiles, setPerfiles] = useState<IPerfil[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<IErrorResponse | null>(null);

  useEffect(() => {
    const fetchPerfiles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await usuariosService.getPerfiles();
        setPerfiles(data);
      } catch (err: any) {
        setError({ 
          message: err.message || 'Error al cargar perfiles', 
          code: 500 
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPerfiles();
  }, []);

  return { perfiles, isLoading, error };
};

export const usePerfilUsuario = (nit: string | undefined) => {
  const [perfil, setPerfil] = useState<IPerfil | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<IErrorResponse | null>(null);

  const fetchPerfil = useCallback(async () => {
    if (!nit) {
      setPerfil(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await usuariosService.getPerfilUsuario(nit);
      setPerfil(data.length > 0 ? data[0] : null);
    } catch (err: any) {
      setError({ 
        message: err.message || 'Error al cargar perfil del usuario', 
        code: 500 
      });
    } finally {
      setIsLoading(false);
    }
  }, [nit]);

  useEffect(() => {
    fetchPerfil();
  }, [fetchPerfil]);

  const refetch = useCallback(() => {
    if (nit) {
      setIsLoading(true);
      usuariosService.getPerfilUsuario(nit)
        .then((data) => {
          setPerfil(data.length > 0 ? data[0] : null);
        })
        .catch((err: any) => {
          setError({ message: err.message || 'Error al cargar perfil', code: 500 });
        })
        .finally(() => setIsLoading(false));
    }
  }, [nit]);

  return { perfil, isLoading, error, refetch };
};

