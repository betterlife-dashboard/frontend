import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { LoginResponse } from '@/types/auth';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://api.betterlifeboard.com';
const storageKey = 'authToken';

export interface ApiError extends Error {
  status?: number;
  originalError?: unknown;
}

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
  withCredentials: true,
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipAuthRenew?: boolean;
};

let refreshPromise: Promise<string> | null = null;

const applyAuthorizationHeader = (headers: AxiosRequestConfig['headers'], value?: string) => {
  if (!headers) {
    return;
  }
  const headerObject = headers as {
    set?: (name: string, value?: string) => void;
    delete?: (name: string) => void;
    Authorization?: string;
  };
  if (typeof headerObject.set === 'function') {
    if (value) {
      headerObject.set('Authorization', value);
    } else {
      headerObject.delete?.('Authorization');
    }
    return;
  }
  if (value) {
    headerObject.Authorization = value;
  } else if ('Authorization' in headerObject) {
    delete headerObject.Authorization;
  }
};

const storeToken = (token: string) => {
  localStorage.setItem(storageKey, token);
  apiClient.defaults.headers.common = apiClient.defaults.headers.common ?? {};
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
};

const renewAuthToken = async () => {
  if (!refreshPromise) {
    const renewConfig: AxiosRequestConfig & { skipAuthRenew?: boolean } = {
      skipAuthRenew: true,
      headers: {
        Authorization: undefined,
      },
    };
    refreshPromise = apiClient.post<LoginResponse>('/auth/renew', renewConfig).then((response) => {
      const newToken = response.data.token;
      storeToken(newToken);
      return newToken;
    });
  }
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

const buildApiError = (error: unknown): ApiError => {
  if ((error as ApiError)?.name === 'ApiError') {
    return error as ApiError;
  }
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;
    const message =
      (responseData && typeof responseData === 'object' && 'message' in responseData
        ? String((responseData as Record<string, unknown>).message)
        : undefined) ??
      (responseData && typeof responseData === 'object' && 'error' in responseData
        ? String((responseData as Record<string, unknown>).error)
        : undefined) ??
      error.message ??
      '요청 처리 중 오류가 발생했습니다.';
    const normalizedError: ApiError = new Error(message);
    normalizedError.name = 'ApiError';
    normalizedError.status = error.response?.status;
    normalizedError.originalError = error;
    return normalizedError;
  }
  const fallbackMessage =
    error instanceof Error ? error.message : '요청 처리 중 오류가 발생했습니다.';
  const normalizedError: ApiError = new Error(fallbackMessage);
  normalizedError.name = 'ApiError';
  normalizedError.originalError = error;
  return normalizedError;
};

apiClient.interceptors.request.use((config) => {
  const requestConfig = config as RetryableRequestConfig;
  if (requestConfig.skipAuthRenew) {
    config.headers = config.headers ?? {};
    applyAuthorizationHeader(config.headers, undefined);
    return config;
  }

  const token = localStorage.getItem(storageKey);
  config.headers = config.headers ?? {};
  applyAuthorizationHeader(config.headers, token ? `Bearer ${token}` : undefined);
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (originalRequest?.skipAuthRenew) {
      return Promise.reject(buildApiError(error));
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await renewAuthToken();
        originalRequest.headers = originalRequest.headers ?? {};
        applyAuthorizationHeader(originalRequest.headers, `Bearer ${newToken}`);
        return apiClient(originalRequest);
      } catch (renewError) {
        return Promise.reject(buildApiError(renewError));
      }
    }

    return Promise.reject(buildApiError(error));
  },
);
