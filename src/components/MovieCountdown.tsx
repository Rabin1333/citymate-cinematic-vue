import { useState, useEffect } from 'react';
import { Film, Clock, Star } from 'lucide-react';
import { comingSoonMovies } from '@/data/movies';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: number;
}

interface MovieWithCountdown {
  id: number;
  title: string;
  poster: string;
  releaseType: 'new' | 'rerelease' | 'special';
  genre: string[];
  timeRemaining: TimeRemaining;
}

const MovieCountdown = () => {
  const [nextMovie, setNextMovie] = useState<MovieWithCountdown | null>(null);

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
      return `${hours}h ${minutes}m ${seconds}s`;
    } else {
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
    const updateCountdown = () => {
      if (comingSoonMovies.length === 0) return;

      const movie = comingSoonMovies[0];
      // For demo purposes, using a fixed future date
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 7);
      targetDate.setHours(targetDate.getHours() + 12);
      
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        const totalHours = Math.floor(difference / (1000 * 60 * 60));

        setNextMovie({
          id: movie.id,
          title: movie.title,
          poster: movie.poster,
          releaseType: 'new',
          genre: typeof movie.genre === 'string' ? [movie.genre] : movie.genre,
          timeRemaining: { days, hours, minutes, seconds, totalHours }
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

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