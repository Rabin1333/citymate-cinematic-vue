import { useState, useEffect } from 'react';
import { Film, Clock } from 'lucide-react';
import { getMovies, getCurrentUser, type UiMovie } from '@/services/api';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: number;
}

interface MovieWithCountdown {
  id: string;
  title: string;
  poster: string;
  releaseType: string;
  genre: string[];
  timeRemaining: TimeRemaining;
}

const MovieCountdown = () => {
  const [nextMovie, setNextMovie] = useState<MovieWithCountdown | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user should see countdown (not admin)
  const currentUser = getCurrentUser();
  const shouldShowCountdown = currentUser?.role !== 'admin';

  const calculateTimeRemaining = (releaseDate: string): TimeRemaining | null => {
    const now = new Date().getTime();
    const target = new Date(releaseDate).getTime();
    const difference = target - now;

    if (difference <= 0) return null;

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    const totalHours = Math.floor(difference / (1000 * 60 * 60));

    return { days, hours, minutes, seconds, totalHours };
  };

  const formatCountdown = (time: TimeRemaining): string => {
    const { days, hours, minutes, seconds, totalHours } = time;
    
    if (days > 30) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      return `${months}mo ${remainingDays}d`;
    } else if (days > 7) {
      return `${days}d ${hours}h`;
    } else if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (totalHours > 1) {
      // Show seconds for urgent releases
      return `${hours}h ${minutes}m ${seconds}s`;
    } else {
      // Always show seconds for final hour
      return `${minutes}m ${seconds}s`;
    }
  };

  const getReleaseIcon = (type: string) => {
    switch (type) {
      case 'new': return '🎬';
      case 'rerelease': return '🔄';
      case 'special': return '⭐';
      default: return '🎬';
    }
  };

  const getUrgencyClass = (time: TimeRemaining) => {
    if (time.totalHours < 1) return 'border-red-500 bg-red-500/10 animate-pulse';
    if (time.totalHours < 24) return 'border-yellow-500 bg-yellow-500/10 shadow-yellow-500/20 shadow-lg';
    return 'border-primary/20 bg-card/50';
  };

  useEffect(() => {
    // Don't load if admin user
    if (!shouldShowCountdown) {
      setLoading(false);
      return;
    }

    const loadUpcomingMovies = async () => {
      try {
        // Get upcoming movies from API
        const upcomingMovies = await getMovies(true);
        
        // Filter movies with valid future release dates
        const moviesWithCountdown = upcomingMovies
          .filter(movie => movie.releaseDate && new Date(movie.releaseDate) > new Date())
          .map(movie => ({
            movie,
            timeRemaining: calculateTimeRemaining(movie.releaseDate!)
          }))
          .filter(item => item.timeRemaining !== null)
          .sort((a, b) => a.timeRemaining!.totalHours - b.timeRemaining!.totalHours);

        if (moviesWithCountdown.length > 0) {
          const nextRelease = moviesWithCountdown[0];
          setNextMovie({
            id: nextRelease.movie.id,
            title: nextRelease.movie.title,
            poster: nextRelease.movie.poster,
            releaseType: 'new',
            genre: nextRelease.movie.genre,
            timeRemaining: nextRelease.timeRemaining!
          });
        }
      } catch (error) {
        console.error('Failed to load upcoming movies:', error);
      } finally {
        setLoading(false);
      }
    };

    const updateCountdown = () => {
      if (nextMovie && nextMovie.id) {
        // Get the saved release date from localStorage or recalculate
        const savedMovies = localStorage.getItem('upcomingMoviesCache');
        if (savedMovies) {
          try {
            const movies = JSON.parse(savedMovies);
            const currentMovie = movies.find((m: any) => m.id === nextMovie.id);
            if (currentMovie && currentMovie.releaseDate) {
              const timeRemaining = calculateTimeRemaining(currentMovie.releaseDate);
              if (timeRemaining) {
                setNextMovie(prev => prev ? { ...prev, timeRemaining } : null);
              } else {
                // Movie is now released, reload the list
                loadUpcomingMovies();
              }
            }
          } catch {
            // Fallback to API call
            loadUpcomingMovies();
          }
        } else {
          // Recalculate from API
          getMovies(true).then(upcomingMovies => {
            const currentMovie = upcomingMovies.find(m => m.id === nextMovie.id);
            if (currentMovie && currentMovie.releaseDate) {
              const timeRemaining = calculateTimeRemaining(currentMovie.releaseDate);
              if (timeRemaining) {
                setNextMovie(prev => prev ? { ...prev, timeRemaining } : null);
              } else {
                loadUpcomingMovies();
              }
            }
          }).catch(console.error);
        }
      }
    };

    // Initial load
    loadUpcomingMovies();

    // Update countdown every second for real-time seconds display
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [shouldShowCountdown]);

  // Don't render for admin users
  if (!shouldShowCountdown) {
    return null;
  }

  if (loading) {
    return (
      <div className="hidden lg:flex items-center space-x-3 px-3 py-2 rounded-lg border border-primary/20 bg-card/50">
        <div className="w-6 h-9 bg-muted animate-pulse rounded"></div>
        <div className="flex flex-col space-y-1">
          <div className="w-20 h-3 bg-muted animate-pulse rounded"></div>
          <div className="w-16 h-3 bg-muted animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  if (!nextMovie) return null;

  const urgencyClass = getUrgencyClass(nextMovie.timeRemaining);

  return (
    <div className={`hidden lg:flex items-center space-x-3 px-3 py-2 rounded-lg border backdrop-blur-sm transition-all duration-300 ${urgencyClass}`}>
      {/* Movie Poster Thumbnail */}
      <div className="relative">
        <img 
          src={nextMovie.poster} 
          alt={nextMovie.title}
          className="w-6 h-9 object-cover rounded border border-border/50"
        />
        <div className="absolute -top-1 -right-1 text-xs">
          {getReleaseIcon(nextMovie.releaseType)}
        </div>
      </div>

      {/* Movie Info */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center space-x-1 text-xs">
          <Film className="h-3 w-3 text-primary" />
          <span className="text-muted-foreground font-medium truncate max-w-32">
            {nextMovie.title}
          </span>
        </div>
        <div className="flex items-center space-x-1 text-xs">
          <Clock className="h-3 w-3 text-primary" />
          <span className={`font-mono font-semibold ${
            nextMovie.timeRemaining.totalHours < 24 ? 'text-yellow-400' : 
            nextMovie.timeRemaining.totalHours < 1 ? 'text-red-400' : 'text-primary'
          }`}>
            {formatCountdown(nextMovie.timeRemaining)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCountdown;