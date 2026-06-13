/**
 * Authentication API functions.
 * Each function maps 1:1 to a backend endpoint.
 * Pages/components call these — they never use Axios directly.
 */

import { apiClient } from '@/api/axios';
import type { ApiResponse } from '@/types/api.types';
import type {
  AuthResponseData,
  LoginPayload,
  SignupPayload,
} from '@/types/auth.types';

export async function signup(payload: SignupPayload): Promise<AuthResponseData> {
  const { data } = await apiClient.post<ApiResponse<AuthResponseData>>(
    '/auth/signup',
    payload,
  );
  return data.data!;
}

export async function login(payload: LoginPayload): Promise<AuthResponseData> {
  const { data } = await apiClient.post<ApiResponse<AuthResponseData>>(
    '/auth/login',
    payload,
  );
  return data.data!;
}
