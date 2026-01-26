import { useState, useEffect, useCallback, useRef } from 'react';
import { usuariosService } from '../services/usuarios.service';
import { ISede } from '../types';
import { IErrorResponse } from '@/types/global';

export const useSedes = () => {
  const [sedes, setSedes] = useState<ISede[]>([]);
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

    const fetchSedes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await usuariosService.getSedes();

        // Solo actualizar estado si el componente sigue montado y no se canceló la petición
        if (mountedRef.current && !abortController.signal.aborted) {
          setSedes(data);
        }
      } catch (err: any) {
        // Ignorar errores de cancelación
        if (err.name === 'AbortError' || abortController.signal.aborted) {
          return;
        }
        if (mountedRef.current && !abortController.signal.aborted) {
          setError({ 
            message: err.message || 'Error al cargar sedes', 
            code: 500 
          });
        }
      } finally {
        if (mountedRef.current && !abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchSedes();

    // Cleanup: marcar como desmontado y cancelar petición pendiente
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { sedes, isLoading, error };
};

export const useSedesUsuario = (usuarioId: string | undefined, enabled: boolean = true) => {
  const [sedes, setSedes] = useState<{ id: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<IErrorResponse | null>(null);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSedes = useCallback(async () => {
    if (!usuarioId || !enabled) {
      if (!enabled) return;
      setSedes([]);
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
      const data = await usuariosService.getSedesUsuario(usuarioId);

      // Solo actualizar estado si el componente sigue montado y no se canceló la petición
      if (mountedRef.current && !abortController.signal.aborted) {
        setSedes(data);
      }
    } catch (err: any) {
      // Ignorar errores de cancelación
      if (err.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }
      if (mountedRef.current && !abortController.signal.aborted) {
        setError({ 
          message: err.message || 'Error al cargar sedes del usuario', 
          code: 500 
        });
      }
    } finally {
      if (mountedRef.current && !abortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [usuarioId, enabled]);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) {
      fetchSedes();
    }

    // Cleanup: marcar como desmontado y cancelar petición pendiente
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchSedes]);

  const refetch = useCallback(() => {
    if (usuarioId && mountedRef.current) {
      fetchSedes();
    }
  }, [usuarioId, fetchSedes]);

  return { sedes, isLoading, error, refetch };
};

