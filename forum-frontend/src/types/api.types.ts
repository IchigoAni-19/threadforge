/**
 * Shared API response wrapper used by every backend endpoint.
 *
 * TypeScript concept: GENERICS (<T>)
 * The `T` is a placeholder for the actual data shape inside `data`.
 * Example: ApiResponse<User> means data will be a User object.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Standard error shape thrown by our Axios interceptor.
 * We normalize backend errors into this format so UI code stays consistent.
 */
export interface ApiError {
  message: string;
  status?: number;
}
