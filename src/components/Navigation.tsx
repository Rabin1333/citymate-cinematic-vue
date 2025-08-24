import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, Film, Settings } from 'lucide-react';
import MovieCountdown from './MovieCountdown';
import MovieCountdownDropdown from './MovieCountdownDropdown';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Movies', href: '/movies' },
    { name: 'Showtimes', href: '/showtimes' },
    { name: 'Login', href: '/auth' },
  ];

  // Mock admin check - in real app this would come from auth context
  const isAdmin = true;

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
                  isActive(item.href)
                    ? 'text-cinema-red'
                    : 'text-foreground-secondary'
                }`}
              >
                {item.name}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`text-sm font-medium transition-colors hover:text-cinema-red flex items-center space-x-1 ${
                  isActive('/admin')
                    ? 'text-cinema-red'
                    : 'text-foreground-secondary'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Movie Countdown, Timer & Search */}
          <div className="hidden lg:flex items-center space-x-4">
            <MovieCountdown />
            <MovieCountdownDropdown />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search movies..."
                className="input-cinema pl-10 w-64"
              />
            </div>
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
                  className={`block px-3 py-2 text-base font-medium transition-colors hover:text-cinema-red ${
                    isActive(item.href)
                      ? 'text-cinema-red bg-cinema-red/10'
                      : 'text-foreground-secondary'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Admin Link */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`block px-3 py-2 text-base font-medium transition-colors hover:text-cinema-red flex items-center space-x-2 ${
                    isActive('/admin')
                      ? 'text-cinema-red bg-cinema-red/10'
                      : 'text-foreground-secondary'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}
              
              {/* Mobile Timer & Search */}
              <div className="px-3 py-2 space-y-3">
                <div className="flex items-center justify-center">
                  <MovieCountdownDropdown />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search movies..."
                    className="input-cinema pl-10 w-full"
                  />
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