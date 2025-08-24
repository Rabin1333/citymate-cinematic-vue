import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { comingSoonMovies } from '@/data/movies';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const MovieCountdown = () => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [nextMovie, setNextMovie] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      // For demo purposes, using a fixed future date
      // In real app, movies would have actual release dates
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 7); // 7 days from now
      
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds });
        
        // Set next movie from coming soon list
        if (comingSoonMovies.length > 0) {
          setNextMovie(comingSoonMovies[0].title);
        }
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!nextMovie) return null;

  return (
    <div className="hidden lg:flex items-center space-x-2 bg-cinema-brown/50 px-4 py-2 rounded-lg border border-cinema-border">
      <Clock className="h-4 w-4 text-cinema-red" />
      <div className="flex items-center space-x-1 text-sm">
        <span className="text-foreground-secondary">Next:</span>
        <span className="text-foreground font-medium truncate max-w-24">{nextMovie}</span>
        <span className="text-cinema-red font-mono">
          {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
        </span>
      </div>
    </div>
  );
};

export default MovieCountdown;