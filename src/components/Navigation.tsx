import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Film, Settings, LogOut, User, Search, Filter, ChevronDown, Home, Calendar, MapPin, Bell } from 'lucide-react';
import { clearAuth, getCurrentUser, getMovies, type UiMovie } from '../services/api';
import { useSearch } from '../contexts/SearchContext';
import { useTriggerEffect } from '../hooks/useCinematicEffects';
import { findEffectByInput } from '../utils/cinematicEffects';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [movies, setMovies] = useState<UiMovie[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = getCurrentUser();
  const isLoggedIn = !!currentUser;
  const isAdmin = currentUser?.role === 'admin';
  
  const { searchTerm, setSearchTerm, selectedGenre, setSelectedGenre } = useSearch();
  const triggerEffect = useTriggerEffect();

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isSearchExpanded) {
        e.preventDefault();
        setIsSearchExpanded(true);
      }
      if (e.key === 'Escape' && isSearchExpanded) {
        setIsSearchExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchExpanded]);

  // Fetch movies for genre dropdown
  useEffect(() => {
    (async () => {
      try {
        const data = await getMovies(false);
        setMovies(data);
      } catch (e) {
        console.error('Failed to load movies for genre filter:', e);
      }
    })();
  }, []);

  // Extract genres from movies
  const genres = useMemo(() => {
    const allGenres = movies.flatMap((m) => m.genre || []);
    return ["All", ...Array.from(new Set(allGenres))];
  }, [movies]);

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
    setIsSearchExpanded(false);
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    setIsGenreDropdownOpen(false);
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
      { name: 'Home', href: '/', icon: Home },
      { name: 'Movies', href: '/movies', icon: Film },
      { name: 'Showtimes', href: '/showtimes', icon: Calendar },
      ...(isLoggedIn ? [] : [{ name: 'Login', href: '/auth', icon: User }]),
    ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`nav-glass sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'scrolled h-14' : 'h-16'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-full">
          {/* Left Cluster - Logo + Primary Nav */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link 
              to="/" 
              className={`flex items-center space-x-2 transition-all duration-300 ${isScrolled ? 'scale-90' : 'scale-100'}`}
            >
              <Film className="h-8 w-8 text-cinema-red filter drop-shadow-sm" />
              <span className="text-xl font-bold text-foreground">City Mate</span>
            </Link>

            {/* Primary Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-link flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all duration-250 ${
                      isActive(item.href) ? 'active' : ''
                    }`}
                    aria-label={item.name}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center - Context Chip */}
          <div className="hidden lg:flex items-center">
            <div className="context-chip flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>Downtown Cinema • Today</span>
            </div>
          </div>

          {/* Right Cluster - Search, Genre, Profile, Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Morph */}
            <div className={`search-morph ${isSearchExpanded ? 'expanded' : ''} relative`}>
              {!isSearchExpanded ? (
                <button
                  onClick={() => setIsSearchExpanded(true)}
                  className="nav-link flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:border-cinema-red/50 transition-colors"
                  aria-label="Open search (Press / to focus)"
                >
                  <Search className="h-4 w-4" />
                </button>
              ) : (
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search movies, directors, actors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onBlur={() => !searchTerm && setIsSearchExpanded(false)}
                    className="w-full pl-10 pr-4 py-2 bg-card/50 backdrop-blur-sm border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cinema-red/50 focus:border-cinema-red transition-all"
                    autoFocus
                  />
                </form>
              )}
            </div>

            {/* Genre Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
                className="nav-link flex items-center space-x-2 px-3 py-2 rounded-lg border border-border hover:border-cinema-red/50 transition-colors"
                aria-label="Filter by genre"
              >
                <Filter className="h-4 w-4" />
                <span className="text-sm">{selectedGenre}</span>
                <ChevronDown className={`h-4 w-4 glow-caret transition-transform ${isGenreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isGenreDropdownOpen && (
                <div className="glass-dropdown absolute right-0 top-full mt-2 w-48 rounded-lg z-50 overflow-hidden">
                  <div className="py-1 max-h-64 overflow-y-auto">
                    {genres.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => handleGenreSelect(genre)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-cinema-red/10 hover:text-cinema-red transition-colors ${
                          selectedGenre === genre ? 'bg-cinema-red/20 text-cinema-red font-medium' : 'text-foreground-secondary'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications/Rewards - Placeholder */}
            {isLoggedIn && (
              <button className="nav-link relative p-2 rounded-lg border border-border hover:border-cinema-red/50 transition-colors">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 bg-cinema-red text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  2
                </span>
              </button>
            )}

            {/* User Actions */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Admin (only if admin) */}
              {isLoggedIn && isAdmin && (
                <Link
                  to="/admin"
                  className={`nav-link flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/admin') ? 'active' : ''
                  }`}
                  aria-label="Admin dashboard"
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">Admin</span>
                </Link>
              )}

              {/* Profile (only if logged in) */}
              {isLoggedIn && (
                <Link
                  to="/profile"
                  className={`nav-link flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/profile') ? 'active' : ''
                  }`}
                  aria-label="User profile"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm">Profile</span>
                </Link>
              )}

              {/* Logout (only if logged in) */}
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="nav-link flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-foreground-secondary hover:text-cinema-red"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="nav-link p-2 rounded-lg border border-border hover:border-cinema-red/50 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50 mt-4 pt-4 pb-4 glass-dropdown">
            <div className="space-y-3">
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-card/50 backdrop-blur-sm border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cinema-red/50"
                />
              </form>

              {/* Mobile Genre Filter */}
              <div className="relative">
                <button
                  onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-card/50 backdrop-blur-sm border border-border rounded-lg text-sm font-medium text-foreground-secondary"
                >
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4" />
                    <span>{selectedGenre}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isGenreDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isGenreDropdownOpen && (
                  <div className="glass-dropdown mt-2 w-full rounded-lg overflow-hidden">
                    <div className="py-1 max-h-48 overflow-y-auto">
                      {genres.map((genre) => (
                        <button
                          key={genre}
                          onClick={() => handleGenreSelect(genre)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-cinema-red/10 transition-colors ${
                            selectedGenre === genre ? 'bg-cinema-red/20 text-cinema-red font-medium' : 'text-foreground-secondary'
                          }`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`nav-link flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive(item.href) ? 'active bg-cinema-red/10' : ''
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                {/* Mobile Admin Link */}
                {isLoggedIn && isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className={`nav-link flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/admin') ? 'active bg-cinema-red/10' : ''
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
                    className={`nav-link flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/profile') ? 'active bg-cinema-red/10' : ''
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                )}

                {/* Mobile logout */}
                {isLoggedIn && (
                  <button
                    onClick={handleLogout}
                    className="nav-link w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-foreground-secondary hover:text-cinema-red"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
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