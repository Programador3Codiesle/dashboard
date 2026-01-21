// Utilidades para hacer peticiones API con cookies HttpOnly

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Variable para evitar múltiples refreshes simultáneos
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Refresca el token automáticamente
 */
async function refreshToken(): Promise<boolean> {
  // Si ya hay un refresh en curso, esperar a que termine
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const success = response.ok;
      
      if (!success) {
        // Si el refresh falla, redirigir al login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }

      return success;
    } catch (error) {
      console.error("Error al refrescar token:", error);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Devuelve los headers básicos para peticiones API.
 * Las cookies HttpOnly (access_token) se envían automáticamente
 * cuando se usa credentials: 'include' en las peticiones fetch.
 */
export function getAuthHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
  };
}

/**
 * Wrapper para fetch que maneja automáticamente el refresh del token
 * cuando recibe un 401 (Unauthorized)
 * 
 * @param url - URL de la petición
 * @param options - Opciones de fetch (method, headers, body, etc.)
 * @returns Promise<Response>
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Configurar credentials por defecto
  const fetchOptions: RequestInit = {
    ...options,
    credentials: "include" as RequestCredentials,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  // Primera petición
  let response = await fetch(url, fetchOptions);

  // Si recibimos 401, intentar refrescar el token
  if (response.status === 401) {
    const refreshed = await refreshToken();

    // Si el refresh fue exitoso, reintentar la petición original
    if (refreshed) {
      response = await fetch(url, fetchOptions);
    } else {
      // Si el refresh falló, lanzar error
      throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    }
  }

  return response;
}



