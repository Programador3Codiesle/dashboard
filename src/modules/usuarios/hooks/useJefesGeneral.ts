import { useEffect, useState, useCallback, useRef } from "react";
import { usuariosService } from "../services/usuarios.service";
import { IJefeGeneral, IUsuarioJefeCandidato } from "../types";
import { IErrorResponse } from "@/types/global";

export const useJefesGeneral = () => {
    const [jefes, setJefes] = useState<IJefeGeneral[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<IErrorResponse | null>(null);
    const mountedRef = useRef(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchJefes = useCallback(async () => {
        // Cancelar petición anterior si existe
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Crear nuevo AbortController para esta petición
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        setIsLoading(true);
        setError(null);

        try {
            const data = await usuariosService.getJefesGeneral();

            // Solo actualizar estado si el componente sigue montado y no se canceló la petición
            if (mountedRef.current && !abortController.signal.aborted) {
                setJefes(data);
            }
        } catch (err: any) {
            // Ignorar errores de cancelación
            if (err.name === 'AbortError' || abortController.signal.aborted) {
                return;
            }
            if (mountedRef.current && !abortController.signal.aborted) {
                setError({
                    message: err.message || "Error al cargar jefes generales",
                    code: 500,
                });
            }
        } finally {
            if (mountedRef.current && !abortController.signal.aborted) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        fetchJefes();

        // Cleanup: marcar como desmontado y cancelar petición pendiente
        return () => {
            mountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchJefes]);

    return { jefes, isLoading, error, refetch: fetchJefes };
};

export const useUsuariosJefes = () => {
    const [usuarios, setUsuarios] = useState<IUsuarioJefeCandidato[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<IErrorResponse | null>(null);
    const mountedRef = useRef(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchUsuarios = useCallback(async () => {
        // Cancelar petición anterior si existe
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Crear nuevo AbortController para esta petición
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        setIsLoading(true);
        setError(null);

        try {
            const data = await usuariosService.getUsuariosJefes();

            // Solo actualizar estado si el componente sigue montado y no se canceló la petición
            if (mountedRef.current && !abortController.signal.aborted) {
                setUsuarios(data);
            }
        } catch (err: any) {
            // Ignorar errores de cancelación
            if (err.name === 'AbortError' || abortController.signal.aborted) {
                return;
            }
            if (mountedRef.current && !abortController.signal.aborted) {
                setError({
                    message: err.message || "Error al cargar usuarios candidatos a jefe",
                    code: 500,
                });
            }
        } finally {
            if (mountedRef.current && !abortController.signal.aborted) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        fetchUsuarios();

        // Cleanup: marcar como desmontado y cancelar petición pendiente
        return () => {
            mountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchUsuarios]);

    return { usuarios, isLoading, error, refetch: fetchUsuarios };
};


