"use client";

import { useUsuarios } from "@/modules/usuarios/hooks/useUsuarios";
import { useUsuariosFilter } from "@/modules/usuarios/hooks/useUsuariosFilter";
import { useUsuarioActions } from "@/modules/usuarios/hooks/useUsuarioActions";
import { useJefes, useJefesUsuario } from "@/modules/usuarios/hooks/useJefes";
import { useSedes, useSedesUsuario } from "@/modules/usuarios/hooks/useSedes";
import { usePerfiles, usePerfilUsuario } from "@/modules/usuarios/hooks/usePerfiles";
import { useHorarioUsuario } from "@/modules/usuarios/hooks/useHorario";
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
import { empresasDisponibles } from "@/modules/usuarios/constants";

import { IUsuario, HorarioData } from "@/modules/usuarios/types";
import { GripVertical, Edit, MapPin, UserCheck, Clock, Building2, KeyRound, CheckCircle2, XCircle } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from "react";

interface UsuariosTableProps {
    onRefetchReady?: (refetch: () => void) => void;
}

export function UsuariosTable({ onRefetchReady }: UsuariosTableProps = {}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    /* ------------------ Fetch Usuarios ------------------ */
    const { usuarios, isLoading, error, refetch: refetchUsuarios } = useUsuarios();

    // Exponer refetchUsuarios al componente padre
    useEffect(() => {
        if (onRefetchReady) {
            onRefetchReady(refetchUsuarios);
        }
    }, [onRefetchReady, refetchUsuarios]);


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

    const usuariosMostrados = useMemo(() => filtered.slice(startIndex, endIndex), [filtered, startIndex, endIndex]);

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

    /* ------------------ Hooks para datos ------------------ */
    const { jefes: todosLosJefes } = useJefes();
    const { jefes: jefesDelUsuario, refetch: refetchJefes } = useJefesUsuario(selectedUsuario?.idEmpleado);
    
    const { sedes: todasLasSedes } = useSedes();
    const { sedes: sedesDelUsuario, refetch: refetchSedes } = useSedesUsuario(selectedUsuario?.id?.toString());
    
    const { perfiles: todosLosPerfiles } = usePerfiles();
    const { perfil: perfilDelUsuario, refetch: refetchPerfil } = usePerfilUsuario(selectedUsuario?.nit);
    
    const { horario: horarioDelUsuario, refetch: refetchHorario } = useHorarioUsuario(selectedUsuario?.nit);

    /* ------------------ Acciones (Mutations) ------------------ */
    const {
        asignarJefe,
        eliminarJefe,
        asignarSede,
        eliminarSede,
        updatePerfil,
        asignarHorario,
        asignarEmpresas,
        eliminarEmpresas,
        resetPassword,
        toggleEstado,
        deleteUsuario
    } = useUsuarioActions();

    /* ------------------ Eventos ------------------ */
    const handleDelete = useCallback(async () => {
        if (!modal.usuario) return;
        const success = await deleteUsuario(modal.usuario.id);
        if (success) {
            closeModal();
            refetchUsuarios();
        }
    }, [modal.usuario, deleteUsuario, closeModal, refetchUsuarios]);

    const handleToggleStatus = useCallback(async () => {
        if (!modal.usuario) return;
        const newStatus = modal.usuario.estado === "Activo" ? "Inactivo" : "Activo";
        const success = await toggleEstado(modal.usuario.id, newStatus);
        if (success) {
            closeModal();
            refetchUsuarios();
        }
    }, [modal.usuario, toggleEstado, closeModal, refetchUsuarios]);

    const handleOpenDropdown = useCallback((e: React.MouseEvent, usuario: IUsuario) => {
        setSelectedUsuario(usuario);
        openDropdown(e);
    }, [openDropdown]);

    const handleUpdatePerfil = useCallback(async (perfilId: string) => {
        if (!selectedUsuario) return;
        const success = await updatePerfil(selectedUsuario.id.toString(), perfilId);
        if (success) {
            setEditModalOpen(false);
            refetchPerfil();
        }
    }, [selectedUsuario, updatePerfil, refetchPerfil]);

    const handleAsignarSede = useCallback(async (idSede: string) => {
        if (!selectedUsuario) return;
        const success = await asignarSede(selectedUsuario.id.toString(), idSede);
        if (success) {
            refetchSedes();
        }
    }, [selectedUsuario, asignarSede, refetchSedes]);

    const handleEliminarSede = useCallback(async (idSede: string) => {
        if (!selectedUsuario) return;
        const success = await eliminarSede(selectedUsuario.id.toString(), idSede);
        if (success) {
            refetchSedes();
        }
    }, [selectedUsuario, eliminarSede, refetchSedes]);

    const handleAsignarJefe = useCallback(async (jefeId: string) => {
        if (!selectedUsuario || !selectedUsuario.idEmpleado) return;
        const success = await asignarJefe(selectedUsuario.idEmpleado, jefeId);
        if (success) {
            refetchJefes();
        }
    }, [selectedUsuario, asignarJefe, refetchJefes]);

    const handleEliminarJefe = useCallback(async (jefeId: string) => {
        if (!selectedUsuario || !selectedUsuario.idEmpleado) return;
        const success = await eliminarJefe(selectedUsuario.idEmpleado, jefeId);
        if (success) {
            refetchJefes();
        }
    }, [selectedUsuario, eliminarJefe, refetchJefes]);

    const handleGuardarHorario = useCallback(async (horario: HorarioData) => {
        if (!selectedUsuario || !selectedUsuario.nit) return;
        const success = await asignarHorario(selectedUsuario.nit, horario);
        if (success) {
            setHorarioModalOpen(false);
            refetchHorario();
            refetchUsuarios();
        }
    }, [selectedUsuario, asignarHorario, refetchHorario, refetchUsuarios]);

    const handleAgregarEmpresa = useCallback(async (empresasSeleccionadas: string[]) => {
        if (!selectedUsuario || !selectedUsuario.nit) return;

        const empresasOriginales = selectedUsuario.empresas || [];

        const empresasAAgregar = empresasSeleccionadas.filter(
            (id) => !empresasOriginales.includes(id)
        );
        const empresasAEliminar = empresasOriginales.filter(
            (id) => !empresasSeleccionadas.includes(id)
        );

        let success = true;

        if (empresasAAgregar.length > 0) {
            success = (await asignarEmpresas(selectedUsuario.nit, empresasAAgregar)) && success;
        }

        if (empresasAEliminar.length > 0) {
            success = (await eliminarEmpresas(selectedUsuario.nit, empresasAEliminar)) && success;
        }

        if (success) {
            setEmpresaModalOpen(false);
            refetchUsuarios();
        }
    }, [selectedUsuario, asignarEmpresas, eliminarEmpresas, refetchUsuarios]);

    const handleResetPassword = useCallback(async (usuario: IUsuario) => {
        if (!usuario.nit) return;
        await resetPassword(usuario.id.toString(), usuario.nit);
    }, [resetPassword]);

    // Opciones del dropdown
    const dropdownItems: DropdownItem[] = useMemo(() => [
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
    ], [closeDropdown]);

    /* ------------------ Loading ------------------ */
    if (!mounted || isLoading) return (
        <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando usuarios...</p>
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
    if (!isLoading && usuarios.length === 0) return <p className="text-center py-10 text-gray-500">No hay usuarios disponibles.</p>;


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
                            <th className="px-4 py-2 text-center">Perfil</th>
                            <th className="px-4 py-2 text-center">Sede</th>
                            <th className="px-4 py-2 text-center">Rest-clave</th>
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
                                        color="bg-blue-200 text-blue-800 border-blue-200"
                                        onHover={(e) =>
                                            showTooltip(
                                                e,
                                                <div className="flex flex-col gap-1">
                                                    {u.totalMarca === 0 || u.marcas.length === 0 ? (
                                                        <span>Sin empresa</span>
                                                    ) : (
                                                        u.marcas.map((m: string) => (
                                                            <span key={m}>{m}</span>
                                                        ))
                                                    )}
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
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 shadow-sm cursor-pointer hover:bg-green-200 hover:shadow-md transition-all duration-200"
                                        >
                                            <CheckCircle2 size={14} className="text-green-600" />
                                            Activo
                                        </span>
                                    ) : (
                                        <span
                                            onClick={() => openModal(u, 'toggle-status')}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 shadow-sm cursor-pointer hover:bg-red-200 hover:shadow-md transition-all duration-200"
                                        >
                                            <XCircle size={14} className="text-red-600" />
                                            Inactivo
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">{u.perfil || "Sin perfil"}</td>

                                <td className="px-4 py-3">{u.sede || "Sin sede"}</td>

                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => handleResetPassword(u)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-linear-to-r from-amber-500 to-amber-600 text-white shadow-sm hover:shadow-md hover:from-amber-600 hover:to-amber-700 transition-all text-xs font-semibold"
                                    >
                                        <KeyRound size={16} />
                                        
                                    </button>
                                </td>

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
                onSave={handleUpdatePerfil}
                perfilesDisponibles={todosLosPerfiles}
                perfilActual={perfilDelUsuario}
            />

            <AgregarSedesModal
                open={sedesModalOpen}
                usuario={selectedUsuario}
                onClose={() => setSedesModalOpen(false)}
                onAsignar={handleAsignarSede}
                onEliminar={handleEliminarSede}
                sedesDisponibles={todasLasSedes}
                sedesUsuario={sedesDelUsuario}
            />

            <AsignarJefeModal
                open={jefeModalOpen}
                usuario={selectedUsuario}
                onClose={() => setJefeModalOpen(false)}
                onAsignar={handleAsignarJefe}
                onEliminar={handleEliminarJefe}
                jefesDisponibles={todosLosJefes}
                jefesUsuario={jefesDelUsuario}
            />

            <HorarioModal
                open={horarioModalOpen}
                usuario={selectedUsuario}
                onClose={() => setHorarioModalOpen(false)}
                onSave={handleGuardarHorario}
                horarioActual={horarioDelUsuario}
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
