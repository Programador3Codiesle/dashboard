// Utilidades para hacer peticiones API con cookies HttpOnly
import {
  isTransientHttpStatus,
  isUnauthorizedHttpStatus,
} from "@/core/auth/session-status";
import { getApiBaseUrl } from "@/config/public-env";

const API_URL = getApiBaseUrl();

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

type QueuedRequest = {
  resolve: (value: Response) => void;
  reject: (error: Error) => void;
  url: string;
  options: RequestInit;
};

const requestQueue: QueuedRequest[] = [];

type PendingRequest = {
  promise: Promise<Response>;
  timestamp: number;
};

const pendingRequests = new Map<string, PendingRequest>();
const REQUEST_CACHE_TIMEOUT = 1000;

function getRequestKey(url: string, options: RequestInit): string {
  const method = options.method || "GET";
  const body = options.body ? JSON.stringify(options.body) : "";
  return `${method}:${url}:${body}`;
}

function syntheticResponse(status: number): Response {
  return new Response(null, { status });
}

function settleQueueWithStatus(status: number) {
  const queue = [...requestQueue];
  requestQueue.length = 0;
  for (const queuedRequest of queue) {
    queuedRequest.resolve(syntheticResponse(status));
  }
}

/**
 * Refresca el token con retry. true = cookies nuevas; false = no se pudo
 * (401 real o API caída). La cola recibe Response, no "sesión expirada" en 5xx.
 */
async function refreshToken(): Promise<boolean> {
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

          if (response.ok) {
            const queue = [...requestQueue];
            requestQueue.length = 0;

            const BATCH_SIZE = 15;

            for (let i = 0; i < queue.length; i += BATCH_SIZE) {
              const batch = queue.slice(i, i + BATCH_SIZE);

              await Promise.all(
                batch.map(async (queuedRequest) => {
                  try {
                    const retryResponse = await fetch(
                      queuedRequest.url,
                      queuedRequest.options,
                    );

                    if (retryResponse.status === 401) {
                      queuedRequest.resolve(syntheticResponse(401));
                    } else {
                      queuedRequest.resolve(retryResponse);
                    }
                  } catch {
                    queuedRequest.resolve(syntheticResponse(503));
                  }
                }),
              );

              if (i + BATCH_SIZE < queue.length) {
                await new Promise((resolve) => setTimeout(resolve, 50));
              }
            }

            return true;
          }

          if (response.status === 429 || isTransientHttpStatus(response.status)) {
            const retryAfter = parseInt(
              response.headers.get("Retry-After") || "5",
              10,
            );
            const backoffTime = Math.min(
              retryAfter * 1000,
              Math.pow(2, retryCount) * 1000,
            );

            await new Promise((resolve) => setTimeout(resolve, backoffTime));
            retryCount++;
            continue;
          }

          if (isUnauthorizedHttpStatus(response.status)) {
            settleQueueWithStatus(401);
            return false;
          }

          settleQueueWithStatus(isTransientHttpStatus(response.status) ? 503 : response.status);
          return false;
        } catch {
          retryCount++;

          if (retryCount >= maxRetries) {
            settleQueueWithStatus(503);
            return false;
          }

          const backoffTime = Math.pow(2, retryCount) * 1000;
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        }
      }

      settleQueueWithStatus(503);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export function getAuthHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
  };
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const fetchOptions: RequestInit = {
    ...options,
    credentials: "include" as RequestCredentials,
    headers: {
      ...(isFormData ? {} : getAuthHeaders()),
      ...options.headers,
    },
  };

  const requestKey = getRequestKey(url, fetchOptions);
  const now = Date.now();

  const pendingRequest = pendingRequests.get(requestKey);
  if (pendingRequest) {
    const age = now - pendingRequest.timestamp;
    if (age < REQUEST_CACHE_TIMEOUT) {
      return pendingRequest.promise.then((response) => response.clone());
    }
    pendingRequests.delete(requestKey);
  }

  const requestPromise = (async (): Promise<Response> => {
    try {
      const response = await fetch(url, fetchOptions);

      if (response.status === 401) {
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

        return new Promise((resolve, reject) => {
          requestQueue.push({
            resolve,
            reject,
            url,
            options: fetchOptions,
          });

          void refreshToken();
        });
      }

      return response;
    } finally {
      setTimeout(() => {
        pendingRequests.delete(requestKey);
      }, REQUEST_CACHE_TIMEOUT);
    }
  })();

  pendingRequests.set(requestKey, {
    promise: requestPromise,
    timestamp: now,
  });

  return requestPromise.then((response) => response.clone());
}
