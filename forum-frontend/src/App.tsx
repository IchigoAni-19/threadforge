/**
 * Root application component.
 *
 * Provider hierarchy:
 * AuthProvider (global auth state)
 *   └── AppRoutes (React Router pages)
 */

import { AuthProvider } from '@/context/AuthContext';
import { AppRoutes } from '@/routes/AppRoutes';

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
