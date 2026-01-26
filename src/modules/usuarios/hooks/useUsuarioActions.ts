import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService } from '../services/usuarios.service';
import { HorarioData, IHorarioApi } from '../types';
import { useToast } from '@/components/shared/ui/ToastContext';
import { USUARIOS_QUERY_KEY } from './useUsuarios';

/**
 * Hook de acciones de usuario con React Query Mutations
 * - Invalidación automática de caché después de cada mutación exitosa
 * - Manejo de errores centralizado
 * - Toast de feedback al usuario
 */
export function useUsuarioActions() {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useToast();

    // Función helper para invalidar y refetch inmediato de usuarios
    const invalidateUsuarios = useCallback(async () => {
        // Invalida y fuerza re-fetch inmediato
        await queryClient.invalidateQueries({ 
            queryKey: USUARIOS_QUERY_KEY,
            refetchType: 'all' // Fuerza re-fetch aunque la query no esté activa
        });
    }, [queryClient]);

    // ========== JEFES ==========
    const asignarJefeMutation = useMutation({
        mutationFn: ({ idEmpleado, jefeId }: { idEmpleado: string; jefeId: string }) =>
            usuariosService.asignarJefe(idEmpleado, jefeId),
        onSuccess: () => {
            showSuccess('Jefe asignado correctamente');
            invalidateUsuarios();
        },
        onError: (error: any) => {
            showError(error.message || 'Error al asignar jefe');
        },
    });

    const eliminarJefeMutation = useMutation({
        mutationFn: ({ idEmpleado, jefeId }: { idEmpleado: string; jefeId: string }) =>
            usuariosService.eliminarJefe(idEmpleado, jefeId),
        onSuccess: () => {
            showSuccess('Jefe eliminado correctamente');
            invalidateUsuarios();
        },
        onError: (error: any) => {
            showError(error.message || 'Error al eliminar jefe');
        },
    });

    const crearJefeMutation = useMutation({
        mutationFn: ({ nit, email }: { nit: string; email: string }) =>
            usuariosService.crearJefe(nit, email),
        onSuccess: () => {
            showSuccess('Jefe creado correctamente');
            invalidateUsuarios();
        },
        onError: (error: any) => {
            showError(error.message || 'Error al crear jefe');
        },
    });

    // ========== SEDES ==========
    const asignarSedeMutation = useMutation({
        mutationFn: ({ usuarioId, idSede }: { usuarioId: string; idSede: string }) =>
            usuariosService.asignarSede(usuarioId, idSede),
        onSuccess: () => {
            showSuccess('Sede asignada correctamente');
            invalidateUsuarios();
        },
        onError: (error: any) => {
            showError(error.message || 'Error al asignar sede');
        },
    });

    const eliminarSedeMutation = useMutation({
        mutationFn: ({ usuarioId, idSede }: { usuarioId: string; idSede: string }) =>
            usuariosService.eliminarSede(usuarioId, idSede),
        onSuccess: () => {
            showSuccess('Sede eliminada correctamente');
            invalidateUsuarios();
        },
        onError: (error: any) => {
            showError(error.message || 'Error al eliminar sede');
        },
    });

    // ========== PERFILES ==========
    const updatePerfilMutation = useMutation({
        mutationFn: ({ usuarioId, perfilId }: { usuarioId: string; perfilId: string }) =>
            usuariosService.updatePerfil(usuarioId, perfilId),
        onSuccess: () => {
            showSuccess('Perfil actualizado correctamente');
            invalidateUsuarios();
        },
        onError: (error: any) => {
            showError(error.message || 'Error al actualizar perfil');
        },
    });

    // ========== HORARIO ==========
    const asignarHorarioMutation = useMutation({
        mutationFn: ({ nit, horario }: { nit: string; horario: HorarioData }) => {
            const payload: IHorarioApi = { nit_empleado: parseInt(nit, 10), ...horario };
            return usuariosService.asignarHorario(nit, payload);
        },
        onSuccess: () => {
            showSuccess('Horario guardado correctamente');
            invalidateUsuarios();
        },
        onError: (error: any) => {
            showError(error.message || 'Error al guardar horario');
        },
    });

    // ========== EMPRESAS ==========
    const asignarEmpresasMutation = useMutation({
        mutationFn: ({ usuarioNit, empresas }: { usuarioNit: string; empresas: string[] }) =>
            usuariosService.asignarEmpresas(usuarioNit, empresas),
        onSuccess: () => {
            showSuccess('Empresas asignadas correctamente');
            // NO hacer invalidateUsuarios() - el componente ya hizo optimistic update
        },
        onError: (error: any) => {
            showError(error.message || 'Error al asignar empresas');
            // El componente se encarga de revertir el optimistic update si falla
        },
    });

    const eliminarEmpresasMutation = useMutation({
        mutationFn: ({ usuarioNit, empresas }: { usuarioNit: string; empresas: string[] }) =>
            usuariosService.eliminarEmpresas(usuarioNit, empresas),
        onSuccess: () => {
            showSuccess('Empresas eliminadas correctamente');
            // NO hacer invalidateUsuarios() - el componente ya hizo optimistic update
        },
        onError: (error: any) => {
            showError(error.message || 'Error al eliminar empresas');
            // El componente se encarga de revertir el optimistic update si falla
        },
    });

    // ========== USUARIOS ==========
    const crearUsuarioMutation = useMutation({
        mutationFn: ({ nit, perfilId }: { nit: string; perfilId: string }) =>
            usuariosService.crearUsuario(nit, perfilId),
        onSuccess: () => {
            showSuccess('Usuario creado correctamente');
            invalidateUsuarios();
        },
        onError: (error: any) => {
            showError(error.message || 'Error al crear usuario');
        },
    });

    const habilitarUsuarioMutation = useMutation({
        mutationFn: (usuarioId: string) => usuariosService.habilitarUsuario(usuarioId),
        onSuccess: () => {
            showSuccess('Usuario habilitado correctamente');
            // NO hacer invalidateUsuarios() - el componente ya hizo optimistic update
        },
        onError: (error: any) => {
            showError(error.message || 'Error al habilitar usuario');
            // El componente se encarga de revertir el optimistic update si falla
        },
    });

    const deshabilitarUsuarioMutation = useMutation({
        mutationFn: (usuarioId: string) => usuariosService.deshabilitarUsuario(usuarioId),
        onSuccess: () => {
            showSuccess('Usuario deshabilitado correctamente');
            // NO hacer invalidateUsuarios() - el componente ya hizo optimistic update
        },
        onError: (error: any) => {
            showError(error.message || 'Error al deshabilitar usuario');
            // El componente se encarga de revertir el optimistic update si falla
        },
    });

    const resetPasswordMutation = useMutation({
        mutationFn: ({ usuarioId, nit }: { usuarioId: string; nit: string }) =>
            usuariosService.resetPassword(usuarioId, nit),
        onSuccess: () => {
            showSuccess('Contraseña actualizada correctamente');
        },
        onError: (error: any) => {
            showError(error.message || 'Error al actualizar contraseña');
        },
    });

    const deleteUsuarioMutation = useMutation({
        mutationFn: (usuarioId: number) => usuariosService.deleteUsuario(usuarioId),
        onSuccess: () => {
            showSuccess('Usuario eliminado correctamente');
            invalidateUsuarios();
        },
        onError: (error: any) => {
            showError(error.message || 'Error al eliminar usuario');
        },
    });

    // ========== FUNCIONES WRAPPER (mantener API compatible) ==========
    const asignarJefe = useCallback(async (idEmpleado: string, jefeId: string) => {
        try {
            await asignarJefeMutation.mutateAsync({ idEmpleado, jefeId });
            return true;
        } catch {
            return false;
        }
    }, [asignarJefeMutation]);

    const eliminarJefe = useCallback(async (idEmpleado: string, jefeId: string) => {
        try {
            await eliminarJefeMutation.mutateAsync({ idEmpleado, jefeId });
            return true;
        } catch {
            return false;
        }
    }, [eliminarJefeMutation]);

    const crearJefeGeneral = useCallback(async (nit: string, email: string) => {
        try {
            await crearJefeMutation.mutateAsync({ nit, email });
            return true;
        } catch {
            return false;
        }
    }, [crearJefeMutation]);

    const asignarSede = useCallback(async (usuarioId: string, idSede: string) => {
        try {
            await asignarSedeMutation.mutateAsync({ usuarioId, idSede });
            return true;
        } catch {
            return false;
        }
    }, [asignarSedeMutation]);

    const eliminarSede = useCallback(async (usuarioId: string, idSede: string) => {
        try {
            await eliminarSedeMutation.mutateAsync({ usuarioId, idSede });
            return true;
        } catch {
            return false;
        }
    }, [eliminarSedeMutation]);

    const updatePerfil = useCallback(async (usuarioId: string, perfilId: string) => {
        try {
            await updatePerfilMutation.mutateAsync({ usuarioId, perfilId });
            return true;
        } catch {
            return false;
        }
    }, [updatePerfilMutation]);

    const asignarHorario = useCallback(async (nit: string, horario: HorarioData) => {
        try {
            await asignarHorarioMutation.mutateAsync({ nit, horario });
            return true;
        } catch {
            return false;
        }
    }, [asignarHorarioMutation]);

    const asignarEmpresas = useCallback(async (usuarioNit: string, empresas: string[]) => {
        try {
            await asignarEmpresasMutation.mutateAsync({ usuarioNit, empresas });
            return true;
        } catch {
            return false;
        }
    }, [asignarEmpresasMutation]);

    const eliminarEmpresas = useCallback(async (usuarioNit: string, empresas: string[]) => {
        try {
            await eliminarEmpresasMutation.mutateAsync({ usuarioNit, empresas });
            return true;
        } catch {
            return false;
        }
    }, [eliminarEmpresasMutation]);

    const crearUsuario = useCallback(async (nit: string, perfilId: string) => {
        try {
            await crearUsuarioMutation.mutateAsync({ nit, perfilId });
            return true;
        } catch {
            return false;
        }
    }, [crearUsuarioMutation]);

    const habilitarUsuario = useCallback(async (usuarioId: string) => {
        try {
            await habilitarUsuarioMutation.mutateAsync(usuarioId);
            return true;
        } catch {
            return false;
        }
    }, [habilitarUsuarioMutation]);

    const deshabilitarUsuario = useCallback(async (usuarioId: string) => {
        try {
            await deshabilitarUsuarioMutation.mutateAsync(usuarioId);
            return true;
        } catch {
            return false;
        }
    }, [deshabilitarUsuarioMutation]);

    const resetPassword = useCallback(async (usuarioId: string, nit: string) => {
        try {
            await resetPasswordMutation.mutateAsync({ usuarioId, nit });
            return true;
        } catch {
            return false;
        }
    }, [resetPasswordMutation]);

    const toggleEstado = useCallback(async (usuarioId: number, nuevoEstado: 'Activo' | 'Inactivo') => {
        if (nuevoEstado === 'Activo') {
            return habilitarUsuario(usuarioId.toString());
        }
        return deshabilitarUsuario(usuarioId.toString());
    }, [habilitarUsuario, deshabilitarUsuario]);

    const deleteUsuario = useCallback(async (usuarioId: number) => {
        try {
            await deleteUsuarioMutation.mutateAsync(usuarioId);
            return true;
        } catch {
            return false;
        }
    }, [deleteUsuarioMutation]);

    // Estado de carga global
    const isLoading = 
        asignarJefeMutation.isPending ||
        eliminarJefeMutation.isPending ||
        crearJefeMutation.isPending ||
        asignarSedeMutation.isPending ||
        eliminarSedeMutation.isPending ||
        updatePerfilMutation.isPending ||
        asignarHorarioMutation.isPending ||
        asignarEmpresasMutation.isPending ||
        eliminarEmpresasMutation.isPending ||
        crearUsuarioMutation.isPending ||
        habilitarUsuarioMutation.isPending ||
        deshabilitarUsuarioMutation.isPending ||
        resetPasswordMutation.isPending ||
        deleteUsuarioMutation.isPending;

    return {
        isLoading,
        error: null,
        // Jefes
        asignarJefe,
        eliminarJefe,
        crearJefeGeneral,
        // Sedes
        asignarSede,
        eliminarSede,
        // Perfiles
        updatePerfil,
        // Horario
        asignarHorario,
        // Empresas
        asignarEmpresas,
        eliminarEmpresas,
        // Usuarios
        crearUsuario,
        habilitarUsuario,
        deshabilitarUsuario,
        resetPassword,
        // Otros
        toggleEstado,
        deleteUsuario,
    };
}
