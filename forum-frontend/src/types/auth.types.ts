/**
 * User object returned after signup/login.
 * Note: auth endpoints use `id` (not `_id`) — we normalize this in the app.
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  credits: number;
}

/** Payload sent to POST /api/auth/signup */
export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

/** Payload sent to POST /api/auth/login */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Data returned inside ApiResponse after successful auth */
export interface AuthResponseData {
  user: AuthUser;
  token: string;
}

/**
 * Everything stored in React Context for authentication.
 * `isLoading` is true while we check localStorage on app startup.
 */
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
