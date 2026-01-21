// Servicio de autenticación

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface LoginCredentials {
  nit_usuario: number;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    nit_usuario: number;
    perfil_postventa: string;
    nombre_usuario: string;
  };
}

export interface LoginErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}

export interface ProfileResponse {
  sub: string;
  email: number;
  role: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        nit_usuario: credentials.nit_usuario,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      const errorData: LoginErrorResponse = await response.json();
      throw new Error(errorData.message || "Credenciales inválidas");
    }

    const data: LoginResponse = await response.json();
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor:", error);
    }
  },

  async getProfile(): Promise<ProfileResponse | null> {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        return null;
      }

      const data: ProfileResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      return null;
    }
  },

  async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      return response.ok;
    } catch (error) {
      console.error("Error al refrescar token:", error);
      return false;
    }
  },
};

