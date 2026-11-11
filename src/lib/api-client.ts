import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { SESSION_EXPIRED_EVENT } from "@/core/auth/session-status";
import { getApiBaseUrl } from "@/config/public-env";
import { ensureFreshSession } from "@/utils/api";
import {
  isIdempotentHttpMethod,
  shouldRetryTransientHttp,
  sleepMs,
  TRANSIENT_RETRY_MAX,
  transientRetryDelayMs,
} from "@/utils/retry-transient";

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _transientRetry?: number;
  _authRetry?: boolean;
};

let sessionEndNotified = false;

function isCredentialUrl(url?: string): boolean {
  if (!url) return false;
  return /\/auth\/(refresh|login|logout)(?:\?|$)/.test(url);
}

function notifySessionExpired(): void {
  if (typeof window === "undefined" || sessionEndNotified) return;
  sessionEndNotified = true;
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableRequestConfig | undefined;
    if (!config || error.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    if (status === 401 && !isCredentialUrl(config.url)) {
      if (config._authRetry) {
        notifySessionExpired();
        return Promise.reject(error);
      }
      config._authRetry = true;
      const renewed = await ensureFreshSession();
      if (renewed === "ok") {
        sessionEndNotified = false;
        return apiClient.request(config);
      }
      if (renewed === "unauthenticated") {
        notifySessionExpired();
      }
      return Promise.reject(error);
    }

    if (!isIdempotentHttpMethod(config.method)) {
      return Promise.reject(error);
    }

    const attempt = config._transientRetry ?? 0;
    const canRetry =
      status != null
        ? shouldRetryTransientHttp(status, attempt)
        : attempt < TRANSIENT_RETRY_MAX - 1;

    if (!canRetry) {
      return Promise.reject(error);
    }

    config._transientRetry = attempt + 1;
    await sleepMs(transientRetryDelayMs(attempt));
    return apiClient.request(config);
  },
);
