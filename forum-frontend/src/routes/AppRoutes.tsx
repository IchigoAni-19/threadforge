import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { PostDetailPage } from '@/pages/PostDetailPage';
import { SignupPage } from '@/pages/SignupPage';

/**
 * Central route configuration.
 *
 * React Router concepts:
 * - <Routes>: container for all route definitions
 * - <Route path element>: maps a URL to a component
 * - Nested routes: ProtectedRoute wraps child routes that need auth
 */
export function AppRoutes() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner label="Starting ThreadForge..." />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />

        {/* Protected routes — require JWT */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
        </Route>

        {/* Catch-all: unknown URLs redirect to dashboard or login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
