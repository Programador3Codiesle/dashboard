import { useState, useCallback } from 'react';
import { usuariosService } from '../services/usuarios.service';
import { HorarioData } from '../types';
import { useToast } from '@/components/shared/ui/ToastContext';

export function useUsuarioActions() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showSuccess, showError } = useToast();

    const executeAction = useCallback(async (action: () => Promise<any>, successMessage?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await action();
            if (successMessage) {
                showSuccess(successMessage);
            }
            return true;
        } catch (err: any) {
            const message = err.message || 'Ocurrió un error inesperado';
            setError(message);
            showError(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [showSuccess, showError]);

    // ========== JEFES ==========
    const asignarJefe = useCallback((idEmpleado: string, jefeId: string) =>
        executeAction(
            () => usuariosService.asignarJefe(idEmpleado, jefeId),
            'Jefe asignado correctamente'
        ), [executeAction]);

    const eliminarJefe = useCallback((idEmpleado: string, jefeId: string) =>
        executeAction(
            () => usuariosService.eliminarJefe(idEmpleado, jefeId),
            'Jefe eliminado correctamente'
        ), [executeAction]);

    const crearJefeGeneral = useCallback((nit: string, email: string) =>
        executeAction(
            () => usuariosService.crearJefe(nit, email),
            'Jefe creado correctamente'
        ), [executeAction]);

    // ========== SEDES ==========
    const asignarSede = useCallback((usuarioId: string, idSede: string) =>
        executeAction(
            () => usuariosService.asignarSede(usuarioId, idSede),
            'Sede asignada correctamente'
        ), [executeAction]);

    const eliminarSede = useCallback((usuarioId: string, idSede: string) =>
        executeAction(
            () => usuariosService.eliminarSede(usuarioId, idSede),
            'Sede eliminada correctamente'
        ), [executeAction]);

    // ========== PERFILES ==========
    const updatePerfil = useCallback((usuarioId: string, perfilId: string) =>
        executeAction(
            () => usuariosService.updatePerfil(usuarioId, perfilId),
            'Perfil actualizado correctamente'
        ), [executeAction]);

    // ========== HORARIO ==========
    const asignarHorario = useCallback((nit: string, horario: HorarioData) =>
        executeAction(
            () => usuariosService.asignarHorario(nit, horario),
            'Horario guardado correctamente'
        ), [executeAction]);

    // ========== EMPRESAS ==========
    const asignarEmpresas = useCallback((usuarioNit: string, empresas: string[]) =>
        executeAction(
            () => usuariosService.asignarEmpresas(usuarioNit, empresas),
            'Empresas asignadas correctamente'
        ), [executeAction]);

    const eliminarEmpresas = useCallback((usuarioNit: string, empresas: string[]) =>
        executeAction(
            () => usuariosService.eliminarEmpresas(usuarioNit, empresas),
            'Empresas eliminadas correctamente'
        ), [executeAction]);

    // ========== USUARIOS ==========
    const crearUsuario = useCallback((nit: string, perfilId: string) =>
        executeAction(
            () => usuariosService.crearUsuario(nit, perfilId),
            'Usuario creado correctamente'
        ), [executeAction]);

    const habilitarUsuario = useCallback((usuarioId: string) =>
        executeAction(
            () => usuariosService.habilitarUsuario(usuarioId),
            'Usuario habilitado correctamente'
        ), [executeAction]);

    const deshabilitarUsuario = useCallback((usuarioId: string) =>
        executeAction(
            () => usuariosService.deshabilitarUsuario(usuarioId),
            'Usuario deshabilitado correctamente'
        ), [executeAction]);

    const resetPassword = useCallback((usuarioId: string, nit: string) =>
        executeAction(
            () => usuariosService.resetPassword(usuarioId, nit),
            'Contraseña actualizada correctamente'
        ), [executeAction]);

    // ========== OTROS ==========
    const toggleEstado = useCallback((usuarioId: number, nuevoEstado: 'Activo' | 'Inactivo') => {
        // nuevoEstado representa el estado al que queremos ir
        if (nuevoEstado === 'Activo') {
            return habilitarUsuario(usuarioId.toString());
        }
        return deshabilitarUsuario(usuarioId.toString());
    }, [habilitarUsuario, deshabilitarUsuario]);

    const deleteUsuario = useCallback((usuarioId: number) =>
        executeAction(
            () => usuariosService.deleteUsuario(usuarioId),
            'Usuario eliminado correctamente'
        ), [executeAction]);

    return {
        isLoading,
        error,
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
