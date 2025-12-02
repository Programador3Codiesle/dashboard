"use client";

import { useState, useEffect } from "react";
import { AuthContext, User } from "../context/AuthContext";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) setUser(JSON.parse(savedUser));
    }, []);

    const login = async (credentials: { user: string; password: string }) => {
        const { user, password } = credentials;

        // Simulación login real
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                if (user === "1095944273" && password === "123456") {
                    const mockUser: User = {
                        id: "1",
                        name: "Cristhian Sánchez",
                        user: "1095944273",
                        role: "admin",
                    };

                    localStorage.setItem("user", JSON.stringify(mockUser));
                    setUser(mockUser);
                    resolve();
                } else {
                    reject(new Error("Credenciales incorrectas"));
                }
            }, 900);
        });
    };

    const logout = () => {
        localStorage.removeItem("user");
        setUser(null);
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
