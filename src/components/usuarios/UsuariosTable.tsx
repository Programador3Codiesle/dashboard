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
import { GripVertical, Edit, MapPin, UserCheck, Clock, Building2, KeyRound, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo, memo } from "react";

interface UsuariosTableProps {
    onRefetchReady?: (refetch: () => void) => void;
}

// Componente memoizado para evitar re-renders innecesarios
export const UsuariosTable = memo(function UsuariosTable({ onRefetchReady }: UsuariosTableProps = {}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    /* ------------------ Fetch Usuarios ------------------ */
    const { usuarios, isLoading, error, refetch: refetchUsuarios, setUsuarios } = useUsuarios();

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

    /* ------------------ Estados de Loading por acción ------------------ */
    const [loadingEstadoId, setLoadingEstadoId] = useState<number | null>(null);
    const [loadingEmpresaId, setLoadingEmpresaId] = useState<number | null>(null);
    
    /* ------------------ Hooks para datos ------------------ */
    // Hooks globales (siempre cargados)
    const { jefes: todosLosJefes } = useJefes();
    const { sedes: todasLasSedes } = useSedes();
    const { perfiles: todosLosPerfiles } = usePerfiles();
    
    // Hooks de datos de usuario - solo fetch cuando el modal correspondiente está abierto (lazy loading)
    const { jefes: jefesDelUsuario, refetch: refetchJefes } = useJefesUsuario(selectedUsuario?.idEmpleado, jefeModalOpen);
    const { sedes: sedesDelUsuario, refetch: refetchSedes } = useSedesUsuario(selectedUsuario?.id?.toString(), sedesModalOpen);
    const { perfil: perfilDelUsuario, refetch: refetchPerfil } = usePerfilUsuario(selectedUsuario?.nit, editModalOpen);
    const { horario: horarioDelUsuario, refetch: refetchHorario } = useHorarioUsuario(selectedUsuario?.nit, horarioModalOpen);

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
        }
    }, [modal.usuario, deleteUsuario, closeModal]);

    const handleToggleStatus = useCallback(async () => {
        if (!modal.usuario) return;
        
        // Guardar valores ANTES de cerrar el modal
        const usuarioId = modal.usuario.id;
        const estadoOriginal = modal.usuario.estado;
        const newStatus = estadoOriginal === "Activo" ? "Inactivo" : "Activo";
        
        // Cerrar modal y mostrar loading en la fila
        closeModal();
        setLoadingEstadoId(usuarioId);
        
        // Optimistic Update: actualizar la UI inmediatamente
        setUsuarios((oldData) =>
            oldData.map(u => (u.id === usuarioId ? { ...u, estado: newStatus } : u))
        );

        try {
            const success = await toggleEstado(usuarioId, newStatus);
            if (!success) {
                setUsuarios((oldData) =>
                    oldData.map(u => (u.id === usuarioId ? { ...u, estado: estadoOriginal } : u))
                );
            }
        } catch {
            setUsuarios((oldData) =>
                oldData.map(u => (u.id === usuarioId ? { ...u, estado: estadoOriginal } : u))
            );
        } finally {
            setLoadingEstadoId(null);
        }
    }, [modal.usuario, toggleEstado, closeModal, setUsuarios]);

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
            // La invalidación de caché ya se hace en useUsuarioActions
        }
    }, [selectedUsuario, asignarHorario, refetchHorario]);

    const handleAgregarEmpresa = useCallback(async (empresasSeleccionadas: string[]) => {
        if (!selectedUsuario || !selectedUsuario.nit) return;

        // Guardar valores ANTES de cualquier operación async
        const usuarioId = selectedUsuario.id;
        const usuarioNit = selectedUsuario.nit;
        const empresasOriginales = [...(selectedUsuario.empresas || [])];
        const marcasOriginales = [...(selectedUsuario.marcas || [])];
        const totalMarcaOriginal = selectedUsuario.totalMarca;

        const empresasAAgregar = empresasSeleccionadas.filter(
            (id) => !empresasOriginales.includes(id)
        );
        const empresasAEliminar = empresasOriginales.filter(
            (id) => !empresasSeleccionadas.includes(id)
        );

        // Si no hay cambios, no hacer nada
        if (empresasAAgregar.length === 0 && empresasAEliminar.length === 0) {
            setEmpresaModalOpen(false);
            return;
        }

        // Cerrar modal y mostrar loading
        setEmpresaModalOpen(false);
        setLoadingEmpresaId(usuarioId);

        // Calcular nuevas marcas para optimistic update
        const nuevasEmpresas = [...empresasSeleccionadas];
        const nuevasMarcas = empresasDisponibles
            .filter(e => nuevasEmpresas.includes(e.id))
            .map(e => e.nombre);

        // Optimistic Update: actualizar la UI inmediatamente
        setUsuarios((oldData) =>
            oldData.map(u =>
                u.id === usuarioId
                    ? { ...u, empresas: nuevasEmpresas, marcas: nuevasMarcas, totalMarca: nuevasMarcas.length }
                    : u
            )
        );

        try {
            let success = true;

            if (empresasAAgregar.length > 0) {
                success = (await asignarEmpresas(usuarioNit, empresasAAgregar)) && success;
            }

            if (empresasAEliminar.length > 0) {
                success = (await eliminarEmpresas(usuarioNit, empresasAEliminar)) && success;
            }

            if (!success) {
                setUsuarios((oldData) =>
                    oldData.map(u =>
                        u.id === usuarioId
                            ? { ...u, empresas: empresasOriginales, marcas: marcasOriginales, totalMarca: totalMarcaOriginal }
                            : u
                    )
                );
            }
        } catch {
            setUsuarios((oldData) =>
                oldData.map(u =>
                    u.id === usuarioId
                        ? { ...u, empresas: empresasOriginales, marcas: marcasOriginales, totalMarca: totalMarcaOriginal }
                        : u
                )
            );
        } finally {
            setLoadingEmpresaId(null);
        }
    }, [selectedUsuario, asignarEmpresas, eliminarEmpresas, setUsuarios]);

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
                    <thead className="brand-bg text-white text-center">
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
                                    {loadingEmpresaId === u.id ? (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-600 border border-blue-200">
                                            <Loader2 size={12} className="animate-spin" />
                                        </span>
                                    ) : (
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
                                    )}
                                </td>

                                <td className="px-4 py-3">
                                    {loadingEstadoId === u.id ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 shadow-sm">
                                            <Loader2 size={14} className="animate-spin" />
                                            Procesando...
                                        </span>
                                    ) : u.estado === "Activo" ? (
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
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full brand-bg-gradient text-white shadow-sm hover:shadow-md hover:opacity-90 transition-all text-xs font-semibold"
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
});

// Display name para debugging
UsuariosTable.displayName = 'UsuariosTable';
