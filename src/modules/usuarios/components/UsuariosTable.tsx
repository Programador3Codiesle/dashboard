"use client";

import { useUsuarios } from "../hooks/useUsuarios";
import { useUsuarioActions } from "../hooks/useUsuarioActions";
import { useJefes, useJefesUsuario } from "../hooks/useJefes";
import { useSedes, useSedesUsuario } from "../hooks/useSedes";
import { usePerfiles, usePerfilUsuario } from "../hooks/usePerfiles";
import { useHorarioUsuario } from "../hooks/useHorario";
import { useTooltip } from "@/components/shared/ui/hooks/useTooltip";
import { useConfirmModal } from "@/components/shared/ui/hooks/useConfirmModal";
import { useDropdown } from "@/components/shared/ui/hooks/useDropdown";

import { Pagination } from "@/components/shared/ui/Pagination";
import { Tooltip } from "@/components/shared/ui/Tooltip";
import ConfirmModal from "@/components/shared/ui/ConfirmModal";
import { DropdownMenu, DropdownItem } from "@/components/shared/ui/DropdownMenu";

import dynamic from "next/dynamic";
import {
  empresasDisponibles,
  USUARIOS_COPY,
  USUARIOS_PAGE_SIZE,
  USUARIOS_STYLES,
} from "../constants";
import { UsuariosSearchInput } from "./UsuariosSearchInput";
import { UsuariosTableRow } from "./UsuariosTableRow";

const EditUsuarioModal = dynamic(() => import("./modals/EditUsuarioModal"), { ssr: false });
const AgregarSedesModal = dynamic(() => import("./modals/AgregarSedesModal"), { ssr: false });
const AsignarJefeModal = dynamic(() => import("./modals/AsignarJefeModal"), { ssr: false });
const HorarioModal = dynamic(() => import("./modals/HorarioModal"), { ssr: false });
const AgregarEmpresaModal = dynamic(() => import("./modals/AgregarEmpresaModal"), { ssr: false });

import { IUsuario, HorarioData } from "../types";
import { Edit, MapPin, UserCheck, Clock, Building2, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback, useMemo, memo } from "react";

