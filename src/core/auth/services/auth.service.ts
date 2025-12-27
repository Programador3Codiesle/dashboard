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
  accessToken: string;
  refreshToken: string;
}

export interface LoginErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
};

