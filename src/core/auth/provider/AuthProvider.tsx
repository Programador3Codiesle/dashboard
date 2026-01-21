"use client";

import { useState, useEffect } from "react";
import { AuthContext, User } from "../context/AuthContext";
import { authService } from "../services/auth.service";
import { setUser, getUser, removeUser, removeCookie } from "@/utils/cookies";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUserState] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

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

    // Refresh preventivo cada 14 minutos (antes de que expire a los 15)
    useEffect(() => {
        if (!user) return;

        const refreshInterval = setInterval(async () => {
            try {
                const success = await authService.refreshToken();
                if (!success) {
                    // Si el refresh falla, limpiar sesión
                    removeUser();
                    setUserState(null);
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }
                }
            } catch (error) {
                console.error("Error en refresh preventivo:", error);
            }
        }, 14 * 60 * 1000); // 14 minutos

        return () => clearInterval(refreshInterval);
    }, [user]);

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

            // Crear objeto usuario
            const userData: User = {
                id: response.user.id,
                user: response.user.nit_usuario.toString(),
                nit_usuario: response.user.nit_usuario,
                perfil_postventa: response.user.perfil_postventa,
                nombre_usuario: response.user.nombre_usuario,
            };

            // Guardar usuario en cookie
            setUser(userData);
            setUserState(userData);
        } catch (error: any) {
            throw error;
        }
    };

    const logout = async () => {
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
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
