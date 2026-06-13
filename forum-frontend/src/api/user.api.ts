/**
 * User profile API.
 */

import { apiClient } from '@/api/axios';
import type { ApiResponse } from '@/types/api.types';
import type { MeResponseData } from '@/types/user.types';

export async function fetchCurrentUser(): Promise<MeResponseData> {
  const { data } = await apiClient.get<ApiResponse<MeResponseData>>('/users/me');
  return data.data!;
}
