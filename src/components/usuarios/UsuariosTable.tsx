"use client";

import { useUsuarios } from "@/modules/usuarios/hooks/useUsuarios";
import { useUsuariosFilter } from "@/modules/usuarios/hooks/useUsuariosFilter";
import { useUsuarioActions } from "@/modules/usuarios/hooks/useUsuarioActions";
import { usePagination } from "@/components/shared/ui/hooks/usePagination";
import { useTooltip } from "@/components/shared/ui/hooks/useTooltip";
import { useConfirmModal } from "@/components/shared/ui/hooks/useConfirmModal";
import { useDropdown } from "@/components/shared/ui/hooks/useDropdown";

import { Badge } from "@/components/shared/ui/Badge";
import { Pagination } from "@/components/shared/ui/Pagination";
import { Tooltip } from "@/components/shared/ui/Tooltip";
import ConfirmModal from "@/components/shared/ui/ConfirmModal";
import { DropdownMenu, DropdownItem } from "@/components/shared/ui/DropdownMenu";

import EditUsuarioModal from "./modals/EditUsuarioModal";
import AgregarSedesModal from "./modals/AgregarSedesModal";
import AsignarJefeModal from "./modals/AsignarJefeModal";
import HorarioModal from "./modals/HorarioModal";
import AgregarEmpresaModal from "./modals/AgregarEmpresaModal";
import { sedesDisponibles } from "@/modules/usuarios/constants";
import { jefesDisponibles } from "@/modules/usuarios/constants";
import { diasSemana } from "@/modules/usuarios/constants";


import { IUsuario, HorarioData } from "@/modules/usuarios/types";
import { empresasDisponibles } from "@/modules/usuarios/constants";
import { GripVertical, Edit, MapPin, UserCheck, Clock, Building2 } from 'lucide-react';
import { useState } from "react";

