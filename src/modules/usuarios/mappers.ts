import { IUsuario, IUsuarioAPI } from "./types";

export function mapUsuarioFromApi(usuario: IUsuarioAPI): IUsuario {
  const rawEstado: unknown = usuario.estado;
  const isActivo =
    rawEstado === "ACTIVO" ||
    rawEstado === "1" ||
    rawEstado === 1;
  const estado: IUsuario["estado"] = isActivo ? "Activo" : "Inactivo";

  return {
    id: parseInt(usuario.id, 10),
    idEmpleado: usuario.id_empleado,
    nombre: usuario.nombresCompletos,
    usuario: parseInt(usuario.nit, 10) || 0,
    totalMarca: usuario.empresasNombresArray?.length || 0,
    marcas: usuario.empresasNombresArray || [],
    sede: usuario.sede || "",
    estado,
    perfil: usuario.perfil,
    nit: usuario.nit,
    empresas: usuario.empresasArray || [],
  };
}
