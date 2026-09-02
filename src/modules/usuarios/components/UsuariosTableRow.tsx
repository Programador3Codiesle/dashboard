"use client";

import { memo } from "react";
import { Badge } from "@/components/shared/ui/Badge";
import { IUsuario } from "../types";
import { USUARIOS_STYLES } from "../constants";
import { GripVertical, KeyRound, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface UsuarioRowProps {
  usuario: IUsuario;
  loadingEmpresa: boolean;
  loadingEstado: boolean;
  onShowMarcasTooltip: (event: React.MouseEvent, usuario: IUsuario) => void;
  onHideTooltip: () => void;
  onToggleEstado: (usuario: IUsuario) => void;
  onResetPassword: (usuario: IUsuario) => void;
  onOpenDropdown: (event: React.MouseEvent, usuario: IUsuario) => void;
}

export const UsuariosTableRow = memo(function UsuariosTableRow({
  usuario,
  loadingEmpresa,
  loadingEstado,
  onShowMarcasTooltip,
  onHideTooltip,
  onToggleEstado,
  onResetPassword,
  onOpenDropdown,
}: UsuarioRowProps) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-3">{usuario.id || "Sin id"}</td>

      <td className="px-4 py-3">{usuario.nombre || "Sin nombre"}</td>

      <td className="px-4 py-3">{usuario.usuario || "Sin usuario"}</td>

      <td className="px-4 py-3">
        {loadingEmpresa ? (
          <span className={USUARIOS_STYLES.marcasLoading}>
            <Loader2 size={12} className="animate-spin" />
          </span>
        ) : (
          <Badge
            text={usuario.totalMarca.toString()}
            color={USUARIOS_STYLES.marcasBadge}
            onHover={(event) => onShowMarcasTooltip(event, usuario)}
            onLeave={onHideTooltip}
          />
        )}
      </td>

      <td className="px-4 py-3">
        {loadingEstado ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 shadow-sm">
            <Loader2 size={14} className="animate-spin" />
            Procesando...
          </span>
        ) : usuario.estado === "Activo" ? (
          <span
            onClick={() => onToggleEstado(usuario)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 shadow-sm cursor-pointer hover:bg-green-200 hover:shadow-md transition-all duration-200"
          >
            <CheckCircle2 size={14} className="text-green-600" />
            Activo
          </span>
        ) : (
          <span
            onClick={() => onToggleEstado(usuario)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 shadow-sm cursor-pointer hover:bg-red-200 hover:shadow-md transition-all duration-200"
          >
            <XCircle size={14} className="text-red-600" />
            Inactivo
          </span>
        )}
      </td>
      <td className="px-4 py-3">{usuario.perfil || "Sin perfil"}</td>

      <td className="px-4 py-3">{usuario.sede || "Sin sede"}</td>

      <td className="px-4 py-3">
        <button
          onClick={() => onResetPassword(usuario)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full brand-bg-gradient text-white shadow-sm hover:shadow-md hover:opacity-90 transition-all text-xs font-semibold"
        >
          <KeyRound size={16} />
        </button>
      </td>

      <td className="px-4 py-3 flex justify-center">
        <button
          onClick={(event) => onOpenDropdown(event, usuario)}
          className="cursor-pointer hover:bg-gray-200 p-1 rounded transition-colors"
        >
          <GripVertical size={20} />
        </button>
      </td>
    </tr>
  );
});
