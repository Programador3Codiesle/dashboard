import {
    IUsuario,
    IUsuarioAPI,
    HorarioData,
    IJefe,
    IJefeGeneral,
    ISede,
    IPerfil,
    IHorarioApi,
    IUsuarioJefeCandidato,
    IApiMessageResponse
} from "../types";
import { fetchWithAuth } from "@/utils/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const usuariosService = {
    async getUsuarios(page: number = 1, limit: number = 1500): Promise<IUsuario[]> {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        const response = await fetchWithAuth(`${API_URL}/usuarios?${params}`, {
            method: 'GET',
        });
        if (!response.ok) throw new Error('Error al cargar usuarios');
        const data: IUsuarioAPI[] = await response.json();
        
        // Mapear la respuesta de la API al formato esperado por el componente
        return data.map((usuario) => {

            const rawEstado = usuario.estado;
            const isActivo =
                rawEstado === 'ACTIVO' ||
                rawEstado === '1' ||
                rawEstado === 1 as any;

            return {
                id: parseInt(usuario.id, 10),
                idEmpleado: usuario.id_empleado,
                nombre: usuario.nombresCompletos,
                usuario: parseInt(usuario.nit, 10) || 0,
                totalMarca: usuario.empresasNombresArray?.length || 0,
                marcas: usuario.empresasNombresArray || [],
                sede: usuario.sede || '',
                estado: isActivo ? 'Activo' : 'Inactivo',
                perfil: usuario.perfil,
                nit: usuario.nit,
                empresas: usuario.empresasArray || [],
            };
        });
    },

    // ========== JEFES ==========
    async getJefes(): Promise<IJefe[]> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/jefes`, {
            method: 'GET',
        });
        if (!response.ok) throw new Error('Error al cargar jefes');
        return response.json();
    },

    async getMisJefes(): Promise<IJefe[]> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/mis-jefes`, {
            method: 'GET',
        });
        if (!response.ok) throw new Error('Error al cargar jefes del usuario');
        return response.json();
    },

    async getJefesUsuario(idEmpleado: string): Promise<IJefe[]> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/${idEmpleado}/jefes`, {
            method: 'GET',
        });
        if (!response.ok) throw new Error('Error al cargar jefes del usuario');
        return response.json();
    },

    async asignarJefe(idEmpleado: string, jefeId: string): Promise<IJefe> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/${idEmpleado}/asignar-jefe`, {
            method: 'POST',
            body: JSON.stringify({ jefeId }),
        });
        if (!response.ok) throw new Error('Error al asignar jefe');
        return response.json();
    },

    async eliminarJefe(idEmpleado: string, jefeId: string): Promise<IJefe> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/${idEmpleado}/eliminar-jefe`, {
            method: 'DELETE',
            body: JSON.stringify({ jefeId }),
        });
        if (!response.ok) throw new Error('Error al eliminar jefe');
        return response.json();
    },

    // ========== SEDES ==========
    async getSedes(): Promise<ISede[]> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/sedes`, {
            method: 'GET',
        });
        if (!response.ok) throw new Error('Error al cargar sedes');
        return response.json();
    },

    async getSedesUsuario(usuarioId: string): Promise<{ id: string }[]> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/${usuarioId}/sedes`, {
            method: 'GET',
        });
        if (!response.ok) throw new Error('Error al cargar sedes del usuario');
        return response.json();
    },

    async asignarSede(usuarioId: string, idSede: string): Promise<ISede> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/${usuarioId}/asignar-sede`, {
            method: 'POST',
            body: JSON.stringify({ idSede }),
        });
        if (!response.ok) throw new Error('Error al asignar sede');
        return response.json();
    },

    async eliminarSede(usuarioId: string, idSede: string): Promise<ISede> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/${usuarioId}/eliminar-sede`, {
            method: 'DELETE',
            body: JSON.stringify({ idSede }),
        });
        if (!response.ok) throw new Error('Error al eliminar sede');
        return response.json();
    },

    // ========== PERFILES ==========
    async getPerfiles(): Promise<IPerfil[]> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/perfiles`, {
            method: 'GET',
        });
        if (!response.ok) throw new Error('Error al cargar perfiles');
        return response.json();
    },

    async getPerfilUsuario(nit: string): Promise<IPerfil[]> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/${nit}/perfil`, {
            method: 'GET',
        });
        if (!response.ok) throw new Error('Error al cargar perfil del usuario');
        return response.json();
    },

    async updatePerfil(usuarioId: string, perfilId: string): Promise<IPerfil> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/${usuarioId}`, {
            method: 'PATCH',
            body: JSON.stringify({ perfil: perfilId }),
        });
        if (!response.ok) throw new Error('Error al actualizar perfil');
        return response.json();
    },

    // ========== HORARIO ==========
    async getHorario(nit: string): Promise<IHorarioApi> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/${nit}/horario`, {
            method: 'GET',
        });
        if (!response.ok) throw new Error('Error al cargar horario');
        return response.json();
    },

    async asignarHorario(nit: string, horario: IHorarioApi): Promise<IHorarioApi> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/${nit}/asignar-horario`, {
            method: 'POST',
            body: JSON.stringify(horario),
        });
        if (!response.ok) throw new Error('Error al asignar horario');
        return response.json();
    },

    // ========== EMPRESAS ==========
    async asignarEmpresas(usuarioNit: string, empresas: string[]): Promise<void> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/${usuarioNit}/asignar-empresa`, {
            method: 'POST',
            body: JSON.stringify({ empresas }),
        });
        if (!response.ok) throw new Error('Error al asignar empresas');
    },

    async eliminarEmpresas(usuarioNit: string, empresas: string[]): Promise<IApiMessageResponse> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/${usuarioNit}/eliminar-empresa`, {
            method: 'DELETE',
            body: JSON.stringify({ empresas }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const message = data?.message || 'Error al eliminar empresas';
            throw new Error(message);
        }

        return data as IApiMessageResponse;
    },

    // ========== USUARIOS ==========
    async crearUsuario(nit: string, perfilId: string): Promise<IApiMessageResponse> {
        const response = await fetchWithAuth(`${API_URL}/usuarios`, {
            method: 'POST',
            body: JSON.stringify({ nit, perfil: perfilId }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            // El backend envía mensajes específicos para nit duplicado o tercero inexistente
            const message =
                data?.message ||
                (Array.isArray(data?.message) ? data.message.join(', ') : '') ||
                'Error al crear usuario';
            throw new Error(message);
        }

        return data as IApiMessageResponse;
    },

    async habilitarUsuario(usuarioId: string): Promise<IApiMessageResponse> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/${usuarioId}/habilitar`, {
            method: 'PATCH',
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const message = data?.message || 'Error al habilitar usuario';
            throw new Error(message);
        }

        return data as IApiMessageResponse;
    },

    async deshabilitarUsuario(usuarioId: string): Promise<IApiMessageResponse> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/${usuarioId}/deshabilitar`, {
            method: 'PATCH',
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const message = data?.message || 'Error al deshabilitar usuario';
            throw new Error(message);
        }

        return data as IApiMessageResponse;
    },

    async resetPassword(usuarioId: string, nit: string): Promise<IApiMessageResponse> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/${usuarioId}/reset-password`, {
            method: 'PATCH',
            body: JSON.stringify({ nit }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const message = data?.message || 'Error al resetear la contraseña';
            throw new Error(message);
        }

        return data as IApiMessageResponse;
    },

    // ========== JEFES GENERALES ==========
    async getJefesGeneral(): Promise<IJefeGeneral[]> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/jefes-general`, {
            method: 'GET',
        });
        if (!response.ok) throw new Error('Error al cargar jefes generales');
        return response.json();
    },

    async getUsuariosJefes(): Promise<IUsuarioJefeCandidato[]> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/usuarios-jefes`, {
            method: 'GET',
        });
        if (!response.ok) throw new Error('Error al cargar usuarios candidatos a jefe');
        return response.json();
    },

    async crearJefe(nit: string, email: string): Promise<IApiMessageResponse> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/crear-jefe`, {
            method: 'POST',
            body: JSON.stringify({ nit, email }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const message = data?.message || 'Error al crear jefe';
            throw new Error(message);
        }

        return data as IApiMessageResponse;
    },

    // ========== OTROS ==========
    async toggleEstado(usuarioId: number, estado: 'Activo' | 'Inactivo'): Promise<void> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/${usuarioId}/estado`, {
            method: 'PATCH',
            body: JSON.stringify({ estado }),
        });
        if (!response.ok) throw new Error('Error al cambiar estado');
    },

    async deleteUsuario(usuarioId: number): Promise<void> {
        const response = await fetchWithAuth(`${API_URL}/usuarios/${usuarioId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar usuario');
    }
};
