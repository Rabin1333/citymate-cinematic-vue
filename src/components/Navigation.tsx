import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Film, Settings, LogOut, User, Search } from 'lucide-react';
import { clearAuth, getCurrentUser } from '../services/api';
import { useSearch } from '../contexts/SearchContext';
import { useTriggerEffect } from '../hooks/useCinematicEffects';
import { findEffectByInput } from '../utils/cinematicEffects';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = getCurrentUser();
  const isLoggedIn = !!currentUser;
  const isAdmin = currentUser?.role === 'admin';
  
  const { searchTerm, setSearchTerm } = useSearch();
  const triggerEffect = useTriggerEffect();


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for cinematic effect triggers
    const effectKey = findEffectByInput(searchTerm);
    if (effectKey) {
      triggerEffect(effectKey, 'search');
    }
    
    if (location.pathname !== '/movies') {
      navigate('/movies');
    }
  };


  const handleLogout = () => {
    clearAuth();
    // Force page reload to ensure all components reinitialize with new auth state
    window.location.href = '/';
  };

  // Role-based navigation
  const navigation = isAdmin ? 
    // Admin only sees basic auth links
    [] : 
    // Normal users see full navigation
    [
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

          {/* Desktop Navigation with Search */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center max-w-4xl">
            {/* Navigation Links */}
            <nav className="flex items-center space-x-8">
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
            </nav>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md mx-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search movies, directors, actors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cinema-red/50 focus:border-cinema-red transition-colors"
              />
            </form>

          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
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
            <div className="px-2 pt-2 pb-3 space-y-3">
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative px-3">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cinema-red/50"
                />
              </form>


              {/* Navigation Links */}
              <div className="space-y-1">
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

              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;