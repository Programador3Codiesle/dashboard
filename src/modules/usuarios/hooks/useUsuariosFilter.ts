import { useState, useMemo } from "react";
import { IUsuario } from "../types";
import { useDebouncedValue } from "@/components/shared/ui/hooks/useDebouncedValue";

export function useUsuariosFilter(usuarios: IUsuario[]) {
    const [search, setSearch] = useState("");
    
    // Debounce de 300ms para evitar filtrado en cada keystroke
    const debouncedSearch = useDebouncedValue(search, 300);

    const filtered = useMemo(() => {
        const searchLower = debouncedSearch.toLowerCase().trim();
        
        // Si no hay búsqueda, mostrar todos
        if (!searchLower) return usuarios;
        
        return usuarios.filter(usuario => {
            // Buscar en nombre
            const nombreMatch = usuario.nombre?.toLowerCase().includes(searchLower) || false;
            
            // Buscar en cédula/NIT (tanto en usuario como en nit)
            const cedulaMatch = 
                (usuario.usuario?.toString().includes(searchLower) || false) ||
                (usuario.nit?.toLowerCase().includes(searchLower) || false);
            
            // Buscar en marcas/empresas
            const marcasMatch = (usuario.marcas || []).some(marca => 
                marca.toLowerCase().includes(searchLower)
            );
            
            // Buscar en sede
            const sedeMatch = usuario.sede?.toString().toLowerCase().includes(searchLower) || false;
            
            // Buscar en estado
            const estadoMatch = usuario.estado?.toLowerCase().includes(searchLower) || false;
            
            // Buscar en perfil
            const perfilMatch = usuario.perfil?.toLowerCase().includes(searchLower) || false;
            
            return nombreMatch || cedulaMatch || marcasMatch || sedeMatch || estadoMatch || perfilMatch;
        });
    }, [usuarios, debouncedSearch]);

    return {
        search,
        setSearch,
        filtered
    };
}
