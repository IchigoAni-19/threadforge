/**
 * AuthContext — global authentication state using React Context API.
 *
 * React concepts:
 * - createContext: creates a "channel" for sharing data without prop drilling
 * - Provider: wraps the app and supplies the value to all descendants
 * - useState: local state for user, token, loading flag
 * - useEffect: runs on mount to restore session from localStorage
 * - useCallback: memoizes functions so child components don't re-render unnecessarily
 *
 * DATA FLOW:
 * 1. App mounts → AuthProvider checks localStorage for token
 * 2. If token exists → call GET /api/users/me to validate and load user
 * 3. Login/Signup → save token + user to state and localStorage
 * 4. Logout → clear state and localStorage
 * 5. Any component calls useAuth() to read user or trigger login/logout
 */

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import * as authApi from '@/api/auth.api';
import * as userApi from '@/api/user.api';
import type { AuthUser, LoginPayload, SignupPayload } from '@/types/auth.types';
import { storage } from '@/utils/storage';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetches the latest user profile from the server.
   * Called after login and on app refresh to keep credits up to date.
   */
  const refreshUser = useCallback(async () => {
    const profileData = await userApi.fetchCurrentUser();
    const profile = profileData.profile;

    setUser({
      id: profile._id,
      name: profile.name,
      email: profile.email,
      credits: profileData.credits,
    });
  }, []);

  /**
   * Persists auth credentials to React state and localStorage.
   */
  const persistAuth = useCallback((authUser: AuthUser, authToken: string) => {
    storage.setToken(authToken);
    setToken(authToken);
    setUser(authUser);
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const result = await authApi.login(payload);
      persistAuth(result.user, result.token);
    },
    [persistAuth],
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      const result = await authApi.signup(payload);
      persistAuth(result.user, result.token);
    },
    [persistAuth],
  );

  const logout = useCallback(() => {
    storage.removeToken();
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Auto-login on refresh: if a token exists in localStorage,
   * validate it by fetching the current user profile.
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = storage.getToken();

      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      setToken(savedToken);

      try {
        await refreshUser();
      } catch {
        // Token expired or invalid — clear stale session
        storage.removeToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [refreshUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      signup,
      logout,
      refreshUser,
    }),
    [user, token, isLoading, login, signup, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
