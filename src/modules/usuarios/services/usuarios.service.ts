import { IUsuario, HorarioData } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const usuariosService = {
    async updateUsuario(usuario: IUsuario): Promise<IUsuario> {
        const response = await fetch(`${API_URL}/usuarios/${usuario.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuario),
        });
        if (!response.ok) throw new Error('Error al actualizar usuario');
        return response.json();
    },

    async asignarSedes(usuarioId: number, sedes: string[]): Promise<void> {
        const response = await fetch(`${API_URL}/usuarios/${usuarioId}/sedes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sedes }),
        });
        if (!response.ok) throw new Error('Error al asignar sedes');
    },

    async asignarJefe(usuarioId: number, jefeId: number): Promise<void> {
        const response = await fetch(`${API_URL}/usuarios/${usuarioId}/jefe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jefeId }),
        });
        if (!response.ok) throw new Error('Error al asignar jefe');
    },

    async asignarHorario(usuarioId: number, horario: HorarioData): Promise<void> {
        const response = await fetch(`${API_URL}/usuarios/${usuarioId}/horario`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(horario),
        });
        if (!response.ok) throw new Error('Error al asignar horario');
    },

    async asignarEmpresas(usuarioId: number, empresas: string[]): Promise<void> {
        const response = await fetch(`${API_URL}/usuarios/${usuarioId}/empresas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ empresas }),
        });
        if (!response.ok) throw new Error('Error al asignar empresas');
    },

    async toggleEstado(usuarioId: number, estado: 'Activo' | 'Inactivo'): Promise<void> {
        const response = await fetch(`${API_URL}/usuarios/${usuarioId}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado }),
        });
        if (!response.ok) throw new Error('Error al cambiar estado');
    },

    async deleteUsuario(usuarioId: number): Promise<void> {
        const response = await fetch(`${API_URL}/usuarios/${usuarioId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar usuario');
    }
};
