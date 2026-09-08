import type { User } from "@/core/auth/context/AuthContext";
import { toPermissionIdSet } from "@/utils/permission-ids";

export type LoginUserPayload = {
  id: string;
  nit_usuario: number;
  perfil_postventa: string;
  nombre_usuario: string;
  nom_perfil?: string;
  empresas_asignadas: number[];
  menus_permitidos: number[];
  submenus_permitidos: number[];
  trimenus_permitidos: number[];
};

export function mapLoginUser(payload: LoginUserPayload): User {
  return {
    id: payload.id,
    user: payload.nit_usuario.toString(),
    nit_usuario: payload.nit_usuario,
    perfil_postventa: payload.perfil_postventa,
    nom_perfil: payload.nom_perfil,
    nombre_usuario: payload.nombre_usuario,
    empresas_asignadas: Array.from(toPermissionIdSet(payload.empresas_asignadas)),
    menus_permitidos: Array.from(toPermissionIdSet(payload.menus_permitidos)),
    submenus_permitidos: Array.from(toPermissionIdSet(payload.submenus_permitidos)),
    trimenus_permitidos: Array.from(toPermissionIdSet(payload.trimenus_permitidos)),
  };
}
