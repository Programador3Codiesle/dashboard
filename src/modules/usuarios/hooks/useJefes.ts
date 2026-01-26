import { useState, useEffect, useCallback, useRef } from 'react';
import { usuariosService } from '../services/usuarios.service';
import { IJefe } from '../types';
import { IErrorResponse } from '@/types/global';

export const useJefes = () => {
  const [jefes, setJefes] = useState<IJefe[]>([]);
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

    const fetchJefes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await usuariosService.getJefes();

        // Solo actualizar estado si el componente sigue montado y no se canceló la petición
        if (mountedRef.current && !abortController.signal.aborted) {
          setJefes(data);
        }
      } catch (err: any) {
        // Ignorar errores de cancelación
        if (err.name === 'AbortError' || abortController.signal.aborted) {
          return;
        }
        if (mountedRef.current && !abortController.signal.aborted) {
          setError({ 
            message: err.message || 'Error al cargar jefes', 
            code: 500 
          });
        }
      } finally {
        if (mountedRef.current && !abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchJefes();

    // Cleanup: marcar como desmontado y cancelar petición pendiente
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { jefes, isLoading, error };
};

export const useJefesUsuario = (idEmpleado: string | undefined, enabled: boolean = true) => {
  const [jefes, setJefes] = useState<IJefe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<IErrorResponse | null>(null);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchJefes = useCallback(async () => {
    if (!idEmpleado || !enabled) {
      if (!enabled) return; // Si no está habilitado, no limpiar datos
      setJefes([]);
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
      const data = await usuariosService.getJefesUsuario(idEmpleado);

      // Solo actualizar estado si el componente sigue montado y no se canceló la petición
      if (mountedRef.current && !abortController.signal.aborted) {
        setJefes(data);
      }
    } catch (err: any) {
      // Ignorar errores de cancelación
      if (err.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }
      if (mountedRef.current && !abortController.signal.aborted) {
        setError({ 
          message: err.message || 'Error al cargar jefes del usuario', 
          code: 500 
        });
      }
    } finally {
      if (mountedRef.current && !abortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [idEmpleado, enabled]);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) {
      fetchJefes();
    }

    // Cleanup: marcar como desmontado y cancelar petición pendiente
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchJefes]);

  const refetch = useCallback(() => {
    if (idEmpleado && mountedRef.current) {
      fetchJefes();
    }
  }, [idEmpleado, fetchJefes]);

  return { jefes, isLoading, error, refetch };
};