export const UsuariosTable = memo(function UsuariosTable() {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    usuarios,
    total,
    totalPages,
    isLoading,
    isFetching,
    error,
    setUsuarios,
  } = useUsuarios(currentPage, USUARIOS_PAGE_SIZE, searchTerm);

  const handleDebouncedSearchChange = useCallback((value: string) => {
    setCurrentPage(1);
    setSearchTerm(value);
  }, []);

  const usuariosMostrados = usuarios;
  const inicioRango = total === 0 ? 0 : (currentPage - 1) * USUARIOS_PAGE_SIZE + 1;
  const finRango = total === 0 ? 0 : Math.min(currentPage * USUARIOS_PAGE_SIZE, total);
  const handleChangePage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages],
  );

  const { tooltip, showTooltip, hideTooltip } = useTooltip();
  const { modal, openModal, closeModal } = useConfirmModal();
  const { isOpen, position, openDropdown, closeDropdown, dropdownRef } = useDropdown();
  const [selectedUsuario, setSelectedUsuario] = useState<IUsuario | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [sedesModalOpen, setSedesModalOpen] = useState(false);
  const [jefeModalOpen, setJefeModalOpen] = useState(false);
  const [horarioModalOpen, setHorarioModalOpen] = useState(false);
  const [empresaModalOpen, setEmpresaModalOpen] = useState(false);

  const [loadingEstadoId, setLoadingEstadoId] = useState<number | null>(null);
  const [loadingEmpresaId, setLoadingEmpresaId] = useState<number | null>(null);

  const { jefes: todosLosJefes } = useJefes({ enabled: jefeModalOpen });
  const { sedes: todasLasSedes } = useSedes({ enabled: sedesModalOpen });
  const { perfiles: todosLosPerfiles } = usePerfiles({ enabled: editModalOpen });
  const { jefes: jefesDelUsuario, refetch: refetchJefes } = useJefesUsuario(
    selectedUsuario?.idEmpleado,
    jefeModalOpen,
  );
  const { sedes: sedesDelUsuario, refetch: refetchSedes } = useSedesUsuario(
    selectedUsuario?.id?.toString(),
    sedesModalOpen,
  );
  const { perfil: perfilDelUsuario, refetch: refetchPerfil } = usePerfilUsuario(
    selectedUsuario?.nit,
    editModalOpen,
  );
  const { horario: horarioDelUsuario, refetch: refetchHorario } = useHorarioUsuario(
    selectedUsuario?.nit,
    horarioModalOpen,
  );

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
    deleteUsuario,
  } = useUsuarioActions();

  const handleDelete = useCallback(async () => {
    if (!modal.usuario) return;
    const success = await deleteUsuario(modal.usuario.id);
    if (success) {
      closeModal();
    }
  }, [modal.usuario, deleteUsuario, closeModal]);

  const handleToggleStatus = useCallback(async () => {
    if (!modal.usuario) return;

    const usuarioId = modal.usuario.id;
    const estadoOriginal = modal.usuario.estado;
    const newStatus = estadoOriginal === "Activo" ? "Inactivo" : "Activo";

    closeModal();
    setLoadingEstadoId(usuarioId);

    setUsuarios((oldData) =>
      oldData.map((u) => (u.id === usuarioId ? { ...u, estado: newStatus } : u)),
    );

    try {
      const success = await toggleEstado(usuarioId, newStatus);
      if (!success) {
        setUsuarios((oldData) =>
          oldData.map((u) =>
            u.id === usuarioId ? { ...u, estado: estadoOriginal } : u,
          ),
        );
      }
    } catch {
      setUsuarios((oldData) =>
        oldData.map((u) =>
          u.id === usuarioId ? { ...u, estado: estadoOriginal } : u,
        ),
      );
    } finally {
      setLoadingEstadoId(null);
    }
  }, [modal.usuario, toggleEstado, closeModal, setUsuarios]);

  const handleOpenDropdown = useCallback(
    (e: React.MouseEvent, usuario: IUsuario) => {
      setSelectedUsuario(usuario);
      openDropdown(e);
    },
    [openDropdown],
  );

  const handleUpdatePerfil = useCallback(
    async (perfilId: string) => {
      if (!selectedUsuario) return;
      const success = await updatePerfil(selectedUsuario.id.toString(), perfilId);
      if (success) {
        setEditModalOpen(false);
        refetchPerfil();
      }
    },
    [selectedUsuario, updatePerfil, refetchPerfil],
  );

  const handleAsignarSede = useCallback(
    async (idSede: string) => {
      if (!selectedUsuario) return;
      const success = await asignarSede(selectedUsuario.id.toString(), idSede);
      if (success) {
        refetchSedes();
      }
    },
    [selectedUsuario, asignarSede, refetchSedes],
  );

  const handleEliminarSede = useCallback(
    async (idSede: string) => {
      if (!selectedUsuario) return;
      const success = await eliminarSede(selectedUsuario.id.toString(), idSede);
      if (success) {
        refetchSedes();
      }
    },
    [selectedUsuario, eliminarSede, refetchSedes],
  );

  const handleAsignarJefe = useCallback(
    async (jefeId: string) => {
      if (!selectedUsuario || !selectedUsuario.idEmpleado) return;
      const success = await asignarJefe(selectedUsuario.idEmpleado, jefeId);
      if (success) {
        refetchJefes();
      }
    },
    [selectedUsuario, asignarJefe, refetchJefes],
  );

  const handleEliminarJefe = useCallback(
    async (jefeId: string) => {
      if (!selectedUsuario || !selectedUsuario.idEmpleado) return;
      const success = await eliminarJefe(selectedUsuario.idEmpleado, jefeId);
      if (success) {
        refetchJefes();
      }
    },
    [selectedUsuario, eliminarJefe, refetchJefes],
  );

  const handleGuardarHorario = useCallback(
    async (horario: HorarioData) => {
      if (!selectedUsuario || !selectedUsuario.nit) return;
      const success = await asignarHorario(selectedUsuario.nit, horario);
      if (success) {
        setHorarioModalOpen(false);
        refetchHorario();
      }
    },
    [selectedUsuario, asignarHorario, refetchHorario],
  );

  const handleAgregarEmpresa = useCallback(
    async (empresasSeleccionadas: string[]) => {
      if (!selectedUsuario || !selectedUsuario.nit) return;

      const usuarioId = selectedUsuario.id;
      const usuarioNit = selectedUsuario.nit;
      const empresasOriginales = [...(selectedUsuario.empresas || [])];
      const marcasOriginales = [...(selectedUsuario.marcas || [])];
      const totalMarcaOriginal = selectedUsuario.totalMarca;

      const empresasAAgregar = empresasSeleccionadas.filter(
        (id) => !empresasOriginales.includes(id),
      );
      const empresasAEliminar = empresasOriginales.filter(
        (id) => !empresasSeleccionadas.includes(id),
      );

      if (empresasAAgregar.length === 0 && empresasAEliminar.length === 0) {
        setEmpresaModalOpen(false);
        return;
      }

      setEmpresaModalOpen(false);
      setLoadingEmpresaId(usuarioId);

      const nuevasEmpresas = [...empresasSeleccionadas];
      const nuevasMarcas = empresasDisponibles
        .filter((e) => nuevasEmpresas.includes(e.id))
        .map((e) => e.nombre);

      setUsuarios((oldData) =>
        oldData.map((u) =>
          u.id === usuarioId
            ? {
                ...u,
                empresas: nuevasEmpresas,
                marcas: nuevasMarcas,
                totalMarca: nuevasMarcas.length,
              }
            : u,
        ),
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
            oldData.map((u) =>
              u.id === usuarioId
                ? {
                    ...u,
                    empresas: empresasOriginales,
                    marcas: marcasOriginales,
                    totalMarca: totalMarcaOriginal,
                  }
                : u,
            ),
          );
        }
      } catch {
        setUsuarios((oldData) =>
          oldData.map((u) =>
            u.id === usuarioId
              ? {
                  ...u,
                  empresas: empresasOriginales,
                  marcas: marcasOriginales,
                  totalMarca: totalMarcaOriginal,
                }
              : u,
          ),
        );
      } finally {
        setLoadingEmpresaId(null);
      }
    },
    [selectedUsuario, asignarEmpresas, eliminarEmpresas, setUsuarios],
  );

  const handleResetPassword = useCallback(
    async (usuario: IUsuario) => {
      if (!usuario.nit) return;
      await resetPassword(usuario.id.toString(), usuario.nit);
    },
    [resetPassword],
  );

  const handleShowMarcasTooltip = useCallback(
    (event: React.MouseEvent, usuario: IUsuario) => {
      showTooltip(
        event,
        <div className="flex flex-col gap-1">
          {usuario.totalMarca === 0 || usuario.marcas.length === 0 ? (
            <span>Sin empresa</span>
          ) : (
            usuario.marcas.map((marca: string, index: number) => (
              <span key={`${marca}-${index}`}>{marca}</span>
            ))
          )}
        </div>,
      );
    },
    [showTooltip],
  );

  const handleToggleEstadoFromRow = useCallback(
    (usuario: IUsuario) => {
      openModal(usuario, "toggle-status");
    },
    [openModal],
  );

  const dropdownItems: DropdownItem[] = useMemo(
    () => [
      {
        label: "Editar",
        icon: <Edit size={16} />,
        onClick: () => {
          setEditModalOpen(true);
          closeDropdown();
        },
      },
      {
        label: "Agregar Sedes",
        icon: <MapPin size={16} />,
        onClick: () => {
          setSedesModalOpen(true);
          closeDropdown();
        },
      },
      {
        label: "Asignar Jefe",
        icon: <UserCheck size={16} />,
        onClick: () => {
          setJefeModalOpen(true);
          closeDropdown();
        },
      },
      {
        label: "Horario",
        icon: <Clock size={16} />,
        onClick: () => {
          setHorarioModalOpen(true);
          closeDropdown();
        },
      },
      {
        label: "Agregar Empresa",
        icon: <Building2 size={16} />,
        onClick: () => {
          setEmpresaModalOpen(true);
          closeDropdown();
        },
      },
    ],
    [closeDropdown],
  );

  if (!mounted || isLoading)
    return (
      <div className="py-10 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-(--color-primary) border-t-transparent mx-auto" />
        <p className="text-sm text-gray-600 font-medium">{USUARIOS_COPY.loading}</p>
      </div>
    );

  if (error)
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline">
          {" "}
          {error.message} (Código: {error.code})
        </span>
      </div>
    );

  return (
    <div className="p-2 sm:p-3 md:p-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
        <UsuariosSearchInput onDebouncedChange={handleDebouncedSearchChange} />
        <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
          <p>
            Mostrando <span className="font-semibold">{inicioRango}-{finRango}</span> de{" "}
            <span className="font-semibold">{total}</span> usuarios
          </p>
          <span className="inline-flex items-center rounded-full border brand-border px-2.5 py-0.5 text-xs font-semibold brand-text bg-white">
            {USUARIOS_PAGE_SIZE} por página
          </span>
          {isFetching && !isLoading && (
            <span className={USUARIOS_STYLES.fetchingBadge}>
              <Loader2 size={12} className="animate-spin" />
              {USUARIOS_COPY.fetching}
            </span>
          )}
        </div>
      </div>

      <div className="app-table-scroll bg-white shadow-sm">
        <table className="w-full min-w-[960px]">
          <thead className="brand-bg text-white text-center">
            <tr>
              <th className="px-2 py-2 text-center text-xs sm:px-4 sm:text-sm">ID</th>
              <th className="px-2 py-2 text-center text-xs sm:px-4 sm:text-sm">Nombre</th>
              <th className="px-2 py-2 text-center text-xs sm:px-4 sm:text-sm">Usuario</th>
              <th className="px-2 py-2 text-center text-xs sm:px-4 sm:text-sm">Marcas</th>
              <th className="px-2 py-2 text-center text-xs sm:px-4 sm:text-sm">Estado</th>
              <th className="px-2 py-2 text-center text-xs sm:px-4 sm:text-sm">Perfil</th>
              <th className="px-2 py-2 text-center text-xs sm:px-4 sm:text-sm">Sede</th>
              <th className="px-2 py-2 text-center text-xs sm:px-4 sm:text-sm">Rest-clave</th>
              <th className="px-2 py-2 text-center text-xs sm:px-4 sm:text-sm">Acciones</th>
            </tr>
          </thead>

          <tbody className="text-center text-sm">
            {usuariosMostrados.map((u: IUsuario) => (
              <UsuariosTableRow
                key={u.id}
                usuario={u}
                loadingEmpresa={loadingEmpresaId === u.id}
                loadingEstado={loadingEstadoId === u.id}
                onShowMarcasTooltip={handleShowMarcasTooltip}
                onHideTooltip={hideTooltip}
                onToggleEstado={handleToggleEstadoFromRow}
                onResetPassword={handleResetPassword}
                onOpenDropdown={handleOpenDropdown}
              />
            ))}

            {usuariosMostrados.length === 0 && (
              <tr>
                <td colSpan={9} className="py-6 text-center text-gray-500">
                  {searchTerm.trim() ? USUARIOS_COPY.emptySearch : USUARIOS_COPY.emptyList}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onChange={handleChangePage}
        />
      </div>

      {tooltip && <Tooltip x={tooltip.x} y={tooltip.y} content={tooltip.content} />}

      <ConfirmModal
        open={modal.open}
        title={
          modal.action === "toggle-status"
            ? modal.usuario?.estado === "Activo"
              ? "Confirmar desactivación"
              : "Confirmar activación"
            : "Confirmar eliminación"
        }
        message={
          modal.action === "toggle-status"
            ? modal.usuario?.estado === "Activo"
              ? `¿Estás seguro que quieres desactivar al usuario ${modal.usuario?.nombre}?`
              : `¿Estás seguro que quieres activar al usuario ${modal.usuario?.nombre}?`
            : `¿Seguro que deseas eliminar a ${modal.usuario?.nombre}?`
        }
        variant={
          modal.action === "toggle-status" && modal.usuario?.estado === "Inactivo"
            ? "success"
            : "danger"
        }
        onCancel={closeModal}
        onConfirm={modal.action === "toggle-status" ? handleToggleStatus : handleDelete}
      />

      <DropdownMenu
        isOpen={isOpen}
        position={position}
        items={dropdownItems}
        dropdownRef={dropdownRef}
      />

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

UsuariosTable.displayName = "UsuariosTable";
