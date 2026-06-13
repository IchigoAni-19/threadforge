import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

/**
 * Top navigation bar shown on every page.
 * Displays auth-aware links: login/signup when logged out, user info + logout when logged in.
 */
export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            TF
          </div>
          <span className="text-lg font-bold text-slate-900">ThreadForge</span>
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.credits} credits</p>
              </div>
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-brand-600">
                Login
              </Link>
              <Link to="/signup">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
