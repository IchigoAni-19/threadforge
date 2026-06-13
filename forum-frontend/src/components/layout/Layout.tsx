import { Outlet } from 'react-router-dom';

import { Header } from '@/components/layout/Header';

/**
 * App shell: header + main content area.
 * Uses <Outlet /> to render the active child route (React Router layout pattern).
 */
export function Layout() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
