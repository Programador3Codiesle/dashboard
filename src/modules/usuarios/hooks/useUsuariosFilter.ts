import { useState } from "react";
import { IUsuario } from "../types";

export function useUsuariosFilter(usuarios: IUsuario[]) {
    const [search, setSearch] = useState("");

    const filtered = usuarios.filter(usuario =>
        usuario.nombre.toLowerCase().includes(search.toLowerCase()) ||
        usuario.usuario.toString().includes(search.toLowerCase()) ||
        (usuario.marcas || []).some(marca => marca.toLowerCase().includes(search.toLowerCase())) ||
        usuario.sede.toString().includes(search.toLowerCase()) ||
        usuario.estado.toLowerCase().startsWith(search.toLowerCase())
    );

    return {
        search,
        setSearch,
        filtered
    };
}
