'use client';

import React, { useRef, useCallback } from 'react';
import { UsuariosTable } from '@/components/usuarios/UsuariosTable';
import { UsuariosToolbar } from '@/components/usuarios/UsuariosToolbar';
import { usePerfiles } from '@/modules/usuarios/hooks/usePerfiles';
import { useUsuarioActions } from '@/modules/usuarios/hooks/useUsuarioActions';

const UsuariosPage: React.FC = () => {
    const refetchUsuariosRef = useRef<(() => void) | null>(null);

    const { perfiles } = usePerfiles();
    const { crearUsuario } = useUsuarioActions();

    const handleRefetchReady = useCallback((refetch: () => void) => {
        refetchUsuariosRef.current = refetch;
    }, []);

    const handleAgregarUsuario = useCallback(async (nit: string, perfilId: string): Promise<boolean> => {
        const success = await crearUsuario(nit, perfilId);
        if (success) {
            if (refetchUsuariosRef.current) {
                refetchUsuariosRef.current();
            }
        }
        return success;
    }, [crearUsuario]);

    return (
        <div className="app-section-card w-full min-w-0 max-w-none">
            <h2 className="app-title-xl text-gray-800 mb-4 sm:mb-6">Usuarios</h2>
            <UsuariosToolbar
                perfiles={perfiles}
                onAgregarUsuario={handleAgregarUsuario}
            />
            <UsuariosTable onRefetchReady={handleRefetchReady} />
            <p className="mt-8 text-sm text-gray-500">
                *Datos mostrados utilizando la lógica conectada a la API de usuarios.
            </p>
        </div>
    );
};

export default UsuariosPage;
