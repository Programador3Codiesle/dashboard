// Utilidades para hacer peticiones API con cookies HttpOnly

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Variable para evitar múltiples refreshes simultáneos
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// Cola de solicitudes que esperan a que se complete el refresh
type QueuedRequest = {
  resolve: (value: Response) => void;
  reject: (error: Error) => void;
  url: string;
  options: RequestInit;
};

const requestQueue: QueuedRequest[] = [];

// Cache de peticiones en curso para evitar duplicados
type PendingRequest = {
  promise: Promise<Response>;
  timestamp: number;
};

const pendingRequests = new Map<string, PendingRequest>();
const REQUEST_CACHE_TIMEOUT = 1000; // 1 segundo - tiempo máximo para considerar una petición como duplicada

/**
 * Genera una clave única para una petición basada en URL y opciones
 */
function getRequestKey(url: string, options: RequestInit): string {
  const method = options.method || 'GET';
  const body = options.body ? JSON.stringify(options.body) : '';
  return `${method}:${url}:${body}`;
}

/**
 * Refresca el token automáticamente con retry y backoff exponencial
 */
async function refreshToken(): Promise<boolean> {
  // Si ya hay un refresh en curso, esperar a que termine
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const maxRetries = 3;
      let retryCount = 0;
      
      while (retryCount < maxRetries) {
        try {
          const response = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          const success = response.ok;
          
          if (success) {
            // Procesar todas las solicitudes en cola en lotes para evitar saturación
            const queue = [...requestQueue];
            requestQueue.length = 0; // Limpiar la cola
            
            // Procesar solicitudes en lotes de 15 para no sobrecargar el servidor
            // Esto es especialmente importante cuando hay muchos usuarios simultáneos
            const BATCH_SIZE = 15;
            
            for (let i = 0; i < queue.length; i += BATCH_SIZE) {
              const batch = queue.slice(i, i + BATCH_SIZE);
              
              // Procesar el lote en paralelo
              await Promise.all(
                batch.map(async (queuedRequest) => {
                  try {
                    const retryResponse = await fetch(queuedRequest.url, queuedRequest.options);
                    
                    // Si después del refresh sigue fallando con 401, rechazar
                    if (retryResponse.status === 401) {
                      queuedRequest.reject(new Error("Sesión expirada. Por favor, inicia sesión nuevamente."));
                    } else {
                      queuedRequest.resolve(retryResponse);
                    }
                  } catch (error) {
                    queuedRequest.reject(error as Error);
                  }
                })
              );
              
              // Pequeña pausa entre lotes para no saturar el servidor
              // Esto ayuda a distribuir la carga cuando hay muchas solicitudes
              if (i + BATCH_SIZE < queue.length) {
                await new Promise(resolve => setTimeout(resolve, 50));
              }
            }
            
            return true;
          }

          // Si es 429 (Too Many Requests), esperar y reintentar con backoff exponencial
          if (response.status === 429) {
            const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
            const backoffTime = Math.min(
              retryAfter * 1000,
              Math.pow(2, retryCount) * 1000 // Backoff exponencial: 1s, 2s, 4s
            );
            
            console.warn(`Rate limit alcanzado, reintentando en ${backoffTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
            retryCount++;
            continue;
          }

          // Otro error, rechazar cola
          const queue = [...requestQueue];
          requestQueue.length = 0;
          const error = new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
          for (const queuedRequest of queue) {
            queuedRequest.reject(error);
          }
          return false;
        } catch (error) {
          retryCount++;
          
          if (retryCount >= maxRetries) {
            // Rechazar cola después de max retries
            const queue = [...requestQueue];
            requestQueue.length = 0;
            const refreshError = new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
            for (const queuedRequest of queue) {
              queuedRequest.reject(refreshError);
            }
            return false;
          }
          
          // Backoff exponencial: 1s, 2s, 4s
          const backoffTime = Math.pow(2, retryCount) * 1000;
          console.warn(`Error al refrescar token, reintentando en ${backoffTime}ms... (intento ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      }
      
      // Si llegamos aquí, todos los reintentos fallaron
      const queue = [...requestQueue];
      requestQueue.length = 0;
      const refreshError = new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      for (const queuedRequest of queue) {
        queuedRequest.reject(refreshError);
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
 * cuando recibe un 401 (Unauthorized) y evita peticiones duplicadas
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

  // Generar clave única para esta petición
  const requestKey = getRequestKey(url, fetchOptions);
  const now = Date.now();

  // Verificar si hay una petición idéntica en curso
  const pendingRequest = pendingRequests.get(requestKey);
  if (pendingRequest) {
    // Si la petición está en curso y no ha expirado, clonar la respuesta
    // para que cada llamada pueda leer su propio body stream
    const age = now - pendingRequest.timestamp;
    if (age < REQUEST_CACHE_TIMEOUT) {
      return pendingRequest.promise.then(response => {
        // Clonar la respuesta para que cada llamada tenga su propio body stream
        // Esto evita el error "body stream already read"
        return response.clone();
      });
    } else {
      // Si expiró, eliminarla del cache
      pendingRequests.delete(requestKey);
    }
  }

  // Crear la promesa de la petición
  const requestPromise = (async (): Promise<Response> => {
    try {
      // Primera petición
      let response = await fetch(url, fetchOptions);

      // Si recibimos 401 (Unauthorized), intentar refrescar el token
      if (response.status === 401) {
        if (process.env.NODE_ENV !== "production") {
          console.log("Token expirado detectado (401), intentando refrescar...");
        }
        
        // Si ya hay un refresh en curso, agregar esta solicitud a la cola y esperar
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            requestQueue.push({
              resolve,
              reject,
              url,
              options: fetchOptions,
            });
          });
        }

        // Agregar esta solicitud a la cola antes de iniciar el refresh
        // para que también sea reintentada cuando el refresh se complete
        return new Promise((resolve, reject) => {
          requestQueue.push({
            resolve,
            reject,
            url,
            options: fetchOptions,
          });

          // Iniciar el refresh (solo una vez)
          // La cola será procesada automáticamente cuando el refresh se complete
          refreshToken();
        });
      }

      return response;
    } finally {
      // Limpiar la petición del cache después de completarse
      // Usar setTimeout para permitir que otras peticiones duplicadas la reutilicen
      setTimeout(() => {
        pendingRequests.delete(requestKey);
      }, REQUEST_CACHE_TIMEOUT);
    }
  })();

  // Guardar la petición en el cache
  pendingRequests.set(requestKey, {
    promise: requestPromise,
    timestamp: now,
  });

  // Retornar una versión clonada para que el original en caché nunca se consuma
  // Esto permite que múltiples llamadas obtengan su propio body stream
  return requestPromise.then(response => response.clone());
}



