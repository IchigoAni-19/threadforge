/**
 * Centralized Axios instance for all API calls.
 *
 * Axios concepts used:
 * - baseURL: prepended to every request path
 * - interceptors: functions that run before requests / after responses
 *
 * Request interceptor: attaches JWT from localStorage as Bearer token.
 * Response interceptor: normalizes errors into a consistent shape.
 */

import axios, { AxiosError } from 'axios';

import type { ApiError } from '@/types/api.types';
import { storage } from '@/utils/storage';

// In dev, leave empty to use Vite proxy. In production, set VITE_API_URL.
const baseURL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT to every request if it exists
apiClient.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Convert Axios errors into our ApiError shape
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const apiError: ApiError = {
      message:
        error.response?.data?.message ??
        error.message ??
        'Something went wrong. Please try again.',
      status: error.response?.status,
    };
    return Promise.reject(apiError);
  },
);
