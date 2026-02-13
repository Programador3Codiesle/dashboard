"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { AuthContext, User } from "../context/AuthContext";
import { authService } from "../services/auth.service";
import { setUser, getUser, removeUser, removeCookie } from "@/utils/cookies";

const INACTIVITY_LIMIT_MS = 4 * 60 * 60 * 1000; // 4 horas
const ACTIVITY_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutos para considerar "activo"

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUserState] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const lastActivity = useRef<number>(Date.now());

    // Cargar usuario de cookies al iniciar y verificar sesión con el backend
    useEffect(() => {
        const initializeAuth = async () => {
            const savedUser = getUser();

            if (savedUser) {
                // Verificar que la sesión sigue válida en el backend
                try {
                    const profile = await authService.getProfile();
                    if (profile) {
                        // Sesión válida, mantener el usuario
                        setUserState(savedUser);
                    } else {
                        // Sesión expirada o inválida, limpiar
                        removeUser();
                        setUserState(null);
                    }
                } catch (error) {
                    // Error al verificar, limpiar por seguridad
                    removeUser();
                    setUserState(null);
                }
            }

            setLoading(false);
        };

        initializeAuth();
    }, []);

    // Definir logout antes de los useEffect que lo usan
    const logout = useCallback(async () => {
        try {
            // Llamar al backend para invalidar el refresh token y borrar cookies HttpOnly
            await authService.logout();
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        } finally {
            // Borrar todas las cookies relacionadas con la sesión (lado cliente)
            removeUser();
            removeCookie('refresh_token');

            // Limpiar el estado del usuario
            setUserState(null);

            // Redirigir al login
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
    }, []);

    // Registrar actividad del usuario (mouse, teclado, clics, scroll, focus)
    useEffect(() => {
        const updateActivity = () => {
            lastActivity.current = Date.now();
        };

        // Eventos que indican actividad del usuario
        window.addEventListener("mousemove", updateActivity);
        window.addEventListener("keydown", updateActivity);
        window.addEventListener("click", updateActivity);
        window.addEventListener("scroll", updateActivity);
        window.addEventListener("focus", updateActivity);
        window.addEventListener("touchstart", updateActivity); // Para dispositivos táctiles

        return () => {
            window.removeEventListener("mousemove", updateActivity);
            window.removeEventListener("keydown", updateActivity);
            window.removeEventListener("click", updateActivity);
            window.removeEventListener("scroll", updateActivity);
            window.removeEventListener("focus", updateActivity);
            window.removeEventListener("touchstart", updateActivity);
        };
    }, []);

    // Verificación de inactividad - cerrar sesión después de 4 horas sin actividad
    useEffect(() => {
        if (!user) return;

        const inactivityInterval = setInterval(() => {
            const inactiveTime = Date.now() - lastActivity.current;

            if (inactiveTime > INACTIVITY_LIMIT_MS) {
                // 4 horas sin actividad → cerrar sesión
                logout();
            }
        }, 60 * 1000); // Verificar cada minuto

        return () => clearInterval(inactivityInterval);
    }, [user, logout]);

    // Refresh preventivo solo si hay actividad reciente (últimos 30 minutos)
    // Se ejecuta con delay aleatorio entre 13.5 y 14 minutos para distribuir las solicitudes
    // y evitar que todos los usuarios refresquen al mismo tiempo
    useEffect(() => {
        if (!user) return;

        const scheduleRefresh = () => {
            const minTime = 13.5 * 60 * 1000;
            const maxTime = 14 * 60 * 1000;
            const randomDelay = Math.random() * (maxTime - minTime) + minTime;

            const refreshTimeout = setTimeout(async () => {
                const inactiveTime = Date.now() - lastActivity.current;

                if (inactiveTime < ACTIVITY_THRESHOLD_MS) {
                    try {
                        const success = await authService.refreshToken();
                        if (!success) {
                            console.error("Refresh preventivo falló, cerrando sesión");
                            logout();
                        } else {
                            console.log("Token refrescado preventivamente");
                            scheduleRefresh();
                        }
                    } catch (error) {
                        console.error("Error en refresh preventivo:", error);
                        if (inactiveTime < ACTIVITY_THRESHOLD_MS) {
                            logout();
                        }
                    }
                } else {
                    scheduleRefresh();
                }
            }, randomDelay);

            return refreshTimeout;
        };

        const timeoutId = scheduleRefresh();

        return () => clearTimeout(timeoutId);
    }, [user, logout]);

    const login = async (credentials: { user: string; password: string }) => {
        const nitUsuario = parseInt(credentials.user, 10);

        if (isNaN(nitUsuario)) {
            throw new Error("El usuario debe ser un número NIT válido");
        }

        try {
            const response = await authService.login({
                nit_usuario: nitUsuario,
                password: credentials.password,
            });

            // Crear objeto usuario (sin empresa; se elige en modal post-login)
            const userData: User = {
                id: response.user.id,
                user: response.user.nit_usuario.toString(),
                nit_usuario: response.user.nit_usuario,
                perfil_postventa: response.user.perfil_postventa,
                nombre_usuario: response.user.nombre_usuario,
            };

            setUser(userData);
            setUserState(userData);
            lastActivity.current = Date.now();
        } catch (error: any) {
            throw error;
        }
    };

    const updateUser = useCallback((partial: Partial<User>) => {
        setUserState((prev) => {
            if (!prev) return prev;
            const next = { ...prev, ...partial };
            setUser(next);
            return next;
        });
    }, []);

    const authValue = useMemo(() => ({
        user,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
    }), [user, loading, logout, updateUser]);

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    );
}
