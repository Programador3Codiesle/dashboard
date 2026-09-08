// Servicio de autenticación
import { getApiBaseUrl } from "@/config/public-env";
import { fetchWithAuth } from "@/utils/api";
import type { LoginUserPayload } from "@/core/auth/map-login-user";
import {
  sessionAvailabilityFromHttpStatus,
  type SessionAvailability,
} from "@/core/auth/session-status";

const API_URL = getApiBaseUrl();

export interface LoginCredentials {
  nit_usuario: number;
  password: string;
  remember: boolean;
}

export interface LoginResponse {
  user: LoginUserPayload;
}

export interface LoginErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}

export interface ProfileResponse {
  sub: string;
  email?: number;
  role: string;
  user?: LoginUserPayload;
}

export type SessionCheck =
  | { status: "authenticated"; profile: ProfileResponse }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

export type RefreshSessionResult = {
  status: Exclude<SessionAvailability, "authenticated"> | "ok";
};

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
        remember: credentials.remember,
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

  async getProfile(): Promise<SessionCheck> {
    try {
      const response = await fetchWithAuth(`${API_URL}/auth/profile`, {
        method: "GET",
      });

      const availability = sessionAvailabilityFromHttpStatus(
        response.status,
        response.ok,
      );

      if (availability === "authenticated") {
        const data: ProfileResponse = await response.json();
        return { status: "authenticated", profile: data };
      }

      if (availability === "unauthenticated") {
        return { status: "unauthenticated" };
      }

      return { status: "unavailable" };
    } catch {
      return { status: "unavailable" };
    }
  },

  async refreshToken(): Promise<RefreshSessionResult> {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        return { status: "ok" };
      }

      const availability = sessionAvailabilityFromHttpStatus(
        response.status,
        false,
      );
      return {
        status:
          availability === "unauthenticated" ? "unauthenticated" : "unavailable",
      };
    } catch {
      return { status: "unavailable" };
    }
  },
};