export function UsuariosTable() {
    /* ------------------ Fetch Usuarios ------------------ */
    const { usuarios, isLoading, error } = useUsuarios();

    /* ------------------ Filtro ------------------ */
    const { search, setSearch, filtered } = useUsuariosFilter(usuarios);

    /* ------------------ Paginación ------------------ */
    const {
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        changePage,
    } = usePagination(filtered.length, 5);

    const usuariosMostrados = filtered.slice(startIndex, endIndex);

    /* ------------------ Tooltip ------------------ */
    const { tooltip, showTooltip, hideTooltip } = useTooltip();

    /* ------------------ Confirm Modal ------------------ */
    const { modal, openModal, closeModal } = useConfirmModal();

    /* ------------------ Dropdown Menu ------------------ */
    const { isOpen, position, openDropdown, closeDropdown, dropdownRef } = useDropdown();
    const [selectedUsuario, setSelectedUsuario] = useState<IUsuario | null>(null);

    /* ------------------ Estados de Modales ------------------ */
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [sedesModalOpen, setSedesModalOpen] = useState(false);
    const [jefeModalOpen, setJefeModalOpen] = useState(false);
    const [horarioModalOpen, setHorarioModalOpen] = useState(false);
    const [empresaModalOpen, setEmpresaModalOpen] = useState(false);

    /* ------------------ Acciones (Mutations) ------------------ */
    const {
        updateUsuario,
        asignarSedes,
        asignarJefe,
        asignarHorario,
        asignarEmpresas,
        toggleEstado,
        deleteUsuario
    } = useUsuarioActions();

    /* ------------------ Eventos ------------------ */
    const handleDelete = async () => {
        if (!modal.usuario) return;
        const success = await deleteUsuario(modal.usuario.id);
        if (success) {
            closeModal();
            // Aquí podrías recargar la lista de usuarios: refetch();
        }
    };

    const handleToggleStatus = async () => {
        if (!modal.usuario) return;
        const newStatus = modal.usuario.estado === "Activo" ? "Inactivo" : "Activo";
        const success = await toggleEstado(modal.usuario.id, newStatus);
        if (success) {
            closeModal();
            // Aquí podrías recargar la lista de usuarios: refetch();
        }
    };

    const handleOpenDropdown = (e: React.MouseEvent, usuario: IUsuario) => {
        setSelectedUsuario(usuario);
        openDropdown(e);
    };

    const handleEditUsuario = async (usuario: IUsuario) => {
        const success = await updateUsuario(usuario);
        if (success) setEditModalOpen(false);
    };

    const handleAgregarSedes = async (sedes: string[]) => {
        if (!selectedUsuario) return;
        const success = await asignarSedes(selectedUsuario.id, sedes);
        if (success) setSedesModalOpen(false);
    };

    const handleAsignarJefe = async (jefeId: number) => {
        if (!selectedUsuario) return;
        const success = await asignarJefe(selectedUsuario.id, jefeId);
        if (success) setJefeModalOpen(false);
    };

    const handleGuardarHorario = async (horario: HorarioData) => {
        if (!selectedUsuario) return;
        const success = await asignarHorario(selectedUsuario.id, horario);
        if (success) setHorarioModalOpen(false);
    };

    const handleAgregarEmpresa = async (empresas: string[]) => {
        if (!selectedUsuario) return;
        const success = await asignarEmpresas(selectedUsuario.id, empresas);
        if (success) setEmpresaModalOpen(false);
    };

    // Opciones del dropdown
    const dropdownItems: DropdownItem[] = [
        {
            label: "Editar",
            icon: <Edit size={16} />,
            onClick: () => {
                setEditModalOpen(true);
                closeDropdown();
            }
        },
        {
            label: "Agregar Sedes",
            icon: <MapPin size={16} />,
            onClick: () => {
                setSedesModalOpen(true);
                closeDropdown();
            }
        },
        {
            label: "Asignar Jefe",
            icon: <UserCheck size={16} />,
            onClick: () => {
                setJefeModalOpen(true);
                closeDropdown();
            }
        },
        {
            label: "Horario",
            icon: <Clock size={16} />,
            onClick: () => {
                setHorarioModalOpen(true);
                closeDropdown();
            }
        },
        {
            label: "Agregar Empresa",
            icon: <Building2 size={16} />,
            onClick: () => {
                setEmpresaModalOpen(true);
                closeDropdown();
            }
        },
    ];

    /* ------------------ Loading ------------------ */
    if (isLoading) return (
        <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando reportes de nómina...</p>
        </div>
    );

    /* ------------------ Error ------------------ */

    if (error) return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error.message} (Código: {error.code})</span>
        </div>
    );

    /* ------------------ No hay usuarios ------------------ */

    if (usuarios.length === 0) return <p className="text-center py-10 text-gray-500">No hay usuarios disponibles.</p>;


    return (
        <div className="p-6">
            {/* ----------- BUSCADOR ----------- */}
            <div className="flex justify-between items-center mb-4">
                <input
                    className="border px-3 py-2 rounded w-64"
                    placeholder="Buscar usuario..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* ----------- TABLA ----------- */}
            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full ">
                    <thead className="bg-amber-500 text-white text-center">
                        <tr>
                            <th className="px-4 py-2 text-center">ID</th>
                            <th className="px-4 py-2 text-center">Nombre</th>
                            <th className="px-4 py-2 text-center">Usuario</th>
                            <th className="px-4 py-2 text-center">Marcas</th>
                            <th className="px-4 py-2 text-center">Estado</th>
                            <th className="px-4 py-2 text-center">Sede</th>
                            <th className="px-4 py-2 text-center">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="text-center text-sm">
                        {usuariosMostrados.map((u: IUsuario) => (
                            <tr key={u.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3">{u.id || "Sin id"}</td>

                                <td className="px-4 py-3">{u.nombre || "Sin nombre"}</td>

                                <td className="px-4 py-3">{u.usuario || "Sin usuario"}</td>

                                <td className="px-4 py-3">
                                    <Badge
                                        text={u.totalMarca.toString()}
                                        color="bg-blue-100 text-blue-800 border-blue-200"
                                        onHover={(e) =>
                                            showTooltip(
                                                e,
                                                <div className="flex flex-col gap-1">
                                                    {u.marcas.map((m: string) => (
                                                        <span key={m}>{m}</span>
                                                    ))}
                                                </div>
                                            )
                                        }
                                        onLeave={hideTooltip}
                                    />
                                </td>

                                <td className="px-4 py-3">
                                    {u.estado === "Activo" ? (
                                        <span
                                            onClick={() => openModal(u, 'toggle-status')}
                                            className="text-green-600 bg-green-100 border-green-200 px-3 py-1 rounded-full text-xs font-medium border cursor-pointer hover:bg-green-200 transition-colors"
                                        >
                                            Activo
                                        </span>
                                    ) : (
                                        <span
                                            onClick={() => openModal(u, 'toggle-status')}
                                            className="text-red-600 bg-red-100 border-red-200 px-3 py-1 rounded-full text-xs font-medium border cursor-pointer hover:bg-red-200 transition-colors"
                                        >
                                            Inactivo
                                        </span>
                                    )}
                                </td>

                                <td className="px-4 py-3">{u.sede || "Sin sede"}</td>

                                <td className="px-4 py-3 flex justify-center">
                                    <button
                                        onClick={(e) => handleOpenDropdown(e, u)}
                                        className="cursor-pointer hover:bg-gray-200 p-1 rounded transition-colors"
                                    >
                                        <GripVertical size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {usuariosMostrados.length === 0 && (
                            <tr>
                                <td colSpan={6} className="py-6 text-center text-gray-500">
                                    No hay usuarios que coincidan con la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ----------- PAGINACIÓN ----------- */}
            <div className="mt-4">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onChange={changePage}
                />
            </div>

            {/* ----------- TOOLTIP ----------- */}
            {tooltip && (
                <Tooltip x={tooltip.x} y={tooltip.y} content={tooltip.content} />
            )}

            {/* ----------- MODAL DE CONFIRMACIÓN ----------- */}
            <ConfirmModal
                open={modal.open}
                title={
                    modal.action === 'toggle-status'
                        ? modal.usuario?.estado === "Activo"
                            ? "Confirmar desactivación"
                            : "Confirmar activación"
                        : "Confirmar eliminación"
                }
                message={
                    modal.action === 'toggle-status'
                        ? modal.usuario?.estado === "Activo"
                            ? `¿Estás seguro que quieres desactivar al usuario ${modal.usuario?.nombre}?`
                            : `¿Estás seguro que quieres activar al usuario ${modal.usuario?.nombre}?`
                        : `¿Seguro que deseas eliminar a ${modal.usuario?.nombre}?`
                }
                variant={
                    modal.action === 'toggle-status' && modal.usuario?.estado === "Inactivo"
                        ? 'success'  // Verde para activar
                        : 'danger'   // Rojo para desactivar o eliminar
                }
                onCancel={closeModal}
                onConfirm={modal.action === 'toggle-status' ? handleToggleStatus : handleDelete}
            />

            {/* ----------- DROPDOWN MENU ----------- */}
            <DropdownMenu
                isOpen={isOpen}
                position={position}
                items={dropdownItems}
                dropdownRef={dropdownRef}
            />

            {/* ----------- MODALES DE ACCIONES ----------- */}
            <EditUsuarioModal
                open={editModalOpen}
                usuario={selectedUsuario}
                onClose={() => setEditModalOpen(false)}
                onSave={handleEditUsuario}
            />

            <AgregarSedesModal
                open={sedesModalOpen}
                usuario={selectedUsuario}
                onClose={() => setSedesModalOpen(false)}
                onSave={handleAgregarSedes}
                sedesDisponibles={sedesDisponibles}
            />

            <AsignarJefeModal
                open={jefeModalOpen}
                usuario={selectedUsuario}
                onClose={() => setJefeModalOpen(false)}
                onSave={handleAsignarJefe}
                jefesDisponibles={jefesDisponibles}
            />

            <HorarioModal
                open={horarioModalOpen}
                usuario={selectedUsuario}
                onClose={() => setHorarioModalOpen(false)}
                onSave={handleGuardarHorario}
                diasSemana={diasSemana}
            />

            <AgregarEmpresaModal
                open={empresaModalOpen}
                usuario={selectedUsuario}
                onClose={() => setEmpresaModalOpen(false)}
                onSave={handleAgregarEmpresa}
                empresasDisponibles={empresasDisponibles}
            />
        </div>
    );
}
