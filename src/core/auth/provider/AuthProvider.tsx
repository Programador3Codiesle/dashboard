"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext, User } from "../context/AuthContext";
import { authService } from "../services/auth.service";
import { mapLoginUser } from "../map-login-user";
import { setUser, getUser, removeUser, removeCookie, getRememberSession } from "@/utils/cookies";
import { withNextBasePath } from "@/config/next-base-path";

const INACTIVITY_LIMIT_MS = 4 * 60 * 60 * 1000;
const ACTIVITY_THRESHOLD_MS = 30 * 60 * 1000;
const SESSION_RETRY_ATTEMPTS = 3;

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUserState] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const queryClient = useQueryClient();
    const lastActivity = useRef<number>(Date.now());
    const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const normalizeEmpresaSelection = useCallback((currentUser: User): User => {
        const empresasAsignadas = currentUser.empresas_asignadas || [];

        if (empresasAsignadas.length === 0) {
            return currentUser;
        }

        const empresaActual = currentUser.empresa;
        const empresaValida =
            typeof empresaActual === 'number' && empresasAsignadas.includes(empresaActual);

        if (empresaValida) {
            return currentUser;
        }

        return {
            ...currentUser,
            empresa: empresasAsignadas[0],
        };
    }, []);

    const applySessionUser = useCallback((next: User) => {
        const normalizedUser = normalizeEmpresaSelection(next);
        setUser(normalizedUser, getRememberSession());
        setUserState(normalizedUser);
    }, [normalizeEmpresaSelection]);

    useEffect(() => {
        const initializeAuth = async () => {
            const savedUser = getUser();

            let check = await authService.getProfile();
            for (let attempt = 1; attempt < SESSION_RETRY_ATTEMPTS && check.status === "unavailable"; attempt++) {
                await sleep(500 * 2 ** (attempt - 1));
                check = await authService.getProfile();
            }

            if (check.status === "unavailable") {
                if (savedUser) {
                    applySessionUser(savedUser);
                }
                setLoading(false);
                return;
            }

            if (check.status === "unauthenticated") {
                removeUser();
                setUserState(null);
                setLoading(false);
                return;
            }

            const fromApi = check.profile.user
                ? mapLoginUser(check.profile.user)
                : null;
            const nextUser = fromApi
                ? {
                    ...fromApi,
                    empresa: savedUser?.empresa,
                }
                : savedUser;

            if (nextUser) {
                applySessionUser(nextUser);
            }

            setLoading(false);
        };

        void initializeAuth();
    }, [applySessionUser]);

    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        } finally {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
                refreshTimeoutRef.current = null;
            }

            removeUser();
            removeCookie('refresh_token');

            queryClient.clear();

            setUserState(null);

            if (typeof window !== 'undefined') {
                window.location.href = withNextBasePath("/login");
            }
        }
    }, [queryClient]);

    useEffect(() => {
        const updateActivity = () => {
            lastActivity.current = Date.now();
        };

        window.addEventListener("mousemove", updateActivity);
        window.addEventListener("keydown", updateActivity);
        window.addEventListener("click", updateActivity);
        window.addEventListener("scroll", updateActivity);
        window.addEventListener("focus", updateActivity);
        window.addEventListener("touchstart", updateActivity);

        return () => {
            window.removeEventListener("mousemove", updateActivity);
            window.removeEventListener("keydown", updateActivity);
            window.removeEventListener("click", updateActivity);
            window.removeEventListener("scroll", updateActivity);
            window.removeEventListener("focus", updateActivity);
            window.removeEventListener("touchstart", updateActivity);
        };
    }, []);

    useEffect(() => {
        if (!user) return;

        const inactivityInterval = setInterval(() => {
            const inactiveTime = Date.now() - lastActivity.current;

            if (inactiveTime > INACTIVITY_LIMIT_MS) {
                logout();
            }
        }, 60 * 1000);

        return () => clearInterval(inactivityInterval);
    }, [user, logout]);

    useEffect(() => {
        if (!user) return;

        let mounted = true;

        const scheduleNext = () => {
            if (!mounted) return;

            const minTime = 13.5 * 60 * 1000;
            const maxTime = 14 * 60 * 1000;
            const randomDelay = Math.random() * (maxTime - minTime) + minTime;

            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
                refreshTimeoutRef.current = null;
            }

            refreshTimeoutRef.current = setTimeout(async () => {
                if (!mounted) return;

                const inactiveTime = Date.now() - lastActivity.current;

                if (inactiveTime < ACTIVITY_THRESHOLD_MS) {
                    const result = await authService.refreshToken();
                    if (result.status === "unauthenticated") {
                        logout();
                        return;
                    }
                    scheduleNext();
                    return;
                }

                scheduleNext();
            }, randomDelay);
        };

        scheduleNext();

        return () => {
            mounted = false;
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
                refreshTimeoutRef.current = null;
            }
        };
    }, [user, logout]);

    const login = useCallback(async (credentials: { user: string; password: string; remember: boolean }): Promise<User> => {
        const nitUsuario = parseInt(credentials.user, 10);

        if (isNaN(nitUsuario)) {
            throw new Error("El usuario debe ser un número NIT válido");
        }

        const response = await authService.login({
            nit_usuario: nitUsuario,
            password: credentials.password,
            remember: credentials.remember,
        });

        const userData = mapLoginUser(response.user);
        const normalizedUser = normalizeEmpresaSelection(userData);
        setUser(normalizedUser, credentials.remember);
        setUserState(normalizedUser);
        lastActivity.current = Date.now();
        return normalizedUser;
    }, [normalizeEmpresaSelection]);

    const updateUser = useCallback((partial: Partial<User>) => {
        setUserState((prev) => {
            if (!prev) return prev;
            const next = normalizeEmpresaSelection({ ...prev, ...partial });
            setUser(next, getRememberSession());
            return next;
        });
    }, [normalizeEmpresaSelection]);

    const authValue = useMemo(() => ({
        user,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
    }), [user, loading, login, logout, updateUser]);

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    );
}
