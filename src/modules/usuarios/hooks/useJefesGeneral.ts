import { useEffect, useState, useCallback } from "react";
import { usuariosService } from "../services/usuarios.service";
import { IJefeGeneral, IUsuarioJefeCandidato } from "../types";
import { IErrorResponse } from "@/types/global";

export const useJefesGeneral = () => {
    const [jefes, setJefes] = useState<IJefeGeneral[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<IErrorResponse | null>(null);

    const fetchJefes = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await usuariosService.getJefesGeneral();
            setJefes(data);
        } catch (err: any) {
            setError({
                message: err.message || "Error al cargar jefes generales",
                code: 500,
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJefes();
    }, [fetchJefes]);

    return { jefes, isLoading, error, refetch: fetchJefes };
};

export const useUsuariosJefes = () => {
    const [usuarios, setUsuarios] = useState<IUsuarioJefeCandidato[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<IErrorResponse | null>(null);

    const fetchUsuarios = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await usuariosService.getUsuariosJefes();
            setUsuarios(data);
        } catch (err: any) {
            setError({
                message: err.message || "Error al cargar usuarios candidatos a jefe",
                code: 500,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    return { usuarios, isLoading, error, refetch: fetchUsuarios };
};


