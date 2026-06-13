/**
 * Custom hook to consume AuthContext safely.
 *
 * React concept: CUSTOM HOOK
 * A function starting with "use" that can call other hooks.
 * This encapsulates the context lookup and error guard in one place.
 */

import { useContext } from 'react';

import { AuthContext } from '@/context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
