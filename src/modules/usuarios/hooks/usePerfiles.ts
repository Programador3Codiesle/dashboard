import { useState, useEffect, useCallback, useRef } from 'react';
import { usuariosService } from '../services/usuarios.service';
import { IPerfil } from '../types';
import { IErrorResponse } from '@/types/global';

export const usePerfiles = () => {
  const [perfiles, setPerfiles] = useState<IPerfil[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<IErrorResponse | null>(null);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController para esta petición
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const fetchPerfiles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await usuariosService.getPerfiles();

        // Solo actualizar estado si el componente sigue montado y no se canceló la petición
        if (mountedRef.current && !abortController.signal.aborted) {
          setPerfiles(data);
        }
      } catch (err: any) {
        // Ignorar errores de cancelación
        if (err.name === 'AbortError' || abortController.signal.aborted) {
          return;
        }
        if (mountedRef.current && !abortController.signal.aborted) {
          setError({ 
            message: err.message || 'Error al cargar perfiles', 
            code: 500 
          });
        }
      } finally {
        if (mountedRef.current && !abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchPerfiles();

    // Cleanup: marcar como desmontado y cancelar petición pendiente
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { perfiles, isLoading, error };
};

export const usePerfilUsuario = (nit: string | undefined, enabled: boolean = true) => {
  const [perfil, setPerfil] = useState<IPerfil | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<IErrorResponse | null>(null);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPerfil = useCallback(async () => {
    if (!nit || !enabled) {
      if (!enabled) return;
      setPerfil(null);
      return;
    }

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController para esta petición
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    setError(null);

    try {
      const data = await usuariosService.getPerfilUsuario(nit);

      // Solo actualizar estado si el componente sigue montado y no se canceló la petición
      if (mountedRef.current && !abortController.signal.aborted) {
        setPerfil(data.length > 0 ? data[0] : null);
      }
    } catch (err: any) {
      // Ignorar errores de cancelación
      if (err.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }
      if (mountedRef.current && !abortController.signal.aborted) {
        setError({ 
          message: err.message || 'Error al cargar perfil del usuario', 
          code: 500 
        });
      }
    } finally {
      if (mountedRef.current && !abortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [nit, enabled]);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) {
      fetchPerfil();
    }

    // Cleanup: marcar como desmontado y cancelar petición pendiente
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchPerfil]);

  const refetch = useCallback(() => {
    if (nit && mountedRef.current) {
      fetchPerfil();
    }
  }, [nit, fetchPerfil]);

  return { perfil, isLoading, error, refetch };
};

