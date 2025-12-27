"use client";

import { useState, useEffect } from "react";
import { AuthContext, User } from "../context/AuthContext";
import { authService } from "../services/auth.service";
import { setUser, getUser, removeUser, setToken, removeToken, removeCookie } from "@/utils/cookies";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUserState] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Cargar usuario de cookies al iniciar
    useEffect(() => {
        const savedUser = getUser();
        if (savedUser) {
            setUserState(savedUser);
        }
        setLoading(false);
    }, []);

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

            // Guardar token en cookie
            setToken(response.accessToken);

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

    const logout = () => {
        // Borrar todas las cookies relacionadas con la sesión
        removeUser();
        removeToken();
        
        // Borrar cualquier otra cookie que pueda existir (por seguridad)
        removeCookie('refreshToken');
        
        // Limpiar el estado del usuario
        setUserState(null);
        
        // Redirigir al login (se hace mediante el useEffect en DashboardLayout)
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
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
