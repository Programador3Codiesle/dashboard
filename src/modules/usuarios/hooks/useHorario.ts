import { useState, useEffect, useCallback, useRef } from 'react';
import { usuariosService } from '../services/usuarios.service';
import { IHorarioApi } from '../types';
import { IErrorResponse } from '@/types/global';

export const useHorarioUsuario = (nit: string | undefined, enabled: boolean = true) => {
  const [horario, setHorario] = useState<IHorarioApi | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<IErrorResponse | null>(null);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchHorario = useCallback(async () => {
    if (!nit || !enabled) {
      if (!enabled) return;
      setHorario(null);
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
      const data = await usuariosService.getHorario(nit);

      // Solo actualizar estado si el componente sigue montado y no se canceló la petición
      if (mountedRef.current && !abortController.signal.aborted) {
        setHorario(data);
      }
    } catch (err: any) {
      // Ignorar errores de cancelación
      if (err.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }
      if (mountedRef.current && !abortController.signal.aborted) {
        setError({ 
          message: err.message || 'Error al cargar horario del usuario', 
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
      fetchHorario();
    }

    // Cleanup: marcar como desmontado y cancelar petición pendiente
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchHorario]);

  const refetch = useCallback(() => {
    if (nit && mountedRef.current) {
      fetchHorario();
    }
  }, [nit, fetchHorario]);

  return { horario, isLoading, error, refetch };
};

