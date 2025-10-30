import axios, { type AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://api.betterlifeboard.com';

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
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      '요청 처리 중 오류가 발생했습니다.';
    const normalizedError: ApiError = new Error(message);
    normalizedError.name = 'ApiError';
    normalizedError.status = error.response?.status;
    normalizedError.originalError = error;
    return Promise.reject(normalizedError);
  },
);
