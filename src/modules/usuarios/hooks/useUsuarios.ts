import { useState, useEffect, useCallback } from 'react';
import { IUsuario } from '@/modules/usuarios/types';
import { IErrorResponse } from '@/types/global';
import { usuariosService } from '../services/usuarios.service';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<IErrorResponse | null>(null);

  const fetchUsuarios = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await usuariosService.getUsuarios();
      setUsuarios(data);
    } catch (err: any) {
      setError({
        message: err.message || 'Error al cargar usuarios',
        code: 500
      });
    } finally {
      setTimeout(() => setIsLoading(false), 200); // pequeña pausa para mejor UX
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  return { usuarios, isLoading, error, refetch: fetchUsuarios, setUsuarios };
};
