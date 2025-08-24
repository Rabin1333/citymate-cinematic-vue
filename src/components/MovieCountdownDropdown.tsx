import { useState, useEffect } from 'react';
import { Timer, Bell, BellRing, Calendar } from 'lucide-react';
import { comingSoonMovies } from '@/data/movies';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface MovieCountdown {
  movieId: number;
  title: string;
  releaseDate: string;
  timeRemaining: TimeRemaining;
}

const MovieCountdownDropdown = () => {
  const [movieCountdowns, setMovieCountdowns] = useState<MovieCountdown[]>([]);
  const [reminders, setReminders] = useState<Set<number>>(new Set());

  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date().getTime();
      
      const countdowns = comingSoonMovies.map(movie => {
        const releaseDate = movie.releaseDate ? new Date(movie.releaseDate).getTime() : now + (7 * 24 * 60 * 60 * 1000);
        const difference = releaseDate - now;

        let timeRemaining: TimeRemaining = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        
        if (difference > 0) {
          timeRemaining = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000)
          };
        } else {
          // Movie is now available
          if (reminders.has(movie.id)) {
            showNotification(movie.title);
            setReminders(prev => {
              const newSet = new Set(prev);
              newSet.delete(movie.id);
              return newSet;
            });
          }
        }

        return {
          movieId: movie.id,
          title: movie.title,
          releaseDate: movie.releaseDate || '',
          timeRemaining
        };
      }).filter(countdown => 
        countdown.timeRemaining.days > 0 || 
        countdown.timeRemaining.hours > 0 || 
        countdown.timeRemaining.minutes > 0 || 
        countdown.timeRemaining.seconds > 0
      );

      setMovieCountdowns(countdowns);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);

    return () => clearInterval(interval);
  }, [reminders]);

  const showNotification = (movieTitle: string) => {
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${movieTitle} is now available!`, {
        body: 'You can now book tickets for this movie.',
        icon: '/favicon.ico'
      });
    }
    
    // In-app notification (you could integrate with toast here)
    console.log(`🎬 ${movieTitle} is now available for booking!`);
  };

  const toggleReminder = async (movieId: number, movieTitle: string) => {
    if (!reminders.has(movieId)) {
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          alert('Please enable notifications to receive movie reminders!');
          return;
        }
      }
      
      setReminders(prev => new Set([...prev, movieId]));
      console.log(`Reminder set for ${movieTitle}`);
    } else {
      setReminders(prev => {
        const newSet = new Set(prev);
        newSet.delete(movieId);
        return newSet;
      });
      console.log(`Reminder removed for ${movieTitle}`);
    }
  };

  const formatTimeRemaining = (time: TimeRemaining) => {
    if (time.days > 0) {
      return `${time.days}d ${time.hours}h ${time.minutes}m`;
    } else if (time.hours > 0) {
      return `${time.hours}h ${time.minutes}m ${time.seconds}s`;
    } else {
      return `${time.minutes}m ${time.seconds}s`;
    }
  };

  if (movieCountdowns.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-foreground-secondary hover:text-cinema-red hover:bg-cinema-red/10 transition-colors"
        >
          <Timer className="h-5 w-5" />
          {movieCountdowns.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-cinema-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
              {movieCountdowns.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-card border-cinema-border shadow-card"
        sideOffset={8}
      >
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Timer className="h-4 w-4 text-cinema-red" />
            <h3 className="font-semibold text-foreground">Coming Soon Movies</h3>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {movieCountdowns.map((countdown) => (
              <div 
                key={countdown.movieId} 
                className="bg-background-secondary rounded-lg p-3 border border-cinema-border"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground text-sm line-clamp-2 leading-tight">
                      {countdown.title}
                    </h4>
                    {countdown.releaseDate && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Calendar className="h-3 w-3 text-foreground-secondary" />
                        <span className="text-xs text-foreground-secondary">
                          {new Date(countdown.releaseDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-2 flex-shrink-0"
                    onClick={() => toggleReminder(countdown.movieId, countdown.title)}
                  >
                    {reminders.has(countdown.movieId) ? (
                      <BellRing className="h-3 w-3 text-cinema-red" />
                    ) : (
                      <Bell className="h-3 w-3 text-foreground-secondary hover:text-cinema-red" />
                    )}
                  </Button>
                </div>
                
                <div className="bg-cinema-dark/50 rounded px-2 py-1">
                  <span className="text-cinema-red font-mono text-sm font-medium">
                    {formatTimeRemaining(countdown.timeRemaining)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t border-cinema-border">
            <p className="text-xs text-foreground-secondary text-center">
              Click <Bell className="h-3 w-3 inline mx-1" /> to set reminders for release notifications
            </p>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MovieCountdownDropdown;