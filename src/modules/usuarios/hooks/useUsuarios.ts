import { useState, useEffect, useCallback, useRef } from 'react';
import { IUsuario } from '@/modules/usuarios/types';
import { IErrorResponse } from '@/types/global';
import { usuariosService } from '../services/usuarios.service';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<IErrorResponse | null>(null);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchUsuarios = useCallback(async () => {
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
      const data = await usuariosService.getUsuarios();

      // Solo actualizar estado si el componente sigue montado y no se canceló la petición
      if (mountedRef.current && !abortController.signal.aborted) {
        setUsuarios(data);
      }
    } catch (err: any) {
      // Ignorar errores de cancelación
      if (err.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }
      if (mountedRef.current && !abortController.signal.aborted) {
        setError({
          message: err.message || 'Error al cargar usuarios',
          code: 500
        });
      }
    } finally {
      if (mountedRef.current && !abortController.signal.aborted) {
        setTimeout(() => setIsLoading(false), 200); // pequeña pausa para mejor UX
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchUsuarios();

    // Cleanup: marcar como desmontado y cancelar petición pendiente
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchUsuarios]);

  return { usuarios, isLoading, error, refetch: fetchUsuarios, setUsuarios };
};
