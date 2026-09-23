import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getApiBaseUrl } from "@/config/public-env";
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
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableRequestConfig | undefined;
    if (
      !config ||
      error.code === "ERR_CANCELED" ||
      !isIdempotentHttpMethod(config.method)
    ) {
      return Promise.reject(error);
    }

    const attempt = config._transientRetry ?? 0;
    const status = error.response?.status;
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
