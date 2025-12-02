import { useState } from 'react';
import { usuariosService } from '../services/usuarios.service';
import { IUsuario, HorarioData } from '../types';

export function useUsuarioActions() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const executeAction = async (action: () => Promise<any>, successMessage?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await action();
            if (successMessage) {
                // Aquí podrías usar un toast notification
                console.log(successMessage);
            }
            return true;
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updateUsuario = (usuario: IUsuario) =>
        executeAction(() => usuariosService.updateUsuario(usuario), 'Usuario actualizado correctamente');

    const asignarSedes = (usuarioId: number, sedes: string[]) =>
        executeAction(() => usuariosService.asignarSedes(usuarioId, sedes), 'Sedes asignadas correctamente');

    const asignarJefe = (usuarioId: number, jefeId: number) =>
        executeAction(() => usuariosService.asignarJefe(usuarioId, jefeId), 'Jefe asignado correctamente');

    const asignarHorario = (usuarioId: number, horario: HorarioData) =>
        executeAction(() => usuariosService.asignarHorario(usuarioId, horario), 'Horario guardado correctamente');

    const asignarEmpresas = (usuarioId: number, empresas: string[]) =>
        executeAction(() => usuariosService.asignarEmpresas(usuarioId, empresas), 'Empresas asignadas correctamente');

    const toggleEstado = (usuarioId: number, nuevoEstado: 'Activo' | 'Inactivo') =>
        executeAction(() => usuariosService.toggleEstado(usuarioId, nuevoEstado), `Usuario ${nuevoEstado === 'Activo' ? 'activado' : 'desactivado'} correctamente`);

    const deleteUsuario = (usuarioId: number) =>
        executeAction(() => usuariosService.deleteUsuario(usuarioId), 'Usuario eliminado correctamente');

    return {
        isLoading,
        error,
        updateUsuario,
        asignarSedes,
        asignarJefe,
        asignarHorario,
        asignarEmpresas,
        toggleEstado,
        deleteUsuario
    };
}
