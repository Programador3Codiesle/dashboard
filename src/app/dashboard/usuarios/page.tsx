'use client';

import React, { useState, useRef } from 'react';
import { UsuariosTable } from '@/components/usuarios/UsuariosTable';
import { Button } from '@/components/shared/atoms/Button';
import { ReceiptText } from 'lucide-react';
import AgregarUsuarioModal from '@/components/usuarios/modals/AgregarUsuarioModal';
import AgregarJefeModal from '@/components/usuarios/modals/AgregarJefeModal';
import { usePerfiles } from '@/modules/usuarios/hooks/usePerfiles';
import { useUsuarioActions } from '@/modules/usuarios/hooks/useUsuarioActions';

const UsuariosPage: React.FC = () => {
    const [modalAgregarUsuario, setModalAgregarUsuario] = useState(false);
    const [modalAgregarJefe, setModalAgregarJefe] = useState(false);
    const refetchUsuariosRef = useRef<(() => void) | null>(null);

    const { perfiles } = usePerfiles();
    const { crearUsuario } = useUsuarioActions();

    const handleAgregarUsuario = async (nit: string, perfilId: string) => {
        const success = await crearUsuario(nit, perfilId);
        if (success) {
            setModalAgregarUsuario(false);
            // Recargar la tabla de usuarios
            if (refetchUsuariosRef.current) {
                refetchUsuariosRef.current();
            }
        }
    };

    const handleAgregarJefe = async () => {
        // TODO: integrar API de jefes generales
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Usuarios</h2>
            <div className="mb-4 flex justify-end">
                <Button variant="primary" className="flex items-center" onClick={() => setModalAgregarUsuario(true)}>
                    <ReceiptText size={16} className="mr-2" />
                    Registrar
                </Button>
                <Button variant="primary" className="flex items-center ml-2" onClick={() => setModalAgregarJefe(true)}>
                    <ReceiptText size={16} className="mr-2" />
                    Jefes
                </Button>
            </div>
            <UsuariosTable onRefetchReady={(refetch) => {
                refetchUsuariosRef.current = refetch;
            }} />
            <p className="mt-8 text-sm text-gray-500">
                *Datos mostrados utilizando la lógica conectada a la API de usuarios.
            </p>

            <AgregarUsuarioModal
                open={modalAgregarUsuario}
                onClose={() => setModalAgregarUsuario(false)}
                onSave={handleAgregarUsuario}
                perfilesDisponibles={perfiles}
            />
            <AgregarJefeModal
                open={modalAgregarJefe}
                onClose={() => setModalAgregarJefe(false)}
            />
        </div>
    );
};

export default UsuariosPage;
