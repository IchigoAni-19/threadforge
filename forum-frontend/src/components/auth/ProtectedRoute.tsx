import { Navigate, Outlet } from 'react-router-dom';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';

/**
 * Route guard for pages that require authentication.
 *
 * React Router concept: <Outlet />
 * Renders the child route's component when the guard passes.
 *
 * Flow:
 * - isLoading → show spinner (checking localStorage)
 * - not authenticated → redirect to /login
 * - authenticated → render child page
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner label="Checking session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
