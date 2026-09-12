// Servicio de autenticación
import { getApiBaseUrl } from "@/config/public-env";
import { fetchWithAuth } from "@/utils/api";
import type { LoginUserPayload } from "@/core/auth/map-login-user";
import {
  sessionAvailabilityFromHttpStatus,
  type SessionAvailability,
} from "@/core/auth/session-status";

import { MustChangePasswordError } from "@/core/auth/must-change-password-error";

const API_URL = getApiBaseUrl();

function messageFromBody(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const msg = (body as { message?: unknown }).message;
  if (typeof msg === "string" && msg.trim()) return msg;
  if (Array.isArray(msg) && typeof msg[0] === "string") return msg[0];
  return fallback;
}

export interface LoginCredentials {
  nit_usuario: number;
  password: string;
  remember: boolean;
}

export interface LoginResponse {
  user: LoginUserPayload;
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

    const data: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(messageFromBody(data, "Credenciales inválidas"));
    }

    if (
      data &&
      typeof data === "object" &&
      "mustChangePassword" in data &&
      (data as { mustChangePassword?: boolean }).mustChangePassword === true
    ) {
      const rec = data as { userId?: unknown; changeToken?: unknown };
      throw new MustChangePasswordError(
        String(rec.userId ?? ""),
        String(rec.changeToken ?? ""),
      );
    }

    return data as LoginResponse;
  },

  async solicitarCodigoRecuperacion(nit: number): Promise<{ mail: string }> {
    const response = await fetch(`${API_URL}/auth/recuperar-codigo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nit }),
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        messageFromBody(
          data,
          "La cedula es incorrecta o no tienes correo corporativo",
        ),
      );
    }
    const mail = (data as { mail?: string }).mail;
    if (!mail) {
      throw new Error("La cedula es incorrecta o no tienes correo corporativo");
    }
    return { mail };
  },

  async validarCodigoRecuperacion(nit: number, codigo: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/recuperar-validar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nit, codigo }),
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(messageFromBody(data, "El codigo es incorrecto"));
    }
  },

  async actualizarPasswordForzado(params: {
    userId: string;
    changeToken: string;
    pass1: string;
    pass2: string;
  }): Promise<string> {
    const response = await fetch(`${API_URL}/auth/update-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(params),
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(messageFromBody(data, "Problemas con los datos enviados"));
    }
    return messageFromBody(data, "Contraseña actualizada con exito");
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
