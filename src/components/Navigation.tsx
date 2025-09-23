import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Film, Settings, LogOut, User } from 'lucide-react';
import { clearAuth, getCurrentUser } from '../services/api';
import MovieCountdown from './MovieCountdown';
import MovieCountdownDropdown from './MovieCountdownDropdown';
import NavbarCountdown from './NavbarCountdown';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = getCurrentUser();
  const isLoggedIn = !!currentUser;
  const isAdmin = currentUser?.role === 'admin';

  const handleLogout = () => {
    clearAuth();
    // Force page reload to ensure all components reinitialize with new auth state
    window.location.href = '/';
  };

  // Public links only — Admin comes from the separate conditional block below
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Movies', href: '/movies' },
    { name: 'Showtimes', href: '/showtimes' },
    ...(isLoggedIn ? [] : [{ name: 'Login', href: '/auth' }]),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-background border-b border-cinema-border sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Film className="h-8 w-8 text-cinema-red" />
              <span className="text-xl font-bold text-foreground">City Mate Movie</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-cinema-red ${
                  isActive(item.href) ? 'text-cinema-red' : 'text-foreground-secondary'
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Admin (only if admin) */}
            {isLoggedIn && isAdmin && (
              <Link
                to="/admin"
                className={`text-sm font-medium transition-colors hover:text-cinema-red flex items-center space-x-1 ${
                  isActive('/admin') ? 'text-cinema-red' : 'text-foreground-secondary'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}

            {/* User info + profile + logout (only if logged in) */}
            {isLoggedIn && (
              <div className="flex items-center space-x-4">
                {/* Profile Link */}
                <Link
                  to="/profile"
                  className={`text-sm font-medium transition-colors hover:text-cinema-red flex items-center space-x-1 ${
                    isActive('/profile') ? 'text-cinema-red' : 'text-foreground-secondary'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-foreground-secondary hover:text-cinema-red transition-colors flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </nav>

          {/* Timer - Only show countdown for non-admin users */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Countdown components will handle their own visibility based on user role */}
            <NavbarCountdown />
            <MovieCountdown />
            <MovieCountdownDropdown />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground hover:text-cinema-red transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-cinema-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium transition-colors hover:text-cinema-red ${
                    isActive(item.href) ? 'text-cinema-red bg-cinema-red/10' : 'text-foreground-secondary'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {/* Admin (only if admin) */}
              {isLoggedIn && isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium transition-colors hover:text-cinema-red flex items-center space-x-2 ${
                    isActive('/admin') ? 'text-cinema-red bg-cinema-red/10' : 'text-foreground-secondary'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}

              {/* Mobile Profile Link */}
              {isLoggedIn && (
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium transition-colors hover:text-cinema-red flex items-center space-x-2 ${
                    isActive('/profile') ? 'text-cinema-red bg-cinema-red/10' : 'text-foreground-secondary'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              )}

              {/* Mobile logout */}
              {isLoggedIn && (
                <div className="px-3 py-2 border-t border-cinema-border mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="text-foreground-secondary hover:text-cinema-red transition-colors flex items-center space-x-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}

              {/* Mobile Timer - Only show for non-admin users */}
              <div className="px-3 py-2 space-y-3">
                {/* Countdown components will handle their own visibility */}
                <div className="flex items-center justify-center">
                  <MovieCountdownDropdown />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;