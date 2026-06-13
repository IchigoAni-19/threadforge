/**
 * localStorage helpers for JWT persistence.
 *
 * Why localStorage?
 * - Survives page refresh (unlike React state alone)
 * - Simple for learning projects
 * - Trade-off: vulnerable to XSS — production apps often prefer httpOnly cookies
 */

const TOKEN_KEY = 'threadforge_token';

export const storage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};
